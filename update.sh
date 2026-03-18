#!/bin/bash
set -e

REMOTE="lin-claw"
REMOTE_DIR="/home/openclaw/linclaw"

echo "==> [1/4] Building frontend..."
npm run build

echo "==> [2/4] Cross-compiling Go binary (linux/amd64)..."
GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o linclawd-linux ./src-go/cmd/linclawd

echo "==> [3/4] Uploading to ${REMOTE}..."
rsync -av --delete dist/ ${REMOTE}:${REMOTE_DIR}/dist/
ssh ${REMOTE} "systemctl stop linclaw"
scp linclawd-linux ${REMOTE}:/tmp/linclawd
ssh ${REMOTE} "sudo mv /tmp/linclawd ${REMOTE_DIR}/linclawd && sudo chmod +x ${REMOTE_DIR}/linclawd"

echo "==> [4/4] Starting service..."
ssh ${REMOTE} "systemctl start linclaw && systemctl status linclaw --no-pager -l"

echo ""
echo "Done."
