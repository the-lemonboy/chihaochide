# EdgeOne 部署

1. 在 EdgeOne Makers 项目中打开「KV 存储」，创建命名空间 `xiaolinxiaozheng_food`。
2. 将该命名空间绑定到当前项目，变量名必须填写 `food_data`。
3. 进入「构建与部署」→「新建部署」，环境选择 `Production`。
4. 上传本目录 `edgeone-static`。根目录必须直接包含 `index.html`、`edge-functions` 和 `edgeone.json`。
5. 部署成功后访问正式的 `*.edgeone.dev` 地址，不要使用带 `eo_token` 的预览链接。

API 路由：

- `GET /api/places`
- `POST /api/places`
- `DELETE /api/places/:id`
- `PUT /api/picks`

EdgeOne KV 是最终一致性存储。不同边缘节点读取新数据最多可能延迟约 60 秒。
