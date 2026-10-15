---
title: 查验源
method: GET
path: /v1/sources
---

# GET /v1/sources

列出当前已启用（按凭证/环境变量开关）的查验源。

> 同时挂载于 `/sources`。

## 响应

```json
{
  "sources": [
    { "source": "tax-official", "displayName": "国家税务总局平台", "available": true },
    { "source": "tencent-verify", "displayName": "腾讯云真查验", "available": true }
  ]
}
```

各源启用条件与限额见 [查验源与限额指南](../guide/sources)。
