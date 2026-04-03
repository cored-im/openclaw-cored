// Copyright (c) 2026 Cored Limited
// SPDX-License-Identifier: Apache-2.0

import type { CoredChannelConfig, CoredAccountConfig } from "./types.js";

const DEFAULTS = {
  enableEncryption: true,
  requestTimeout: 30_000,
  requireMention: true,
  inboundWhitelist: [] as string[],
} as const;

const ENV_PREFIX = "CORED_";

function getChannelConfig(cfg: unknown): CoredChannelConfig | undefined {
  const root = cfg as Record<string, unknown> | undefined;
  return root?.channels
    ? ((root.channels as Record<string, unknown>).cored as
        | CoredChannelConfig
        | undefined)
    : undefined;
}

function readEnvConfig(): Partial<CoredAccountConfig> {
  const env = process.env;
  const result: Partial<CoredAccountConfig> = {};

  if (env[`${ENV_PREFIX}APP_ID`]) result.appId = env[`${ENV_PREFIX}APP_ID`];
  if (env[`${ENV_PREFIX}APP_SECRET`])
    result.appSecret = env[`${ENV_PREFIX}APP_SECRET`];
  if (env[`${ENV_PREFIX}BACKEND_URL`])
    result.backendUrl = env[`${ENV_PREFIX}BACKEND_URL`];
  if (env[`${ENV_PREFIX}ENABLE_ENCRYPTION`] !== undefined)
    result.enableEncryption =
      env[`${ENV_PREFIX}ENABLE_ENCRYPTION`] !== "false";
  if (env[`${ENV_PREFIX}REQUEST_TIMEOUT`])
    result.requestTimeout = Number(env[`${ENV_PREFIX}REQUEST_TIMEOUT`]);
  if (env[`${ENV_PREFIX}REQUIRE_MENTION`] !== undefined)
    result.requireMention = env[`${ENV_PREFIX}REQUIRE_MENTION`] !== "false";
  if (env[`${ENV_PREFIX}BOT_USER_ID`])
    result.botUserId = env[`${ENV_PREFIX}BOT_USER_ID`];

  return result;
}

export function listAccountIds(cfg: unknown): string[] {
  const ch = getChannelConfig(cfg);
  if (!ch) {
    // Check env vars as fallback
    if (process.env[`${ENV_PREFIX}APP_ID`]) return ["default"];
    return [];
  }
  if (ch.accounts) return Object.keys(ch.accounts);
  if (ch.appId) return ["default"];
  // env var fallback
  if (process.env[`${ENV_PREFIX}APP_ID`]) return ["default"];
  return [];
}

export function resolveAccountConfig(
  cfg: unknown,
  accountId?: string,
): CoredAccountConfig {
  const ch = getChannelConfig(cfg);
  const id = accountId ?? "default";
  const envConfig = readEnvConfig();

  const raw = ch?.accounts?.[id] ?? ch;

  return {
    accountId: id,
    enabled: raw?.enabled ?? true,
    appId: raw?.appId ?? envConfig.appId ?? "",
    appSecret: raw?.appSecret ?? envConfig.appSecret ?? "",
    backendUrl: raw?.backendUrl ?? envConfig.backendUrl ?? "",
    enableEncryption:
      raw?.enableEncryption ?? envConfig.enableEncryption ?? DEFAULTS.enableEncryption,
    requestTimeout:
      raw?.requestTimeout ?? envConfig.requestTimeout ?? DEFAULTS.requestTimeout,
    requireMention:
      raw?.requireMention ?? envConfig.requireMention ?? DEFAULTS.requireMention,
    botUserId: raw?.botUserId ?? envConfig.botUserId,
    inboundWhitelist: raw?.inboundWhitelist ?? [...DEFAULTS.inboundWhitelist],
  };
}

export interface ConfigValidationError {
  field: string;
  message: string;
}

export function validateAccountConfig(
  config: CoredAccountConfig,
): ConfigValidationError[] {
  const errors: ConfigValidationError[] = [];

  if (!config.appId) {
    errors.push({
      field: "appId",
      message: `Account "${config.accountId}": appId is required. Set it in channels.cored.appId or CORED_APP_ID env var.`,
    });
  }

  if (!config.appSecret) {
    errors.push({
      field: "appSecret",
      message: `Account "${config.accountId}": appSecret is required. Set it in channels.cored.appSecret or CORED_APP_SECRET env var.`,
    });
  }

  if (!config.backendUrl) {
    errors.push({
      field: "backendUrl",
      message: `Account "${config.accountId}": backendUrl is required. Set it in channels.cored.backendUrl or CORED_BACKEND_URL env var.`,
    });
  } else if (
    !config.backendUrl.startsWith("http://") &&
    !config.backendUrl.startsWith("https://")
  ) {
    errors.push({
      field: "backendUrl",
      message: `Account "${config.accountId}": backendUrl must start with http:// or https:// (got "${config.backendUrl}").`,
    });
  }

  if (
    typeof config.requestTimeout !== "number" ||
    !Number.isFinite(config.requestTimeout) ||
    config.requestTimeout <= 0
  ) {
    errors.push({
      field: "requestTimeout",
      message: `Account "${config.accountId}": requestTimeout must be a positive number in milliseconds (got ${config.requestTimeout}).`,
    });
  }

  return errors;
}

export function resolveAndValidateAccountConfig(
  cfg: unknown,
  accountId?: string,
): CoredAccountConfig {
  const config = resolveAccountConfig(cfg, accountId);
  const errors = validateAccountConfig(config);

  if (errors.length > 0) {
    const messages = errors.map((e) => `  - ${e.message}`).join("\n");
    throw new Error(
      `[cored] Invalid config for account "${config.accountId}":\n${messages}`,
    );
  }

  return config;
}

export function listEnabledAccountConfigs(cfg: unknown): CoredAccountConfig[] {
  const ids = listAccountIds(cfg);
  return ids
    .map((id) => resolveAccountConfig(cfg, id))
    .filter((account) => account.enabled);
}
