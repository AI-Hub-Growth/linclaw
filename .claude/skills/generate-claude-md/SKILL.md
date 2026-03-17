---
name: generate-claude-md
description: |
  Generate or update a CLAUDE.md file for the current project.
  Triggers on: "generate CLAUDE.md", "create CLAUDE.md", "init claude",
  "update CLAUDE.md", or "document this project for Claude Code".
argument-hint: [project-type]
---

# CLAUDE.md Generator

Analyze the current project and generate a comprehensive CLAUDE.md file.

## Process

1. **Detect project type** by examining:
   - Package manager files (package.json, pyproject.toml, Cargo.toml, go.mod)
   - Framework config files (next.config.*, vite.config.*, etc.)
   - Directory structure patterns

2. **Gather project information**:
   - Read package.json / pyproject.toml for name, scripts, dependencies
   - Scan directory structure (top 3 levels)
   - Read existing README.md for context
   - Check for existing CLAUDE.md to preserve custom sections

3. **Generate CLAUDE.md** following this structure:
   - **Project Overview**: One sentence from README or package description
   - **Key Commands**: Extracted from package.json scripts or Makefile
   - **Architecture**: Framework, key libraries, patterns detected
   - **Directory Structure**: Actual structure from project
   - **Key Files**: Most important files with descriptions
   - **Development Patterns**: Conventions detected from code

4. **Quality rules**:
   - Keep it concise (aim for < 200 lines for simple projects)
   - Only include what Claude Code needs to know
   - Do NOT include information Claude already knows (e.g., "use proper error handling")
   - Focus on project-SPECIFIC conventions and gotchas
   - Include actual commands, not generic ones
   - Follow progressive disclosure: essentials first, details later

## Output

Write the generated content to `./CLAUDE.md`. If one already exists, show a diff first and ask for confirmation before overwriting.
