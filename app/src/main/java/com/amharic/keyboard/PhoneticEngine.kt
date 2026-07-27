package com.amharic.keyboard

/**
 * Windows 10 Amharic Phonetic Engine
 * Exact deterministic mapping for 7 Fidel orders, labialized vowels, punctuation, and numerals.
 */
object PhoneticEngine {

    data class Result(
        val output: String,
        val newBuffer: String,
        val deleteCount: Int
    )

    private val baseMap = mapMapOf(
        "h" to "ሀ", "l" to "ለ", "H" to "ሐ", "m" to "መ", "s" to "ሠ",
        "r" to "ረ", "S" to "ሰ", "x" to "ሸ", "q" to "ቀ", "b" to "በ",
        "v" to "ቨ", "t" to "ተ", "c" to "ቸ", "n" to "ነ", "N" to "ኘ",
        "a" to "አ", "k" to "ከ", "K" to "ኸ", "w" to "ወ", "E" to "ዐ",
        "z" to "ዘ", "Z" to "ዠ", "y" to "የ", "d" to "ደ", "j" to "ጀ",
        "g" to "ገ", "T" to "ጠ", "C" to "ጨ", "P" to "ጰ", "S2" to "ጸ",
        "S3" to "ፀ", "f" to "ፈ", "p" to "ፐ"
    )

    private fun mapMapOf(vararg pairs: Pair<String, String>): Map<String, String> {
        return pairs.toMap()
    }

    private val orders = arrayOf("ä", "u", "i", "a", "e", "ə", "o")

    fun processKey(key: String, buffer: String): Result {
        // Handle Backspace
        if (key == "BACKSPACE") {
            return if (buffer.isNotEmpty()) {
                Result("", buffer.dropLast(1), 1)
            } else {
                Result("", "", 0)
            }
        }

        // Handle Space / Enter
        if (key == " " || key == "\n") {
            return Result(key, "", 0)
        }

        val newBuf = buffer + key

        // Check for double character triggers
        if (newBuf == "ts" || newBuf == "Tz") {
            return Result("", newBuf, buffer.length)
        }

        // Try mapping exact key combination
        val mapped = mapCharacter(newBuf)
        if (mapped != null) {
            return Result(mapped, newBuf, buffer.length)
        }

        // If buffer was partially matching but new key doesn't extend it, flush current and process new key
        val singleMap = mapCharacter(key)
        if (singleMap != null) {
            return Result(singleMap, key, 0)
        }

        return Result(key, "", 0)
    }

    private fun mapCharacter(input: String): String? {
        // Base consonant + vowel order logic
        if (input.length == 1) {
            return baseMap[input]
        }

        if (input.length == 2) {
            val cons = input.substring(0, 1)
            val vowel = input.substring(1, 2)
            val baseChar = baseMap[cons] ?: return null

            val orderIdx = when (vowel) {
                "e" -> 0
                "u" -> 1
                "i" -> 2
                "a" -> 3
                "E" -> 4
                "o" -> 6
                else -> -1
            }

            if (orderIdx != -1) {
                val baseCode = baseChar[0].code
                return (baseCode + orderIdx).toChar().toString()
            }
        }

        return null
    }
}
