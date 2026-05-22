# Google Sheets 云端储存设置步骤

## 交付文件

本阶段会有两个文件：

- `index.html`：门店预约看板。
- `google-apps-script.gs`：Google Sheets 云端接口代码。

## 设置步骤

1. 新建一个 Google Sheets 文件。

   建议命名为：`门店预约与会员管理数据库`

2. 在 Google Sheets 中打开 Apps Script。

   路径：`扩展程序` -> `Apps Script`

3. 删除默认代码，把 `google-apps-script.gs` 里的代码复制进去。

4. 保存项目。

   建议命名为：`预约会员系统接口`

5. 先运行一次 `setupSheets`。

   第一次运行时，Google 会要求授权。授权完成后，表格里会自动生成：

   - `预约记录`
   - `会员资料`
   - `系统设置`

6. 部署为 Web App。

   路径：`部署` -> `新建部署` -> 类型选择 `Web 应用`

   建议设置：

   - 执行身份：我
   - 谁可以访问：知道链接的任何人

7. 复制部署后的 Web App URL。

8. 打开 `index.html`。

   在右上角点击 `修改表格`，填写：

   - 数据储存方式：`Google Sheets`
   - Google Apps Script 接口：粘贴 Web App URL

9. 点击 `保存设置`。

10. 点击 `同步云端`。

   当前看板里的预约数据会写入 Google Sheets。

11. 之后日常使用时：

   - 点 `读取云端`：从 Google Sheets 拉取最新数据。
   - 点 `同步云端`：把当前看板数据写入 Google Sheets。
   - 如果设置为 Google Sheets 模式，保存预约时会自动尝试同步。

## 推荐使用方式

第一阶段建议由管理员固定使用一台电脑操作 HTML 看板，并定期点击 `同步云端`。

Google Sheets 用于：

- 数据备份
- 查看完整预约表
- 查看会员资料
- 导出 Excel
- 后续接小程序或正式后台

## 注意事项

- 当前 `index.html` 仍可离线使用，数据会保存在浏览器本地。
- 如果换电脑使用，需要先点击 `读取云端` 拉取 Google Sheets 中的数据。
- 如果直接双击本地 `index.html` 时浏览器拦截云端读取，建议把 HTML 一起部署到 Apps Script Web App，或放到一个固定的 HTTPS 网页地址。这样读写 Google Sheets 会更稳定。
- 如果多人同时编辑，第一阶段可能出现覆盖问题。正式多人协作时，建议升级为小程序或数据库版本。
- Apps Script URL 不建议公开放到网站首页，只给门店内部员工使用。

## 后续升级

下一阶段可以继续增加：

- 会员管理页面
- 预约时自动识别会员
- 会员套餐扣次
- 员工登录权限
- 操作日志
- 手机端列表视图
