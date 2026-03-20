package com.mkhailksk.famnotes

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import android.util.Log
import com.mkhailksk.famnotes.widget.NotesWidget

class WidgetDataModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    
    private val TAG = "WidgetDataModule"
    
    override fun getName(): String = "WidgetDataModule"
    
    @ReactMethod
    fun updateWidgetNotes(notesJson: String) {
        Log.d(TAG, "📥 updateWidgetNotes called with JSON length: ${notesJson.length}")
        Log.d(TAG, "📄 JSON preview: ${notesJson.take(200)}")
        
        if (notesJson == "[]" || notesJson.isBlank()) {
            Log.d(TAG, "⚠️ Empty notes array received")
        } else {
            Log.d(TAG, "✅ Notes array has content")
        }
        
        val context = reactApplicationContext
        NotesWidget.updateWidgetNotes(context, notesJson)
    }
}
