import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const viteBin = path.join(rootDir, "node_modules", "vite", "bin", "vite.js");

const processes = [
  {
    name: "api",
    command: "node",
    args: ["src/server.js"],
  },
  {
    name: "web",
    command: "node",
    args: [viteBin, "--configLoader", "native", "--port=3000", "--host=0.0.0.0"],
  },
];

const running = new Set();
let shuttingDown = false;

function stopAll(exitCode = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  for (const child of running) {
    child.kill();
  }

  process.exitCode = exitCode;
}

for (const proc of processes) {
  const child = spawn(proc.command, proc.args, {
    cwd: rootDir,
    stdio: "inherit",
    shell: false,
    env: process.env,
  });

  running.add(child);

  child.on("exit", (code, signal) => {
    running.delete(child);

    if (shuttingDown) {
      return;
    }

    const reason = signal ? `signal ${signal}` : `code ${code}`;
    console.error(`[${proc.name}] exited with ${reason}; stopping dev server.`);
    stopAll(code ?? 1);
  });
}

process.on("SIGINT", () => stopAll(0));
process.on("SIGTERM", () => stopAll(0));
