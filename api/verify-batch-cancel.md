---
title: 批量取消
method: DELETE
path: /v1/verify/batch/{task_id}
---

# DELETE /v1/verify/batch/{task_id}

取消运行中的任务，或删除已完成任务记录。

> 同时挂载于 `/verify/batch/{task_id}`。

## 路径参数

| 参数 | 说明 |
| --- | --- |
| `task_id` | 任务 ID |

## 响应

```json
{ "success": true }
```

任务不存在或已过期返回 `ResourceNotFound.Task`（404）。
