// Verifica apenas skills próprias; não altera skills OpenSpec geradas.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
const src=resolve(".agents/skills/adaptive-ai-workflow/SKILL.md");
const target=resolve(".claude/skills/adaptive-ai-workflow/SKILL.md");
const check=process.argv.includes("--check");
const normalize=s=>s.replace(/\r\n/g,"\n");
const source=normalize(readFileSync(src,"utf8"));
if(check){let actual;try{actual=normalize(readFileSync(target,"utf8"));}catch{console.error("Skill Claude ausente");process.exit(1);}
if(source!==actual){console.error("Skill própria fora de sincronia");process.exit(1);} console.log("Skill própria sincronizada");
}else{mkdirSync(dirname(target),{recursive:true});writeFileSync(target,source);console.log("Skill própria copiada para Claude");}
