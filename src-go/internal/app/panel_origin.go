package app

import (
	"net/url"
	"os"
	"strings"
)

const (
	envPanelOrigin    = "LINCLAW_PANEL_ORIGIN"
	envAllowedOrigins = "LINCLAW_ALLOWED_ORIGINS"
)

func ConfiguredPanelOrigins() []string {
	origins := map[string]struct{}{}
	addOrigin := func(value string) {
		value = strings.TrimSpace(value)
		if value == "" {
			return
		}
		origins[value] = struct{}{}
	}

	addOrigin(os.Getenv(envPanelOrigin))

	for _, item := range strings.FieldsFunc(os.Getenv(envAllowedOrigins), func(r rune) bool {
		return r == ',' || r == '\n' || r == '\r'
	}) {
		addOrigin(item)
	}

	if origin := strings.TrimSpace(os.Getenv(envPanelOrigin)); origin != "" {
		for _, alias := range originAliases(origin) {
			addOrigin(alias)
		}
	}

	return mapKeys(origins)
}

func PanelOrigins() []string {
	origins := map[string]struct{}{
		"http://localhost:1420": {},
		"http://127.0.0.1:1420": {},
	}
	for _, origin := range ConfiguredPanelOrigins() {
		origins[origin] = struct{}{}
	}
	return mapKeys(origins)
}

func originAliases(origin string) []string {
	parsed, err := url.Parse(origin)
	if err != nil {
		return nil
	}
	host := strings.TrimSpace(parsed.Hostname())
	port := parsed.Port()
	if port == "" {
		return nil
	}

	switch host {
	case "127.0.0.1":
		return []string{parsed.Scheme + "://localhost:" + port}
	case "localhost":
		return []string{parsed.Scheme + "://127.0.0.1:" + port}
	default:
		return nil
	}
}

func mapKeys(values map[string]struct{}) []string {
	keys := make([]string, 0, len(values))
	for key := range values {
		keys = append(keys, key)
	}
	return keys
}
