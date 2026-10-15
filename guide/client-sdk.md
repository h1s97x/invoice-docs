# Python 客户端 SDK

`invoice-verify` 客户端**不含任何查验逻辑**——真正查验在服务端。本包只做 HTTP 封装、响应类型化、非 2xx 转 `VerifySDKError`，让 Python 系统无需关心服务端实现。与 TypeScript 客户端逐方法镜像，共享同一份 OpenAPI 契约。

## 安装

```bash
pip install invoice-verify
```

## 单张查验

```python
from invoice_verify import VerifyClient, VerifyRequest, VerifySDKError

# 地址也可用环境变量 VERIFY_SERVICE_URL
with VerifyClient("https://your-engine.example.com") as client:
    try:
        res = client.verify(VerifyRequest(
            invoice_num="26377000000538745230",
            invoice_date="2026-10-08",   # 自动归一为 20261008
            total_amount="58.00",
            invoice_kind="10",           # 数电普票
        ))
        print(res.success, res.result.status, res.result.status_desc)
    except VerifySDKError as exc:
        if exc.code == "ResourceNotFound.NoInvoice":   # 点分码可程序化分支
            ...
        print(exc.code, exc.message, exc.request_id)
```

## 批量查验（任务式）

官方源单次 5–15s，同步批量会超时，故服务端是「创建任务 → 轮询」：

```python
task = client.create_batch([
    VerifyRequest(invoice_num="26377000000538745230", invoice_date="20261008"),
    VerifyRequest(invoice_num="26332000006773563636", invoice_date="20260806"),
], concurrency=2)

progress = client.wait_batch(task.task_id, interval=2.0, timeout=300)
for item in progress.results:
    print(item.index, item.success, item.result.status if item.result else item.error)
```

## 文件查验

```python
import base64
task = client.verify_file(
    base64.b64encode(open("expense.pdf", "rb").read()).decode(),
    invoice_kind="10",
)
progress = client.wait_batch(task.task_id)
```

## 方法 ↔ 端点

| 方法 | 端点 |
| --- | --- |
| `verify(request)` | `POST /v1/verify` |
| `get_sources()` | `GET /v1/sources` |
| `verify_file(file_base64, ...)` | `POST /v1/verify/file` |
| `create_batch(invoices, ...)` | `POST /v1/verify/batch` |
| `get_batch(task_id)` | `GET /v1/verify/batch/{task_id}` |
| `list_batches()` | `GET /v1/verify/batch` |
| `cancel_batch(task_id)` | `DELETE /v1/verify/batch/{task_id}` |
| `wait_batch(task_id, ...)` | 轮询 `get_batch` 到终局（本地助手） |
| `health()` / `healthz()` | `GET /v1/health` / `/v1/healthz` |

## 约定

- 日期接受 `YYYYMMDD` 或 `YYYY-MM-DD`，客户端归一为 `YYYYMMDD`。
- 票种用国税局官方代码（`04` 普票 / `10` 数电普票 / `08` 数电专票 …）。
- 非 2xx 抛 `VerifySDKError`，`code` 为点分业务码。

> TypeScript 客户端 `@h1s97x/invoice-verify-engine` 逐方法镜像，契约见服务端 `contracts/openapi.json`。
