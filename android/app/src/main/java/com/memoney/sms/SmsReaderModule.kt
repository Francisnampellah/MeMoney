package com.memoney.sms

import android.Manifest
import android.content.pm.PackageManager
import android.database.Cursor

import android.net.Uri
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.bridge.WritableNativeMap
import androidx.core.app.ActivityCompat
import com.facebook.react.bridge.*

class SmsReaderModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName() = "SmsReader"

  @ReactMethod
  fun hasPermission(promise: Promise) {
    val granted = ActivityCompat.checkSelfPermission(
      reactContext,
      Manifest.permission.READ_SMS
    ) == PackageManager.PERMISSION_GRANTED

    promise.resolve(granted)
  }

  @ReactMethod
  fun readInbox(promise: Promise) {
    readInboxFrom(0.0, promise)
  }

  @ReactMethod
  fun readInboxFrom(since: Double, promise: Promise) {
    val smsUri = Uri.parse("content://sms/inbox")
    val selection = "date > ?"
    val selectionArgs = arrayOf(since.toLong().toString())
    
    val cursor: Cursor? =
      reactContext.contentResolver.query(smsUri, null, selection, selectionArgs, "date DESC")

    val result = WritableNativeArray()

    cursor?.use {
      while (it.moveToNext()) {
        val map = WritableNativeMap()
        map.putString("id", it.getString(it.getColumnIndexOrThrow("_id")))
        map.putString("address", it.getString(it.getColumnIndexOrThrow("address")))
        map.putString("body", it.getString(it.getColumnIndexOrThrow("body")))
        map.putDouble("date", it.getLong(it.getColumnIndexOrThrow("date")).toDouble())
        result.pushMap(map)
      }
    }

    promise.resolve(result)
  }
}
