import fs from 'fs';
import path from 'path';

const rootDir = 'D:/reverse';

// 1. Pastas e arquivos legados do awesome-cursorrules para remover
const pathsToRemove = [
  path.join(rootDir, 'rules'),
  path.join(rootDir, 'cursor-ai-logo.png'),
  path.join(rootDir, 'cr_logo.png'),
  path.join(rootDir, 'LOCKUP_VERTICAL_25D_DARK.png'),
  path.join(rootDir, 'LOCKUP_VERTICAL_25D_LIGHT.png'),
  path.join(rootDir, 'Unblocked-logo-sq-words-over-gradient-1024w.png'),
  path.join(rootDir, 'code-of-conduct.md'),
  path.join(rootDir, 'contributing.md')
];

// Scripts legados para remover
const legacyScripts = [
  'check-awesome-list.mjs',
  'check-awesome-list.test.mjs',
  'check-issue-template-policy.mjs',
  'check-pr-author.mjs',
  'check-pr-author.test.mjs',
  'check-readme-hygiene.mjs',
  'check-repo-concerns.test.mjs',
  'check-repo-hygiene.mjs',
  'check-repo-hygiene.test.mjs',
  'check-repo-security.mjs',
  'check-repo-security.test.mjs',
  'check-rule-hygiene.mjs',
  'cleanup-legacy-artifacts.mjs',
  'cleanup-legacy-artifacts.test.mjs',
  'convert-readme-links.mjs',
  'convert-readme-links.test.mjs',
  'repo-config.mjs',
  'repo-config.test.mjs',
  'workflow-security.test.mjs'
];

for (const script of legacyScripts) {
  pathsToRemove.push(path.join(rootDir, 'scripts', script));
}

console.log('🧹 [PlanOrc] Removendo arquivos e pastas legadas do Cursor...');

for (const targetPath of pathsToRemove) {
  try {
    if (fs.existsSync(targetPath)) {
      const stat = fs.statSync(targetPath);
      if (stat.isDirectory()) {
        fs.rmSync(targetPath, { recursive: true, force: true });
        console.log(`  🗑️ Pasta removida: ${path.relative(rootDir, targetPath)}`);
      } else {
        fs.unlinkSync(targetPath);
        console.log(`  🗑️ Arquivo removido: ${path.relative(rootDir, targetPath)}`);
      }
    }
  } catch (err) {
    console.warn(`  ⚠️ Aviso ao remover ${targetPath}:`, err.message);
  }
}

console.log('✅ [PlanOrc] Limpeza de arquivos legados concluída com sucesso!');
