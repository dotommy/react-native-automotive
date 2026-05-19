package io.automotive.rn.notifications

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.core.app.RemoteInput

/**
 * Broadcast receiver that handles taps on notification action buttons
 * (both `quick_reply` and `voice`) posted by [AutomotiveNotificationsModule].
 *
 * For `voice` actions, the user's dictated text is extracted via
 * [RemoteInput.getResultsFromIntent] from the [REMOTE_INPUT_KEY] slot.
 *
 * Forwards the extracted data to the module via [AutomotiveNotificationsModule.emitAction],
 * which then emits the `actionPressed` event to JS subscribers — fires
 * only when the RN runtime is alive (foreground or background). For
 * cold-start delivery (notification tap while app is killed) the Step 9
 * Expo Config Plugin generates the AppDelegate/MainActivity bootstrap.
 */
class AutomotiveNotificationsReceiver : BroadcastReceiver() {

  override fun onReceive(context: Context, intent: Intent) {
    val notificationId = intent.getStringExtra(EXTRA_NOTIFICATION_ID) ?: return
    val actionId = intent.getStringExtra(EXTRA_ACTION_ID) ?: return

    val voiceResponse = RemoteInput.getResultsFromIntent(intent)
      ?.getCharSequence(REMOTE_INPUT_KEY)
      ?.toString()

    AutomotiveNotificationsModule.emitAction(
      notificationId = notificationId,
      actionId = actionId,
      response = voiceResponse
    )
  }

  companion object {
    const val EXTRA_NOTIFICATION_ID = "io.automotive.rn.notifications.notification_id"
    const val EXTRA_ACTION_ID = "io.automotive.rn.notifications.action_id"
    const val REMOTE_INPUT_KEY = "io.automotive.rn.notifications.voice_input"
  }
}
