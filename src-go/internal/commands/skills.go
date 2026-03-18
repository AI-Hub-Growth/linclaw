package commands

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	appctx "github.com/AI-Hub-Growth/linclaw/src-go/internal/app"
	"github.com/AI-Hub-Growth/linclaw/src-go/internal/models"
)

func registerSkills(r *Registry) {
	registerImplemented(r, "skills", "skills_list", "列出可用 Skills", skillsList)
	registerImplemented(r, "skills", "skills_info", "读取单个 Skill 信息", skillsInfo)
	registerImplemented(r, "skills", "skills_check", "检查 Skills CLI 状态", skillsCheck)
	registerImplemented(r, "skills", "skills_install_dep", "安装 Skill 依赖占位接口", skillsInstallDep)
	registerImplemented(r, "skills", "skills_clawhub_search", "搜索 ClawHub Skills", skillsClawHubSearch)
	registerImplemented(r, "skills", "skills_clawhub_install", "安装 ClawHub Skill", skillsClawHubInstall)
}

func skillsList(ctx context.Context, _ *appctx.Context, _ map[string]any) (any, *models.APIError) {
	path, err := execLookPath("openclaw")
	if err != nil {
		return map[string]any{
			"skills":       []any{},
			"cliAvailable": false,
		}, nil
	}
	output, err := runCombinedOutput(ctx, path, "skills", "list", "--json")
	if err != nil {
		return map[string]any{
			"skills":       []any{},
			"cliAvailable": false,
			"error":        strings.TrimSpace(string(output)),
		}, nil
	}
	var result struct {
		Skills []any `json:"skills"`
	}
	if jsonErr := json.Unmarshal(output, &result); jsonErr != nil {
		return map[string]any{
			"skills":       []any{},
			"cliAvailable": true,
			"error":        "解析 skills list 输出失败",
		}, nil
	}
	if result.Skills == nil {
		result.Skills = []any{}
	}
	return map[string]any{
		"skills":       result.Skills,
		"cliAvailable": true,
	}, nil
}

func skillsInfo(ctx context.Context, _ *appctx.Context, args map[string]any) (any, *models.APIError) {
	name, apiErr := requireString(args, "name")
	if apiErr != nil {
		return nil, apiErr
	}
	path, err := execLookPath("openclaw")
	if err != nil {
		return nil, models.NewAPIError(501, "CLI_NOT_AVAILABLE", "服务器上未安装 openclaw CLI")
	}
	output, err := runCombinedOutput(ctx, path, "skills", "info", name, "--json")
	if err != nil {
		return nil, models.NewAPIError(500, "EXEC_FAILED", strings.TrimSpace(string(output)))
	}
	var result any
	if jsonErr := json.Unmarshal(output, &result); jsonErr != nil {
		return nil, models.NewAPIError(500, "PARSE_FAILED", "解析 skills info 输出失败")
	}
	return result, nil
}

func skillsCheck(ctx context.Context, _ *appctx.Context, _ map[string]any) (any, *models.APIError) {
	path, err := execLookPath("openclaw")
	if err != nil {
		return map[string]any{
			"cliAvailable": false,
		}, nil
	}
	output, err := runCombinedOutput(ctx, path, "skills", "check", "--json")
	if err != nil {
		return map[string]any{
			"cliAvailable": false,
			"error":        strings.TrimSpace(string(output)),
		}, nil
	}
	var result map[string]any
	if jsonErr := json.Unmarshal(output, &result); jsonErr != nil {
		return map[string]any{
			"cliAvailable": true,
			"error":        "解析 skills check 输出失败",
		}, nil
	}
	result["cliAvailable"] = true
	return result, nil
}

func skillsInstallDep(_ context.Context, _ *appctx.Context, _ map[string]any) (any, *models.APIError) {
	return nil, models.NewAPIError(501, "NOT_IMPLEMENTED", "Go 云端版尚未支持自动安装 Skill 依赖，请在服务器上手动安装")
}

func skillsClawHubSearch(_ context.Context, _ *appctx.Context, args map[string]any) (any, *models.APIError) {
	query := strings.TrimSpace(optionalString(args, "query"))
	if query == "" {
		return []any{}, nil
	}
	apiURL := fmt.Sprintf("https://clawhub.ai/api/v1/search?q=%s&limit=10", url.QueryEscape(query))
	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Get(apiURL)
	if err != nil {
		return []any{}, nil
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return []any{}, nil
	}
	var result struct {
		Results []any `json:"results"`
	}
	if jsonErr := json.Unmarshal(body, &result); jsonErr != nil {
		return []any{}, nil
	}
	if result.Results == nil {
		return []any{}, nil
	}
	return result.Results, nil
}

func skillsClawHubInstall(ctx context.Context, app *appctx.Context, args map[string]any) (any, *models.APIError) {
	slug, apiErr := requireString(args, "slug")
	if apiErr != nil {
		return nil, apiErr
	}
	clawhubPath, err := execLookPath("clawhub")
	if err != nil {
		return nil, models.NewAPIError(501, "CLI_NOT_AVAILABLE", "服务器上未安装 clawhub CLI")
	}
	skillsDir := app.Store.HomeDir() + "/.openclaw"
	output, err := runCombinedOutput(ctx, clawhubPath, "install", slug, "--workdir", skillsDir, "--dir", "skills")
	message := strings.TrimSpace(string(output))
	if err != nil {
		if ctx.Err() == context.DeadlineExceeded {
			message = "安装超时：ClawHub 服务可能正在限速，请稍后重试"
		} else if message == "" {
			message = err.Error()
		}
		return nil, models.NewAPIError(500, "INSTALL_FAILED", message)
	}
	if message == "" {
		message = "Skill 安装成功"
	}
	return map[string]any{
		"success": true,
		"message": message,
	}, nil
}
