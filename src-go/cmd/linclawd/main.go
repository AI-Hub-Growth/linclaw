package main

import (
	"flag"
	"log"
	"net/http"
	"os"
	"path/filepath"

	appctx "github.com/AI-Hub-Growth/linclaw/src-go/internal/app"
	"github.com/AI-Hub-Growth/linclaw/src-go/internal/commands"
	"github.com/AI-Hub-Growth/linclaw/src-go/internal/httpapi"
)

func main() {
	host := flag.String("host", envOr("LINCLAW_HOST", "0.0.0.0"), "HTTP bind host")
	port := flag.String("port", envOr("LINCLAW_PORT", "1420"), "HTTP bind port")
	webRoot := flag.String("web-root", envOr("LINCLAW_WEB_ROOT", "dist"), "frontend web root")
	packageRoot := flag.String("package-root", envOr("LINCLAW_PACKAGE_ROOT", ""), "package root")
	managedRoot := flag.String("managed-root", envOr("LINCLAW_MANAGED_ROOT", ""), "managed runtime root")
	flag.Parse()

	root := *packageRoot
	if root == "" {
		cwd, err := os.Getwd()
		if err != nil {
			log.Fatalf("getwd: %v", err)
		}
		root = cwd
	}

	ctx, err := appctx.New(root, *managedRoot)
	if err != nil {
		log.Fatalf("init app context: %v", err)
	}

	registry := commands.NewRegistry()
	commands.RegisterAll(registry)

	addr := *host + ":" + *port
	server := httpapi.NewServer(ctx, registry, filepath.Clean(*webRoot))

	log.Printf("LinClaw Go backend listening on http://%s", addr)
	log.Printf("package root: %s", ctx.PackageRoot)
	log.Printf("web root: %s", server.WebRoot())
	if *managedRoot != "" {
		log.Printf("managed root: %s", ctx.Store.ManagedRootDir())
	}
	log.Printf("log dir: %s", ctx.Store.LogsDir())
	if ctx.Logger != nil {
		ctx.Logger.Gatewayf("main", "backend_started addr=%s web_root=%s managed_root=%s log_dir=%s", addr, server.WebRoot(), ctx.Store.ManagedRootDir(), ctx.Store.LogsDir())
	}
	if err := http.ListenAndServe(addr, server); err != nil {
		if ctx.Logger != nil {
			ctx.Logger.GatewayErrorf("main", "server_exit error=%v", err)
		}
		log.Fatal(err)
	}
}

func envOr(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
