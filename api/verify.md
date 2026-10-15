---
title: 单张查验
method: POST
path: /v1/verify
---

# POST /v1/verify

即时查验一张发票，返回结构化结果。免费源（`tax-official`）使用真实浏览器，单次约 5–15s。

> 同时挂载于 `/verify`（无前缀兼容别名，下个大版本移除）。

## 请求体 · `VerifyRequest`

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `invoiceNum` | string | ✅ | 发票号码 |
| `invoiceDate` | string | ✅ | 开票日期 `YYYYMMDD` 或 `YYYY-MM-DD` |
| `invoiceKind` | string | ⚪ | 票种代码，默认 `04`；数电普票 `10`、数电专票 `08` |
| `totalAmount` | string | ⚪ | 价税合计（**数电票必填**） |
| `invoiceCode` | string | ⚪ | 发票代码（**数电票留空**） |
| `checkCode` | string | ⚪ | 校验码 |
| `fileBase64` | string | ⚪ | 发票原文件（PDF/OFD/XML），优先于手填 |
| `source` | string | ⚪ | 查验源，默认 `tax-official` |
| `captchaCode` | string | ⚪ | 验证码两步式第二步回填 |

## 请求示例

```bash
curl -X POST http://localhost:8000/v1/verify \
  -H "Content-Type: application/json" \
  -d '{"invoiceNum":"26377000000538745230","invoiceDate":"2026-10-08",
       "totalAmount":"58.00","invoiceKind":"10"}'
```

## 响应 · `VerifyResponse`

```json
{
  "success": true,
  "requestId": "a1b2c3d4...",
  "result": {
    "verified": true,
    "status": "valid",
    "statusDesc": "001",
    "source": "tax-official",
    "isCached": false,
    "invoiceDetail": { "key1": "001", "invoiceFields": ["..."], "itemLines": ["..."] },
    "verifiedAt": "2026-10-15T12:00:00+00:00"
  }
}
```

| `result.status` | 含义 |
| --- | --- |
| `valid` | 查验一致（真票） |
| `not_found` | 查无此票 |
| `invalid` | 查验不一致 |
| `repeated` | 当日同票查验超 5 次 |
| `abnormal` | 税务局网络异常 |
| `unknown` | 结果未知 |
| `captcha_required` | 需验证码（`captchaB64` 在 `result` 中） |

失败时在顶层 `error` 返回点分码（`ResourceNotFound.NoInvoice` 等）。详见 [单张查验指南](../guide/verify-single)。
