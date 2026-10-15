# AI Agent 接入

本服务面向 AI Agent 设计：契约稳定、错误为点分码、结果结构化。Agent 拿到发票（字段或原文件）即可自助查验，无需人工。

## 典型流程

```
1. 解析输入：发票号码 / 开票日期 / 价税合计（或从 PDF 调 /v1/verify/file）
2. 构造请求：数电票 invoiceCode 留空、invoiceKind=10、totalAmount=价税合计
3. POST /v1/verify
4. 若 result.status == "captcha_required"：
     读取 result.captchaB64 → 用视觉/OCR 得到文本 → 带 captchaCode 重调第 3 步
5. 解析 result.status：
     valid      → 真票且一致
     not_found  → 查无此票
     invalid    → 查验不一致（票可能假或被篡改）
     repeated   → 当日同票已查 5 次，换天或换源
     abnormal   → 税务局网络异常，稍后重试
6. 取 result.invoiceDetail 与用户提供的信息交叉核对（购销方、金额、税额）
```

## 请求示例（数电普票）

```json
POST /v1/verify
{
  "invoiceNum": "26377000000538745230",
  "invoiceDate": "2026-10-08",
  "totalAmount": "58.00",
  "invoiceKind": "10"
}
```

## 批量（多张）

对多张发票用任务式批量，避免逐张同步超时：

```text
POST /v1/verify/batch  → taskId
loop: GET /v1/verify/batch/{task_id} until status ∈ {completed, failed, cancelled}
      取 results[index].result.status
```

## 错误码（点分，可程序化分支）

| 码 | 含义 | Agent 应对 |
| --- | --- | --- |
| `ResourceNotFound.NoInvoice` | 查无此票 | 提示用户核对号码/日期 |
| `FailedOperation.InvoiceMismatch` | 不一致 | 标记可疑，做人工复核 |
| `FailedOperation.CountLimitError` | 当日超限 | 换天 / 换 `tencent-verify` 源 |
| `ResourceUnavailable.TaxNetworkError` | 税局网络异常 | 指数退避后重试 |
| `FailedOperation.CaptchaRequired` | 需验证码 | 见上文第 4 步 |

::: warning 免费源 5 次 / 日
默认 `tax-official` 受平台限额约束，Agent 应规划调用频次，必要时引导用户启用 `tencent-verify`。
:::
