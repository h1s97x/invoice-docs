---
title: 发票识别
method: POST
path: /v1/recognize
---

# POST /v1/recognize

发票识别（**仅抽字段，不查税局**）：上传 PDF / OFD / XML，离线抽取结构化字段并返回。**零额度消耗**，适合先做"识别"再做"查验"的流水线，或在前端预览识别结果。

> 同时挂载于 `/recognize`。

## 请求体 · `FileVerifyRequest`

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `fileBase64` | string | ✅ | 发票原文件（PDF / OFD / XML） |
| `invoiceKind` | string | ⚪ | 统一覆盖所有票种；缺省按票面推断 |

## 请求示例

```bash
curl -X POST http://localhost:8000/v1/recognize \
  -H "Content-Type: application/json" \
  -d '{"fileBase64":"'"$(base64 -w0 invoice.pdf)"'"}'
```

## 响应

```json
{
  "count": 1,
  "invoices": [
    { "invoiceNum": "26377000000538745230", "invoiceDate": "20261008",
      "totalAmount": "58.00", "invoiceKind": "10", "invoiceCode": "", "checkCode": "" }
  ]
}
```

## 说明

- 抽取基于文件文本层（PDF 用 pypdf、OFD 解 zip 取 XML 文本），**不依赖 OCR**，无需调云厂商。
- 扫描件 / 拍照无文本层，请改用云 OCR 源（`tencent-invoice` / `baidu-invoice`）。
- 字段抽取逻辑与 [文件查验](./verify-file) 共用 `app.parsers.pdf_invoice`；抽取结果可直接喂给 [单张查验](./verify) 或 [批量查验](./verify-batch)。详见 [发票识别指南](../guide/recognize)。
