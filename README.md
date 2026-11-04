# Fun Apple 接送名單

完整操作介面由 GitHub Pages 提供，根目錄 index.html、app.js、sync.js、weekly.js 是上線檔案。名單與密碼驗證沿用既有 Sites 後端；不跳轉網站。

所有人可查看，輸入共用密碼才能編輯。密碼僅存伺服器 secret PICKUP_EDIT_PASSWORD；GitHub 不存密碼或正式資料庫。跨來源登入使用 12 小時簽章 token，只保留於目前分頁 sessionStorage。後端只允許本 GitHub Pages 來源與原站來源發出瀏覽器修改請求，並驗證每次寫入及版本衝突。

支援週表、PNG 圖片、A4 列印。前端變更推送 main 即由 Pages 發布；後端程式變更需另行部署至原 Sites。
