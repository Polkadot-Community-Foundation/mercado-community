// SPDX-License-Identifier: GPL-3.0-only
//
// Product manifest for `@polkadot-community-foundation/polkadot-app-deploy`
// (the Bulletin app-deploy CLI). The tool auto-discovers this file by name
// (`polkadot-app-deploy.config.{ts,js,mjs}`, walking up from the build dir) and
// reads the default export to publish the product manifest (displayName,
// description, icon) alongside the content upload. A file named anything else is
// silently ignored — manifest publish skipped, no error.
//
// This lives in `apps/web/` (the deployed app): the deploy pipeline uploads
// `apps/web/dist`, so the CLI walks up from there and finds THIS file. `icon.path`
// and `executables[].path` resolve relative to this file — `./dist` is the Vite
// build output.
//
// `defineConfig` is vendored as an identity function rather than imported from
// the deploy CLI: the tool is a global/npx CLI, not a package.json dependency,
// so importing from it would make config resolution fragile.
const defineConfig = <T>(config: T): T => config;

declare const process: { env?: Record<string, string | undefined> };

// APP_DOTNS_DOMAIN lets CI/preview deploys override the bare label; defaults to
// the production label. MUST match the domain the CLI is invoked with.
const domain = process.env?.APP_DOTNS_DOMAIN ?? "mercado";
const label = domain.toLowerCase().replace(/\.dot$/, "");

export default defineConfig({
  domain: `${label}.dot`,
  displayName: "Mercado",
  description:
    "Web3 food delivery on Polkadot — decentralized ordering with smart-contract escrow payments, dispute resolution, and on-chain restaurant ratings.",
  // NEEDS ICON FROM USER: the repo has no Mercado brand asset (the only image,
  // public/token-logo.png, is an unrelated payment-token monogram). Drop a
  // square PNG/JPEG at this path before the manifest-publish pass; publish
  // fails loudly until it exists. Set `format` to match the file ("png"|"jpeg").
  icon: { path: "./assets/icon.png", format: "png" },
  executables: [
    {
      kind: "app",
      path: "./dist",
      appVersion: [0, 1, 0],
    },
  ],
});
