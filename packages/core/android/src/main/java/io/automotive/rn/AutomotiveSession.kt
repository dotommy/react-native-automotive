package io.automotive.rn

import android.annotation.SuppressLint
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.res.Configuration
import android.os.Build
import android.os.Bundle
import android.util.Log
import androidx.car.app.CarContext.SCREEN_SERVICE
import androidx.car.app.Screen
import androidx.car.app.ScreenManager
import androidx.car.app.Session
import androidx.lifecycle.DefaultLifecycleObserver
import androidx.lifecycle.LifecycleOwner
import com.facebook.react.ReactInstanceManager
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableNativeMap
import com.facebook.react.modules.appregistry.AppRegistry
import com.facebook.react.modules.debug.DevSettingsModule
import io.automotive.rn.screens.CarScreen


class AutomotiveSession(private val reactInstanceManager: ReactInstanceManager) : Session(), DefaultLifecycleObserver {
  private lateinit var screen: CarScreen

  @SuppressLint("UnspecifiedRegisterReceiverFlag")
  override fun onCreateScreen(intent: Intent): Screen {
    Log.d(TAG, "On create screen " + intent.action + " - " + intent.dataString)
    val lifecycle = lifecycle
    lifecycle.addObserver(this)
    screen = CarScreen(carContext)
    screen.marker = "root"

    // Handle reload events
    if (Build.VERSION.SDK_INT >= 34 && carContext.getApplicationInfo().targetSdkVersion >= 34) {
    carContext.registerReceiver(object : BroadcastReceiver() {
      override fun onReceive(context: Context, intent: Intent) {
        if ("io.automotive.rn.APP_RELOAD" == intent.action) {
          invokeStartTask(reactInstanceManager.currentReactContext!!);
        }
      }
    }, IntentFilter("io.automotive.rn.APP_RELOAD"), Context.RECEIVER_EXPORTED)
    }else{
           carContext.registerReceiver(object : BroadcastReceiver() {
            override fun onReceive(context: Context, intent: Intent) {
                 if ("io.automotive.rn.APP_RELOAD" == intent.action) {
                     invokeStartTask(reactInstanceManager.currentReactContext!!);
                   }
               }
      }, IntentFilter("io.automotive.rn.APP_RELOAD"))
    }

    // Run JS
    runJsApplication()
    return screen
  }

  private fun runJsApplication() {
    val reactContext = reactInstanceManager.currentReactContext
    if (reactContext == null) {
      reactInstanceManager.addReactInstanceEventListener(
        object : ReactInstanceManager.ReactInstanceEventListener {
          override fun onReactContextInitialized(reactContext: ReactContext) {
            invokeStartTask(reactContext)
            reactInstanceManager.removeReactInstanceEventListener(this)
          }
        })
      reactInstanceManager.createReactContextInBackground()
    } else {
      invokeStartTask(reactContext)
    }
  }

  private fun invokeStartTask(reactContext: ReactContext) {
    try {
      val catalystInstance = reactContext.catalystInstance
      val jsAppModuleName = "AndroidAuto"
      val appParams = WritableNativeMap()
      appParams.putDouble("rootTag", 1.0)
      val appProperties = Bundle.EMPTY
      if (appProperties != null) {
        appParams.putMap("initialProps", Arguments.fromBundle(appProperties))
      }

      // Safe call: catalystInstance.getJSModule may return null while the
      // bridge is initialising; Kotlin 1.9.25+ rejects the unsafe direct call.
      catalystInstance.getJSModule(AppRegistry::class.java)
        ?.runApplication(jsAppModuleName, appParams)

      val carModule = reactInstanceManager
        .currentReactContext?.getNativeModule(AutomotiveModule::class.java)
      carModule?.setCarContext(carContext, screen)

      // Previously: `timingModule!!.onHostResume()` to simulate a host resume
      // so JS timers fire while the VirtualDisplay renders. The `onHostResume`
      // symbol is no longer publicly exposed on TimingModule in RN 0.76+;
      // modern RN handles this automatically through its lifecycle hooks,
      // so the explicit nudge is no longer required. Removed.

    } catch (e: Exception) {
      e.printStackTrace()
    }
  }

  override fun onDestroy(owner: LifecycleOwner) {
    Log.i(TAG, "onDestroy")
    val context = carContext
    // stop services here, if any
  }

  override fun onNewIntent(intent: Intent) {
    // handle intents
    Log.d(TAG, "AutomotiveSession.onNewIntent")
  }

  override fun onCarConfigurationChanged(configuration: Configuration) {
    // we should report this over the bridge
    Log.d(TAG, "AutomotiveSession.onCarConfigurationChanged")
  }

  companion object {
    const val TAG = "AutomotiveSession"
  }
}

