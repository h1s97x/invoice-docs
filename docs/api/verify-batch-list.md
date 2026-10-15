---
title: 批量列表
method: GET
path: /v1/verify/batch
---

# GET /v1/verify/batch

列出当前批量任务（调试用）。

> 同时挂载于 `/verify/batch`。

## 响应

```json
{ "tasks": [ { "taskId": "t-xxxx", "status": "completed", "total": 2, "completed": 2, "failed": 0 } ] }
```

创建任务见 [批量创建](./verify-batch)；查询单任务见 [批量进度](./verify-batch-task)。
