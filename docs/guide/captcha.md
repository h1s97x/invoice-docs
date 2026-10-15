# 验证码与两步校验

国家税务总局平台带人机验证码。`tax-official` 源处理验证码有两种模式：

## 模式 A：自动（推荐）

服务端配置 `CAPTCHA_SOLVER_PROVIDER=ddddocr` 后，验证码由内置离线 OCR 自动识别并提交。识别含汉字时可能读错，引擎已内置 **007 / 008 自动重试**（刷新验证码重来），无需调用方介入。

## 模式 B：两步式（手动 solver）

若部署时未配自动 solver，验证码无法在服务端解出，API 会返回：

```json
{
  "success": false,
  "error": { "code": "FailedOperation.CaptchaRequired", "message": "需要验证码" },
  "result": { "status": "captcha_required", "captchaB64": "<png base64>" }
}
```

调用方自行对 `captchaB64` 做 OCR 或人工识别，拿到文本后用 `captchaCode` **重调同一张票**的 `POST /v1/verify`：

```bash
curl -X POST http://localhost:8000/v1/verify \
  -H "Content-Type: application/json" \
  -d '{"invoiceNum":"...","invoiceDate":"...","totalAmount":"...",
       "invoiceKind":"10","captchaCode":"AB3F"}'
```

两步式复用同一浏览器会话，验证码即被消费。

## 注意

- `007`（验证码错误）/ `008`（验证码失效 / 校验未过）是**瞬时错误**，引擎内部已重试，不应被当作验真结论。
- 真正的验真结论只有 `status=valid`（一致）、`not_found`（查无）、`invalid`（不一致）等（见 [单张查验](./verify-single)）。
