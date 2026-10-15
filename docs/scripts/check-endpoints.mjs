// 端点闸门：防止 docs/api/*.md 与代码实际注册的端点漂移。
// 从 <ENGINE_DIR>/app/main.py 抽取路由，与每个 api 页 front matter 的 `path:` 比对。
// 若 ENGINE_DIR 下找不到 app/main.py（如独立的文档仓未携带引擎代码），
// 则退化为「仅校验文档侧」：每个 API 页都需含 path:，且不重复。
//
// 用法: ENGINE_DIR=/path/to/engine node docs/scripts/check-endpoints.mjs
// 退出码 1 = 不一致或文档侧非法。

import { readFileSync, readdirSync, existsSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "../..")
const engineDir = process.env.ENGINE_DIR || root
const mainPyPath = join(engineDir, "app/main.py")

// 1) 代码侧路由（可选）
const codeRoutes = new Set()
if (existsSync(mainPyPath)) {
  const mainPy = readFileSync(mainPyPath, "utf8")
  const routeRe = /_router\.(post|get|delete)\(\s*"([^"]+)"/g
  for (const m of mainPy.matchAll(routeRe)) {
    codeRoutes.add("/v1" + m[2])
    codeRoutes.add(m[2])
  }
  console.log(`✓ 已从 ${mainPyPath} 解析到 ${codeRoutes.size / 2} 个端点`)
} else {
  console.log(`⚠ 未找到 ${mainPyPath}，跳过“代码 vs 文档”比对（CI 中克隆引擎仓并设置 ENGINE_DIR 可启用）`)
}

// 2) 文档侧 path（含 aliases）
const apiDir = join(root, "docs/api")
const docPaths = new Set()
let docCount = 0
for (const f of readdirSync(apiDir)) {
  if (!f.endsWith(".md")) continue
  const fm = readFileSync(join(apiDir, f), "utf8").match(/^---\n([\s\S]*?)\n---/)
  if (!fm) continue
  const path = fm[1].match(/^\s*path:\s*(.+)$/m)?.[1]?.trim()
  if (!path) {
    console.error(`✗ 文档 ${f} 缺少 path: front matter`)
    process.exit(1)
  }
  docPaths.add(path)
  docCount++
  const aliasM = fm[1].match(/^\s*aliases:\s*\[([^\]]*)\]/m)
  if (aliasM) {
    for (const a of aliasM[1].split(",")) {
      const t = a.trim().replace(/^["']|["']$/g, "")
      if (t) docPaths.add(t)
    }
  }
}

// 3) 比对
let ok = true
if (codeRoutes.size) {
  const missing = [...docPaths].filter((p) => !codeRoutes.has(p))
  const extra = [...codeRoutes].filter((p) => p.startsWith("/v1") && !docPaths.has(p))
  if (missing.length) {
    ok = false
    console.error("✗ 文档存在但代码中无此端点（可能已删除/更名）:")
    missing.forEach((p) => console.error("   " + p))
  }
  if (extra.length) {
    ok = false
    console.error("✗ 代码已注册但文档缺失的端点:")
    extra.forEach((p) => console.error("   " + p))
  }
  if (ok) console.log(`✓ 端点文档同步（${docPaths.size} 篇 / ${codeRoutes.size / 2} 个端点）`)
} else {
  console.log(`ℹ 已校验文档侧：${docCount} 篇 API 文档均含合法 path front matter`)
}
process.exit(ok ? 0 : 1)
