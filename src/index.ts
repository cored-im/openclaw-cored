// Copyright (c) 2026 Cored Limited
// SPDX-License-Identifier: Apache-2.0

import { defineChannelPluginEntry, type PluginApi } from "openclaw/plugin-sdk/core";
import { coredPlugin } from "./channel.js";
import { listEnabledAccountConfigs, validateAccountConfig } from "./config.js";
import {
  createClient,
  destroyAllClients,
  clientCount,
} from "./core/cored-client.js";
import { processInboundMessage, type ExtendedPluginApi } from "./messaging/inbound.js";
import { makeDeliver, setTyping, clearTyping, readMessage } from "./messaging/outbound.js";
import type { CoredAccountConfig, CoredMessageEvent } from "./types.js";

// Extended PluginApi with config type for service registration
interface ServicePluginApi extends ExtendedPluginApi {
  config: { channels?: Record<string, unknown> };
}

export default defineChannelPluginEntry({
  id: "cored",
  name: "Cored",
  description: "Connect OpenClaw with Cored",
  plugin: coredPlugin,
  registerFull(api) {
    const typedApi = api as ServicePluginApi;

    typedApi.registerService({
      id: "cored-sdk",
      start: async () => {
        if (clientCount() > 0) return;

        const accounts = listEnabledAccountConfigs(typedApi.config);
        if (accounts.length === 0) {
          typedApi.logger?.warn?.("[cored] no enabled account config found — service idle");
          return;
        }

        for (const account of accounts) {
          const errors = validateAccountConfig(account);
          if (errors.length > 0) {
            typedApi.logger?.warn?.(
              `[cored] skipping account=${account.accountId}: ${errors.map((e) => e.message).join("; ")}`,
            );
            continue;
          }

          try {
            await startAccount(typedApi, account);
            typedApi.logger?.info?.(
              `[cored] account=${account.accountId} connected (appId=${account.appId})`,
            );
          } catch (err) {
            typedApi.logger?.error?.(
              `[cored] account=${account.accountId} failed to start: ${err instanceof Error ? err.message : String(err)}`,
            );
          }
        }

        typedApi.logger?.info?.(`[cored] service started with ${clientCount()} account(s)`);
      },
      stop: async () => {
        await destroyAllClients();
        typedApi.logger?.info?.("[cored] service stopped — all clients disconnected");
      },
    });

    typedApi.logger?.info?.("[cored] plugin registered");
  },
});

/**
 * Start a single account — create client, subscribe to inbound events.
 */
async function startAccount(
  api: ServicePluginApi,
  account: CoredAccountConfig,
): Promise<void> {
  const deliver = makeDeliver(account.accountId, (msg) => api.logger?.warn?.(msg));

  await createClient({
    config: account,
    log: (msg: string) => api.logger?.debug?.(msg),
    onMessage: (event: CoredMessageEvent, accountConfig: CoredAccountConfig) => {
      // Fire-and-forget: process inbound with typing indicator
      handleInbound(api, accountConfig, event, deliver).catch((err) => {
        api.logger?.error?.(
          `[cored] unhandled inbound error for account=${accountConfig.accountId}: ${err}`,
        );
      });
    },
  });
}

/**
 * Handle a single inbound message with typing indicator lifecycle.
 */
async function handleInbound(
  api: ServicePluginApi,
  account: CoredAccountConfig,
  event: CoredMessageEvent,
  deliver: (chatId: string, text: string) => Promise<void>,
): Promise<void> {
  const chatId = event.message?.chatId;
  const messageId = event.message?.messageId;

  // Set typing indicator and mark message as read before processing
  if (chatId) {
    setTyping(chatId, account.accountId).catch(() => {});
  }
  if (messageId) {
    readMessage(messageId, account.accountId).catch(() => {});
  }

  try {
    await processInboundMessage(api, account, event, { deliver });
  } finally {
    // Clear typing after dispatch completes
    if (chatId) {
      clearTyping(chatId, account.accountId).catch(() => {});
    }
  }
}
