# 文档站构建与部署

文档站基于 **VitePress**（与 `elecredit-docs` 同款技术栈），源在 `docs/`，配置 `docs/.vitepress/config.mts`。

## 本地预览

```bash
npm install
npm run docs:dev        # 本地开发服务器 http://localhost:5173
```

## 构建

```bash
npm run docs:build      # 产物 docs/.vitepress/dist
npm run docs:preview    # 本地预览构建产物
```

## 端点闸门

`docs/api/*.md` 的 `path:` / `aliases:` 必须与 `app/main.py` 实际注册路由一一对应，防止文档漂移：

```bash
npm run check:endpoints
```

CI 中已串联该检查（`npm run check:endpoints`），不一致将阻断构建。

## 部署到 CNB Pages

`.cnb.yml` 已新增 `pages:` 流水线：push 到默认分支即自动 `npm install → check:endpoints → docs:build`，并将 `docs/.vitepress/dist` 发布为 CNB Pages 站点。若贵司 Pages 输出目录约定不同，请在 CNB 控制台调整。

> 文档约定（沿用参考站）：不复制正文，所有内容是对代码仓库事实源的面向读者重写；危险操作显式用 `::: danger / ::: warning`；每条结论附可执行命令。
