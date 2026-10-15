# invoice-verify-engine 文档站

本仓库**仅承载文档站**，与引擎代码仓库（`h1s97x/whccb/invoice-verify-engine`）分离。

技术栈：[VitePress](https://vitepress.dev/)。

## 本地预览

```bash
npm install
npm run docs:dev      # http://localhost:5173
```

## 构建

```bash
npm run docs:build    # 产物 .vitepress/dist
```

推到默认分支即触发 CNB Pages / GitHub Pages 自动构建并发布（见 `.cnb.yml` 与 `.github/workflows/deploy.yml`）。

## 端点闸门（防文档与代码漂移）

`npm run check:endpoints` 会比对 `app/main.py`（引擎仓）的路由与 `api/*.md` 的
`path:` front matter。在 CI 中会自动克隆引擎仓到 `/tmp/engine` 再做完整比对；
若引擎仓不可达，则退化为仅校验文档侧（每个 API 页都要有 `path:`）。

修改引擎 API 后，请同步更新 `api` 下对应页面。
