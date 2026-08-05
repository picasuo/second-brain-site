# 将 Published Site 部署至 GitHub Pages

每个成功的 `publish-vault-revision` 派发都将其指定 Vault Revision 构建成带 SHA 名称的 Pages artifact，并自动部署至 GitHub Pages；公开入口使用由 Site Repository 配置的自定义域名 `picasuo.qzz.io`。这保留 Published Site 与 Vault Revision 的可追溯性，同时避免将 Vault 仓库或其凭据耦合到页面托管与域名配置中。
