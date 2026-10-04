#!/usr/bin/env bash
# apply-mod.sh로 만든 게임 폴더에서 수정한 내용을 이 저장소로 되돌려 저장한다.
#  - overlay/에 있는 파일 경로는 게임 폴더의 같은 파일로 덮어쓴다.
#  - 원본 파일을 고친 내용은 patches/ad-mod.patch로 다시 만든다.
# 새 파일을 추가했다면 먼저 overlay/ 아래 같은 경로에 빈 파일을 만들어 두면 같이 복사된다.
#
# 사용법: scripts/export-mod.sh [게임 폴더]
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TARGET="${1:-$ROOT/game}"

if [ ! -d "$TARGET/.git" ]; then
  echo "'$TARGET' 는 apply-mod.sh로 만든 게임 폴더가 아닙니다." >&2
  exit 1
fi

echo "==> overlay 파일 복사"
(cd "$ROOT/overlay" && find . -type f) | while read -r file; do
  cp "$TARGET/$file" "$ROOT/overlay/$file"
done

echo "==> 패치 다시 만들기"
git -C "$TARGET" diff > "$ROOT/patches/ad-mod.patch"
git -C "$TARGET" diff --stat
