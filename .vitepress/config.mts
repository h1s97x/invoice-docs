import { defineConfig } from "vitepress"

// VitePress 配置：导航 / 侧边栏 / 本地搜索。
// 站点源在仓库根目录（index.md 为入口），构建产物默认在 .vitepress/dist。
export default defineConfig({
  title: "发票查验引擎 · 文档",
  description:
    "国家税务总局增值税发票查验服务：单张 / 批量 / 文件查验，多语言客户端与 AI Agent 接入指南",
  lang: "zh-CN",
  lastUpdated: true,
  cleanUrls: true,
  themeConfig: {
    nav: [
      { text: "首页", link: "/" },
      { text: "指南", link: "/guide/introduction" },
      { text: "API 参考", link: "/api/verify" },
      { text: "CNB", link: "https://cnb.cool" },
    ],
    sidebar: {
      "/guide/": [
        {
          text: "指南",
          items: [
            { text: "项目简介", link: "/guide/introduction" },
            { text: "快速开始", link: "/guide/quickstart" },
            { text: "单张查验", link: "/guide/verify-single" },
            { text: "批量查验", link: "/guide/verify-batch" },
            { text: "文件 / PDF 查验", link: "/guide/verify-file" },
            { text: "查验源与限额", link: "/guide/sources" },
            { text: "验证码与两步校验", link: "/guide/captcha" },
            { text: "Python 客户端 SDK", link: "/guide/client-sdk" },
            { text: "AI Agent 接入", link: "/guide/agent" },
            { text: "发票识别（PDF/OFD）", link: "/guide/recognize" },
            { text: "文档站构建与部署", link: "/guide/deploy" },
          ],
        },
      ],
      "/api/": [
        {
          text: "API 参考",
          items: [
            { text: "单张查验 · POST /v1/verify", link: "/api/verify" },
            { text: "批量创建 · POST /v1/verify/batch", link: "/api/verify-batch" },
            { text: "批量进度 · GET /v1/verify/batch/{task_id}", link: "/api/verify-batch-task" },
            { text: "批量列表 · GET /v1/verify/batch", link: "/api/verify-batch-list" },
            { text: "批量取消 · DELETE /v1/verify/batch/{task_id}", link: "/api/verify-batch-cancel" },
            { text: "文件查验 · POST /v1/verify/file", link: "/api/verify-file" },
            { text: "查验源 · GET /v1/sources", link: "/api/sources" },
            { text: "发票识别 · POST /v1/recognize", link: "/api/recognize" },
            { text: "健康检查 · GET /v1/health", link: "/api/health" },
          ],
        },
      ],
    },
    socialLinks: [{ icon: "github", link: "https://cnb.cool" }],
    search: { provider: "local" },
    docFooter: { prev: true, next: true },
    returnToTopLabel: "回到顶部",
    lastUpdatedText: "最后更新",
    sidebarMenuLabel: "菜单",
    darkModeSwitchLabel: "主题",
    outlineTitle: "本页目录",
  },
})
