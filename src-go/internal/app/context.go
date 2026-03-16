package app

import (
	"path/filepath"
	"time"

	"github.com/AI-Hub-Growth/linclaw/src-go/internal/auth"
	"github.com/AI-Hub-Growth/linclaw/src-go/internal/storage"
)

type Context struct {
	Store       *storage.Store
	Sessions    *auth.Manager
	Logger      *Logger
	PackageRoot string
	StartedAt   time.Time
}

func New(packageRoot string, managedRoot ...string) (*Context, error) {
	absRoot, err := filepath.Abs(packageRoot)
	if err != nil {
		return nil, err
	}

	resolvedManagedRoot := ""
	if len(managedRoot) > 0 && managedRoot[0] != "" {
		resolvedManagedRoot, err = filepath.Abs(managedRoot[0])
		if err != nil {
			return nil, err
		}
	}

	store, err := storage.NewStore(absRoot, resolvedManagedRoot)
	if err != nil {
		return nil, err
	}
	secret, err := store.LoadOrCreateSessionSecret()
	if err != nil {
		return nil, err
	}
	return &Context{
		Store:       store,
		Sessions:    auth.NewManager(secret),
		Logger:      NewLogger(store.LogsDir()),
		PackageRoot: absRoot,
		StartedAt:   time.Now(),
	}, nil
}
