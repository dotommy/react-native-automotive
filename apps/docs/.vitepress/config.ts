import { defineConfig } from 'vitepress';

const repoUrl = 'https://github.com/dotommy/react-native-automotive';

export default defineConfig({
  title: 'react-native-automotive',
  description:
    'React Native SDK for Apple CarPlay and Android Auto. One TypeScript API, both platforms, first-class Expo Config Plugin.',
  lang: 'en-US',
  cleanUrls: true,
  lastUpdated: true,

  // GitHub Pages serves from /<repo>/, so VitePress needs base to match.
  // Override via VITE_BASE env when building for a custom domain.
  base: process.env.VITE_BASE ?? '/react-native-automotive/',

  head: [
    ['meta', { name: 'theme-color', content: '#0a84ff' }],
    [
      'meta',
      {
        name: 'keywords',
        content:
          'react-native, carplay, android-auto, automotive, expo, ios, android, typescript',
      },
    ],
  ],

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/introduction', activeMatch: '^/guide/' },
      {
        text: 'Templates',
        link: '/templates/list-template',
        activeMatch: '^/templates/',
      },
      { text: 'Plugin', link: '/plugin/options', activeMatch: '^/plugin/' },
      {
        text: 'v1.1',
        items: [
          { text: 'Changelog', link: `${repoUrl}/releases` },
          { text: 'Migrate from birkir', link: '/guide/migration' },
        ],
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          collapsed: false,
          items: [
            { text: 'Introduction', link: '/guide/introduction' },
            { text: 'Requirements', link: '/guide/requirements' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Your first template', link: '/guide/first-template' },
          ],
        },
        {
          text: 'Concepts',
          collapsed: false,
          items: [
            { text: 'Imperative API', link: '/guide/imperative-api' },
            { text: 'Connection lifecycle', link: '/guide/lifecycle' },
            { text: 'Template navigation stack', link: '/guide/navigation-stack' },
            { text: 'CarPlay vs Android Auto', link: '/guide/platforms' },
          ],
        },
        {
          text: 'Modules',
          collapsed: false,
          items: [
            { text: 'Notifications', link: '/guide/notifications' },
            { text: 'Navigation sessions', link: '/guide/navigation-sessions' },
          ],
        },
        {
          text: 'Native Setup',
          collapsed: false,
          items: [
            { text: 'With Expo (plugin)', link: '/guide/setup-expo' },
            { text: 'Bare React Native', link: '/guide/setup-bare' },
          ],
        },
        {
          text: 'Migration',
          collapsed: false,
          items: [
            { text: 'From birkir/react-native-carplay', link: '/guide/migration' },
          ],
        },
      ],

      '/templates/': [
        {
          text: 'Cross-platform',
          collapsed: false,
          items: [
            { text: 'ListTemplate', link: '/templates/list-template' },
            { text: 'GridTemplate', link: '/templates/grid-template' },
            { text: 'MapTemplate', link: '/templates/map-template' },
            { text: 'TabBarTemplate', link: '/templates/tab-bar-template' },
            { text: 'SearchTemplate', link: '/templates/search-template' },
            { text: 'InformationTemplate', link: '/templates/information-template' },
            { text: 'ContactTemplate', link: '/templates/contact-template' },
            {
              text: 'PointOfInterestTemplate',
              link: '/templates/point-of-interest-template',
            },
            { text: 'NowPlayingTemplate', link: '/templates/now-playing-template' },
            { text: 'AlertTemplate', link: '/templates/alert-template' },
            { text: 'ActionSheetTemplate', link: '/templates/action-sheet-template' },
          ],
        },
        {
          text: 'Android-only',
          collapsed: false,
          items: [
            { text: 'TabTemplate', link: '/templates/tab-template' },
            { text: 'PaneTemplate', link: '/templates/pane-template' },
            { text: 'NavigationTemplate', link: '/templates/navigation-template' },
            { text: 'MessageTemplate', link: '/templates/message-template' },
            { text: 'SignInTemplate', link: '/templates/sign-in-template' },
          ],
        },
        {
          text: 'Experimental',
          collapsed: true,
          items: [
            { text: 'VoiceControlTemplate', link: '/templates/voice-control-template' },
            { text: 'PlaceListMapTemplate', link: '/templates/place-list-map-template' },
            {
              text: 'PlaceListNavigationTemplate',
              link: '/templates/place-list-navigation-template',
            },
            {
              text: 'RoutePreviewNavigationTemplate',
              link: '/templates/route-preview-navigation-template',
            },
          ],
        },
      ],

      '/plugin/': [
        {
          text: 'Expo Config Plugin',
          collapsed: false,
          items: [
            { text: 'Options reference', link: '/plugin/options' },
            { text: 'What it writes (iOS)', link: '/plugin/ios-output' },
            { text: 'What it writes (Android)', link: '/plugin/android-output' },
          ],
        },
      ],
    },

    socialLinks: [{ icon: 'github', link: repoUrl }],

    editLink: {
      pattern: `${repoUrl}/edit/master/apps/docs/:path`,
      text: 'Edit this page on GitHub',
    },

    search: {
      provider: 'local',
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: `Continued work © ${new Date().getFullYear()} Tommaso · Original work © 2019 Birkir Rafn Guðjónsson`,
    },

    outline: {
      level: [2, 3],
    },
  },
});
