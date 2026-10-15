# 发票识别（PDF / OFD 抽字段）

引擎内置**离线、免费**的发票识别：从电子发票（数电票 / 增值税电子发票）的 PDF / OFD 文本层直接抽取字段，**无需 OCR、无需调云厂商**。

## 用法

- HTTP：`POST /v1/recognize` —— 仅抽字段，不查税局，零额度。
- 代码：`from app.parsers import pdf_to_verify_request, pdf_to_verify_requests`。

```python
from app.parsers import pdf_to_verify_request

req = pdf_to_verify_request(open("invoice.pdf", "rb").read())
# req.invoiceNum / req.invoiceDate / req.totalAmount / req.invoiceKind ...
```

## 抽取字段

| 字段 | 来源 | 说明 |
| --- | --- | --- |
| `invoiceNum` | 发票号码 | 数电票 20 位，无发票代码 |
| `invoiceDate` | 开票日期 | 归一为 `YYYYMMDD` |
| `totalAmount` | 价税合计（小写） | 数电票必填项 |
| `invoiceKind` | 票面文案推断 | `10`=数电普票，`08`=数电专票，`04`=普票 … |
| `invoiceCode` / `checkCode` | 旧版纸票字段 | 数电票为空 |

## 铁路电子客票（车票）

车票也是带文本层的 PDF，可直接识别。`extra` 会返回车票专属字段：

| `extra` 字段 | 含义 |
| --- | --- |
| `trainNo` | 车次，如 `G19` |
| `travelDate` | 乘车日期 `YYYYMMDD` |
| `departureStation` / `arrivalStation` | 出发 / 到达站（按票面顺序，个别版式可能需对调） |
| `seatClass` | 席别（二等座 / 一等座 / 商务座 …） |
| `carriage` | 车厢，如 `06车` |
| `passengerName` / `passengerId` | 乘车人姓名 / 证件号（脱敏） |
| `ticketNo` | 电子客票号 |

```python
req = pdf_to_verify_request(open("ticket.pdf", "rb").read())
print(req.extra["trainNo"], req.extra["departureStation"], req.extra["arrivalStation"])
```

## 与查验的关系

识别出的 `VerifyRequest` 可直接喂给 `POST /v1/verify`（单张）或 `POST /v1/verify/batch`（批量），实现「上传文件 → 识别 → 查验」一条龙。文件直接查验见 [文件 / PDF 查验](./verify-file)。

## 支持的格式与边界

- ✅ 文本层电子发票：数电票 PDF、增值税电子发票 PDF、OFD（解 zip 取 XML 文本）。
- ⚠️ OFD 抽取为启发式（拼接 XML 文本后复用同一套正则），真实版式差异请以实测为准。
- ❌ 扫描件 / 拍照：无文本层，需云 OCR 源（`tencent-invoice` / `baidu-invoice`），后续接入。
