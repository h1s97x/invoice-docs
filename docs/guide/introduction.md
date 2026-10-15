# 项目简介

发票查验引擎（invoice-verify-engine）是一个**统一抽象「查验源」**的增值税发票查验服务：对外暴露一套稳定的 HTTP 契约，内部按 `source` 把请求路由到不同的查验后端（国家税务总局官方平台、腾讯云「真查验」、百度 / 腾讯 OCR 等）。调用方无需关心某个源是用真实浏览器还是云 API 实现。

## 架构

```
HTTP 服务 (FastAPI, app/main.py)
   │  双挂载 /v1（正式）与无前缀别名（兼容）
   ▼
VerificationEngine (app/engine.py)
   │  按 req.source 选择适配器；缺省走 tax-official
   ▼
Adapter（按 source）
   ├─ tax-official   → 真实浏览器（OfficialBrowserClient，免费，自带全部签名参数）
   ├─ tencent-verify → 腾讯云真查验（付费，无日限额，免浏览器）
   ├─ tencent-invoice/baidu-invoice → 云 OCR 源（按凭证开关）
   └─ tax-official-http → 纯 HTTP 官方源（Route A，默认关闭）
```

## 三种查验形态

| 形态 | 端点 | 适用 |
| --- | --- | --- |
| 单张 | `POST /v1/verify` | 一张票即时查验 |
| 批量 | `POST /v1/verify/batch` + 轮询 `GET /v1/verify/batch/{task_id}` | 多张票，任务式并发 |
| 文件 | `POST /v1/verify/file` | 报销单 / 多页 PDF，自动拆票后逐张查验 |

## 统一结果

所有形态最终归一为 `VerifyResult`：

- `verified`：是否查验一致
- `status`：`valid` / `invalid` / `not_found` / `repeated` / `abnormal` / `unknown` / `captcha_required`
- `statusDesc`：状态码对应说明
- `invoiceDetail`：成功时的票面明细（`key2` ≡ 分隔要素、`key3` █ 明细行已切分为 `invoiceFields` / `itemLines`）
- `captchaB64`：`status=captcha_required` 时携带验证码图片 base64

业务失败以**点分错误码**表达（对齐腾讯云语义），例如 `ResourceNotFound.NoInvoice`（查无此票）、`FailedOperation.CountLimitError`（当日查验超限）。
