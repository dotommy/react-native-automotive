package io.automotive.rn.parser

import android.util.Log
import androidx.car.app.CarContext
import androidx.car.app.model.Action
import androidx.car.app.model.CarIcon
import androidx.car.app.model.ItemList
import androidx.car.app.model.ListTemplate
import androidx.car.app.model.Row
import androidx.car.app.model.Tab
import androidx.car.app.model.TabContents
import androidx.car.app.model.TabTemplate
import androidx.car.app.model.TabTemplate.TabCallback
import com.facebook.react.bridge.ReadableMap
import io.automotive.rn.screens.CarScreenContext

/**
 * Parses the JS-side `'tab'` template config into an Android-Auto
 * [TabTemplate] with native semantics: a tab strip at the top of the
 * screen, each tab references a separate content template by contentId.
 *
 * Distinct from [RCTTabBarTemplate] which adapts the CarPlay-flavoured
 * `'tabbar'` shape (config holds full child template instances).
 *
 * Config shape (from `src/templates/android/TabTemplate.ts`):
 * ```
 * {
 *   headerAction: HeaderAction,
 *   tabs: [{ contentId: string, title: string, icon: ImageSourcePropType }],
 *   activeTabContentId?: string,
 *   loading?: boolean
 * }
 * ```
 *
 * The active tab's content is looked up from the [CarScreenContext]
 * store by contentId — the JS side must have created that content
 * template before this TabTemplate.
 */
class RCTTabTemplate(
  context: CarContext,
  carScreenContext: CarScreenContext
) : RCTTemplate(context, carScreenContext) {

  data class TabSpec(val contentId: String, val title: String, val icon: CarIcon)

  private var activeContentId: String? = null
  private var currentTemplate: TabTemplate? = null
  private var tabsConfig: List<TabSpec> = emptyList()
  private var headerAction: Action = Action.APP_ICON
  private var isLoading: Boolean = false

  private val tabCallback = object : TabCallback {
    override fun onTabSelected(tabContentId: String) {
      Log.d(TAG, "Tab selected: $tabContentId")
      eventEmitter.didSelectTemplate(tabContentId)
      activeContentId = tabContentId
      rebuildAndApply()
    }
  }

  override fun parse(props: ReadableMap): TabTemplate {
    isLoading = props.isLoading()
    headerAction = props.getMap("headerAction")?.let { parseAction(it) } ?: Action.APP_ICON

    tabsConfig = parseTabs(props)
    activeContentId = props.getString("activeTabContentId")
      ?: tabsConfig.firstOrNull()?.contentId

    currentTemplate = buildTemplate()
    return currentTemplate!!
  }

  // MARK: - Building

  private fun parseTabs(props: ReadableMap): List<TabSpec> {
    val tabsArray = props.getArray("tabs") ?: return emptyList()
    val specs = mutableListOf<TabSpec>()
    for (i in 0 until tabsArray.size()) {
      try {
        val tabMap = tabsArray.getMap(i)
        val contentId = tabMap.getString("contentId") ?: continue
        val title = tabMap.getString("title") ?: ""
        val icon = tabMap.getMap("icon")?.let { parseCarIcon(it) } ?: CarIcon.APP_ICON
        specs.add(TabSpec(contentId, title, icon))
      } catch (e: Exception) {
        Log.e(TAG, "Error parsing tab at index $i", e)
      }
    }
    return specs
  }

  private fun buildTemplate(): TabTemplate {
    val builder = TabTemplate.Builder(tabCallback)
      .setLoading(isLoading)
      .setHeaderAction(headerAction)

    for (spec in tabsConfig) {
      builder.addTab(
        Tab.Builder()
          .setContentId(spec.contentId)
          .setTitle(spec.title)
          .setIcon(spec.icon)
          .build()
      )
    }

    activeContentId?.let { id ->
      builder.setActiveTabContentId(id)
      builder.setTabContents(resolveTabContents(id))
    }

    return builder.build()
  }

  // MARK: - Content lookup

  private fun resolveTabContents(contentId: String): TabContents {
    val screen = carScreenContext.screens[contentId]
    val template = screen?.template
    return if (template != null) {
      TabContents.Builder(template).build()
    } else {
      placeholderTabContents(contentId)
    }
  }

  private fun placeholderTabContents(contentId: String): TabContents {
    val placeholderList = ItemList.Builder()
      .addItem(Row.Builder().setTitle("No content for $contentId").build())
      .build()
    val placeholder = ListTemplate.Builder()
      .setTitle("Placeholder")
      .setSingleList(placeholderList)
      .build()
    return TabContents.Builder(placeholder).build()
  }

  private fun rebuildAndApply() {
    currentTemplate = buildTemplate()
    carScreenContext.screens[carScreenContext.screenMarker]?.apply {
      setTemplate(currentTemplate, carScreenContext.screenMarker, null)
      invalidate()
    }
  }

  companion object {
    const val TAG = "RCTTabTemplate"
  }
}
