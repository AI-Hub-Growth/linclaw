<p align="center">
  <img src="public/images/logo-brand.png" width="360" alt="LinClaw">
</p>

<p align="center">
  LinClaw — 集成七牛云 AI 大模型广场的 OpenClaw 可视化管理面板
</p>

<p align="center">
  <a href="https://www.qiniu.com/ai/models">
    <img src="https://img.shields.io/badge/七牛云-AI%20大模型广场-F37021?style=flat-square&logo=qiniu" alt="七牛云 AI">
  </a>
  <a href="https://github.com/sunqirui1987/linclaw/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square" alt="License">
  </a>
</p>

---

## 简介

**LinClaw** 是 [OpenClaw](https://github.com/1186258278/OpenClawChineseTranslation) AI Agent 框架的可视化管理面板，深度集成 [七牛云 AI 大模型广场](https://www.qiniu.com/ai/models)。

七牛云 AI 大模型广场汇聚全球主流 AI 模型，提供 **300 万 Token 免费额度**（新用户），支持 OpenAI / Anthropic 兼容接口。LinClaw 内置七牛云一键接入，配置模型、管理 Agent、诊断排障，开箱即用。

| 形态 | 适用场景 | 说明 |
|------|----------|------|
| **🌐 Web 版** | Linux 服务器、Docker、无桌面环境 | `npm run build && npm run serve`，浏览器访问 `http://IP:1420` |
| **🖥️ Electron 桌面版** | macOS / Windows / Linux 桌面环境 | 前端 + Go 后端打包到同一个安装包，双击即可运行 |
| **📦 发布包** | 离线部署、多平台分发 | `npm run release`，输出到 `release/v版本号/` |
| **🚀 一键部署** | 远程服务器快速安装 | `curl -fsSL .../deploy.sh \| bash`，默认端口 9099 |

### 界面预览

<p align="center">
  <strong>仪表盘</strong> — OpenClaw 运行状态概览
</p>
<p align="center">
  <img src="docs/image.png" width="800" alt="LinClaw 仪表盘">
</p>

<p align="center">
  <strong>消息渠道</strong> — 支持 QQ、Telegram、Discord、飞书、钉钉等接入
</p>
<p align="center">
  <img src="docs/image2.png" width="800" alt="LinClaw 消息渠道">
</p>

---

## 七牛云 AI 集成

- **模型广场**: [www.qiniu.com/ai/models](https://www.qiniu.com/ai/models) — 查看可用模型
- **API 文档**: [developer.qiniu.com/aitokenapi](https://developer.qiniu.com/aitokenapi) — 获取 API Key、调用说明
- **接入点**: `https://api.qnaigc.com/v1`（OpenAI 兼容）
- **新用户福利**: 调用即送 300 万全模型免费额度，支持按比例抵扣

在 LinClaw 的「模型配置」页面，选择 **七牛云** 预设，填入 API Key 即可接入。

---

## 源代码安装

### 前置条件

| 环境 | 要求 |
|------|------|
| [Node.js](https://nodejs.org/) | >= 18 |
| [Go](https://go.dev/) | >= 1.25 |
| [Git](https://git-scm.com/) | 克隆仓库 |

### 1. 克隆与安装

```bash
git clone https://github.com/sunqirui1987/linclaw.git
cd linclaw
npm install
```

### 2. 开发模式

#### Web 版

```bash
npm run serve:go         # Go API 后端，默认 http://127.0.0.1:43187
npm run dev              # Vite 前端，自动代理 /__api 到 Go 后端
```

访问 `http://localhost:1420`

如果你想单独运行 Go 的完整静态 Web 服务，可执行：

```bash
npm run serve:go:web
```

### 3. 构建与运行

```bash
npm run build
npm run serve            # Go Web 服务，默认 0.0.0.0:1420
```

### 4. Electron 开发模式

```bash
npm run electron:dev
```

这会同时启动：

- Go API 后端（`127.0.0.1:43187`）
- Vite 前端（`127.0.0.1:1420`）
- Electron 桌面壳

适合做桌面端联调。管理面板依然使用根目录这套 `Vite + Go`，`www/` 官网不会被打进桌面版。

### 5. Electron 预打包（当前平台）

```bash
npm run electron:build
npm run electron:pack
```

说明：

- `electron:build` 会准备桌面端资源目录 `electron-build/`
- `electron:pack` 会生成当前平台的 unpacked 应用，便于本机自测

默认输出目录：

- `release/electron/`

### 6. Electron 安装包

```bash
npm run electron:dist
```

打包流程会自动：

- 构建前端 `dist/`
- 编译当前平台 `linclawd`
- 将前端与 Go 后端一起打进 Electron 安装包

### 7. 跨平台发布包

```bash
npm run release
```

默认会输出到 `release/v版本号/`，并打出以下平台包：

- `darwin/amd64`
- `darwin/arm64`
- `linux/amd64`
- `linux/arm64`
- `windows/amd64`
- `windows/arm64`

如果只想打部分目标：

```bash
npm run release -- linux/amd64 windows/amd64
```

每个发布包都包含：

- `linclawd` 或 `linclawd.exe`
- `dist/`
- `start.sh` 或 `start.cmd`
- `README-DEPLOY.txt`

### 8. 一键部署（远程服务器）

```bash
curl -fsSL https://raw.githubusercontent.com/sunqirui1987/linclaw/main/deploy.sh | bash
```

默认安装到 `~/.linclaw-web`，端口 9099。可通过环境变量自定义：

```bash
CLAWPANEL_PORT=8080 curl -fsSL https://raw.githubusercontent.com/sunqirui1987/linclaw/main/deploy.sh | bash
```

### 9. 官网（www）开发

`www/` 是 LinClaw 的官方落地页，基于 Next.js 16 + React 19 构建，静态导出。

```bash
cd www
pnpm install
pnpm run dev      # 开发服务器 http://localhost:3000
pnpm run build    # 静态导出到 out/
pnpm run start    # 本地预览构建产物
```

构建产物为纯静态文件，可部署到 Vercel、OSS、GitHub Pages 等。

---

## 项目结构

```
linclaw/
├── src/                    # 管理面板前端（Vite + Vanilla JS）
│   ├── pages/              # 页面（模型、服务、助手、聊天等）
│   ├── components/        # 通用组件
│   └── lib/               # API 封装、主题等
├── src-go/                 # Go 后端
├── www/                    # 官网落地页（Next.js + React）
│   ├── app/                # Next.js App Router
│   ├── components/        # 官网组件（sections、动效等）
│   └── public/            # 静态资源
├── scripts/
│   ├── dev.sh             # 开发模式包装
│   ├── electron-dev.mjs   # Electron 开发模式（Go + Vite + Electron）
│   ├── build-electron-assets.mjs # Electron 资源准备
│   ├── release.sh         # 跨平台发布打包
│   ├── run-vite.js        # Vite 启动包装
│   └── sync-version.js    # 版本同步
├── electron/              # Electron 主进程与桌面壳
├── build.sh               # Web 版构建
├── deploy.sh              # 一键部署
└── package.json
```

## 技术栈

| 层级 | 技术 |
|------|------|
| 管理面板前端 | Vanilla JS + Vite |
| 官网（www） | Next.js 16 + React 19 + TypeScript + Tailwind CSS |
| 后端 | Go |

---

## 功能特性

- **🤖 AI 助手** — 4 种模式 + 8 大工具，诊断配置、一键排障、提交 Bug/PR
- **🖼️ 多模态** — 图片识别、文件识别、流式对话
- **模型配置** — 七牛云 / OpenAI / DeepSeek / Ollama 等，一键接入
- **服务管理** — OpenClaw 启停、Gateway 安装、配置备份
- **Agent / 渠道 / 记忆 / 日志** — 完整 OpenClaw 管理能力

---

## 相关链接

| 项目 | 说明 |
|------|------|
| [七牛云 AI 大模型广场](https://www.qiniu.com/ai/models) | 模型列表、免费额度 |
| [七牛云 AI 推理 API 文档](https://developer.qiniu.com/aitokenapi) | 获取 Key、调用说明 |
| [OpenClaw](https://github.com/1186258278/OpenClawChineseTranslation) | AI Agent 框架 |
| [OpenClaw + 七牛云配置指南](https://developer.qiniu.com/aitokenapi/13332/openclaw-installation-cuide) | 官方最佳实践 |

---

## 贡献

欢迎提交 Issue 和 Pull Request。

## 许可证

[MIT License](LICENSE)
