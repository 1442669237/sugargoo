# SUGARGOO

uni-app（Vue 3）+ Vite + Pinia + JavaScript 基础工程，面向 H5、iOS App 和 Android App。源码统一放在 `src`，按实际业务逐步扩展。

## 启动与构建

使用 Node.js 22.12+、npm 10+，提交锁文件，团队统一使用 `npm ci` 安装依赖。

```bash
npm ci
npm run dev:server # 本地后端（另开一个终端）
npm run dev:h5     # H5 开发
npm run dev:app    # App 资源开发编译
npm run build:h5   # H5 生产构建
npm run build:app  # App 生产资源构建
npm run check     # ESLint + Prettier 检查
```

`npm run lint:fix` 自动修复代码规范，`npm run format` 格式化代码。H5 产物位于 `dist/build/h5`，默认使用 hash 路由。App 产物位于 `dist/build/app`，不会直接生成 APK / IPA。

## 本地商品服务

后端使用 Node.js 内置 HTTP 服务，无需额外安装框架或数据库。先运行 `npm run dev:server`，再在另一终端运行 `npm run dev:h5`，访问 `http://127.0.0.1:5173`。后端默认仅监听本机 `127.0.0.1:8080`。

- `GET /api/products?locale=zh-CN&currency=AUD`：返回 `{ code: 0, message: 'ok', data: { items, total } }`。
- `GET /api/health`：健康检查。
- `GET /api/images/products/<文件名>.jpg`：商品图片。

服务端初始商品数据在 `server/data/products.json`，图片在 `server/public/products`，来自提供的截图。可在 JSON 中增删商品或修改标题、销量、价格，刷新首页即可生效；`basePrice.amountMinor` 为基准币种最小单位，例如澳元 `704` 表示 `AUD 7.04`；标题在 `titles` 中按语言维护，`image` 为相对于 API 根路径的图片地址。当前是本地文件数据源，尚未接入真实商品库、数据库或后台管理系统。前端没有内置商品数据或离线兜底，服务不可用时显示重试入口；支持下拉刷新。

H5 的 `/api` 请求和商品图片通过 Vite 代理转发到本地后端。真机 App 联调时，使用 `HOST=0.0.0.0 npm run dev:server` 在可信局域网监听，并在 `.env.development.local` 中将 `VITE_API_BASE_URL` 设置为 `http://电脑局域网IP:8080/api`，重新启动 App 编译；手机与电脑需在同一网络，手机上的 `127.0.0.1` 不指向电脑。App 的 HTTP 开发访问策略需按调试运行基座配置，正式发布使用 HTTPS 服务。生产 H5 不使用 Vite 开发代理，需要自行部署后端并配置同源代理或 CORS。

## 多语言与多币种

- `src/locales`：中文 `zh-CN`、英文 `en-US`、西班牙文 `es-ES` 界面翻译，缺少翻译回退到中文。
- `shared/international.js`：前后端共同使用的语言、币种支持列表；欧元使用标准代码 `EUR`。
- `src/store/modules/preferences.js`：语言和币种独立保存至本地存储。设置页先选择，点击确定后生效；关闭弹层不保存。
- `src/pages/settings`：设置页和底部选择弹层，首页右上角可进入。
- `server/data/products.json`：`titles` 为商品翻译，`basePrice` 为基准价格，当前基准币种 AUD。
- `server/data/exchange-rates.json`：手工配置的开发示例汇率，**不是实时或交易汇率**，上线前需要接入真实汇率来源及更新机制。
- `server/pricing.js`：按目标币种小数位计算价格，使用 BigInt 有理数计算并四舍五入；JPY、KRW 为零小数币种。接口返回 `price: { currency, amountMinor, fractionDigits }`，附带汇率日期及开发标识。
- `src/utils/money.js`：统一金额格式化，有 Intl 时按语言格式显示，旧 WebView 回退为币种代码加金额。

切换偏好会重新获取商品，旧请求不能覆盖最新选择。购物车零金额随币种变化；个人页余额仍明确标为 CNY（钱包业务尚未接入）。现有宣传图片中嵌入的文字及价格是静态素材，不参与界面翻译或换汇，需由设计提供对应语言/币种素材后替换。后续真实下单需由后端重新核价并保存币种、成交价和汇率快照，不能使用前端金额直接结算。

运行 `npm run test:server` 验证偏好校验、换汇舍入及异常价格处理。H5 已做设置切换联调，iOS/Android 仍需真机验证弹层、安全区及原生 tabBar 文案。

## 目录

```text
├── server/               # 本地 HTTP 服务、商品 JSON 与图片
├── .vscode/              # 保存格式化、ESLint、页面代码片段
├── src/
│   ├── api/
│   │   ├── modules/      # 业务接口模块（商品列表）
│   │   ├── request.js    # uni.request、Token、错误处理
│   │   └── index.js
│   ├── assets/           # 图片、字体、图标目录
│   ├── components/      # 只保留 base / business 空目录
│   ├── config/           # 环境与基础设置
│   ├── hooks/            # 页面语言及 tabBar 同步
│   ├── layout/           # 暂留空，需要统一布局时再添加
│   ├── pages/            # 四个 tabBar 页面、语言/币种设置
│   ├── pages-sub/        # 暂留空，业务增多后再配置分包
│   ├── router/           # 简单导航、参数编码、返回兜底
│   ├── store/            # Pinia 与基础用户会话状态
│   ├── styles/           # 变量和基础重置样式
│   ├── utils/            # 存储、会话工具
│   ├── static/           # 页面宣传图片、功能图标、tabBar 图标
│   ├── App.vue
│   ├── main.js
│   ├── pages.json
│   ├── manifest.json
│   └── uni.scss
├── .env.development
├── .env.production
├── eslint.config.js
├── .prettierrc.json
├── jsconfig.json
├── vite.config.js
└── package.json
```

空目录使用 `.gitkeep` 保留。CLI 工程的 `manifest.json`、`pages.json`、`uni.scss` 位于 `src`。

## 静态页面

四个页面按提供的设计截图制作，使用 uni-app 原生 tabBar、自定义页面顶部和 `rpx` 布局；App 顶部预留系统状态栏空间，购物车结算栏避让底部 tabBar。除首页推荐商品由本地 API 获取外，其余区域展示固定数据；“前往商场”仅切换到精选页，首页及精选页右上角、个人页设置图标可进入语言/币种设置，其余业务入口暂为静态展示。公共组件目录继续留空。

`src/static/images` 中的宣传图、头像和部分图标从提供的截图裁剪压缩，后续取得原始设计素材后可同名替换。新增的通用线性图标位于 `src/static/icons`，tabBar 使用本地 PNG 图标。

## 接口与会话

在 `.env.development.local` 配置开发接口。H5 使用 `/api` 代理，`API_PROXY_TARGET` 指向后端且保留 `/api` 前缀；App 直接使用 `VITE_API_BASE_URL`。生产环境需替换 `.env.production` 的占位域名，H5 服务端需配置 CORS 或同源反向代理。`VITE_` 变量会进入客户端，不要放密钥。

业务接口放入 `api/modules`，使用统一请求封装：

```js
import { http } from '@/api'

// 示例写法，项目中尚未预设任何业务接口。
export const getProfile = () => http.get('/user/profile')
```

默认响应契约为 `{ code: 0, message: '', data: ... }`；后端契约确定后在 `request.js` 集中适配。默认附带 Bearer Token，公开接口可传 `{ auth: false }`。失败显示统一提示并抛出 `RequestError`，页面需处理 `catch`；`silent: true` 可关闭提示。请求不自动重试。

登录接口和页面由实际业务实现。登录成功后调用 `useUserStore().setSession({ token, expiresAt, user })`，`expiresAt` 为毫秒时间戳；退出时调用 `clearSession()`。会话保存在本地存储，不保存密码。HTTP / 业务 401 清理对应会话并同步用户状态，旧请求不会清理新登录。当前未加入自动登录跳转、权限守卫或 refresh token，按实际认证流程再添加。

新增页面注册到 `pages.json`，使用 `navigate('/pages/xxx/index', { id })` 跳转，支持 tabBar 自动识别；当前已配置首页、精选、购物车、我的四个 tabBar 入口。业务体量需要时再配置 `subPackages`。

## 开发约定与发布

- 页面局部状态留在页面，多页面共享的状态才放 Pinia；出现实际复用时再抽组件或 Hook。
- `assets` 存参与构建的资源；`static` 使用 `/static/...` 路径。大图、视频优先使用 CDN。
- `src/uni.scss` 只注入 SCSS 变量，全局样式在 `App.vue` 引入。跨端页面使用 uni-app 标签。
- 测试框架、CI、Mock、业务组件和页面模板暂不预置，按需求再引入。
- App 发布前填写 `manifest.json` 的 DCloud AppID，并在 HBuilderX 配置 Android 包名 / 签名及 iOS Bundle ID / 证书 / 描述文件。资源编译通过后仍需真机验收。
- DCloud 编译依赖保持同批版本，升级后验证 H5 / App 构建。当前编译依赖仍有已知安全公告，发布前执行 `npm audit` 评估；不要使用 `npm audit fix --force` 跨代替换编译器。
