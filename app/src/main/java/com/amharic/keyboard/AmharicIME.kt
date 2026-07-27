package com.amharic.keyboard

import android.inputmethodservice.InputMethodService
import android.inputmethodservice.Keyboard
import android.inputmethodservice.KeyboardView
import android.view.View

/**
 * Main Android Input Method Service (IME) for Amharic Windows Phonetic Keyboard.
 */
class AmharicIME : InputMethodService(), KeyboardView.OnKeyboardActionListener {

    private lateinit var keyboardView: KeyboardView
    private lateinit var keyboard: Keyboard
    private var compositionBuffer = ""

    override fun onCreateInputView(): View {
        keyboardView = layoutInflater.inflate(R.layout.keyboard_view, null) as KeyboardView
        keyboard = Keyboard(this, R.xml.qwerty_layout)
        keyboardView.keyboard = keyboard
        keyboardView.setOnKeyboardActionListener(this)
        return keyboardView
    }

    override fun onKey(primaryCode: Int, keyCodes: IntArray?) {
        val ic = currentInputConnection ?: return

        when (primaryCode) {
            Keyboard.KEYCODE_DELETE -> {
                if (compositionBuffer.isNotEmpty()) {
                    compositionBuffer = compositionBuffer.dropLast(1)
                    ic.deleteSurroundingText(1, 0)
                } else {
                    ic.deleteSurroundingText(1, 0)
                }
            }
            Keyboard.KEYCODE_DONE, 10 -> {
                compositionBuffer = ""
                ic.sendKeyEvent(android.view.KeyEvent(android.view.KeyEvent.ACTION_DOWN, android.view.KeyEvent.KEYCODE_ENTER))
            }
            32 -> { // Space
                compositionBuffer = ""
                ic.commitText(" ", 1)
            }
            else -> {
                val codeChar = primaryCode.toChar().toString()
                val result = PhoneticEngine.processKey(codeChar, compositionBuffer)
                
                if (result.deleteCount > 0) {
                    ic.deleteSurroundingText(result.deleteCount, 0)
                }
                
                ic.commitText(result.output, 1)
                compositionBuffer = result.newBuffer
            }
        }
    }

    override fun onPress(primaryCode: Int) {}
    override fun onRelease(primaryCode: Int) {}
    override fun onText(text: CharSequence?) {
        val ic = currentInputConnection ?: return
        ic.commitText(text, 1)
    }
    override fun swipeLeft() {}
    override fun swipeRight() {}
    override fun swipeDown() {}
    override fun swipeUp() {}
}
