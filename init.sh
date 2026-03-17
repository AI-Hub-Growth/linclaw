#!/bin/bash
# LinClaw 初始化部署脚本
# 用法: ./init.sh <目标主机>
# 示例: ./init.sh lin-claw
#       ./init.sh root@1.2.3.4

set -e

REMOTE="${1:?用法: $0 <目标主机>  例: $0 lin-claw}"
REMOTE_DIR="/home/openclaw/linclaw"
PORT=1420

echo ""
echo "  LinClaw Init Deploy"
echo "  目标主机: ${REMOTE}"
echo ""

# ── Step 1: 构建 ──────────────────────────────────────────
echo "==> [1/5] Building frontend..."
npm run build

echo "==> [2/5] Cross-compiling Go binary (linux/amd64)..."
GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o linclawd-linux ./src-go/cmd/linclawd

# ── Step 2: 创建目录 ──────────────────────────────────────
echo "==> [3/5] Setting up remote directory..."
ssh "${REMOTE}" "mkdir -p ${REMOTE_DIR}/dist && chown -R openclaw:openclaw ${REMOTE_DIR}"

# ── Step 3: 上传文件 ──────────────────────────────────────
echo "==> [4/5] Uploading files..."
rsync -av --delete dist/ "${REMOTE}:${REMOTE_DIR}/dist/"
scp linclawd-linux "${REMOTE}:${REMOTE_DIR}/linclawd"
ssh "${REMOTE}" "chmod +x ${REMOTE_DIR}/linclawd && chown -R openclaw:openclaw ${REMOTE_DIR}"

# ── Step 4: 创建 systemd 服务 ─────────────────────────────
echo "==> [5/5] Installing systemd service..."
ssh "${REMOTE}" "cat > /etc/systemd/system/linclaw.service << 'EOF'
[Unit]
Description=LinClaw Web Panel
After=network.target

[Service]
Type=simple
User=openclaw
Group=openclaw
WorkingDirectory=${REMOTE_DIR}
ExecStart=${REMOTE_DIR}/linclawd --host 0.0.0.0 --port ${PORT} --web-root ${REMOTE_DIR}/dist
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable linclaw
systemctl restart linclaw"

# ── 验证 ──────────────────────────────────────────────────
echo ""
ssh "${REMOTE}" "systemctl status linclaw --no-pager -l"
echo ""

PUBLIC_IP=$(ssh "${REMOTE}" "curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print \$1}'" 2>/dev/null || echo "<公网IP>")
echo "  ✅ LinClaw 已部署并启动"
echo "  访问地址: http://${PUBLIC_IP}:${PORT}"
echo ""
echo "  提醒: 确保云安全组已放行 TCP ${PORT}"
echo "  镜像: 验证无误后在云控制台对该实例创建自定义镜像"
echo ""
