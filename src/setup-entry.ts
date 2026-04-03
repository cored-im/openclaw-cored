// Copyright (c) 2026 Cored Limited
// SPDX-License-Identifier: Apache-2.0

import { defineSetupPluginEntry } from "openclaw/plugin-sdk/core";

export default defineSetupPluginEntry({
  async onSetup(context) {
    const appId = await context.prompt({
      type: "text",
      message: "Enter your Cored App ID:",
      validate: (val: string) => val.length > 0 || "This field is required",
    });

    const appSecret = await context.prompt({
      type: "password",
      message: "Enter your Cored App Secret:",
      validate: (val: string) => val.length > 0 || "This field is required",
    });

    const backendUrl = await context.prompt({
      type: "text",
      message: "Enter Cored backend server URL:",
      validate: (val: string) => {
        if (val.length === 0) return "This field is required";
        try {
          new URL(val);
          return true;
        } catch {
          return "Please enter a valid URL";
        }
      },
    });

    const enableEncryption = await context.prompt({
      type: "confirm",
      message: "Enable message encryption?",
      default: true,
    });

    // Write config to ~/.openclaw/openclaw.json
    await context.updateConfig("channels.cored.appId", appId);
    await context.updateConfig("channels.cored.appSecret", appSecret);
    await context.updateConfig("channels.cored.backendUrl", backendUrl);
    await context.updateConfig("channels.cored.enableEncryption", enableEncryption);
    await context.updateConfig("channels.cored.enabled", true);

    console.log("✅ Cored channel configuration saved successfully!");
    console.log("📄 Config file: ~/.openclaw/openclaw.json");
    console.log("📖 Deploy docs: https://coredim.com/docs/admin/bots/openclaw");
  },
});
