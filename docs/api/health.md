---
title: 健康检查
method: GET
path: /v1/health
aliases: ["/v1/healthz"]
---

# GET /v1/health · GET /v1/healthz

存活与就绪探针。

> 同时挂载于 `/health`、`/healthz`（无前缀别名）。

| 端点 | 语义 | 响应 |
| --- | --- | --- |
| `GET /v1/health` | 存活（liveness） | `{"ok": true}` |
| `GET /v1/healthz` | 就绪（readiness，含批量管理器） | `{"ok": true, "tasks": 0}` |

## 响应示例

```json
{ "ok": true }
```

非 2xx 即表示服务不可用，可用于编排健康检查。
