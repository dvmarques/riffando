import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const script = resolve("scripts/sync-agent-skills.mjs");
const src = ".agents/skills/adaptive-ai-workflow/SKILL.md";
const dst = ".claude/skills/adaptive-ai-workflow/SKILL.md";
test("sincroniza, normaliza CRLF, detecta divergência e não reescreve em check", () => {
  const root = mkdtempSync(join(tmpdir(), "riffando-skills-"));
  try {
    const source = join(root, src);
    const target = join(root, dst);
    mkdirSync(dirname(source), { recursive: true });
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(source, "skill\nconteudo\n");
    const run = (...args) => spawnSync(process.execPath, [script, ...args], { cwd: root, encoding: "utf8" });
    assert.notEqual(run("--check").status, 0, "cópia ausente deve falhar");
    assert.equal(run().status, 0, "sincronização deve passar");
    assert.equal(run("--check").status, 0, "cópia idêntica deve passar");
    writeFileSync(target, "skill\r\nconteudo\r\n");
    assert.equal(run("--check").status, 0, "CRLF deve ser aceito");
    assert.equal(readFileSync(target, "utf8"), "skill\r\nconteudo\r\n", "check não grava");
    writeFileSync(target, "divergente\n");
    assert.notEqual(run("--check").status, 0, "divergência deve falhar");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
