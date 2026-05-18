import { ImageSourcePropType } from 'react-native';
import { HeaderAction } from '../../interfaces/Action';
import { Template, TemplateConfig } from '../Template';

/**
 * A single tab within a {@link TabTemplate}.
 *
 * Each tab links to a separate content template via {@link contentId}.
 * When the user selects a tab, the host fires {@link TabTemplateConfig.onTabSelected}
 * and the app is expected to swap the active content template accordingly.
 */
export interface Tab {
  /**
   * Stable, unique identifier for this tab.
   * Used to correlate tab selection events with content templates.
   */
  contentId: string;
  /**
   * Tab label shown in the strip.
   */
  title: string;
  /**
   * Tab icon. Required by Android Auto — tabs without icons are rejected.
   */
  icon: ImageSourcePropType;
}

export interface TabTemplateConfig extends TemplateConfig {
  /**
   * Required header action. Android Auto only accepts `APP_ICON` here
   * (passing `back` will be rejected by the host).
   */
  headerAction: HeaderAction;
  /**
   * Tabs to display in the strip at the top of the screen.
   * Android Auto enforces a maximum of 4 tabs.
   */
  tabs: Tab[];
  /**
   * The {@link Tab.contentId} of the currently active tab.
   * The host highlights this tab and shows its associated content.
   */
  activeTabContentId?: string;
  /**
   * When true, the tab strip is hidden and a loading indicator is shown.
   */
  loading?: boolean;
  /**
   * Fired when the user selects a different tab.
   * The app should respond by setting the content template for the new tab.
   */
  onTabSelected?(event: { contentId: string; templateId: string }): void;
}

/**
 * Android Auto template that displays a strip of tabs at the top of the screen,
 * each linked to a separate content template.
 *
 * Distinct from CarPlay's {@link TabBarTemplate} (which is a *container* holding
 * full child templates). Android's `TabTemplate` shows tab affordances above a
 * single dynamic content area — the app swaps content in response to tab selection.
 *
 * @see https://developer.android.com/reference/androidx/car/app/model/TabTemplate
 * @namespace Android
 */
export class TabTemplate extends Template<TabTemplateConfig> {
  public get type(): string {
    return 'tab';
  }
}
