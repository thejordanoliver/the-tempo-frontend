package com.thetempo.messaging

import android.graphics.Bitmap
import android.graphics.Canvas
import android.provider.Telephony
import android.util.Base64
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.ByteArrayOutputStream

// Reads only the chosen SMS app's public label and icon. No contacts/SMS access.
class TempoMessagingModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("TempoMessaging")

    AsyncFunction("getDefaultSmsApp") {
      val context = appContext.reactContext ?: return@AsyncFunction null
      val packageName = Telephony.Sms.getDefaultSmsPackage(context)
        ?: return@AsyncFunction null
      val manager = context.packageManager
      try {
        val application = manager.getApplicationInfo(packageName, 0)
        val drawable = manager.getApplicationIcon(application)
        val bitmap = Bitmap.createBitmap(144, 144, Bitmap.Config.ARGB_8888)
        val previousBounds = android.graphics.Rect(drawable.bounds)
        val iconUri = try {
          drawable.setBounds(0, 0, bitmap.width, bitmap.height)
          drawable.draw(Canvas(bitmap))
          ByteArrayOutputStream().use { output ->
            bitmap.compress(Bitmap.CompressFormat.PNG, 100, output)
            "data:image/png;base64," + Base64.encodeToString(output.toByteArray(), Base64.NO_WRAP)
          }
        } finally {
          drawable.bounds = previousBounds
          bitmap.recycle()
        }
        mapOf(
          "name" to manager.getApplicationLabel(application).toString(),
          "iconUri" to iconUri
        )
      } catch (_: android.content.pm.PackageManager.NameNotFoundException) {
        null
      } catch (_: SecurityException) {
        null
      }
    }
  }
}
