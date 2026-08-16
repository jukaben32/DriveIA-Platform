#!/bin/bash
set -euo pipefail

# Installs bundled Claude Code skills (e.g. scroll-film-studio) from the repo
# into ~/.claude/skills so they load every session, without depending on the
# ephemeral container's local state. Idempotent: safe to run every session.

SKILLS_SRC="$CLAUDE_PROJECT_DIR/.claude/skills"
SKILLS_DEST="$HOME/.claude/skills"

if [ ! -d "$SKILLS_SRC" ]; then
  exit 0
fi

mkdir -p "$SKILLS_DEST"

for skill_dir in "$SKILLS_SRC"/*/; do
  [ -d "$skill_dir" ] || continue
  skill_name="$(basename "$skill_dir")"
  rm -rf "$SKILLS_DEST/$skill_name"
  cp -R "$skill_dir" "$SKILLS_DEST/$skill_name"
  echo "installed skill: $skill_name"
done
