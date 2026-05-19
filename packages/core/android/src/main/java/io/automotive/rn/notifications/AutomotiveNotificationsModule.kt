package io.automotive.rn.notifications

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.os.Build
import androidx.car.app.notification.CarAppExtender
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.app.Person
import androidx.core.app.RemoteInput
import androidx.core.graphics.drawable.IconCompat
import com.facebook.common.references.CloseableReference
import com.facebook.datasource.DataSources
import com.facebook.drawee.backends.pipeline.Fresco
import com.facebook.imagepipeline.image.CloseableBitmap
import com.facebook.imagepipeline.image.CloseableImage
import com.facebook.imagepipeline.request.ImageRequestBuilder
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter
import com.facebook.react.views.imagehelper.ImageSource
import java.util.UUID

/**
 * React Native module exposing `AutomotiveNotifications.send(config)` to JS.
 *
 * Bridged as `NativeModules.AutomotiveNotifications`.
 *
 * What `send()` does:
 * 1. Ensures the notifications channel exists (Android 8+).
 * 2. Builds a `Person` for the sender (name + optional avatar).
 * 3. Wires action buttons:
 *    - `quick_reply` → `NotificationCompat.Action` with PendingIntent
 *      to [AutomotiveNotificationsReceiver].
 *    - `voice` → same, plus a `RemoteInput` that captures the dictated
 *      text and surfaces it in the broadcast intent's extras.
 * 4. Attaches `CarAppExtender` so the notification surfaces on the
 *    Android Auto display in addition to the phone.
 * 5. Posts via `NotificationManagerCompat`.
 *
 * Action button taps → broadcast → [AutomotiveNotificationsReceiver]
 *  → `emitAction()` → `actionPressed` event to JS listeners.
 */
@ReactModule(name = AutomotiveNotificationsModule.NAME)
class AutomotiveNotificationsModule(
  private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = NAME

  init {
    instance = this
    ensureChannelExists()
  }

  // MARK: - Public bridge API

  @ReactMethod
  fun send(config: ReadableMap, promise: Promise) {
    try {
      val notificationId = UUID.randomUUID().toString()
      val title = config.getStringOrEmpty("title")
      val body = config.getStringOrEmpty("body")
      val conversationId =
        if (config.hasKey("conversationId")) config.getString("conversationId") ?: notificationId
        else notificationId

      val senderConfig = if (config.hasKey("sender")) config.getMap("sender") else null
      val senderName = senderConfig?.getString("name") ?: ""
      val senderAvatar = senderConfig?.getMap("avatar")?.let { loadBitmap(it) }

      val sender = Person.Builder()
        .setName(senderName)
        .apply { senderAvatar?.let { setIcon(IconCompat.createWithBitmap(it)) } }
        .setKey(conversationId)
        .build()

      // The system small icon. Falls back to the app's launcher icon —
      // a CarPlay-specific icon can be wired in Step 9 plugin.
      val smallIcon = reactContext.applicationInfo.icon

      val messagingStyle = NotificationCompat.MessagingStyle(sender)
        .setConversationTitle(title)
        .addMessage(body, System.currentTimeMillis(), sender)

      val builder = NotificationCompat.Builder(reactContext, CHANNEL_ID)
        .setSmallIcon(smallIcon)
        .setStyle(messagingStyle)
        .setShortcutId(conversationId)
        .setCategory(NotificationCompat.CATEGORY_MESSAGE)
        .setAutoCancel(true)
        .setExtras(android.os.Bundle().apply { putString("notificationId", notificationId) })

      val actionsArray = if (config.hasKey("actions")) config.getArray("actions") else null
      if (actionsArray != null) {
        for (i in 0 until actionsArray.size()) {
          val actionConfig = actionsArray.getMap(i) ?: continue
          buildAction(actionConfig, notificationId)?.let { builder.addAction(it) }
        }
      }

      // Add CarAppExtender so the notification surfaces on Android Auto.
      // The extend() method lives on NotificationCompat.Builder, not on
      // the CarAppExtender itself.
      builder.extend(CarAppExtender.Builder().build())

      val notification = builder.build()
      val notificationIdInt = notificationId.hashCode()
      NotificationManagerCompat.from(reactContext).notify(notificationIdInt, notification)

      promise.resolve(notificationId)
    } catch (e: SecurityException) {
      // Android 13+ POST_NOTIFICATIONS permission not granted.
      promise.reject("E_NOTIFICATION_PERMISSION_DENIED", e.message, e)
    } catch (e: Exception) {
      promise.reject("E_NOTIFICATION_POST_FAILED", e.message, e)
    }
  }

  /**
   * RN event emitter handshake — required when consumers subscribe to
   * the emitter from JS.
   */
  @ReactMethod
  fun addListener(eventType: String) {
    // no-op; required by RN event emitter
  }

  @ReactMethod
  fun removeListeners(count: Int) {
    // no-op; required by RN event emitter
  }

  // MARK: - Internals

  private fun ensureChannelExists() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    val manager = reactContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    if (manager.getNotificationChannel(CHANNEL_ID) != null) return
    val channel = NotificationChannel(
      CHANNEL_ID,
      "Automotive notifications",
      NotificationManager.IMPORTANCE_HIGH
    )
    manager.createNotificationChannel(channel)
  }

  private fun buildAction(
    actionConfig: ReadableMap,
    notificationId: String
  ): NotificationCompat.Action? {
    val actionId = actionConfig.getString("id") ?: return null
    val label = actionConfig.getString("label") ?: return null
    val type = actionConfig.getString("type") ?: return null

    val intent = Intent(reactContext, AutomotiveNotificationsReceiver::class.java).apply {
      putExtra(AutomotiveNotificationsReceiver.EXTRA_NOTIFICATION_ID, notificationId)
      putExtra(AutomotiveNotificationsReceiver.EXTRA_ACTION_ID, actionId)
    }
    // RemoteInput (voice) requires MUTABLE so the system can inject the
    // typed text into the intent extras before delivery.
    val pendingFlags =
      if (type == "voice") PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE
      else PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE

    val pendingIntent = PendingIntent.getBroadcast(
      reactContext,
      (notificationId + actionId).hashCode(),
      intent,
      pendingFlags
    )

    val builder = NotificationCompat.Action.Builder(0 /* iconRes */, label, pendingIntent)

    if (type == "voice") {
      val placeholder = actionConfig.getString("placeholder") ?: ""
      val remoteInput = RemoteInput.Builder(AutomotiveNotificationsReceiver.REMOTE_INPUT_KEY)
        .setLabel(placeholder)
        .build()
      builder.addRemoteInput(remoteInput)
    }
    return builder.build()
  }

  private fun loadBitmap(map: ReadableMap): Bitmap? {
    val uri = map.getString("uri") ?: return null
    return try {
      val source = ImageSource(reactContext, uri)
      val request = ImageRequestBuilder.newBuilderWithSource(source.uri).build()
      val dataSource = Fresco.getImagePipeline().fetchDecodedImage(request, reactContext)
      @Suppress("UNCHECKED_CAST")
      val result = DataSources.waitForFinalResult(dataSource) as CloseableReference<CloseableBitmap>
      val bitmap = result.get().underlyingBitmap
      CloseableReference.closeSafely(result)
      dataSource.close()
      bitmap
    } catch (e: Exception) {
      null
    }
  }

  private fun ReadableMap.getStringOrEmpty(key: String): String {
    return if (hasKey(key)) getString(key) ?: "" else ""
  }

  companion object {
    const val NAME = "AutomotiveNotifications"
    const val CHANNEL_ID = "io.automotive.rn.notifications"

    private var instance: AutomotiveNotificationsModule? = null

    /**
     * Called by [AutomotiveNotificationsReceiver] when a notification
     * action is triggered. Emits the `actionPressed` event to JS.
     */
    fun emitAction(notificationId: String, actionId: String, response: String?) {
      val module = instance ?: return
      val body: WritableMap = Arguments.createMap().apply {
        putString("notificationId", notificationId)
        putString("actionId", actionId)
        response?.let { putString("response", it) }
      }
      module.reactContext
        .getJSModule(RCTDeviceEventEmitter::class.java)
        .emit("actionPressed", body)
    }
  }
}
