# 批量查验

官方源单次查验约 5–15s（真实浏览器），同步批量会超时，因此批量采用**任务式**：`POST` 创建任务立即返回 `taskId`，再轮询进度。

## 流程

```
POST /v1/verify/batch  ──►  { taskId, total }
        │
        ▼  轮询 GET /v1/verify/batch/{task_id}
   { status: processing, completed, total, results: [...] }
        │  直到 status ∈ {completed, failed, cancelled}
        ▼
   取 results[index].result / .error
```

## 请求（`BatchVerifyRequest`）

| 字段 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `invoices` | `VerifyRequest[]` | 必填 | 发票列表（字段同 [单张](./verify-single)，最少 1 张） |
| `concurrency` | int | `2` | 并发数，执行时 clamp 到 `[1, VERIFY_BATCH_MAX_CONCURRENCY]`（默认 5） |
| `retryCount` | int | `0` | 单条失败重试次数，clamp 到 `[0, 5]` |

## 创建任务

```bash
curl -X POST http://localhost:8000/v1/verify/batch \
  -H "Content-Type: application/json" \
  -d '{
    "invoices": [
      {"invoiceNum":"26377000000538745230","invoiceDate":"2026-10-08","totalAmount":"58.00","invoiceKind":"10"},
      {"invoiceNum":"26332000006773563636","invoiceDate":"2026-08-06","totalAmount":"50.00","invoiceKind":"10"}
    ],
    "concurrency": 2,
    "retryCount": 1
  }'
# {"success":true,"taskId":"t-xxxx","total":2}
```

## 轮询进度

```bash
curl http://localhost:8000/v1/verify/batch/t-xxxx
# { "taskId":"t-xxxx", "status":"completed", "total":2, "completed":2, "failed":0,
#   "results":[ {"index":0,"success":true,"result":{...}}, {"index":1,...} ] }
```

## 取消 / 列表

```bash
DELETE /v1/verify/batch/t-xxxx     # 取消运行中或删除已完成记录
GET    /v1/verify/batch            # 任务列表（调试用）
```

::: warning 限额仍是瓶颈
任务式只解决「超时」，不解决「次数」。免费源约 **5 次 / 日 / IP**，批量并发只是把这 5 次尽量并行用完。要真批量请启用 `tencent-verify`（无日限额）。
:::
