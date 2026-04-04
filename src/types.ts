// Copyright (c) 2026 Cored Limited
// SPDX-License-Identifier: Apache-2.0

// --- Plugin Config Types ---

export interface CoredAccountConfig {
  accountId: string;
  enabled: boolean;
  appId: string;
  appSecret: string;
  backendUrl: string;
  enableEncryption: boolean;
  requestTimeout: number;
  requireMention: boolean;
  botUserId?: string;
  inboundWhitelist: string[];
}

export interface CoredRawAccountConfig {
  appId?: string;
  appSecret?: string;
  backendUrl?: string;
  enableEncryption?: boolean;
  requestTimeout?: number;
  requireMention?: boolean;
  enabled?: boolean;
  botUserId?: string;
  inboundWhitelist?: string[];
}

export interface CoredChannelConfig {
  appId?: string;
  appSecret?: string;
  backendUrl?: string;
  enableEncryption?: boolean;
  requestTimeout?: number;
  requireMention?: boolean;
  enabled?: boolean;
  botUserId?: string;
  inboundWhitelist?: string[];
  accounts?: Record<string, CoredRawAccountConfig>;
}

// --- Cored Event Types ---

export interface CoredUserId {
  userId: string;
  unionUserId?: string;
  openUserId?: string;
}

export interface CoredMessage {
  messageId: string;
  messageType: string;
  messageContent: unknown;
  chatId: string;
  chatType: string;
  sender: CoredUserId;
  createdAt: number;
  mentionUserList?: CoredUserId[];
}

export interface CoredMessageEvent {
  message: CoredMessage;
}

// --- Target Types ---

export interface ParsedTarget {
  kind: "user" | "chat";
  id: string;
}

// --- Connection Types ---

export type ConnectionState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "disconnecting";

