import * as esbuild from "esbuild";
import { chmodSync } from "fs";

await esbuild.build({
  entryPoints: ["src/index.ts"],
  bundle:      true,
  platform:    "node",
  target:      "node18",
  format:      "cjs",
  outfile:     "dist/farebox-mcp",
  banner:      { js: "#!/usr/bin/env node" },
});

// Make executable so npm bin entry is valid
chmodSync("dist/farebox-mcp", 0o755);

console.log("farebox-mcp built → dist/farebox-mcp (chmod 755)");
