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
        Log.d(TAG, "📥 updateWidgetNotes called")
        Log.d(TAG, "JSON length: ${notesJson.length}")
        
        try {
            val context = reactApplicationContext.applicationContext
            NotesWidget.updateWidgetNotes(context, notesJson)
            Log.d(TAG, "✅ Widget updated successfully")
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error updating widget", e)
        }
    }
    
    init {
        Log.d(TAG, "✅ WidgetDataModule initialized")
    }
}
