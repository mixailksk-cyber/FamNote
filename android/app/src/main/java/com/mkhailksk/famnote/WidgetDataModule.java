package com.mkhailksk.famnote;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.module.annotations.ReactModule;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

@ReactModule(name = WidgetDataModule.NAME)
public class WidgetDataModule extends ReactContextBaseJavaModule {
    public static final String NAME = "WidgetDataModule";
    private static final String PREFS_NAME = "com.mkhailksk.famnote.widget";
    private static final String NOTES_KEY = "widget_notes";

    public WidgetDataModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return NAME;
    }

    @ReactMethod
    public void updateWidgetNotes(ReadableArray notes) {
        try {
            // Конвертируем ReadableArray в JSONArray
            JSONArray jsonArray = new JSONArray();
            for (int i = 0; i < notes.size(); i++) {
                ReadableMap note = notes.getMap(i);
                JSONObject jsonNote = new JSONObject();
                
                ReadableMapKeySetIterator iterator = note.keySetIterator();
                while (iterator.hasNextKey()) {
                    String key = iterator.nextKey();
                    switch (note.getType(key)) {
                        case String:
                            jsonNote.put(key, note.getString(key));
                            break;
                        case Number:
                            jsonNote.put(key, note.getDouble(key));
                            break;
                        case Boolean:
                            jsonNote.put(key, note.getBoolean(key));
                            break;
                    }
                }
                jsonArray.put(jsonNote);
            }

            // Сохраняем в SharedPreferences
            Context context = getReactApplicationContext();
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            prefs.edit().putString(NOTES_KEY, jsonArray.toString()).apply();

            // Обновляем виджет
            NotesWidget.updateWidgetNotes(context, jsonArray.toString());

            Log.d(NAME, "Widget updated with " + notes.size() + " notes");
        } catch (JSONException e) {
            Log.e(NAME, "Error updating widget", e);
        }
    }
}
