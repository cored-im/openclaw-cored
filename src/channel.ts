// Copyright (c) 2026 Cored Limited
// SPDX-License-Identifier: Apache-2.0

import { listAccountIds, resolveAccountConfig } from "./config.js";
import { sendText } from "./messaging/outbound.js";
import { parseTarget } from "./targets.js";

export const coredPlugin = {
  id: "cored",
  meta: {
    id: "cored",
    label: "Cored",
    selectionLabel: "Cored",
    docsPath: "/channels/cored",
    blurb: "Cored enterprise IM channel",
    aliases: ["cored", "cd"],
  },
  capabilities: {
    chatTypes: ["direct", "group"] as const,
  },
  config: {
    listAccountIds: (cfg: unknown) => listAccountIds(cfg),
    resolveAccount: (cfg: unknown, accountId?: string) =>
      resolveAccountConfig(cfg, accountId),
  },
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
};
