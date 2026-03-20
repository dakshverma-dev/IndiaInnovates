---
name: revenuecat
description: Guidelines for using RevenueCat to integrate payments in mobile apps and any subsequent CRUD operations related to any RevenueCat entities

# Note: ./references/replit-revenuecat-v2-docs.md is copy-pasted manually from https://github.com/replit/replit-revenuecat-v2/blob/main/docs/SDK.ts and was last updated: 2026-02-12 for version 2.0.2
---


## Introduction

- RevenueCat lets users monetize their native mobile apps on Replit.
- The RevenueCat integration is only intended to be used for the Expo/mobile stack on Replit.
- If the stack used is *not* Expo/mobile, do not use RevenueCat, and instead suggest the Stripe integration.
- The package used in the React Native client code is `react-native-purchases`. Always download the version that is compatible with the version of React Native/Expo used in the app.

## Prerequisites

1. These packages must be installed in the workspace root package.json:
    - `react-native-purchases` - Official client-side SDK for React Native. This should be used on the client.
    - `replit-revenuecat-v2` - SDK for RevenueCat's REST API. This should NEVER be used on the client, only for server-side scripts.

    If they are not installed, use npm to install them: `$ cd /home/runner/workspace && npm install <packages>`


2. The RevenueCat integration must be connected to the repl. This is necessary as the integration creates an authenticated client for RevenueCat accessible via a function `getUncachableRevenueCatClient`. You can do this by proposing the integration. Reference the `integrations` skill if necessary.

You are required to ensure these requirements are met before setting up or using RevenueCat.

## Project Structure

- **Scripts directory**: `scripts/` at the workspace root (e.g., `scripts/seedRevenueCat.ts`)
- **Run a script**: `npx tsx scripts/<script>.ts`
- **Client app directory**: `client/`

Reference files use these terms. Map them to these concrete paths.

## Essential Clarifications -- Critical

- RevenueCat DOES work in Expo Go and DOES NOT require a native build. In Expo Go, the SDK automatically runs in Preview API Mode, replacing native calls with JavaScript mocks so your app loads without errors.
- RevenueCat DOES work on the web out of the box without any additional configuration.
- RevenueCat's Test Store DOES work out of the box and DOES NOT require additional code checks.

## RevenueCat Architecture

- **Projects:** A RevenueCat project is the top-level entity for RevenueCat - it's like a container for your apps, products, entitlements, and integrations.
  - Each project comes with a Test Store where you can create products, configure offerings, and test the complete purchase flow—without connecting to any app store or payment provider.
- **Apps:** An app in RevenueCat is a platform-specific configuration that connects your project to a store (e.g., an iOS app connected to Apple App Store, an Android app connected to Google Play Store, or a web app connected to Stripe/Paddle).
- **Products:** The individual items users purchase (e.g., "Monthly Premium")
- **Entitlements:** The access level users receive (e.g., "premium"). Most apps use a single entitlement (e.g., "pro"). They are linked to products: when a product is purchased, its associated entitlements become active.
  - The flow: User purchases a Product -> which then unlocks an Entitlement -> You check the entitlement to grant access.
- **Offerings:** The set of products available to a user. Allow you to change available products without app updates. Access via `offerings.current` on the client for the default offering.
  - The client side code always queries the current offering as a source of truth to get the products and packages available to the user. Therefore, it is critical that this be always up to date.
- **Packages:** Containers for products within an offering.
- **CustomerInfo**: The central object containing all subscription and purchase data for a user

## Storing Data

Do NOT Create Product Tables or Maintain Any Other Source of Truth for In-App Purchases

**Bad** — creates duplicate product storage:

```ts
export const products = pgTable("products", {
  id: varchar("id").primaryKey(),
  name: text("name"),
  price: integer("price"),
  // ... custom fields
});
```

Correct Approach:

- NO product tables needed!
- Query directly from RevenueCat SDK

Key Principle
"If it exists in RevenueCat, it belongs in RevenueCat"

- Don't duplicate RevenueCat data in your own tables.
- Don't create parallel storage systems.
- RevenueCat + metadata = your complete product catalog.
- Your tables should only store data that RevenueCat doesn't manage.

## Free Trials

- Free trials are not supported in the test store due to a RevenueCat limitation.
- Free trials can be configured directly in App Store Connect and the Google Play Console.
- If a user asks about adding free trials:
  - Inform them of this limitation and note that the client can automatically detect and display free trials via RevenueCat once enabled in production.
  - RevenueCat reads store product metadata, including trial details, in the package object.

## Working with Prices

- Never hardcode prices in the client code; always derive them from the subscription context.
- Prices in the test store are immutable; production store prices are configured in App Store Connect and the Google Play Console.

## References

Before writing code, identify whether any reference below applies to the task. If it does, read it first.

- ./references/initial-setup.md -- Step-by-step guide for setting up RevenueCat from scratch in a project that doesn't already have it configured
- ./references/replit-revenuecat-v2-docs.md -- SDK Reference for the `replit-revenuecat-v2` package
- ./references/subsequent-management.md -- Querying RevenueCat data (e.g. fetching customers, entitlements) and managing resources (creating, updating, deleting products, offerings, prices, etc.) after initial setup
