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

- `GET /api/products?locale=zh-CN`：返回 `{ code: 0, message: 'ok', data: { items, total } }`。
- `GET /api/health`：健康检查。
- `GET /api/images/products/<文件名>.jpg`：商品图片。

服务端初始商品数据在 `server/data/products.json`，图片在 `server/public/products`，来自提供的截图。可在 JSON 中增删商品或修改标题、销量、价格，刷新首页即可生效；`price.amountMinor` 固定为人民币分，例如 `3309` 表示 `CNY 33.09`；标题在 `titles` 中按语言维护，`image` 为相对于 API 根路径的图片地址。当前是本地文件数据源，尚未接入真实商品库、数据库或后台管理系统。前端没有内置商品数据或离线兜底，服务不可用时显示重试入口；支持下拉刷新。

H5 的 `/api` 请求和商品图片通过 Vite 代理转发到本地后端。真机 App 联调时，使用 `HOST=0.0.0.0 npm run dev:server` 在可信局域网监听，并在 `.env.development.local` 中将 `VITE_API_BASE_URL` 设置为 `http://电脑局域网IP:8080/api`，重新启动 App 编译；手机与电脑需在同一网络，手机上的 `127.0.0.1` 不指向电脑。App 的 HTTP 开发访问策略需按调试运行基座配置，正式发布使用 HTTPS 服务。生产 H5 不使用 Vite 开发代理，需要自行部署后端并配置同源代理或 CORS。

## 多语言与多币种

- `src/locales`：中文 `zh-CN`、英文 `en-US`、西班牙文 `es-ES` 界面翻译，缺失时回退中文。
- `shared/international.js`：前后端共享的语言、币种和小数位定义。
- `src/pages/settings`：首页右上角进入，弹层选择后确认保存；语言与币种独立持久化。
- `GET /api/products?locale=zh-CN`：仅语言影响标题；所有商品价格始终是 `price: { currency: "CNY", amountMinor, fractionDigits: 2 }`。币种变化不清空列表、不请求商品接口。
- `GET /api/exchange-rate?currency=USD`：独立汇率接口，返回 CNY→目标币种的 `rateNumerator / rateScale`、供应商更新时间、下次更新时间与来源。
- `server/exchange-rates.js`：第三方适配及缓存。目前接入 [ExchangeRate-API 开放接口](https://www.exchangerate-api.com/docs/free)，无需 Key、**每日更新，并非秒级实时行情**。页面按供应商要求展示来源链接。
- `shared/money.js`：前端使用整数约分计算并按目标币种小数位舍入，不累计换汇；每次始终从原始人民币金额计算。无可用汇率时显示 `—`。
- `src/store/modules/exchange.js`：按币种管理汇率缓存、加载状态及错误，合并同币种并发请求。`src/utils/money.js` 只负责最终金额格式。

### 更新时机

1. 每次在设置弹层确认币种，都请求自己的汇率接口（包括切回 CNY），成功后才保存币种；失败保留原币种并提示重试。
2. 应用启动或返回前台检查当前币种的汇率；客户端缓存超过 5 分钟、供应商下一次更新时间已到或本机时钟倒退时重新获取。
3. 前台每分钟检查一次上述条件，未过期不发请求，进入后台停止定时器。
4. 自动更新失败时可继续使用最近成功获取的缓存，界面明确提示；客户端缓存超过 24 小时或不存在时显示 `—`，可手动重试。缓存有效期指成功校验时间，页面另展示供应商数据日期。
5. 本地后端最多缓存上游 1 小时，供应商 `nextUpdateAt` 到达会提前失效；并发请求合并，避免频繁切币触发第三方限流。

### 替换实时服务

`EXCHANGE_RATE_URL` 可改变上游地址，响应格式改变时只需调整 `server/exchange-rates.js` 的适配方法及来源信息，前端接口契约保持不变。`EXCHANGE_RATE_CACHE_MS` 可调整服务端缓存时长（毫秒），前端有效期在 `shared/money.js` 的 `RATE_CHECK_MS` 配置。例如换成分钟级服务时应同步缩短两端缓存策略。不要把私密 API Key 放进 `VITE_` 变量，应保留在后端。

个人页钱包余额仍明确为 CNY，购物车当前为零金额；宣传图片里的文字和价格属于静态素材，需要另备对应版本。前端换汇用于展示，未来真实下单仍需由后端核价。

运行 `npm run test:server` 验证金额舍入、币种匹配、缓存失效、上游校验与失败处理。H5 已做设置联调；iOS/Android 仍需真机验证。

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

四个页面按提供的设计截图制作，使用 uni-app 原生 tabBar、自定义页面顶部和 `rpx` 布局；App 顶部预留系统状态栏空间，购物车结算栏避让底部 tabBar。除首页推荐商品由本地 API 获取外，其余区域展示固定数据；“前往商场”仅切换到精选页，首页及精选页右上角、个人页设置图标可进入语言/币种设置，“我的”默认展示未登录状态，点击内容区域（包括空白处）进入登录/注册页，底部 tabBar 可正常切换。已登录后的业务入口显示暂未开放提示。公共组件目录继续留空。

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

登录/注册页目前为纯前端演示，支持表单校验、密码显隐、演示验证码刷新、协议和订阅勾选。填写有效内容后会创建内存中的演示用户并返回“我的”，可退出；刷新或重启后恢复未登录，不保存密码、不创建 Token、不调用认证接口，也不会真实创建账号。忘记密码、Google/Apple 登录、协议和隐私入口目前仅显示提示。演示验证码只用于页面交互，不具备安全校验能力。

后续接入真实登录接口后，登录成功时调用 `useUserStore().setSession({ token, expiresAt, user })`，`expiresAt` 为毫秒时间戳；退出时调用 `clearSession()`。会话保存在本地存储，不保存密码。HTTP / 业务 401 清理对应会话并同步用户状态，旧请求不会清理新登录。当前未加入自动登录跳转、权限守卫或 refresh token，按实际认证流程再添加。

新增页面注册到 `pages.json`，使用 `navigate('/pages/xxx/index', { id })` 跳转，支持 tabBar 自动识别；当前已配置首页、精选、购物车、我的四个 tabBar 入口。业务体量需要时再配置 `subPackages`。

## 开发约定与发布

- 页面局部状态留在页面，多页面共享的状态才放 Pinia；出现实际复用时再抽组件或 Hook。
- `assets` 存参与构建的资源；`static` 使用 `/static/...` 路径。大图、视频优先使用 CDN。
- `src/uni.scss` 只注入 SCSS 变量，全局样式在 `App.vue` 引入。跨端页面使用 uni-app 标签。
- 测试框架、CI、Mock、业务组件和页面模板暂不预置，按需求再引入。
- App 发布前填写 `manifest.json` 的 DCloud AppID，并在 HBuilderX 配置 Android 包名 / 签名及 iOS Bundle ID / 证书 / 描述文件。资源编译通过后仍需真机验收。
- DCloud 编译依赖保持同批版本，升级后验证 H5 / App 构建。当前编译依赖仍有已知安全公告，发布前执行 `npm audit` 评估；不要使用 `npm audit fix --force` 跨代替换编译器。
