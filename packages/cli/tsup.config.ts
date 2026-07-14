import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node18",
  platform: "node",
  clean: true,
  // Bundle the workspace core (TS source) into the output...
  noExternal: ["@image-compressor/core"],
  // ...but keep the native/runtime deps external so sharp can load its binary.
  external: ["sharp", "tinyglobby"],
  banner: { js: "#!/usr/bin/env node" },
});
