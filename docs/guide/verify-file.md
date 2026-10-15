# 文件 / PDF 查验

`POST /v1/verify/file` —— 上传一张报销单或多页 PDF / OFD / XML，服务端自动拆成 N 张发票并逐张查验，照常走批量管线。支持 OFD（本地解 zip 抽文本，免 OCR）；仅抽字段不查验可用 [POST /v1/recognize](./recognize)。

## 请求（`FileVerifyRequest`）

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `fileBase64` | string | ✅ | 文件 base64（PDF / OFD / XML；图片需云 OCR 源） |
| `source` | string | ⚪ | 默认 `tax-official`（本地拆页）；`tencent-invoice` 走云 OCR 多票 |
| `invoiceKind` | string | ⚪ | 统一覆盖所有票种；缺省按每页 / 每张推断 |
| `captchaCode` | string | ⚪ | 验证码两步式回填 |
| `concurrency` / `retryCount` | int | ⚪ | 同 [批量](./verify-batch) |

## 请求示例

```bash
curl -X POST http://localhost:8000/v1/verify/file \
  -H "Content-Type: application/json" \
  -d '{
    "fileBase64": "'"$(base64 -w0 expense.pdf)"'",
    "invoiceKind": "10"
  }'
# {"success":true,"taskId":"t-yyyy","total":3,"pages":[0,1,2]}
```

返回的 `pages` 与最终结果 `results` 顺序一一对应：`results[index]` ↔ `pages[index]`。

## 后续

拿到 `taskId` 后，轮询 `GET /v1/verify/batch/{task_id}`（与 [批量查验](./verify-batch) 完全一致）即可取逐张结果。

::: warning 本地仅支持 PDF/OFD/XML
`tax-official` 的本地解析只接受 PDF / OFD / XML；图片类请改用云 OCR 源（如 `tencent-invoice`），否则返回 `UnsupportedMediaType`。
:::
