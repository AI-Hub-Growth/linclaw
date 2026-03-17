package commands

import (
	"context"
	"log"
	"os"
	"strings"

	appctx "github.com/AI-Hub-Growth/linclaw/src-go/internal/app"
)

// RunElectronFirstRunInstall runs Node.js, OpenClaw, and config setup when
// LINCLAW_ELECTRON_PACKAGED=1 and managed resources are missing.
// Called from main before ListenAndServe. Logs errors but does not block startup.
func RunElectronFirstRunInstall(ctx context.Context, app *appctx.Context) {
	if strings.TrimSpace(os.Getenv("LINCLAW_ELECTRON_PACKAGED")) != "1" {
		return
	}
	if app == nil || app.Store == nil {
		return
	}

	log.Printf("[electron-init] Electron packaged mode: checking first-run install")

	// 1. Node.js
	nodeStatus, apiErr := checkNodeWithRuntime(ctx, app)
	if apiErr != nil {
		log.Printf("[electron-init] check node failed: %v", apiErr)
		return
	}
	nodeOk, _ := nodeStatus.(map[string]any)["installed"].(bool)
	if !nodeOk {
		log.Printf("[electron-init] Installing Node.js/npm to managed dir...")
		if _, err := installNodeRuntime(ctx, app, map[string]any{}); err != nil {
			log.Printf("[electron-init] Node.js install failed: %v", err)
			return
		}
		log.Printf("[electron-init] Node.js/npm installed")
	}

	// 2. OpenClaw CLI
	if !isManagedOpenClaw(app) {
		log.Printf("[electron-init] Installing OpenClaw (chinese) to managed dir...")
		if _, err := upgradeOpenClaw(ctx, app, map[string]any{"source": "chinese"}); err != nil {
			log.Printf("[electron-init] OpenClaw install failed: %v", err)
			return
		}
		log.Printf("[electron-init] OpenClaw installed")
	}

	// 3. Config
	configStatus, apiErr := checkInstallation(ctx, app, map[string]any{})
	if apiErr != nil {
		log.Printf("[electron-init] check installation failed: %v", apiErr)
		return
	}
	configOk, _ := configStatus.(map[string]any)["installed"].(bool)
	if !configOk {
		log.Printf("[electron-init] Creating default openclaw.json...")
		if _, err := initOpenClawConfig(ctx, app, map[string]any{}); err != nil {
			log.Printf("[electron-init] init config failed: %v", err)
			return
		}
		log.Printf("[electron-init] Config created")
	}

	log.Printf("[electron-init] First-run install complete")
}
