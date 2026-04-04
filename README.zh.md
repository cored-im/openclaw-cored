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

运行以下命令，将三个占位符替换为你的应用凭据：

```bash
openclaw channels add --channel cored \
  --app-token <APP_ID> \
  --token <APP_SECRET> \
  --url <BACKEND_URL>
```

| 参数 | 填入内容 |
|------|----------|
| `--app-token` | 应用 ID |
| `--token` | 应用密钥 |
| `--url` | 服务器地址，如 `http://192.168.10.10:21000` |

然后重启网关：

```bash
openclaw gateway restart
```

### 账号管理

#### 添加账号

如需接入多个机器人，使用 `--account` 参数指定账号名称：

```bash
openclaw channels add --channel cored \
  --account bot2 \
  --app-token <APP_ID> \
  --token <APP_SECRET> \
  --url <BACKEND_URL>
```

首个账号自动命名为 `default`。

#### 禁用账号

禁用账号（保留配置，方便后续重新启用）：

```bash
openclaw channels remove --channel cored --account bot2
```

如需重新启用，编辑 `~/.openclaw/openclaw.json`，将该账号的 `"enabled"` 设为 `true`（或删除该字段——账号默认启用）。

#### 删除账号

彻底删除账号及其配置：

```bash
openclaw channels remove --channel cored --account bot2 --delete
```

任何账号变更后，需执行 `openclaw gateway restart` 重启网关使更改生效。

### 高级配置

如需修改其他设置（如加密或请求超时），编辑 `~/.openclaw/openclaw.json`：

```json
{
  "channels": {
    "cored": {
      "accounts": {
        "default": {
          "appId": "your_app_id",
          "appSecret": "your_app_secret",
          "backendUrl": "http://192.168.10.10:21000",
          "enableEncryption": true,
          "requestTimeout": 30000
        }
      }
    }
  }
}
```

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
