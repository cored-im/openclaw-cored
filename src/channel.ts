// Copyright (c) 2026 Cored Limited
// SPDX-License-Identifier: Apache-2.0

import {
  createChatChannelPlugin,
  createChannelPluginBase,
} from "openclaw/plugin-sdk/core";
import type { OpenClawConfig } from "openclaw/plugin-sdk/core";
import { listAccountIds, resolveAccountConfig } from "./config.js";
import { sendText } from "./messaging/outbound.js";
import { parseTarget } from "./targets.js";

type ResolvedAccount = {
  accountId: string | null;
  appId: string;
  appSecret: string;
  backendUrl: string;
  enableEncryption: boolean;
  requestTimeout: number;
  requireMention: boolean;
};

function resolveAccount(
  cfg: OpenClawConfig,
  accountId?: string | null,
): ResolvedAccount {
  const section = (cfg.channels as Record<string, any>)?.["cored"];
  const accounts = section?.accounts;
  const defaultAccount = section?.defaultAccount;

  // If multi-account mode, resolve the specific account
  if (accounts && Object.keys(accounts).length > 0) {
    const targetId = accountId ?? defaultAccount ?? Object.keys(accounts)[0];
    const account = accounts[targetId];
    if (!account) {
      throw new Error(`cored: account "${targetId}" not found`);
    }
    return {
      accountId: targetId,
      appId: account.appId,
      appSecret: account.appSecret,
      backendUrl: account.backendUrl,
      enableEncryption: account.enableEncryption ?? section.enableEncryption ?? true,
      requestTimeout: account.requestTimeout ?? section.requestTimeout ?? 30000,
      requireMention: account.requireMention ?? section.requireMention ?? true,
    };
  }

  // Single-account mode
  const appId = section?.appId;
  const appSecret = section?.appSecret;
  const backendUrl = section?.backendUrl;

  if (!appId || !appSecret || !backendUrl) {
    throw new Error("cored: appId, appSecret, and backendUrl are required");
  }

  return {
    accountId: null,
    appId,
    appSecret,
    backendUrl,
    enableEncryption: section?.enableEncryption ?? true,
    requestTimeout: section?.requestTimeout ?? 30000,
    requireMention: section?.requireMention ?? true,
  };
}

export const coredPlugin = createChatChannelPlugin<ResolvedAccount>({
  base: createChannelPluginBase({
    id: "cored",
    setup: {
      resolveAccount,
      inspectAccount(cfg, accountId) {
        const section = (cfg.channels as Record<string, any>)?.["cored"];
        const hasConfig = Boolean(
          section?.appId && section?.appSecret && section?.backendUrl,
        );
        return {
          enabled: Boolean(section?.enabled !== false),
          configured: hasConfig,
          tokenStatus: hasConfig ? "available" : "missing",
        };
      },
    },
  }),

  // Plugin metadata
  meta: {
    id: "cored",
    label: "Cored",
    selectionLabel: "Cored",
    docsPath: "/channels/cored",
    blurb: "Connect OpenClaw to Cored",
    aliases: ["cored", "co"],
  },

  // Capabilities
  capabilities: {
    chatTypes: ["direct", "group"] as const,
  },

  // Config
  config: {
    listAccountIds: (cfg: unknown) => listAccountIds(cfg),
    resolveAccount: (cfg: unknown, accountId?: string) =>
      resolveAccountConfig(cfg, accountId),
  },

  // Outbound messaging
  outbound: {
    deliveryMode: "direct" as const,
    resolveTarget: ({ to }: { to?: string }) => {
      const target = parseTarget(to);
      if (!target) {
        return {
          ok: false as const,
          error: new Error(
            `Cored requires --to <user:ID|chat:ID>, got: ${JSON.stringify(to)}`,
          ),
        };
      }
      // Normalize to "kind:id" so sendText receives a consistent format
      return { ok: true as const, to: `${target.kind}:${target.id}` };
    },
    sendText: async ({
      to,
      text,
      accountId,
    }: {
      to: string;
      text: string;
      accountId?: string;
    }) => {
      // Re-parse the normalized target to extract the chat/user ID
      const target = parseTarget(to);
      if (!target) {
        return {
          ok: false,
          error: new Error(`[cored] invalid send target: ${to}`),
        };
      }
      return sendText(target.id, text, accountId);
    },
  },

  // Setup wizard for openclaw onboard
  setupWizard: {
    channel: "cored",
    status: {
      configuredLabel: "Connected",
      unconfiguredLabel: "Not configured",
      resolveConfigured: ({ cfg }: { cfg: OpenClawConfig }) => {
        const section = (cfg.channels as Record<string, any>)?.["cored"];
        return Boolean(section?.appId && section?.appSecret && section?.backendUrl);
      },
    },
    credentials: [
      {
        inputKey: "appId",
        providerHint: "cored",
        credentialLabel: "App ID",
        preferredEnvVar: "CORED_APP_ID",
        envPrompt: "Use CORED_APP_ID from environment?",
        keepPrompt: "Keep current App ID?",
        inputPrompt: "Enter your Cored App ID:",
        inspect: ({ cfg }: { cfg: OpenClawConfig }) => {
          const section = (cfg.channels as Record<string, any>)?.["cored"];
          return {
            accountConfigured: Boolean(section?.appId),
            hasConfiguredValue: Boolean(section?.appId),
          };
        },
      },
      {
        inputKey: "appSecret",
        providerHint: "cored",
        credentialLabel: "App Secret",
        preferredEnvVar: "CORED_APP_SECRET",
        envPrompt: "Use CORED_APP_SECRET from environment?",
        keepPrompt: "Keep current App Secret?",
        inputPrompt: "Enter your Cored App Secret:",
        inspect: ({ cfg }: { cfg: OpenClawConfig }) => {
          const section = (cfg.channels as Record<string, any>)?.["cored"];
          return {
            accountConfigured: Boolean(section?.appSecret),
            hasConfiguredValue: Boolean(section?.appSecret),
          };
        },
      },
      {
        inputKey: "backendUrl",
        providerHint: "cored",
        credentialLabel: "Backend URL",
        preferredEnvVar: "CORED_BACKEND_URL",
        envPrompt: "Use CORED_BACKEND_URL from environment?",
        keepPrompt: "Keep current Backend URL?",
        inputPrompt: "Enter your Cored backend server URL:",
        inspect: ({ cfg }: { cfg: OpenClawConfig }) => {
          const section = (cfg.channels as Record<string, any>)?.["cored"];
          return {
            accountConfigured: Boolean(section?.backendUrl),
            hasConfiguredValue: Boolean(section?.backendUrl),
          };
        },
      },
    ],
  },
});
