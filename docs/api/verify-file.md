---
title: 文件查验
method: POST
path: /v1/verify/file
---

# POST /v1/verify/file

上传发票原文件（PDF / OFD / XML），服务端拆成 N 张发票并逐张查验，复用批量管线。返回 `taskId` 与 `pages`（与结果顺序对应）。

> 同时挂载于 `/verify/file`。HTTP 202。

## 请求体 · `FileVerifyRequest`

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `fileBase64` | string | ✅ | 文件 base64（PDF/OFD/XML；图片需云 OCR 源） |
| `source` | string | ⚪ | 默认 `tax-official`（本地拆页）；`tencent-invoice` 走云 OCR |
| `invoiceKind` | string | ⚪ | 统一覆盖所有票种；缺省按每页/每张推断 |
| `captchaCode` | string | ⚪ | 验证码两步式回填 |
| `concurrency` / `retryCount` | int | ⚪ | 同 [批量创建](./verify-batch) |

## 请求示例

```bash
curl -X POST http://localhost:8000/v1/verify/file \
  -H "Content-Type: application/json" \
  -d '{"fileBase64":"'"$(base64 -w0 expense.pdf)"'","invoiceKind":"10"}'
```

## 响应 · `FileVerifyCreated`（HTTP 202）

```json
{ "success": true, "taskId": "t-yyyy", "total": 3, "pages": [0, 1, 2] }
```

`results[index]` ↔ `pages[index]`。拿到 `taskId` 后轮询 [批量进度](./verify-batch-task)。详见 [文件查验指南](../guide/verify-file)。
