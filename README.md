# SUGARGOO

uni-app（Vue 3）+ Vite + Pinia + JavaScript 基础工程，面向 H5、iOS App 和 Android App。源码统一放在 `src`，按实际业务逐步扩展。

## 启动与构建

使用 Node.js 22.12+、npm 10+，提交锁文件，团队统一使用 `npm ci` 安装依赖。

```bash
npm ci
npm run dev:h5     # H5 开发
npm run dev:app    # App 资源开发编译
npm run build:h5   # H5 生产构建
npm run build:app  # App 生产资源构建
npm run check     # ESLint + Prettier 检查
```

`npm run lint:fix` 自动修复代码规范，`npm run format` 格式化代码。H5 产物位于 `dist/build/h5`，默认使用 hash 路由。App 产物位于 `dist/build/app`，不会直接生成 APK / IPA。

## 目录

```text
├── .vscode/              # 保存格式化、ESLint、页面代码片段
├── src/
│   ├── api/
│   │   ├── modules/      # 业务接口目录，暂留空
│   │   ├── request.js    # uni.request、Token、错误处理
│   │   └── index.js
│   ├── assets/           # 图片、字体、图标目录
│   ├── components/      # 只保留 base / business 空目录
│   ├── config/           # 环境与基础设置
│   ├── hooks/            # 暂留空，需要复用逻辑时再添加
│   ├── layout/           # 暂留空，需要统一布局时再添加
│   ├── pages/home/       # 唯一初始页面
│   ├── pages-sub/        # 暂留空，业务增多后再配置分包
│   ├── router/           # 简单导航、参数编码、返回兜底
│   ├── store/            # Pinia 与基础用户会话状态
│   ├── styles/           # 变量和基础重置样式
│   ├── utils/            # 存储、会话工具
│   ├── static/           # 原样复制的静态资源，暂留空
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

新增页面注册到 `pages.json`，使用 `navigate('/pages/xxx/index', { id })` 跳转，支持 tabBar 自动识别；当前不预设 tabBar。业务体量需要时再配置 `subPackages`。

## 开发约定与发布

- 页面局部状态留在页面，多页面共享的状态才放 Pinia；出现实际复用时再抽组件或 Hook。
- `assets` 存参与构建的资源；`static` 使用 `/static/...` 路径。大图、视频优先使用 CDN。
- `src/uni.scss` 只注入 SCSS 变量，全局样式在 `App.vue` 引入。跨端页面使用 uni-app 标签。
- 测试框架、CI、Mock、业务组件和页面模板暂不预置，按需求再引入。
- App 发布前填写 `manifest.json` 的 DCloud AppID，并在 HBuilderX 配置 Android 包名 / 签名及 iOS Bundle ID / 证书 / 描述文件。资源编译通过后仍需真机验收。
- DCloud 编译依赖保持同批版本，升级后验证 H5 / App 构建。当前编译依赖仍有已知安全公告，发布前执行 `npm audit` 评估；不要使用 `npm audit fix --force` 跨代替换编译器。
