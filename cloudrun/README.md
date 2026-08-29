# 微信云托管后端

在微信公众平台「开发与服务 → 云托管」创建服务，代码来源选择本项目，Dockerfile 路径填 `cloudrun/Dockerfile`，端口填 `80`。

将 `/app/data` 挂载到云托管持久化存储（否则容器重建会丢失 SQLite 数据）。部署后用服务提供的 HTTPS 域名填入 `miniprogram/app.js` 的 `apiBase`。

健康检查：`GET /health`。
