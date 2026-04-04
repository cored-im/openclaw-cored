# @cored-im/openclaw-plugin

[![npm version](https://img.shields.io/npm/v/@cored-im/openclaw-plugin.svg)](https://www.npmjs.com/package/@cored-im/openclaw-plugin)
[![CI](https://github.com/cored-im/openclaw-cored/actions/workflows/ci.yaml/badge.svg)](https://github.com/cored-im/openclaw-cored/actions/workflows/ci.yaml)
[![npm downloads](https://img.shields.io/npm/dm/@cored-im/openclaw-plugin.svg)](https://www.npmjs.com/package/@cored-im/openclaw-plugin)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/github/license/cored-im/openclaw-cored)](LICENSE)

中文 | [English](./README.md)

Cored 是一个安全、可自托管的团队协作平台，集成了即时通讯、组织架构、音视频会议和文件存储等功能。

 IM 频道插件，用于 OpenClaw。将机器人接入 OpenClaw 的 AI Agent 管线，通过与 Agent 对话。请参阅[配置教程](https://coredim.com/docs/admin/bots/openclaw)了解如何将连接到 OpenClaw。

## 功能

- 支持私聊和群聊
- 收发文本消息
- 输入状态指示和已读回执
- 多账号配置
- 群聊触发策略，支持仅 @提及 模式
- 入站白名单访问控制
- 消息去重
- 自身消息过滤
- 客户端自动重连与鉴权重试

## 前置条件

- 已安装并运行 **OpenClaw**
- **Node.js** v18 或更高版本
- 已准备好应用的 `appId`、`appSecret` 和 `backendUrl`

## 安装

```bash
openclaw plugins install @cored-im/openclaw-plugin
```

## 配置

交互式配置（推荐）：

```bash
openclaw channels add --channel cored
```

或手动编辑 `~/.openclaw/openclaw.json`：

```json
{
  "channels": {
    "cored": {
      "appId": "your_app_id",
      "appSecret": "your_app_secret",
      "backendUrl": "https://your-backend-url.com"
    }
  }
}
```

然后重启网关：

```bash
openclaw gateway restart
```

### 多账号配置

```json
{
  "channels": {
    "cored": {
      "appId": "111111",
      "appSecret": "secret-1",
      "backendUrl": "https://your-backend-url.com",
      "accounts": {
        "bot2": {
          "enabled": true,
          "appId": "222222",
          "appSecret": "secret-2",
          "backendUrl": "https://your-backend-url.com"
        }
      }
    }
  }
}
```

### 配置项参考

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `appId` | string | 必填 | 应用 ID |
| `appSecret` | string | 必填 | 应用密钥 |
| `backendUrl` | string | 必填 | 后端地址 |
| `enabled` | boolean | `true` | 启用/禁用该账号 |
| `enableEncryption` | boolean | `true` | 是否启用加密传输 |
| `requestTimeout` | number | `30000` | API 请求超时时间（毫秒） |

### 环境变量

`default` 账号支持环境变量回退：

- `CORED_APP_ID`
- `CORED_APP_SECRET`
- `CORED_BACKEND_URL`

## 许可证

Apache-2.0
