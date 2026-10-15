# 查验源与限额

引擎按 `req.source` 选择后端。可用源随环境变量动态暴露（见 `GET /v1/sources`）。

## 源清单

| `source` | 实现 | 计费 / 限额 | 启用条件 |
| --- | --- | --- | --- |
| `tax-official` | 真实浏览器（官方平台） | **免费，约 5 次 / 日 / IP** | 默认开启 |
| `tencent-verify` | 腾讯云真查验 API | 付费，**无日限额，免浏览器** | `TENCENT_SECRET_ID/KEY` + `TENCENT_VERIFY_ENABLED=true` |
| `tencent-invoice` | 腾讯云 OCR | 凭证开关 | `TENCENT_SECRET_ID/KEY` |
| `baidu-invoice` | 百度 OCR | 凭证开关 | `BAIDU_INVOICE_API_KEY/SECRET_KEY` |
| `tax-official-http` | 纯 HTTP 官方源（Route A） | 同免费源 | `OFFICIAL_HTTP_ENABLED=true`（需先校准签名参数） |

## 怎么选

- **开发 / 少量核验**：默认 `tax-official` 即可，配 `CAPTCHA_SOLVER_PROVIDER=ddddocr` 自动解验证码。
- **生产批量 / 不限额**：启用 `tencent-verify`，走云 API，不受 5 次 / 日 限制，也无需维护浏览器。
- **只有发票图片**：用 `tencent-invoice` 或 `baidu-invoice` 先做 OCR 抽字段，再查验。

## 免费源限额细节

- 平台对 **同一张票当日查验超过 5 次** 会锁定，返回 `FailedOperation.CountLimitError`（`status=repeated`）。
- 接口级建议 ≤ 20 次 / 秒；`VERIFY_MIN_INTERVAL_MS` 提供尽力而为的间隔保护。
- 失败的验证码尝试（`007` / `008`）通常不计入成功次数，但也不要无脑刷。
