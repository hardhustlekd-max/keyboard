package com.amharic.keyboard

import android.content.Intent
import android.os.Bundle
import android.provider.Settings
import android.view.inputmethod.InputMethodManager
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class SettingsActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_settings)

        val btnEnable = findViewById<Button>(R.id.btnEnableKeyboard)
        val btnSelect = findViewById<Button>(R.id.btnSelectKeyboard)
        val statusText = findViewById<TextView>(R.id.tvStatus)

        btnEnable.setOnClickListener {
            startActivity(Intent(Settings.ACTION_INPUT_METHOD_SETTINGS))
        }

        btnSelect.setOnClickListener {
            val imm = getSystemService(INPUT_METHOD_SERVICE) as InputMethodManager
            imm.showInputMethodPicker()
        }

        updateStatus(statusText)
    }

    override fun onResume() {
        super.onResume()
        val statusText = findViewById<TextView>(R.id.tvStatus)
        updateStatus(statusText)
    }

    private fun updateStatus(statusText: TextView) {
        val imm = getSystemService(INPUT_METHOD_SERVICE) as InputMethodManager
        val enabledMethods = imm.enabledInputMethodList
        val isEnabled = enabledMethods.any { it.packageName == packageName }

        if (isEnabled) {
            statusText.text = "Status: Amharic Keyboard is ENABLED ✓"
            statusText.setTextColor(0xFF10B981.toInt())
        } else {
            statusText.text = "Status: Keyboard Not Enabled Yet"
            statusText.setTextColor(0xFFEF4444.toInt())
        }
    }
}
