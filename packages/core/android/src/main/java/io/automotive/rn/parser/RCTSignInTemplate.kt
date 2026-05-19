package io.automotive.rn.parser

import android.net.Uri
import androidx.car.app.CarContext
import androidx.car.app.model.Action
import androidx.car.app.model.InputCallback
import androidx.car.app.model.signin.InputSignInMethod
import androidx.car.app.model.signin.PinSignInMethod
import androidx.car.app.model.signin.ProviderSignInMethod
import androidx.car.app.model.signin.QRCodeSignInMethod
import androidx.car.app.model.signin.SignInTemplate
import com.facebook.react.bridge.ReadableMap
import io.automotive.rn.screens.CarScreenContext

/**
 * Parses the JS-side `'sign-in'` template config into an Android-Auto
 * [SignInTemplate]. Required for any account-based app on Android Auto
 * (music streaming, navigation with sync, EV charging, parking, etc.).
 *
 * Config shape (from `src/templates/android/SignInTemplate.ts`):
 * ```
 * {
 *   signInMethod: { type: "pin" | "input" | "provider" | "qrcode", ... },
 *   title?: string,
 *   instructions?: string,
 *   additionalText?: string,
 *   loading?: boolean,
 *   headerAction?: HeaderAction,
 *   actions?: Action[]
 * }
 * ```
 *
 * API note: the marker interface for sign-in methods is
 * `SignInTemplate.SignInMethod` (nested), and the input callback type is
 * `androidx.car.app.model.InputCallback` (top-level in the model package,
 * not in the signin subpackage).
 */
class RCTSignInTemplate(
  context: CarContext,
  carScreenContext: CarScreenContext
) : RCTTemplate(context, carScreenContext) {

  override fun parse(props: ReadableMap): SignInTemplate {
    val methodConfig = props.getMap("signInMethod")
      ?: throw IllegalArgumentException("SignInTemplate requires signInMethod")

    // SignInTemplate.Builder accepts a SignInTemplate.SignInMethod; Kotlin
    // upcasts the concrete subclasses automatically.
    val builder = when (val type = methodConfig.getString("type")) {
      "pin"      -> SignInTemplate.Builder(parsePinMethod(methodConfig))
      "input"    -> SignInTemplate.Builder(parseInputMethod(methodConfig))
      "provider" -> SignInTemplate.Builder(parseProviderMethod(methodConfig))
      "qrcode"   -> SignInTemplate.Builder(parseQrCodeMethod(methodConfig))
      else       -> throw IllegalArgumentException("Unknown sign-in method type: $type")
    }

    builder.setLoading(props.isLoading())

    props.getString("title")?.let { builder.setTitle(it) }
    props.getString("instructions")?.let { builder.setInstructions(it) }
    props.getString("additionalText")?.let { builder.setAdditionalText(it) }

    val headerAction = props.getMap("headerAction")?.let { parseAction(it) } ?: Action.APP_ICON
    builder.setHeaderAction(headerAction)

    props.getArray("actions")?.let { actions ->
      builder.setActionStrip(parseActionStrip(actions))
    }

    return builder.build()
  }

  // MARK: - Concrete sign-in method parsers

  private fun parsePinMethod(map: ReadableMap): PinSignInMethod {
    val pin = map.getString("pin") ?: ""
    return PinSignInMethod(pin)
  }

  private fun parseInputMethod(map: ReadableMap): InputSignInMethod {
    // InputCallback has default impls for onInputSubmitted / onInputTextChanged
    // — an empty object inherits them. Wire to RN events in a follow-up
    // commit when EventEmitter gains dedicated sign-in input events.
    val callback = object : InputCallback {}
    val hint = map.getString("hint") ?: ""
    val builder = InputSignInMethod.Builder(callback)
    builder.setHint(hint)
    map.getString("errorMessage")?.let { builder.setErrorMessage(it) }
    map.getString("defaultValue")?.let { builder.setDefaultValue(it) }
    map.getString("inputType")?.let { builder.setInputType(parseInputType(it)) }
    map.getString("keyboardType")?.let { builder.setKeyboardType(parseKeyboardType(it)) }
    return builder.build()
  }

  private fun parseProviderMethod(map: ReadableMap): ProviderSignInMethod {
    val actionMap = map.getMap("action")
      ?: throw IllegalArgumentException("ProviderSignInMethod requires action")
    return ProviderSignInMethod(parseAction(actionMap))
  }

  private fun parseQrCodeMethod(map: ReadableMap): QRCodeSignInMethod {
    val url = map.getString("url") ?: ""
    // Constructor-based: QRCodeSignInMethod has no Builder.
    return QRCodeSignInMethod(Uri.parse(url))
  }

  // MARK: - InputSignInMethod enum mapping

  private fun parseInputType(raw: String): Int {
    return when (raw) {
      "password" -> InputSignInMethod.INPUT_TYPE_PASSWORD
      else       -> InputSignInMethod.INPUT_TYPE_DEFAULT
    }
  }

  private fun parseKeyboardType(raw: String): Int {
    return when (raw) {
      "email"  -> InputSignInMethod.KEYBOARD_EMAIL
      "phone"  -> InputSignInMethod.KEYBOARD_PHONE
      "number" -> InputSignInMethod.KEYBOARD_NUMBER
      else     -> InputSignInMethod.KEYBOARD_DEFAULT
    }
  }
}
