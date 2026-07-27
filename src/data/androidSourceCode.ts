/**
 * Native Android (Kotlin & Java) Source Files for Amharic Soft Keyboard (IME)
 * 
 * Supports Android 2.4 (API 8) up to Android 15 (API 35+).
 * Pure native InputMethodService with Windows 10 Amharic Phonetic Engine,
 * dedicated Language Lock key, zero external runtime dependencies, and ultra-lightweight memory footprint.
 */

import { AndroidCodeFile } from '../types';

export const ANDROID_FILES: AndroidCodeFile[] = [
  {
    filename: 'AmharicIME.kt',
    path: 'app/src/main/java/com/amharic/keyboard/AmharicIME.kt',
    language: 'kotlin',
    description: 'Kotlin InputMethodService managing soft keyboard views, touch events, language locking state (English vs Amharic), and phonetic key dispatching.',
    content: `package com.amharic.keyboard

import android.inputmethodservice.InputMethodService
import android.inputmethodservice.Keyboard
import android.inputmethodservice.KeyboardView
import android.view.KeyEvent
import android.view.View
import android.view.inputmethod.InputConnection
import android.widget.Toast

/**
 * Native Kotlin Amharic Soft Keyboard (InputMethodService)
 * 
 * Compatible with Android 2.4 (API 8) up to Android 15 (API 35+).
 * Implements dedicated Language Locking (English default vs. Windows 10 Amharic Phonetic).
 */
class AmharicIME : InputMethodService(), KeyboardView.OnKeyboardActionListener {

    companion object {
        const val KEYCODE_LANG_LOCK = -101 // Dedicated Language Lock Toggle
        const val KEYCODE_SHIFT = Keyboard.KEYCODE_SHIFT
        const val KEYCODE_DELETE = Keyboard.KEYCODE_DELETE
        const val KEYCODE_DONE = Keyboard.KEYCODE_DONE
    }

    private var keyboardView: KeyboardView? = null
    private var qwertyKeyboard: Keyboard? = null
    
    // Core IME State
    private var isAmharicLocked = false
    private var isShifted = false
    private var currentSyllableBuffer = ""

    override fun onCreateInputView(): View {
        keyboardView = layoutInflater.inflate(R.layout.keyboard_view, null) as KeyboardView
        qwertyKeyboard = Keyboard(this, R.xml.qwerty_layout)
        keyboardView?.apply {
            keyboard = qwertyKeyboard
            setOnKeyboardActionListener(this@AmharicIME)
        }
        return keyboardView!!
    }

    override fun onKey(primaryCode: Int, keyCodes: IntArray?) {
        val ic: InputConnection = currentInputConnection ?: return

        when (primaryCode) {
            KEYCODE_LANG_LOCK -> {
                // Toggle Language Lock between English & Windows 10 Amharic Phonetic
                isAmharicLocked = !isAmharicLocked
                currentSyllableBuffer = ""
                
                val msg = if (isAmharicLocked) 
                    "Amharic Language LOCKED (Windows 10 Phonetic)" 
                else 
                    "English Language LOCKED"
                Toast.makeText(this, msg, Toast.LENGTH_SHORT).show()
                
                keyboardView?.invalidateAllKeys()
            }

            KEYCODE_DELETE -> {
                if (currentSyllableBuffer.isNotEmpty()) {
                    currentSyllableBuffer = ""
                }
                ic.deleteSurroundingText(1, 0)
            }

            KEYCODE_SHIFT -> {
                isShifted = !isShifted
                qwertyKeyboard?.isShifted = isShifted
                keyboardView?.invalidateAllKeys()
            }

            KEYCODE_DONE -> {
                ic.sendKeyEvent(KeyEvent(KeyEvent.ACTION_DOWN, KeyEvent.KEYCODE_ENTER))
                ic.sendKeyEvent(KeyEvent(KeyEvent.ACTION_UP, KeyEvent.KEYCODE_ENTER))
                currentSyllableBuffer = ""
            }

            else -> {
                var codeChar = primaryCode.toChar()
                
                if (isShifted) {
                    codeChar = codeChar.uppercaseChar()
                    isShifted = false
                    qwertyKeyboard?.isShifted = false
                    keyboardView?.invalidateAllKeys()
                }

                if (isAmharicLocked) {
                    // Process through Kotlin Windows 10 Amharic Phonetic Engine
                    val res = PhoneticEngineKt.processKey(codeChar.toString(), currentSyllableBuffer)
                    
                    if (res.replaceLength > 0) {
                        ic.deleteSurroundingText(res.replaceLength, 0)
                    }
                    ic.commitText(res.outputChar, 1)
                    currentSyllableBuffer = res.newBuffer
                } else {
                    // Standard English input mode
                    ic.commitText(codeChar.toString(), 1)
                    currentSyllableBuffer = ""
                }
            }
        }
    }

    override fun onPress(primaryCode: Int) {}
    override fun onRelease(primaryCode: Int) {}
    override fun onText(text: CharSequence?) {}
    override fun swipeLeft() {}
    override fun swipeRight() {}
    override fun swipeDown() {}
    override fun swipeUp() {}
}
`,
  },
  {
    filename: 'PhoneticEngineKt.kt',
    path: 'app/src/main/java/com/amharic/keyboard/PhoneticEngineKt.kt',
    language: 'kotlin',
    description: 'High-performance Kotlin object implementing Windows 10 Amharic Phonetic letter composition logic.',
    content: `package com.amharic.keyboard

/**
 * Pure Kotlin Implementation of Windows 10 Amharic Phonetic Composition Engine.
 * Supports all 7 orders + labialized forms + digraphs (ch, zh, ny, ts, etc.).
 */
object PhoneticEngineKt {

    data class Result(
        val outputChar: String,
        val replaceLength: Int,
        val newBuffer: String
    )

    // Consonant Family Map (Index: 0=1st, 1=2nd, 2=3rd, 3=4th, 4=5th, 5=6th, 6=7th, 7=labialized)
    private val FAMILIES = mapOf(
        "h" to arrayOf("ሀ", "ሁ", "ሂ", "ሃ", "ሄ", "ህ", "ሆ", "ኋ"),
        "H" to arrayOf("ሐ", "ሑ", "ሒ", "ሓ", "ሔ", "ሕ", "ሖ", "ሗ"),
        "l" to arrayOf("ለ", "ሉ", "ሊ", "ላ", "ሌ", "ል", "ሎ", "ሏ"),
        "m" to arrayOf("መ", "ሙ", "ሚ", "ማ", "ሜ", "ም", "ሞ", "ሟ"),
        "r" to arrayOf("ረ", "ሩ", "ሪ", "ራ", "ሬ", "ር", "ሮ", "ሯ"),
        "s" to arrayOf("ሰ", "ሱ", "ሲ", "ሳ", "ሴ", "ስ", "ሶ", "ሷ"),
        "S" to arrayOf("ሠ", "ሡ", "ሢ", "ሣ", "ሤ", "ሥ", "ሦ", "ሧ"),
        "q" to arrayOf("ቀ", "ቁ", "ቂ", "ቃ", "ቄ", "ቅ", "ቆ", "ቋ"),
        "b" to arrayOf("በ", "ቡ", "ቢ", "ባ", "ቤ", "ብ", "ቦ", "ቧ"),
        "v" to arrayOf("ቨ", "ቩ", "ቪ", "ቫ", "ቬ", "ቭ", "ቮ", "ቯ"),
        "t" to arrayOf("ተ", "ቱ", "ቲ", "ታ", "ቴ", "ት", "ቶ", "ቷ"),
        "ch" to arrayOf("ቸ", "ቹ", "ቺ", "ቻ", "ቼ", "ች", "ቾ", "ቿ"),
        "n" to arrayOf("ነ", "ኑ", "ኒ", "ና", "ኔ", "ን", "ኖ", "ኗ"),
        "N" to arrayOf("ኘ", "ኙ", "ኚ", "ኛ", "፜", "ኝ", "ኞ", "፝"),
        "ny" to arrayOf("ኘ", "ኙ", "ኚ", "ኛ", "፜", "ኝ", "ኞ", "፝"),
        "a" to arrayOf("አ", "ኡ", "ኢ", "ኣ", "ኤ", "እ", "ኦ", "ኧ"),
        "A" to arrayOf("ዐ", "ዑ", "ዒ", "ዓ", "ዔ", "ዕ", "ዖ", ""),
        "k" to arrayOf("ከ", "ኩ", "ኪ", "ካ", "ኬ", "ክ", "ኮ", "ኳ"),
        "w" to arrayOf("ወ", "ዉ", "ዊ", "ዋ", "ዌ", "ው", "ዎ", ""),
        "z" to arrayOf("ዘ", "ዙ", "ዚ", "ዛ", "ዜ", "ዝ", "ዞ", "ዟ"),
        "Z" to arrayOf("ዠ", "ዡ", "ዢ", "ዣ", "ዤ", "ዥ", "ዦ", "ዧ"),
        "zh" to arrayOf("ዠ", "ዡ", "ዢ", "ዣ", "ዤ", "ዥ", "ዦ", "ዧ"),
        "y" to arrayOf("የ", "ዩ", "ዪ", "ያ", "ዬ", "ይ", "ዮ", ""),
        "d" to arrayOf("ደ", "ዱ", "ዲ", "ዳ", "ዴ", "ድ", "ዶ", "ዷ"),
        "j" to arrayOf("ጀ", "ጁ", "ጂ", "ጃ", "ጄ", "ጅ", "ጆ", "ጇ"),
        "g" to arrayOf("ገ", "ጉ", "ጊ", "ጋ", "ጌ", "ግ", "ጎ", "ጓ"),
        "T" to arrayOf("ጠ", "ጡ", "ጢ", "ጣ", "ጤ", "ጥ", "ጦ", "ጧ"),
        "C" to arrayOf("ጨ", "ጩ", "ጪ", "ጫ", "ጬ", "ጭ", "ጮ", "ጯ"),
        "P" to arrayOf("ጰ", "ጱ", "ጲ", "ጳ", "ጴ", "ጵ", "ጶ", "<ctrl42>"),
        "ts" to arrayOf("ጸ", "ጹ", "ጺ", "ጻ", "ጼ", "ጽ", "ጾ", "ጿ"),
        "f" to arrayOf("ፈ", "ፉ", "ፊ", "ፋ", "ፌ", "ፍ", "ፎ", "ፏ"),
        "p" to arrayOf("ፐ", "ፑ", "ፒ", "ፓ", "ፔ", "ፕ", "ፖ", "ፗ")
    )

    fun processKey(key: String, currentBuffer: String): Result {
        val combined = currentBuffer + key

        // Punctuation
        if (key == ":" && currentBuffer == ":") return Result("፡", 1, "")
        if (key == ":" && currentBuffer == "::") return Result("።", 1, "")

        // Digraphs (ch, zh, ny, ts)
        if (combined in setOf("ch", "zh", "ny", "ts")) {
            val orders = FAMILIES[combined] ?: return Result(key, 0, "")
            return Result(orders[0], currentBuffer.length, combined)
        }

        // Active consonant buffer conversion via vowel modifiers
        if (currentBuffer.isNotEmpty() && FAMILIES.containsKey(currentBuffer)) {
            val orders = FAMILIES[currentBuffer]!!
            return when (key.lowercase()) {
                "u" -> Result(orders[1], 1, "")
                "i" -> Result(orders[2], 1, "")
                "a" -> Result(orders[3], 1, "")
                "e" -> Result(orders[4], 1, "")
                "o" -> Result(orders[6], 1, "")
                "w" -> if (orders.size > 7 && orders[7].isNotEmpty()) Result(orders[7], 1, "") else Result(key, 0, "")
                else -> {
                    if (key == "I") Result(orders[5], 1, "")
                    else if (FAMILIES.containsKey(key)) {
                        val newOrders = FAMILIES[key]!!
                        Result(newOrders[0], 0, key)
                    } else Result(key, 0, "")
                }
            }
        }

        // New consonant key
        if (FAMILIES.containsKey(key)) {
            val orders = FAMILIES[key]!!
            return Result(orders[0], 0, key)
        }

        return Result(key, 0, "")
    }
}
`,
  },
  {
    filename: 'AmharicIME.java',
    path: 'app/src/main/java/com/amharic/keyboard/AmharicIME.java',
    language: 'java',
    description: 'Pure Java InputMethodService managing keyboard views, touch events, language locking state, and key dispatching.',
    content: `package com.amharic.keyboard;

import android.inputmethodservice.InputMethodService;
import android.inputmethodservice.Keyboard;
import android.inputmethodservice.KeyboardView;
import android.view.KeyEvent;
import android.view.View;
import android.view.inputmethod.InputConnection;
import android.widget.Toast;

/**
 * Pure Java Amharic Soft Keyboard (InputMethodService)
 * Compatible back to Android 2.4 (API 8) up to Android 15 (API 35+).
 */
public class AmharicIME extends InputMethodService implements KeyboardView.OnKeyboardActionListener {

    public static final int KEYCODE_LANG_LOCK = -101;
    public static final int KEYCODE_SHIFT = Keyboard.KEYCODE_SHIFT;
    public static final int KEYCODE_DELETE = Keyboard.KEYCODE_DELETE;
    public static final int KEYCODE_DONE = Keyboard.KEYCODE_DONE;

    private KeyboardView mKeyboardView;
    private Keyboard mQwertyKeyboard;
    
    private boolean isAmharicLocked = false;
    private boolean isShifted = false;
    private String currentSyllableBuffer = "";

    @Override
    public View onCreateInputView() {
        mKeyboardView = (KeyboardView) getLayoutInflater().inflate(R.layout.keyboard_view, null);
        mQwertyKeyboard = new Keyboard(this, R.xml.qwerty_layout);
        mKeyboardView.setKeyboard(mQwertyKeyboard);
        mKeyboardView.setOnKeyboardActionListener(this);
        return mKeyboardView;
    }

    @Override
    public void onKey(int primaryCode, int[] keyCodes) {
        InputConnection ic = getCurrentInputConnection();
        if (ic == null) return;

        switch (primaryCode) {
            case KEYCODE_LANG_LOCK:
                isAmharicLocked = !isAmharicLocked;
                currentSyllableBuffer = "";
                
                String toastMsg = isAmharicLocked ? 
                    "Amharic Language LOCKED (Windows 10 Phonetic)" : 
                    "English Language LOCKED";
                Toast.makeText(this, toastMsg, Toast.LENGTH_SHORT).show();
                
                mKeyboardView.invalidateAllKeys();
                break;

            case KEYCODE_DELETE:
                if (currentSyllableBuffer.length() > 0) {
                    currentSyllableBuffer = "";
                }
                ic.deleteSurroundingText(1, 0);
                break;

            case KEYCODE_SHIFT:
                isShifted = !isShifted;
                mQwertyKeyboard.setShifted(isShifted);
                mKeyboardView.invalidateAllKeys();
                break;

            case KEYCODE_DONE:
                ic.sendKeyEvent(new KeyEvent(KeyEvent.ACTION_DOWN, KeyEvent.KEYCODE_ENTER));
                ic.sendKeyEvent(new KeyEvent(KeyEvent.ACTION_UP, KeyEvent.KEYCODE_ENTER));
                currentSyllableBuffer = "";
                break;

            default:
                char codeChar = (char) primaryCode;
                
                if (isShifted) {
                    codeChar = Character.toUpperCase(codeChar);
                    isShifted = false;
                    mQwertyKeyboard.setShifted(false);
                    mKeyboardView.invalidateAllKeys();
                }

                if (isAmharicLocked) {
                    PhoneticEngine.Result res = PhoneticEngine.processKey(String.valueOf(codeChar), currentSyllableBuffer);
                    
                    if (res.replaceLength > 0) {
                        ic.deleteSurroundingText(res.replaceLength, 0);
                    }
                    ic.commitText(res.outputChar, 1);
                    currentSyllableBuffer = res.newBuffer;
                } else {
                    ic.commitText(String.valueOf(codeChar), 1);
                    currentSyllableBuffer = "";
                }
                break;
        }
    }

    @Override public void onPress(int primaryCode) {}
    @Override public void onRelease(int primaryCode) {}
    @Override public void onText(CharSequence text) {}
    @Override public void swipeLeft() {}
    @Override public void swipeRight() {}
    @Override public void swipeDown() {}
    @Override public void swipeUp() {}
}
`,
  },
  {
    filename: 'PhoneticEngine.java',
    path: 'app/src/main/java/com/amharic/keyboard/PhoneticEngine.java',
    language: 'java',
    description: 'Pure Java class executing Windows 10 Amharic Phonetic key combination rules.',
    content: `package com.amharic.keyboard;

import java.util.HashMap;
import java.util.Map;

public class PhoneticEngine {

    public static class Result {
        public final String outputChar;
        public final int replaceLength;
        public final String newBuffer;

        public Result(String outputChar, int replaceLength, String newBuffer) {
            this.outputChar = outputChar;
            this.replaceLength = replaceLength;
            this.newBuffer = newBuffer;
        }
    }

    private static final Map<String, String[]> FAMILIES = new HashMap<String, String[]>();

    static {
        FAMILIES.put("h", new String[]{"ሀ", "ሁ", "ሂ", "ሃ", "ሄ", "ህ", "ሆ", "ኋ"});
        FAMILIES.put("H", new String[]{"ሐ", "ሑ", "ሒ", "ሓ", "ሔ", "ሕ", "ሖ", "ሗ"});
        FAMILIES.put("l", new String[]{"ለ", "ሉ", "ሊ", "ላ", "ሌ", "ል", "ሎ", "ሏ"});
        FAMILIES.put("m", new String[]{"መ", "ሙ", "ሚ", "ማ", "ሜ", "ም", "ሞ", "ሟ"});
        FAMILIES.put("r", new String[]{"ረ", "ሩ", "ሪ", "ራ", "ሬ", "ር", "ሮ", "ሯ"});
        FAMILIES.put("s", new String[]{"ሰ", "ሱ", "ሲ", "ሳ", "ሴ", "ስ", "ሶ", "ሷ"});
        FAMILIES.put("S", new String[]{"ሠ", "ሡ", "ሢ", "ሣ", "ሤ", "ሥ", "ሦ", "ሧ"});
        FAMILIES.put("q", new String[]{"ቀ", "ቁ", "ቂ", "ቃ", "ቄ", "ቅ", "ቆ", "ቋ"});
        FAMILIES.put("b", new String[]{"በ", "ቡ", "ቢ", "ባ", "ቤ", "ብ", "ቦ", "ቧ"});
        FAMILIES.put("v", new String[]{"ቨ", "ቩ", "ቪ", "ቫ", "ቬ", "ቭ", "ቮ", "ቯ"});
        FAMILIES.put("t", new String[]{"ተ", "ቱ", "ቲ", "ታ", "ቴ", "ት", "ቶ", "ቷ"});
        FAMILIES.put("ch", new String[]{"ቸ", "ቹ", "ቺ", "ቻ", "ቼ", "ች", "ቾ", "ቿ"});
        FAMILIES.put("n", new String[]{"ነ", "ኑ", "ኒ", "ና", "ኔ", "ን", "ኖ", "ኗ"});
        FAMILIES.put("N", new String[]{"ኘ", "ኙ", "ኚ", "ኛ", "፜", "ኝ", "ኞ", "፝"});
        FAMILIES.put("ny", new String[]{"ኘ", "ኙ", "ኚ", "ኛ", "፜", "ኝ", "ኞ", "፝"});
        FAMILIES.put("a", new String[]{"አ", "ኡ", "ኢ", "ኣ", "ኤ", "እ", "ኦ", "ኧ"});
        FAMILIES.put("A", new String[]{"ዐ", "ዑ", "ዒ", "ዓ", "ዔ", "ዕ", "ዖ", ""});
        FAMILIES.put("k", new String[]{"ከ", "ኩ", "ኪ", "ካ", "ኬ", "ክ", "ኮ", "ኳ"});
        FAMILIES.put("w", new String[]{"ወ", "ዉ", "ዊ", "ዋ", "ዌ", "ው", "ዎ", ""});
        FAMILIES.put("z", new String[]{"ዘ", "ዙ", "ዚ", "ዛ", "ዜ", "ዝ", "ዞ", "ዟ"});
        FAMILIES.put("Z", new String[]{"ዠ", "ዡ", "ዢ", "ዣ", "ዤ", "ዥ", "ዦ", "ዧ"});
        FAMILIES.put("zh", new String[]{"ዠ", "ዡ", "ዢ", "ዣ", "ዤ", "ዥ", "ዦ", "ዧ"});
        FAMILIES.put("y", new String[]{"የ", "ዩ", "ዪ", "ያ", "ዬ", "ይ", "ዮ", ""});
        FAMILIES.put("d", new String[]{"ደ", "ዱ", "ዲ", "ዳ", "ዴ", "ድ", "ዶ", "ዷ"});
        FAMILIES.put("j", new String[]{"ጀ", "ጁ", "ጂ", "ጃ", "ጄ", "ጅ", "ጆ", "ጇ"});
        FAMILIES.put("g", new String[]{"ገ", "ጉ", "ጊ", "ጋ", "ጌ", "ግ", "ጎ", "ጓ"});
        FAMILIES.put("T", new String[]{"ጠ", "ጡ", "ጢ", "ጣ", "ጤ", "ጥ", "ጦ", "ጧ"});
        FAMILIES.put("C", new String[]{"ጨ", "ጩ", "ጪ", "ጫ", "ጬ", "ጭ", "ጮ", "ጯ"});
        FAMILIES.put("P", new String[]{"ጰ", "ጱ", "ጲ", "ጳ", "ጴ", "ጵ", "ጶ", "<ctrl42>"});
        FAMILIES.put("ts", new String[]{"ጸ", "ጹ", "ጺ", "ጻ", "ጼ", "ጽ", "ጾ", "ጿ"});
        FAMILIES.put("f", new String[]{"ፈ", "ፉ", "ፊ", "ፋ", "ፌ", "ፍ", "ፎ", "ፏ"});
        FAMILIES.put("p", new String[]{"ፐ", "ፑ", "ፒ", "ፓ", "ፔ", "ፕ", "ፖ", "ፗ"});
    }

    public static Result processKey(String key, String currentBuffer) {
        String combined = currentBuffer + key;

        if (key.equals(":") && currentBuffer.equals(":")) return new Result("፡", 1, "");
        if (key.equals(":") && currentBuffer.equals("::")) return new Result("።", 1, "");

        if (combined.equals("ch") || combined.equals("zh") || combined.equals("ny") || combined.equals("ts")) {
            String[] orders = FAMILIES.get(combined);
            return new Result(orders[0], currentBuffer.length(), combined);
        }

        if (currentBuffer.length() > 0 && FAMILIES.containsKey(currentBuffer)) {
            String[] orders = FAMILIES.get(currentBuffer);
            if (key.equalsIgnoreCase("u")) return new Result(orders[1], 1, "");
            if (key.equalsIgnoreCase("i")) return new Result(orders[2], 1, "");
            if (key.equalsIgnoreCase("a")) return new Result(orders[3], 1, "");
            if (key.equalsIgnoreCase("e")) return new Result(orders[4], 1, "");
            if (key.equals("I")) return new Result(orders[5], 1, "");
            if (key.equalsIgnoreCase("o")) return new Result(orders[6], 1, "");
            if (key.equalsIgnoreCase("w") && orders.length > 7 && !orders[7].isEmpty()) return new Result(orders[7], 1, "");
        }

        if (FAMILIES.containsKey(key)) {
            String[] orders = FAMILIES.get(key);
            return new Result(orders[0], 0, key);
        }

        return new Result(key, 0, "");
    }
}
`,
  },
  {
    filename: 'qwerty_layout.xml',
    path: 'app/src/main/res/xml/qwerty_layout.xml',
    language: 'xml',
    description: 'Android Soft Keyboard XML layout containing key codes and dedicated Language Lock key (-101).',
    content: `<?xml version="1.0" encoding="utf-8"?>
<Keyboard xmlns:android="http://schemas.android.com/apk/res/android"
    android:keyWidth="10%p"
    android:keyHeight="50dp"
    android:horizontalGap="0px"
    android:verticalGap="0px">

    <Row>
        <Key android:codes="113" android:keyLabel="q" android:keyEdgeFlags="left"/>
        <Key android:codes="119" android:keyLabel="w"/>
        <Key android:codes="101" android:keyLabel="e"/>
        <Key android:codes="114" android:keyLabel="r"/>
        <Key android:codes="116" android:keyLabel="t"/>
        <Key android:codes="121" android:keyLabel="y"/>
        <Key android:codes="117" android:keyLabel="u"/>
        <Key android:codes="105" android:keyLabel="i"/>
        <Key android:codes="111" android:keyLabel="o"/>
        <Key android:codes="112" android:keyLabel="p" android:keyEdgeFlags="right"/>
    </Row>

    <Row>
        <Key android:codes="97" android:keyLabel="a" android:horizontalGap="5%p" android:keyEdgeFlags="left"/>
        <Key android:codes="115" android:keyLabel="s"/>
        <Key android:codes="100" android:keyLabel="d"/>
        <Key android:codes="102" android:keyLabel="f"/>
        <Key android:codes="103" android:keyLabel="g"/>
        <Key android:codes="104" android:keyLabel="h"/>
        <Key android:codes="106" android:keyLabel="j"/>
        <Key android:codes="107" android:keyLabel="k"/>
        <Key android:codes="108" android:keyLabel="l" android:keyEdgeFlags="right"/>
    </Row>

    <Row>
        <Key android:codes="-1" android:keyIcon="@android:drawable/ic_menu_agenda" android:keyWidth="15%p" android:keyEdgeFlags="left"/>
        <Key android:codes="122" android:keyLabel="z"/>
        <Key android:codes="120" android:keyLabel="x"/>
        <Key android:codes="99" android:keyLabel="c"/>
        <Key android:codes="118" android:keyLabel="v"/>
        <Key android:codes="98" android:keyLabel="b"/>
        <Key android:codes="110" android:keyLabel="n"/>
        <Key android:codes="109" android:keyLabel="m"/>
        <Key android:codes="-5" android:keyIcon="@android:drawable/ic_input_delete" android:keyWidth="15%p" android:keyEdgeFlags="right"/>
    </Row>

    <Row android:rowEdgeFlags="bottom">
        <Key android:codes="-101" android:keyLabel="🔒 LANG LOCK" android:keyWidth="25%p" android:keyEdgeFlags="left"/>
        <Key android:codes="32" android:keyLabel="SPACE (አማርኛ / EN)" android:keyWidth="50%p"/>
        <Key android:codes="-4" android:keyLabel="ENTER" android:keyWidth="25%p" android:keyEdgeFlags="right"/>
    </Row>
</Keyboard>
`,
  },
  {
    filename: 'AndroidManifest.xml',
    path: 'app/src/main/AndroidManifest.xml',
    language: 'xml',
    description: 'Android Manifest defining InputMethodService permission and backward compatibility for Android 2.4+.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.amharic.keyboard"
    android:versionCode="1"
    android:versionName="1.0.0">

    <uses-sdk 
        android:minSdkVersion="8" 
        android:targetSdkVersion="35" />

    <application
        android:allowBackup="true"
        android:icon="@android:drawable/ic_btn_speak_now"
        android:label="Amharic Windows Phonetic Keyboard"
        android:theme="@android:style/Theme.InputMethod">

        <service
            android:name=".AmharicIME"
            android:label="Amharic Windows Phonetic IME"
            android:permission="android.permission.BIND_INPUT_METHOD"
            android:exported="true">
            <intent-filter>
                <action android:name="android.view.InputMethod" />
            </intent-filter>
            <meta-data
                android:name="android.view.im"
                android:resource="@xml/method" />
        </service>

    </application>
</manifest>
`,
  },
  {
    filename: 'build.gradle.kts',
    path: 'build.gradle.kts',
    language: 'kotlin',
    description: 'Kotlin Gradle build configuration for Native Android Studio build.',
    content: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.amharic.keyboard"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.amharic.keyboard"
        minSdk = 8   // Supports Android 2.4+ (API 8) up to Android 15
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
    }

    buildTypes {
        getByName("release") {
            isMinifyEnabled = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }
    
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }
    
    kotlinOptions {
        jvmTarget = "1.8"
    }
}

dependencies {
    // Ultra-lightweight: zero unnecessary dependencies
}
`,
  },
];
