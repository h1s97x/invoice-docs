---
title: 批量创建
method: POST
path: /v1/verify/batch
---

# POST /v1/verify/batch

创建批量查验任务（任务式）：立即返回 `taskId`，后台并发查验，轮询 `GET /v1/verify/batch/{task_id}` 取进度与结果。

> 同时挂载于 `/verify/batch`。

## 请求体 · `BatchVerifyRequest`

| 字段 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `invoices` | `VerifyRequest[]` | 必填 | 发票列表（字段同 [单张查验](./verify)），最少 1 张 |
| `concurrency` | int | `2` | 并发数，执行时 clamp 到 `[1, VERIFY_BATCH_MAX_CONCURRENCY]`（默认 5） |
| `retryCount` | int | `0` | 单条失败重试，clamp 到 `[0, 5]` |

## 请求示例

```bash
curl -X POST http://localhost:8000/v1/verify/batch \
  -H "Content-Type: application/json" \
  -d '{"invoices":[
        {"invoiceNum":"26377000000538745230","invoiceDate":"2026-10-08","totalAmount":"58.00","invoiceKind":"10"},
        {"invoiceNum":"26332000006773563636","invoiceDate":"2026-08-06","totalAmount":"50.00","invoiceKind":"10"}
      ], "concurrency":2, "retryCount":1}'
```

## 响应 · `BatchTaskCreated`（HTTP 202）

```json
{ "success": true, "taskId": "t-xxxx", "total": 2 }
```

随后轮询 [批量进度](./verify-batch-task)。并发受免费源 5 次/日 限额约束，详见 [批量查验指南](../guide/verify-batch)。
