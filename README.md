# Fun Apple 接送名單

所有人可查看；輸入共用編輯密碼後才能修改。不需 ChatGPT 登入。密碼只存於伺服器 secret PICKUP_EDIT_PASSWORD，沒有收錄於此儲存庫。登入 cookie 為 HttpOnly、Secure、SameSite，12 小時到期；每次修改由後端驗證並檢查版本衝突。

支援 A4 週表、PNG 下載、同時間分組、車號底色、空白時段斜線。

## 開發與部署

Node 22.13+，pnpm install、pnpm dev。後端使用 Cloudflare D1 binding DB，需套用 drizzle SQL，並設定 PICKUP_EDIT_PASSWORD secret。此儲存庫不包含正式資料庫、密碼或網站管理憑證。

GitHub 修改不會自動更新現有網站。GitHub Pages 不能執行此後端，完整共編需部署至支援 Workers 與 D1 的主機。
