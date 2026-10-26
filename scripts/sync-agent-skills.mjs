// Skills próprias: fonte em .agents, cópia em .claude; nunca altera skills OpenSpec.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const sourcePath = resolve(".agents/skills/adaptive-ai-workflow/SKILL.md");
const targetPath = resolve(".claude/skills/adaptive-ai-workflow/SKILL.md");
const check = process.argv.includes("--check");
const normalize = (contents) => contents.replace(/\r\n/g, "\n");

function read(path) {
  try {
    return normalize(readFileSync(path, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error(`Skill não encontrada: ${path}`);
    }
    throw error;
  }
}

try {
  const source = read(sourcePath);
  if (check) {
    if (read(targetPath) !== source) {
      throw new Error("Skill adaptativa divergente. Rode npm run sync:agent-skills e revise o diff.");
    }
    console.log("Skill adaptativa sincronizada.");
  } else {
    mkdirSync(dirname(targetPath), { recursive: true });
    writeFileSync(targetPath, source);
    console.log("Skill adaptativa copiada para Claude; revise o diff.");
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
