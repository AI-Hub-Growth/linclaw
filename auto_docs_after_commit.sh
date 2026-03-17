#!/bin/zsh
set -euo pipefail

# =============================
# Config
# =============================
SKIP_TAG='[skip-claude-hook]'
LOCK_FILE="$(git rev-parse --git-dir)/claude_hook_docs.lock"

# 文档/元数据路径（这些变更不触发 commit-with-docs）
DOC_PATH_REGEX='^(docs/|README\.md$|AGENTS\.md$|CLAUDE\.md$|CHANGELOG\.md$|\.github/|\.claude/)'

# 自动生成 docs 的二次提交信息（必须带 skip tag，防死循环）
AUTO_DOC_COMMIT_MSG="docs: auto-update ${SKIP_TAG}"

# 显式加载用户环境（Git hook 非交互 shell 默认不会加载）
# 先临时关闭 set -u，避免 .zshrc 中未定义变量导致退出
if [[ -f "$HOME/.zshrc" ]]; then
  set +u
  source "$HOME/.zshrc"
  set -u
fi

# Claude CLI 可执行文件（可通过环境变量覆盖）
CLAUDE_BIN="${CLAUDE_BIN:-claude}"

# 如果 claude 不可用，给出提示并退出
if ! command -v "$CLAUDE_BIN" >/dev/null 2>&1; then
  log "Claude CLI not found: $CLAUDE_BIN (did you set it in ~/.zshrc?)"
  exit 0
fi

# 调试开关：DEBUG=1 会打印更多信息
DEBUG="${DEBUG:-0}"

log()  { echo "[post-commit] $*"; }
dbg()  { [[ "$DEBUG" == "1" ]] && echo "[post-commit][debug] $*"; }

# 最小可观测性：让 hook 日志更明确
dbg "Script path: $0"
dbg "Working dir: $(pwd)"
dbg "CLAUDE_BIN: $CLAUDE_BIN"

# =============================
# Guards
# =============================
# Guard 0：外部强制跳过（用于二次提交）
if [[ "${SKIP_CLAUDE_HOOK:-}" == "1" ]]; then
  log "SKIP_CLAUDE_HOOK=1, exit."
  exit 0
fi

# Guard 1：锁，防并发/递归
# 如果锁文件陈旧（PID 不存在），清理后继续
if [[ -f "$LOCK_FILE" ]]; then
  LOCK_PID="$(cat "$LOCK_FILE" 2>/dev/null || true)"
  if [[ -n "${LOCK_PID:-}" ]] && ! ps -p "$LOCK_PID" >/dev/null 2>&1; then
    log "Stale lock found for PID $LOCK_PID, removing."
    rm -f "$LOCK_FILE"
  else
    log "Lock exists ($LOCK_FILE), exit."
    exit 0
  fi
fi
trap 'rm -f "$LOCK_FILE"' EXIT
echo "$$" > "$LOCK_FILE"

# Guard 2：如果 commit message 带 skip tag，直接退出
msg="$(git log -1 --pretty=%B 2>/dev/null || true)"
if echo "$msg" | grep -Fq "$SKIP_TAG"; then
  log "Commit message contains skip tag, exit."
  exit 0
fi

# =============================
# Decide whether to trigger
# =============================
changed_files="$(git diff-tree --no-commit-id --name-only -r HEAD 2>/dev/null || true)"
if [[ -z "${changed_files// }" ]]; then
  log "No changed files found, exit."
  exit 0
fi

dbg "Changed files:"
dbg "$changed_files"

# 如果这次 commit 只有 docs/元数据（匹配 DOC_PATH_REGEX），不触发
if echo "$changed_files" | awk 'NF{print}' | grep -Ev "$DOC_PATH_REGEX" >/dev/null 2>&1; then
  dbg "Found non-doc changes -> will trigger."
else
  log "Docs/meta-only commit -> no trigger."
  exit 0
fi

# =============================
# Run Claude skill
# =============================
log "Invoking Claude to run /commit-with-docs ..."

# 这里用 -p（headless/print 模式）确保可在 hook 中运行
# 强约束：只改 docs/README/CHANGELOG/AGENTS/.github/.claude
"$CLAUDE_BIN" -p \
"Run /commit-with-docs now.
Use git to inspect the latest commit (HEAD): message + changed files.
Update ONLY documentation/meta files:
- docs/
- README.md
- CHANGELOG.md
- CLAUDE.md
- AGENTS.md
- .github/
- .claude/
Do NOT modify any other files.
After edits, stop." >/dev/null

# =============================
# Stage docs/meta only
# =============================
# 如果没有任何改动（含 staged/unstaged），退出
if git diff --quiet && git diff --cached --quiet; then
  log "No docs/meta changes produced."
  exit 0
fi

# 只 add 允许范围（更安全）
git add docs/ README.md CHANGELOG.md AGENTS.md .github/ .claude/ 2>/dev/null || true

# 如果暂存区为空，退出
if git diff --cached --quiet; then
  log "Nothing staged for docs/meta."
  exit 0
fi

# =============================
# Auto commit docs/meta (avoid loop)
# =============================
log "Committing docs/meta..."
SKIP_CLAUDE_HOOK=1 git commit -m "$AUTO_DOC_COMMIT_MSG" --no-verify
log "Done."
