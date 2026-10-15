---
title: 批量进度
method: GET
path: /v1/verify/batch/{task_id}
---

# GET /v1/verify/batch/{task_id}

查询批量任务进度；完成后返回逐条结果（按 `index` 排序）。

> 同时挂载于 `/verify/batch/{task_id}`。

## 路径参数

| 参数 | 说明 |
| --- | --- |
| `task_id` | `POST /v1/verify/batch` 返回的 `taskId` |

## 响应 · `BatchTaskProgress`

```json
{
  "taskId": "t-xxxx",
  "status": "completed",
  "total": 2,
  "completed": 2,
  "failed": 0,
  "createdAt": "2026-10-15T12:00:00+00:00",
  "finishedAt": "2026-10-15T12:01:10+00:00",
  "results": [
    { "index": 0, "success": true, "result": { "status": "valid", "...": "..." } },
    { "index": 1, "success": false, "error": { "code": "ResourceNotFound.NoInvoice", "message": "发票不存在" } }
  ]
}
```

| `status` | 含义 |
| --- | --- |
| `pending` / `processing` | 进行中，继续轮询 |
| `completed` | 全部完成（含失败条目），取 `results` |
| `failed` / `cancelled` | 终态 |

任务不存在或已过期返回 `ResourceNotFound.Task`（404）。详见 [批量查验指南](../guide/verify-batch)。
