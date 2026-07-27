import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import JSZip from 'jszip';
import forge from 'node-forge';

// ============================================================================
// Helper: Adler32 Calculation
// ============================================================================
function adler32(buf: Buffer): number {
  let a = 1;
  let b = 0;
  for (let i = 0; i < buf.length; i++) {
    a = (a + buf[i]) % 65521;
    b = (b + a) % 65521;
  }
  return (b << 16) | a;
}

// ============================================================================
// Helper: LEB128 Encoding for DEX Strings & Integers
// ============================================================================
function writeUleb128(val: number): Buffer {
  const bytes: number[] = [];
  let current = val;
  do {
    let byte = current & 0x7f;
    current >>>= 7;
    if (current !== 0) {
      byte |= 0x80;
    }
    bytes.push(byte);
  } while (current !== 0);
  return Buffer.from(bytes);
}

// ============================================================================
// 1. Android Binary XML (AXML) Encoder
// ============================================================================
const nsAndroid = "http://schemas.android.com/apk/res/android";
const prefixAndroid = "android";

interface AxmlAttr {
  ns?: string;
  name: string;
  value: string | number | boolean;
  type?: 'string' | 'int' | 'bool' | 'ref' | 'dimen';
  resId?: number;
}

interface AxmlNode {
  tag: string;
  attrs?: AxmlAttr[];
  children?: AxmlNode[];
}

function buildAxml(root: AxmlNode): Buffer {
  const strings: string[] = [];
  const stringMap = new Map<string, number>();

  function getStringIdx(s: string): number {
    if (stringMap.has(s)) return stringMap.get(s)!;
    const idx = strings.length;
    strings.push(s);
    stringMap.set(s, idx);
    return idx;
  }

  // Pre-populate namespace strings
  getStringIdx(prefixAndroid);
  getStringIdx(nsAndroid);

  function collectStrings(node: AxmlNode) {
    getStringIdx(node.tag);
    if (node.attrs) {
      for (const attr of node.attrs) {
        getStringIdx(attr.name);
        if (attr.ns) getStringIdx(attr.ns);
        if (typeof attr.value === 'string') {
          getStringIdx(attr.value);
        }
      }
    }
    if (node.children) {
      for (const child of node.children) {
        collectStrings(child);
      }
    }
  }

  collectStrings(root);

  // --- Build String Pool Chunk ---
  const strDataBuffers: Buffer[] = [];
  const strOffsets: number[] = [];
  let currentStrOffset = 0;

  for (const str of strings) {
    strOffsets.push(currentStrOffset);
    const strBuf = Buffer.from(str, 'utf8');
    const prefix = Buffer.concat([writeUleb128(str.length), writeUleb128(strBuf.length)]);
    const entry = Buffer.concat([prefix, strBuf, Buffer.from([0x00])]);
    strDataBuffers.push(entry);
    currentStrOffset += entry.length;
  }

  const strDataConcat = Buffer.concat(strDataBuffers);
  const strDataPadding = (4 - (strDataConcat.length % 4)) % 4;
  const strDataPadded = Buffer.concat([strDataConcat, Buffer.alloc(strDataPadding)]);

  const strPoolHeaderSize = 28;
  const strOffsetsSize = strings.length * 4;
  const stringsStart = strPoolHeaderSize + strOffsetsSize;
  const strPoolChunkSize = stringsStart + strDataPadded.length;

  const strPoolChunk = Buffer.alloc(strPoolChunkSize);
  strPoolChunk.writeUInt16LE(0x0001, 0); // RES_STRING_POOL_TYPE
  strPoolChunk.writeUInt16LE(28, 2);     // header size
  strPoolChunk.writeUInt32LE(strPoolChunkSize, 4);
  strPoolChunk.writeUInt32LE(strings.length, 8); // string count
  strPoolChunk.writeUInt32LE(0, 12);     // style count
  strPoolChunk.writeUInt32LE(0x00000100, 16); // UTF-8 flag
  strPoolChunk.writeUInt32LE(stringsStart, 20);
  strPoolChunk.writeUInt32LE(0, 24);     // styles start

  for (let i = 0; i < strOffsets.length; i++) {
    strPoolChunk.writeUInt32LE(strOffsets[i], 28 + i * 4);
  }
  strDataPadded.copy(strPoolChunk, stringsStart);

  // --- Build Resource ID Map Chunk ---
  const nameToResId = new Map<string, number>([
    ['theme', 0x01010000],
    ['label', 0x01010001],
    ['icon', 0x01010002],
    ['name', 0x01010003],
    ['permission', 0x0101000f],
    ['resource', 0x01010010],
    ['exported', 0x0101020c],
    ['minSdkVersion', 0x0101020b],
    ['targetSdkVersion', 0x01010270],
    ['versionCode', 0x0101021b],
    ['versionName', 0x0101021c],
    ['allowBackup', 0x01010280],
    ['keyWidth', 0x01010005],
    ['keyHeight', 0x01010006],
    ['horizontalGap', 0x01010007],
    ['verticalGap', 0x01010008],
    ['codes', 0x01010009],
    ['keyLabel', 0x0101000a],
    ['keyIcon', 0x0101000b],
    ['keyEdgeFlags', 0x0101000c]
  ]);

  const resMapChunkSize = 8 + strings.length * 4;
  const resMapChunk = Buffer.alloc(resMapChunkSize);
  resMapChunk.writeUInt16LE(0x0180, 0); // RES_XML_RESOURCE_MAP_TYPE
  resMapChunk.writeUInt16LE(8, 2);
  resMapChunk.writeUInt32LE(resMapChunkSize, 4);

  for (let i = 0; i < strings.length; i++) {
    const name = strings[i];
    const id = nameToResId.get(name) || 0x0;
    resMapChunk.writeUInt32LE(id, 8 + i * 4);
  }

  // --- Build XML Tree Chunks ---
  const xmlChunks: Buffer[] = [];

  // Start Namespace Chunk
  const nsStartChunk = Buffer.alloc(24);
  nsStartChunk.writeUInt16LE(0x0100, 0); // RES_XML_START_NAMESPACE_TYPE
  nsStartChunk.writeUInt16LE(16, 2);
  nsStartChunk.writeUInt32LE(24, 4);
  nsStartChunk.writeUInt32LE(1, 8);  // line number
  nsStartChunk.writeUInt32LE(0xffffffff, 12); // comment
  nsStartChunk.writeUInt32LE(getStringIdx(prefixAndroid), 16);
  nsStartChunk.writeUInt32LE(getStringIdx(nsAndroid), 20);
  xmlChunks.push(nsStartChunk);

  // Recursive Element Builder
  function buildElementChunks(node: AxmlNode) {
    const attrs = node.attrs || [];
    const attrCount = attrs.length;
    const startElemSize = 36 + attrCount * 20;

    const startElem = Buffer.alloc(startElemSize);
    startElem.writeUInt16LE(0x0102, 0); // RES_XML_START_ELEMENT_TYPE
    startElem.writeUInt16LE(16, 2);
    startElem.writeUInt32LE(startElemSize, 4);
    startElem.writeUInt32LE(1, 8); // line number
    startElem.writeUInt32LE(0xffffffff, 12); // comment
    startElem.writeUInt32LE(0xffffffff, 16); // ns (none for tag name)
    startElem.writeUInt32LE(getStringIdx(node.tag), 20);
    startElem.writeUInt16LE(20, 24); // attrStart
    startElem.writeUInt16LE(20, 26); // attrSize
    startElem.writeUInt16LE(attrCount, 28);
    startElem.writeUInt16LE(0, 30); // idIndex
    startElem.writeUInt16LE(0, 32); // classIndex
    startElem.writeUInt16LE(0, 34); // styleIndex

    for (let i = 0; i < attrCount; i++) {
      const a = attrs[i];
      const offset = 36 + i * 20;
      const nsIdx = a.ns ? getStringIdx(a.ns) : 0xffffffff;
      const nameIdx = getStringIdx(a.name);

      startElem.writeUInt32LE(nsIdx, offset);
      startElem.writeUInt32LE(nameIdx, offset + 4);

      if (typeof a.value === 'string') {
        const valIdx = getStringIdx(a.value);
        startElem.writeUInt32LE(valIdx, offset + 8); // rawValue
        startElem.writeUInt16LE(8, offset + 12);     // size
        startElem.writeUInt8(0, offset + 14);       // res0
        startElem.writeUInt8(0x03, offset + 15);    // TYPE_STRING
        startElem.writeUInt32LE(valIdx, offset + 16);
      } else if (typeof a.value === 'boolean') {
        startElem.writeUInt32LE(0xffffffff, offset + 8); // rawValue
        startElem.writeUInt16LE(8, offset + 12);
        startElem.writeUInt8(0, offset + 14);
        startElem.writeUInt8(0x12, offset + 15);   // TYPE_INT_BOOLEAN
        startElem.writeUInt32LE(a.value ? 0xffffffff : 0, offset + 16);
      } else if (typeof a.value === 'number') {
        startElem.writeUInt32LE(0xffffffff, offset + 8);
        startElem.writeUInt16LE(8, offset + 12);
        startElem.writeUInt8(0, offset + 14);
        if (a.type === 'ref') {
          startElem.writeUInt8(0x01, offset + 15); // TYPE_REFERENCE
        } else {
          startElem.writeUInt8(0x10, offset + 15); // TYPE_INT_DEC
        }
        startElem.writeUInt32LE(a.value, offset + 16);
      }
    }

    xmlChunks.push(startElem);

    if (node.children) {
      for (const child of node.children) {
        buildElementChunks(child);
      }
    }

    const endElem = Buffer.alloc(24);
    endElem.writeUInt16LE(0x0103, 0); // RES_XML_END_ELEMENT_TYPE
    endElem.writeUInt16LE(16, 2);
    endElem.writeUInt32LE(24, 4);
    endElem.writeUInt32LE(1, 8);
    endElem.writeUInt32LE(0xffffffff, 12);
    endElem.writeUInt32LE(0xffffffff, 16);
    endElem.writeUInt32LE(getStringIdx(node.tag), 20);
    xmlChunks.push(endElem);
  }

  buildElementChunks(root);

  // End Namespace Chunk
  const nsEndChunk = Buffer.alloc(24);
  nsEndChunk.writeUInt16LE(0x0101, 0); // RES_XML_END_NAMESPACE_TYPE
  nsEndChunk.writeUInt16LE(16, 2);
  nsEndChunk.writeUInt32LE(24, 4);
  nsEndChunk.writeUInt32LE(1, 8);
  nsEndChunk.writeUInt32LE(0xffffffff, 12);
  nsEndChunk.writeUInt32LE(getStringIdx(prefixAndroid), 16);
  nsEndChunk.writeUInt32LE(getStringIdx(nsAndroid), 20);
  xmlChunks.push(nsEndChunk);

  const xmlBody = Buffer.concat([strPoolChunk, resMapChunk, ...xmlChunks]);
  const totalAxmlSize = 8 + xmlBody.length;

  const axmlHeader = Buffer.alloc(8);
  axmlHeader.writeUInt16LE(0x0008, 0); // RES_XML_TYPE
  axmlHeader.writeUInt16LE(8, 2);
  axmlHeader.writeUInt32LE(totalAxmlSize, 4);

  return Buffer.concat([axmlHeader, xmlBody]);
}

// ============================================================================
// 2. Dalvik Executable (DEX) Builder for Amharic Soft Keyboard
// ============================================================================
function buildDex(): Buffer {
  const rawStrings = [
    "",
    "V",
    "I",
    "[I",
    "Lcom/amharic/keyboard/AmharicIME;",
    "Lcom/amharic/keyboard/PhoneticEngine;",
    "Lcom/amharic/keyboard/PhoneticEngineKt;",
    "Lcom/amharic/keyboard/R$drawable;",
    "Lcom/amharic/keyboard/R$layout;",
    "Lcom/amharic/keyboard/R$xml;",
    "Landroid/inputmethodservice/InputMethodService;",
    "Landroid/inputmethodservice/KeyboardView$OnKeyboardActionListener;",
    "Ljava/lang/Object;",
    "Ljava/lang/String;",
    "AmharicIME.kt",
    "PhoneticEngine.java",
    "PhoneticEngineKt.kt",
    "R.java",
    "<init>",
    "()V",
    "onKey",
    "(I[I)V",
    "processKey",
    "(Ljava/lang/String;Ljava/lang/String;)Lcom/amharic/keyboard/PhoneticEngine$Result;",
    "Amharic Language LOCKED (Windows 10 Phonetic)",
    "English Language LOCKED",
    "keyboard_view",
    "qwerty_layout",
    "method"
  ];

  const strings = [...rawStrings].sort();

  const stringDataBuffers: Buffer[] = [];
  const stringDataOffsets: number[] = [];

  for (const s of strings) {
    const utf8Buf = Buffer.from(s, 'utf8');
    const ulebLen = writeUleb128(s.length);
    const item = Buffer.concat([ulebLen, utf8Buf, Buffer.from([0x00])]);
    stringDataBuffers.push(item);
  }

  const typeNames = [
    "V",
    "I",
    "[I",
    "Lcom/amharic/keyboard/AmharicIME;",
    "Lcom/amharic/keyboard/PhoneticEngine;",
    "Lcom/amharic/keyboard/PhoneticEngineKt;",
    "Lcom/amharic/keyboard/R$drawable;",
    "Lcom/amharic/keyboard/R$layout;",
    "Lcom/amharic/keyboard/R$xml;",
    "Landroid/inputmethodservice/InputMethodService;",
    "Landroid/inputmethodservice/KeyboardView$OnKeyboardActionListener;",
    "Ljava/lang/Object;",
    "Ljava/lang/String;"
  ].sort();

  const typeIds = typeNames.map(tn => strings.indexOf(tn));

  const protoIds = [
    { returnTypeIdx: typeNames.indexOf("V"), parametersOff: 0 },
  ];

  const headerSize = 112; // 0x70
  const stringIdsSize = strings.length;
  const stringIdsOff = headerSize;
  const typeIdsSize = typeIds.length;
  const typeIdsOff = stringIdsOff + stringIdsSize * 4;
  const protoIdsSize = 1;
  const protoIdsOff = typeIdsOff + typeIdsSize * 4;
  const fieldIdsSize = 0;
  const fieldIdsOff = 0;
  const methodIdsSize = 1;
  const methodIdsOff = protoIdsOff + protoIdsSize * 12;
  const classDefsSize = 1;
  const classDefsOff = methodIdsOff + methodIdsSize * 8;

  let currentDataOff = classDefsOff + classDefsSize * 32;

  const stringDataOffsetsArr: number[] = [];
  for (let i = 0; i < stringDataBuffers.length; i++) {
    stringDataOffsetsArr.push(currentDataOff);
    currentDataOff += stringDataBuffers[i].length;
  }

  const initCodeItemOff = currentDataOff;
  const initCodeItem = Buffer.alloc(16);
  initCodeItem.writeUInt16LE(1, 0);  // registers_size = 1
  initCodeItem.writeUInt16LE(1, 2);  // ins_size = 1
  initCodeItem.writeUInt16LE(0, 4);  // outs_size = 0
  initCodeItem.writeUInt16LE(0, 6);  // tries_size = 0
  initCodeItem.writeUInt32LE(0, 8);  // debug_info_off = 0
  initCodeItem.writeUInt32LE(1, 12); // insns_size = 1
  initCodeItem.writeUInt16LE(0x000e, 14); // return-void instruction
  currentDataOff += initCodeItem.length;

  const classDataOff = currentDataOff;
  const classDataBytes = Buffer.concat([
    writeUleb128(0),
    writeUleb128(0),
    writeUleb128(1),
    writeUleb128(0),
    writeUleb128(0), // method_idx_diff = 0
    writeUleb128(0x10001), // ACC_PUBLIC | ACC_CONSTRUCTOR
    writeUleb128(initCodeItemOff)
  ]);
  currentDataOff += classDataBytes.length;

  const mapListOff = currentDataOff;
  const mapItems = [
    { type: 0x0000, size: 1, offset: 0 },
    { type: 0x0001, size: stringIdsSize, offset: stringIdsOff },
    { type: 0x0002, size: typeIdsSize, offset: typeIdsOff },
    { type: 0x0003, size: protoIdsSize, offset: protoIdsOff },
    { type: 0x0005, size: methodIdsSize, offset: methodIdsOff },
    { type: 0x0006, size: classDefsSize, offset: classDefsOff },
    { type: 0x2002, size: stringIdsSize, offset: stringDataOffsetsArr[0] },
    { type: 0x2001, size: 1, offset: initCodeItemOff },
    { type: 0x2000, size: 1, offset: classDataOff },
    { type: 0x1000, size: 1, offset: mapListOff }
  ];

  const mapListBuf = Buffer.alloc(4 + mapItems.length * 12);
  mapListBuf.writeUInt32LE(mapItems.length, 0);
  for (let i = 0; i < mapItems.length; i++) {
    mapListBuf.writeUInt16LE(mapItems[i].type, 4 + i * 12);
    mapListBuf.writeUInt16LE(0, 6 + i * 12);
    mapListBuf.writeUInt32LE(mapItems[i].size, 8 + i * 12);
    mapListBuf.writeUInt32LE(mapItems[i].offset, 12 + i * 12);
  }
  currentDataOff += mapListBuf.length;

  const fileSize = currentDataOff;
  const dexBuf = Buffer.alloc(fileSize);

  dexBuf.write("dex\n035\0", 0, 8, "ascii");
  dexBuf.writeUInt32LE(fileSize, 32);
  dexBuf.writeUInt32LE(headerSize, 36);
  dexBuf.writeUInt32LE(0x12345678, 40);
  dexBuf.writeUInt32LE(mapListOff, 52);

  dexBuf.writeUInt32LE(stringIdsSize, 56);
  dexBuf.writeUInt32LE(stringIdsOff, 60);

  dexBuf.writeUInt32LE(typeIdsSize, 64);
  dexBuf.writeUInt32LE(typeIdsOff, 68);

  dexBuf.writeUInt32LE(protoIdsSize, 72);
  dexBuf.writeUInt32LE(protoIdsOff, 76);

  dexBuf.writeUInt32LE(fieldIdsSize, 80);
  dexBuf.writeUInt32LE(fieldIdsOff, 84);

  dexBuf.writeUInt32LE(methodIdsSize, 88);
  dexBuf.writeUInt32LE(methodIdsOff, 92);

  dexBuf.writeUInt32LE(classDefsSize, 96);
  dexBuf.writeUInt32LE(classDefsOff, 100);

  dexBuf.writeUInt32LE(fileSize - headerSize, 104);
  dexBuf.writeUInt32LE(headerSize, 108);

  for (let i = 0; i < stringIdsSize; i++) {
    dexBuf.writeUInt32LE(stringDataOffsetsArr[i], stringIdsOff + i * 4);
  }

  for (let i = 0; i < typeIdsSize; i++) {
    dexBuf.writeUInt32LE(typeIds[i], typeIdsOff + i * 4);
  }

  dexBuf.writeUInt32LE(strings.indexOf("V"), protoIdsOff);
  dexBuf.writeUInt32LE(typeNames.indexOf("V"), protoIdsOff + 4);
  dexBuf.writeUInt32LE(0, protoIdsOff + 8);

  dexBuf.writeUInt16LE(typeNames.indexOf("Lcom/amharic/keyboard/AmharicIME;"), methodIdsOff);
  dexBuf.writeUInt16LE(0, methodIdsOff + 2);
  dexBuf.writeUInt32LE(strings.indexOf("<init>"), methodIdsOff + 4);

  const cdOff = classDefsOff;
  dexBuf.writeUInt32LE(typeNames.indexOf("Lcom/amharic/keyboard/AmharicIME;"), cdOff);
  dexBuf.writeUInt32LE(0x0001, cdOff + 4);
  dexBuf.writeUInt32LE(typeNames.indexOf("Landroid/inputmethodservice/InputMethodService;"), cdOff + 8);
  dexBuf.writeUInt32LE(0, cdOff + 12);
  dexBuf.writeUInt32LE(strings.indexOf("AmharicIME.kt"), cdOff + 16);
  dexBuf.writeUInt32LE(0, cdOff + 20);
  dexBuf.writeUInt32LE(classDataOff, cdOff + 24);
  dexBuf.writeUInt32LE(0, cdOff + 28);

  for (let i = 0; i < stringDataBuffers.length; i++) {
    stringDataBuffers[i].copy(dexBuf, stringDataOffsetsArr[i]);
  }

  initCodeItem.copy(dexBuf, initCodeItemOff);
  classDataBytes.copy(dexBuf, classDataOff);
  mapListBuf.copy(dexBuf, mapListOff);

  const sha1 = crypto.createHash('sha1').update(dexBuf.subarray(32)).digest();
  sha1.copy(dexBuf, 12);

  const adler = adler32(dexBuf.subarray(12));
  dexBuf.writeUInt32LE(adler, 8);

  return dexBuf;
}

// ============================================================================
// 3. String Pool & Resources Table (`resources.arsc`) Builder
// ============================================================================
function buildStringPool(strings: string[]): Buffer {
  const strDataBuffers: Buffer[] = [];
  const strOffsets: number[] = [];
  let currentOffset = 0;

  for (const str of strings) {
    strOffsets.push(currentOffset);
    const strBuf = Buffer.from(str, 'utf8');
    const prefix = Buffer.concat([writeUleb128(str.length), writeUleb128(strBuf.length)]);
    const entry = Buffer.concat([prefix, strBuf, Buffer.from([0x00])]);
    strDataBuffers.push(entry);
    currentOffset += entry.length;
  }

  const strDataConcat = Buffer.concat(strDataBuffers);
  const padding = (4 - (strDataConcat.length % 4)) % 4;
  const strDataPadded = Buffer.concat([strDataConcat, Buffer.alloc(padding)]);

  const headerSize = 28;
  const offsetsSize = strings.length * 4;
  const stringsStart = headerSize + offsetsSize;
  const chunkSize = stringsStart + strDataPadded.length;

  const chunk = Buffer.alloc(chunkSize);
  chunk.writeUInt16LE(0x0001, 0); // RES_STRING_POOL_TYPE
  chunk.writeUInt16LE(28, 2);
  chunk.writeUInt32LE(chunkSize, 4);
  chunk.writeUInt32LE(strings.length, 8);
  chunk.writeUInt32LE(0, 12); // styleCount
  chunk.writeUInt32LE(0x00000100, 16); // UTF-8 flag
  chunk.writeUInt32LE(stringsStart, 20);
  chunk.writeUInt32LE(0, 24); // stylesStart

  for (let i = 0; i < strOffsets.length; i++) {
    chunk.writeUInt32LE(strOffsets[i], 28 + i * 4);
  }
  strDataPadded.copy(chunk, stringsStart);

  return chunk;
}

function buildResourcesArsc(): Buffer {
  const globalStrings = ["Amharic Keyboard", "AmharicIME", "keyboard_view", "method", "qwerty_layout"];
  const globalStringPool = buildStringPool(globalStrings);

  const typeStrings = ["attr", "drawable", "layout", "xml", "string"];
  const typeStringPool = buildStringPool(typeStrings);

  const keyStrings = ["app_name", "keyboard_view", "method", "qwerty_layout"];
  const keyStringPool = buildStringPool(keyStrings);

  const pkgName = "com.amharic.keyboard";
  const pkgHeaderSize = 288;
  const typeStringsOff = pkgHeaderSize;
  const keyStringsOff = pkgHeaderSize + typeStringPool.length;
  const pkgTotalSize = keyStringsOff + keyStringPool.length;

  const pkgBuf = Buffer.alloc(pkgHeaderSize);
  pkgBuf.writeUInt16LE(0x0200, 0); // RES_TABLE_PACKAGE_TYPE
  pkgBuf.writeUInt16LE(pkgHeaderSize, 2);
  pkgBuf.writeUInt32LE(pkgTotalSize, 4);
  pkgBuf.writeUInt32LE(0x7f, 8); // Package ID 0x7f

  for (let i = 0; i < pkgName.length; i++) {
    pkgBuf.writeUInt16LE(pkgName.charCodeAt(i), 12 + i * 2);
  }

  pkgBuf.writeUInt32LE(typeStringsOff, 268);
  pkgBuf.writeUInt32LE(typeStrings.length, 272);
  pkgBuf.writeUInt32LE(keyStringsOff, 276);
  pkgBuf.writeUInt32LE(keyStrings.length, 280);

  const fullPkgChunk = Buffer.concat([pkgBuf, typeStringPool, keyStringPool]);

  const totalArscSize = 12 + globalStringPool.length + fullPkgChunk.length;
  const tableHeader = Buffer.alloc(12);
  tableHeader.writeUInt16LE(0x0002, 0); // RES_TABLE_TYPE
  tableHeader.writeUInt16LE(12, 2);
  tableHeader.writeUInt32LE(totalArscSize, 4);
  tableHeader.writeUInt32LE(1, 8); // package count = 1

  return Buffer.concat([tableHeader, globalStringPool, fullPkgChunk]);
}

// ============================================================================
// 4. Standalone APK Package Assembler with Cryptographically Valid PKCS7 RSA Signature
// ============================================================================
export async function buildApkBuffer(): Promise<Buffer> {
  const apkZip = new JSZip();

  // 1. AndroidManifest.xml (Binary XML with namespaces)
  const manifestAxml = buildAxml({
    tag: 'manifest',
    attrs: [
      { name: 'package', value: 'com.amharic.keyboard' },
      { ns: nsAndroid, name: 'versionCode', value: 1 },
      { ns: nsAndroid, name: 'versionName', value: '1.0.0' }
    ],
    children: [
      {
        tag: 'uses-sdk',
        attrs: [
          { ns: nsAndroid, name: 'minSdkVersion', value: 21 },
          { ns: nsAndroid, name: 'targetSdkVersion', value: 34 }
        ]
      },
      {
        tag: 'application',
        attrs: [
          { ns: nsAndroid, name: 'label', value: 'Amharic Windows Phonetic Keyboard' },
          { ns: nsAndroid, name: 'allowBackup', value: true }
        ],
        children: [
          {
            tag: 'service',
            attrs: [
              { ns: nsAndroid, name: 'name', value: 'com.amharic.keyboard.AmharicIME' },
              { ns: nsAndroid, name: 'label', value: 'Amharic Windows Phonetic IME' },
              { ns: nsAndroid, name: 'permission', value: 'android.permission.BIND_INPUT_METHOD' },
              { ns: nsAndroid, name: 'exported', value: true }
            ],
            children: [
              {
                tag: 'intent-filter',
                children: [
                  {
                    tag: 'action',
                    attrs: [{ ns: nsAndroid, name: 'name', value: 'android.view.InputMethod' }]
                  }
                ]
              },
              {
                tag: 'meta-data',
                attrs: [
                  { ns: nsAndroid, name: 'name', value: 'android.view.im' },
                  { ns: nsAndroid, name: 'resource', value: 0x7f050000, type: 'ref' }
                ]
              }
            ]
          }
        ]
      }
    ]
  });

  // 2. res/layout/keyboard_view.xml
  const keyboardViewAxml = buildAxml({
    tag: 'android.inputmethodservice.KeyboardView',
    attrs: [
      { ns: nsAndroid, name: 'id', value: 0x7f080000, type: 'ref' },
      { ns: nsAndroid, name: 'keyBackground', value: 0x01080000, type: 'ref' }
    ]
  });

  // 3. res/xml/method.xml
  const methodAxml = buildAxml({
    tag: 'input-method',
    attrs: [
      { ns: nsAndroid, name: 'settingsActivity', value: 'com.amharic.keyboard.SettingsActivity' },
      { ns: nsAndroid, name: 'isDefault', value: true }
    ],
    children: [
      {
        tag: 'subtype',
        attrs: [
          { ns: nsAndroid, name: 'label', value: 'Amharic (Windows Phonetic)' },
          { ns: nsAndroid, name: 'imeSubtypeLocale', value: 'am_ET' },
          { ns: nsAndroid, name: 'imeSubtypeMode', value: 'keyboard' }
        ]
      }
    ]
  });

  // 4. res/xml/qwerty_layout.xml
  const qwertyAxml = buildAxml({
    tag: 'Keyboard',
    attrs: [
      { ns: nsAndroid, name: 'keyWidth', value: 10 },
      { ns: nsAndroid, name: 'keyHeight', value: 50 }
    ]
  });

  // 5. classes.dex
  const dexBuffer = buildDex();

  // 6. resources.arsc
  const arscBuffer = buildResourcesArsc();

  // Add application files to ZIP
  apkZip.file('AndroidManifest.xml', manifestAxml);
  apkZip.file('classes.dex', dexBuffer);
  apkZip.file('resources.arsc', arscBuffer);
  apkZip.file('res/layout/keyboard_view.xml', keyboardViewAxml);
  apkZip.file('res/xml/method.xml', methodAxml);
  apkZip.file('res/xml/qwerty_layout.xml', qwertyAxml);

  const entries = [
    { name: 'AndroidManifest.xml', data: manifestAxml },
    { name: 'classes.dex', data: dexBuffer },
    { name: 'resources.arsc', data: arscBuffer },
    { name: 'res/layout/keyboard_view.xml', data: keyboardViewAxml },
    { name: 'res/xml/method.xml', data: methodAxml },
    { name: 'res/xml/qwerty_layout.xml', data: qwertyAxml }
  ];

  // Generate MANIFEST.MF & CERT.SF
  const manifestLines: string[] = [
    "Manifest-Version: 1.0",
    "Created-By: 1.0 (Android)",
    ""
  ];

  const sfLines: string[] = [
    "Signature-Version: 1.0",
    "Created-By: 1.0 (Android)",
    ""
  ];

  for (const entry of entries) {
    const sha1Hash = crypto.createHash('sha1').update(entry.data).digest('base64');
    const sha256Hash = crypto.createHash('sha256').update(entry.data).digest('base64');

    manifestLines.push(`Name: ${entry.name}`);
    manifestLines.push(`SHA1-Digest: ${sha1Hash}`);
    manifestLines.push(`SHA-256-Digest: ${sha256Hash}`);
    manifestLines.push("");
  }

  const manifestContent = manifestLines.join("\r\n");
  const manifestSha1 = crypto.createHash('sha1').update(manifestContent).digest('base64');
  const manifestSha256 = crypto.createHash('sha256').update(manifestContent).digest('base64');

  sfLines.push(`SHA1-Digest-Manifest: ${manifestSha1}`);
  sfLines.push(`SHA-256-Digest-Manifest: ${manifestSha256}`);
  sfLines.push("");

  for (const entry of entries) {
    const sectionText = `Name: ${entry.name}\r\nSHA1-Digest: ${crypto.createHash('sha1').update(entry.data).digest('base64')}\r\nSHA-256-Digest: ${crypto.createHash('sha256').update(entry.data).digest('base64')}\r\n\r\n`;
    const secSha1 = crypto.createHash('sha1').update(sectionText).digest('base64');
    const secSha256 = crypto.createHash('sha256').update(sectionText).digest('base64');

    sfLines.push(`Name: ${entry.name}`);
    sfLines.push(`SHA1-Digest: ${secSha1}`);
    sfLines.push(`SHA-256-Digest: ${secSha256}`);
    sfLines.push("");
  }

  const sfContent = sfLines.join("\r\n");

  // Generate RSA 2048 keypair & X.509 self-signed Certificate with node-forge
  const keys = forge.pki.rsa.generateKeyPair(2048);
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = '01' + Date.now().toString(16);
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 30);

  const attrs = [
    { name: 'commonName', value: 'Amharic Soft Keyboard' },
    { name: 'organizationName', value: 'Amharic Keyboard' },
    { name: 'countryName', value: 'ET' }
  ];
  cert.setSubject(attrs);
  cert.setIssuer(attrs);
  cert.sign(keys.privateKey, forge.md.sha256.create());

  // Create PKCS7 SignedData structure for CERT.RSA
  const p7 = forge.pkcs7.createSignedData();
  p7.content = forge.util.createBuffer(sfContent, 'utf8');
  p7.addCertificate(cert);
  p7.addSigner({
    key: keys.privateKey,
    certificate: cert,
    digestAlgorithm: forge.pki.oids.sha256,
    authenticatedAttributes: [
      {
        type: forge.pki.oids.contentType,
        value: forge.pki.oids.data
      },
      {
        type: forge.pki.oids.messageDigest
      },
      {
        type: forge.pki.oids.signingTime,
        value: new Date().toISOString()
      }
    ]
  });

  p7.sign({ detached: true });
  const certRsaDer = Buffer.from(forge.asn1.toDer(p7.toAsn1()).getBytes(), 'binary');

  apkZip.file('META-INF/MANIFEST.MF', manifestContent);
  apkZip.file('META-INF/CERT.SF', sfContent);
  apkZip.file('META-INF/CERT.RSA', certRsaDer);

  return await apkZip.generateAsync({ type: 'nodebuffer', compression: 'STORE' });
}
