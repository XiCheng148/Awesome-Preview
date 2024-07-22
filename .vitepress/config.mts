export default {
  title: '链接预览神器',
  description: '提升您的浏览效率，告别标签页混乱',
  themeConfig: {
    logo: '/logo.png',
    nav: [
      { text: '首页', link: '/' },
      { text: '功能', link: '/features/' },
      { text: '使用指南', link: '/guide/' },
      { text: '演示', link: '/demo/' },
      { text: '下载', link: '/download/' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: '使用指南',
          items: [
            { text: '快速开始', link: '/guide/' },
            { text: '安装教程', link: '/guide/installation' },
            { text: '基本用法', link: '/guide/basic-usage' },
            { text: '高级设置', link: '/guide/advanced-settings' },
          ]
        }
      ],
      '/features/': [
        {
          text: '功能特性',
          items: [
            { text: '智能预览', link: '/features/smart-preview' },
            { text: '灵活操作', link: '/features/flexible-operations' },
            { text: '自定义黑名单', link: '/features/blacklist' },
            { text: '主题适配', link: '/features/theme-adaptation' },
          ]
        }
      ]
    },
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2023-present Your Name'
    }
  }
}
