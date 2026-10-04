#!/usr/bin/env bash
# 안티매터 디멘션 원본 소스를 고정된 커밋으로 받아서 AD Mod를 적용한다.
#
# 사용법: scripts/apply-mod.sh [대상 폴더]
#   대상 폴더 기본값: ./game
# Windows에서는 Git Bash에서 실행하면 된다.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TARGET="${1:-$ROOT/game}"
UPSTREAM_URL="https://github.com/IvarK/AntimatterDimensionsSourceCode.git"
COMMIT="$(tr -d '[:space:]' < "$ROOT/UPSTREAM_COMMIT")"

if [ -e "$TARGET" ]; then
  echo "이미 '$TARGET' 가 있습니다. 지우거나 다른 폴더를 지정하세요." >&2
  exit 1
fi

echo "==> 원본 소스 받는 중 ($COMMIT)"
git init -q "$TARGET"
git -C "$TARGET" remote add origin "$UPSTREAM_URL"
git -C "$TARGET" fetch -q --depth 1 origin "$COMMIT"
git -C "$TARGET" checkout -q FETCH_HEAD

echo "==> 원본 파일 수정 (patches/*.patch)"
for patch in "$ROOT"/patches/*.patch; do
  git -C "$TARGET" apply --whitespace=nowarn "$patch"
done

echo "==> 새 모드 파일 복사 (overlay/)"
cp -R "$ROOT/overlay/." "$TARGET/"

cat <<EOF

모드 적용 완료: $TARGET

실행 방법:
  cd "$TARGET"
  npm ci
  npm run serve

게임이 열리면 Options 탭 -> Mod 서브탭에서 설정을 바꿀 수 있습니다.
EOF
