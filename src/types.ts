// Copyright (c) 2026 Cored Limited
// SPDX-License-Identifier: Apache-2.0

// --- Plugin Config Types ---

export interface CoredAccountConfig {
  accountId: string;
  appId: string;
  appSecret: string;
  backendUrl: string;
  enabled: boolean;
  enableEncryption: boolean;
  requestTimeout: number;
}

export interface CoredRawAccountConfig {
  appId?: string;
  appSecret?: string;
  backendUrl?: string;
  enabled?: boolean;
  enableEncryption?: boolean;
  requestTimeout?: number;
}

export interface CoredChannelConfig {
  appId?: string;
  appSecret?: string;
  backendUrl?: string;
  enabled?: boolean;
  enableEncryption?: boolean;
  requestTimeout?: number;
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

