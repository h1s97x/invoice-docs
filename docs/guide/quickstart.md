# 快速开始

## 1. 启动服务

免费源 `tax-official` 使用真实浏览器，需先装 Playwright 的 Chromium：

```bash
pip install -r requirements.txt
playwright install chromium          # 仅 tax-official 源需要
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

服务启动后：

- API 文档：服务启动后访问根路径下的 `/docs`（FastAPI Swagger）
- 存活探针：`GET /v1/health`

## 2. 环境变量（可选）

| 变量 | 说明 |
| --- | --- |
| `API_KEYS` | 逗号分隔的 Key 列表；配置后所有受保护端点需带 `X-API-Key`。未配置则开放。 |
| `CAPTCHA_SOLVER_PROVIDER` | `ddddocr` 启用本地离线 OCR 自动解验证码（推荐）；不配则 tax-official 走手动两步式。 |
| `TENCENT_SECRET_ID` / `TENCENT_SECRET_KEY` | 启用 `tencent-invoice` / `tencent-verify` 云源。 |
| `TENCENT_VERIFY_ENABLED` | `true` 时对外暴露 `tencent-verify`（付费真查验）。 |

## 3. 第一个调用

列出当前可用源：

```bash
curl http://localhost:8000/v1/sources
# {"sources":[{"source":"tax-official","displayName":"国家税务总局平台","available":true}]}
```

单张查验（数电普票示例）：

```bash
curl -X POST http://localhost:8000/v1/verify \
  -H "Content-Type: application/json" \
  -d '{"invoiceNum":"26377000000538745230","invoiceDate":"2026-10-08",
       "totalAmount":"58.00","invoiceKind":"10"}'
```

返回 `result.status == "valid"` 即查验一致（真票）。

## 4. 客户端 SDK

Python 客户端见 [Python 客户端 SDK](./client-sdk)；TypeScript 客户端与服务端契约逐方法镜像。
