# 单张查验

`POST /v1/verify` —— 即时查验一张发票，返回结构化结果。完整字段见 [API 参考](/api/verify)。

## 请求字段（`VerifyRequest`）

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `invoiceNum` | string | ✅ | 发票号码 |
| `invoiceDate` | string | ✅ | 开票日期，`YYYYMMDD` 或 `YYYY-MM-DD`（自动归一） |
| `invoiceKind` | string | ⚪ | 票种代码，默认 `04`；**数电普票用 `10`**，数电专票 `08` |
| `totalAmount` | string | ⚪ | 价税合计；**数电票必填** |
| `invoiceCode` | string | ⚪ | 发票代码；**数电票留空** |
| `checkCode` | string | ⚪ | 校验码（部分票种需要） |
| `fileBase64` | string | ⚪ | 发票原文件（PDF/OFD/XML），优先于手填字段 |
| `source` | string | ⚪ | 查验源，默认 `tax-official` |
| `captchaCode` | string | ⚪ | 验证码两步式第二步回填（见 [验证码](./captcha)） |

::: warning 数电票三要素
数电普票 / 数电专票：**`invoiceCode` 留空、`invoiceKind=10`（或 `08`）、`totalAmount` 填价税合计**。旧版纸质票才需要 `invoiceCode` 与 `checkCode`。
:::

## 请求示例

```bash
curl -X POST http://localhost:8000/v1/verify \
  -H "Content-Type: application/json" \
  -d '{
    "invoiceNum": "26377000000538745230",
    "invoiceDate": "2026-10-08",
    "totalAmount": "58.00",
    "invoiceKind": "10"
  }'
```

## 响应示例

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
    "invoiceDetail": {
      "key1": "001",
      "key2": "3≡20261008≡...≡26377000000538745230≡...≡58.00≡...",
      "invoiceFields": ["3", "20261008", "...", "26377000000538745230", "...", "58.00", "..."],
      "itemLines": ["*电信服务*通信服务费██0.000██58.00██0.00██..."]
    },
    "verifiedAt": "2026-10-15T12:00:00+00:00"
  }
}
```

## 业务错误码（点分）

| `status` | 错误码 | 含义 |
| --- | --- | --- |
| `not_found` | `ResourceNotFound.NoInvoice` | 发票不存在 |
| `invalid` | `FailedOperation.InvoiceMismatch` | 查验不一致 |
| `repeated` | `FailedOperation.CountLimitError` | 当日同票查验超过 5 次被锁定 |
| `abnormal` | `ResourceUnavailable.TaxNetworkError` | 税务局网络异常，稍后重试 |
| `unknown` | `FailedOperation.UnKnowError` | 结果未知 |
| `captcha_required` | `FailedOperation.CaptchaRequired` | 需要验证码（两步式） |
