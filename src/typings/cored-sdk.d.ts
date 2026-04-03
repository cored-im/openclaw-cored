// Copyright (c) 2026 Cored Limited
// SPDX-License-Identifier: Apache-2.0

/**
 * Re-export types from @cored-im/sdk used across the plugin.
 *
 * The published SDK ships its own type declarations. This file exists
 * only to keep the rest of the plugin importing from a single local
 * barrel, making future SDK swaps cheaper.
 */
export type {
  CoredClient,
  CoredClientOptions,
} from "@cored-im/sdk";

export {
  LoggerLevel,
} from "@cored-im/sdk";

export type {
  Logger,
  EventHeader,
} from "@cored-im/sdk";
