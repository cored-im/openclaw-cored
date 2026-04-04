# @cored-im/openclaw-plugin

[![npm version](https://img.shields.io/npm/v/@cored-im/openclaw-plugin.svg)](https://www.npmjs.com/package/@cored-im/openclaw-plugin)
[![CI](https://github.com/cored-im/openclaw-cored/actions/workflows/ci.yaml/badge.svg)](https://github.com/cored-im/openclaw-cored/actions/workflows/ci.yaml)
[![npm downloads](https://img.shields.io/npm/dm/@cored-im/openclaw-plugin.svg)](https://www.npmjs.com/package/@cored-im/openclaw-plugin)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/github/license/cored-im/openclaw-cored)](LICENSE)

[中文](./README.zh.md) | English

Cored is a secure, self-hosted productivity platform for teams, integrating instant messaging, organizational structures, video conferencing, and file storage.

Cored IM channel plugin for OpenClaw. Connects a Cored bot to OpenClaw's AI agent pipeline so you can chat with your agent through Cored. See the [Setup Tutorial](https://coredim.com/docs/admin/bots/openclaw) for how to connect Cored to OpenClaw.

## Features

- Direct chat and group chat support
- Inbound and outbound text messages
- Typing indicator and read receipt lifecycle
- Multi-account setup
- Group trigger policy with optional mention-only mode
- Inbound whitelist for access control
- Message deduplication
- Self-message filtering
- Automatic client reconnection with auth retry

## Prerequisites

- **OpenClaw** installed and running
- **Node.js** v18 or higher
- A Cored application with `appId`, `appSecret`, and `backendUrl` ready

## Installation

```bash
openclaw plugins install @cored-im/openclaw-plugin
```

## Configuration

Interactive setup (recommended):

```bash
openclaw channels add --channel cored
```

Or manually edit `~/.openclaw/openclaw.json`:

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

Then restart the gateway:

```bash
openclaw gateway restart
```

### Multi-Account Setup

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

### Config Reference

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `appId` | string | required | Cored application ID |
| `appSecret` | string | required | Cored application secret |
| `backendUrl` | string | required | Cored backend URL |
| `enabled` | boolean | `true` | Enable/disable this account |
| `enableEncryption` | boolean | `true` | Whether to use encrypted transport |
| `requestTimeout` | number | `30000` | API request timeout in milliseconds |

### Environment Variables

The `default` account supports environment variable fallback:

- `CORED_APP_ID`
- `CORED_APP_SECRET`
- `CORED_BACKEND_URL`

## License

Apache-2.0
