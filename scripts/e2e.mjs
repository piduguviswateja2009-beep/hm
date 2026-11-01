import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const baseURL = "http://127.0.0.1:3100";
const env = {
  ...process.env,
  NEXT_PUBLIC_SITE_URL: baseURL,
  NEXT_TELEMETRY_DISABLED: "1",
};

function startNode(args) {
  return spawn(process.execPath, args, { cwd: process.cwd(), env, stdio: "inherit" });
}

async function waitForServer(server) {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) throw new Error(`Next.js server exited with code ${server.exitCode}`);
    try {
      const response = await fetch(baseURL, { signal: AbortSignal.timeout(2_000) });
      if (response.ok) return;
    } catch {
      // The dev server is still starting.
    }
    await delay(500);
  }
  throw new Error("Timed out waiting for the Playwright Next.js server.");
}

async function stopServer(server) {
  if (server.exitCode !== null) return;
  server.kill("SIGTERM");
  await Promise.race([
    new Promise((resolve) => server.once("exit", resolve)),
    delay(5_000).then(() => {
      if (server.exitCode === null) server.kill("SIGKILL");
    }),
  ]);
}

const server = startNode(["./node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", "3100"]);
let exitCode = 1;
try {
  await waitForServer(server);
  const tests = startNode(["./node_modules/@playwright/test/cli.js", "test"]);
  exitCode = await new Promise((resolve, reject) => {
    tests.once("error", reject);
    tests.once("exit", (code) => resolve(code ?? 1));
  });
} catch (error) {
  console.error(error instanceof Error ? error.message : "End-to-end tests could not run.");
} finally {
  await stopServer(server);
}
process.exitCode = exitCode;
