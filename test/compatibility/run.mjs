import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../..");

console.log("Testing Richcord package compatibility...\n");

// 1. Verify build artifacts exist
const requiredArtifacts = [
  path.join(projectRoot, "dist/src/index.js"),
  path.join(projectRoot, "dist/src/index.cjs"),
  path.join(projectRoot, "dist/src/index.d.ts"),
  path.join(projectRoot, "dist/cli/index.js"),
];

for (const artifact of requiredArtifacts) {
  if (!fs.existsSync(artifact)) {
    console.error(`Error: Required build artifact not found: ${artifact}`);
    console.error("Please run 'npm run build' before running compatibility tests.");
    process.exit(1);
  }
}

// 2. Prepare isolated temporary consumer environment
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "richcord-compat-"));

function runNpm(args, cwd) {
  const bundledNpmCli = path.join(
    path.dirname(process.execPath),
    "node_modules/npm/bin/npm-cli.js"
  );
  if (fs.existsSync(bundledNpmCli)) {
    return execFileSync(process.execPath, [bundledNpmCli, ...args], { cwd, stdio: "pipe" });
  }
  const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
  return execFileSync(npmCmd, args, { cwd, stdio: "pipe", shell: process.platform === "win32" });
}

try {
  // 3. Pack package into temporary directory
  runNpm(["pack", "--pack-destination", tempDir], projectRoot);

  const tarballName = fs
    .readdirSync(tempDir)
    .find((file) => file.startsWith("richcord-") && file.endsWith(".tgz"));

  if (!tarballName) {
    throw new Error("Failed to locate generated npm package tarball in temp directory.");
  }

  const tarballPath = path.join(tempDir, tarballName);

  // 4. Initialize consumer project
  const consumerPackageJson = {
    name: "richcord-compat-consumer",
    version: "1.1.0",
    private: true,
    type: "commonjs",
  };

  fs.writeFileSync(
    path.join(tempDir, "package.json"),
    JSON.stringify(consumerPackageJson, null, 2),
    "utf-8"
  );

  // Install the packaged tarball
  runNpm(["install", "--no-package-lock", tarballPath], tempDir);

  // 5. Copy test fixtures into consumer environment
  fs.copyFileSync(path.join(__dirname, "esm.mjs"), path.join(tempDir, "esm.mjs"));
  fs.copyFileSync(path.join(__dirname, "cjs.cjs"), path.join(tempDir, "cjs.cjs"));
  fs.copyFileSync(path.join(__dirname, "types.ts"), path.join(tempDir, "types.ts"));
  fs.copyFileSync(path.join(__dirname, "types-cjs.cts"), path.join(tempDir, "types-cjs.cts"));

  const consumerTsConfig = {
    compilerOptions: {
      target: "ES2022",
      module: "NodeNext",
      moduleResolution: "NodeNext",
      strict: true,
      skipLibCheck: true,
      noEmit: true,
    },
    include: ["types.ts", "types-cjs.cts"],
  };

  fs.writeFileSync(
    path.join(tempDir, "tsconfig.json"),
    JSON.stringify(consumerTsConfig, null, 2),
    "utf-8"
  );

  // 6. Test ESM import
  execFileSync(process.execPath, [path.join(tempDir, "esm.mjs")], {
    cwd: tempDir,
    stdio: "pipe",
  });
  console.log("✓ ESM import");

  // 7. Test CommonJS require
  execFileSync(process.execPath, [path.join(tempDir, "cjs.cjs")], {
    cwd: tempDir,
    stdio: "pipe",
  });
  console.log("✓ CommonJS require");

  // 8. Test TypeScript declarations
  const tscBin = path.join(projectRoot, "node_modules", "typescript", "bin", "tsc");
  execFileSync(process.execPath, [tscBin, "--project", path.join(tempDir, "tsconfig.json")], {
    cwd: tempDir,
    stdio: "pipe",
  });
  console.log("✓ TypeScript declarations");

  console.log("\nAll compatibility tests passed.");
} catch (error) {
  console.error("\nCompatibility test failed:");
  if (error.stdout) {
    console.error(error.stdout.toString());
  }
  if (error.stderr) {
    console.error(error.stderr.toString());
  }
  if (!error.stdout && !error.stderr) {
    console.error(error.message);
  }
  process.exit(1);
} finally {
  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors
  }
}
