package io.automotive.rn.parser

import androidx.car.app.CarContext
import androidx.car.app.model.Pane
import androidx.car.app.model.PaneTemplate
import androidx.car.app.model.Template
import com.facebook.react.bridge.ReadableMap
import io.automotive.rn.screens.CarScreenContext

class TemplateParser internal constructor(
  private val context: CarContext,
  private val carScreenContext: CarScreenContext) {

  fun parse(props: ReadableMap): Template {
    val template = when (props.getString("type")) {
      "list" -> RCTListTemplate(context, carScreenContext)
      "grid" -> RCTGridTemplate(context, carScreenContext)
      "map" -> RCTMapTemplate(context, carScreenContext)
      "navigation" -> RCTMapTemplate(context, carScreenContext)
      "place-list-map" -> RCTMapTemplate(context, carScreenContext)
      "place-list-navigation" -> RCTMapTemplate(context, carScreenContext)
      "route-preview" -> RCTMapTemplate(context, carScreenContext)
      "pane" -> RCTPaneTemplate(context, carScreenContext)
      "search" -> RCTSearchTemplate(context, carScreenContext)
      // Two distinct tab template parsers:
      // - 'tabbar': legacy adapter accepting CarPlay-shaped config
      //   (templates array of full child template instances).
      // - 'tab': native Android shape (tabs array of {contentId, title, icon}).
      "tabbar" -> RCTTabBarTemplate(context, carScreenContext)
      "tab" -> RCTTabTemplate(context, carScreenContext)
      "message" -> RCTMessageTemplate(context, carScreenContext)
      "sign-in" -> RCTSignInTemplate(context, carScreenContext)
      else -> null
    }

    return template?.parse(props) ?: PaneTemplate
      .Builder(
        Pane.Builder().setLoading(true).build()
      ).setTitle("Template missing").build()
  }
}
