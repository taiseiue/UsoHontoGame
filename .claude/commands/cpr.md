# Create Pull Request Command

Custom command to create a GitHub pull request using MCP GitHub tools.

## Usage
```
/cpr [title] [description]
```

## Parameters
- `title` (optional): PR title. If not provided, uses conventional commit format based on recent changes
- `description` (optional): PR description. If not provided, generates based on changes and follows project template

## Validation
- Must be on a git branch (not main/master)
- Branch must be pushed to origin
- Must have GitHub MCP server configured

## Behavior
1. Detects current branch name
2. Analyzes recent commits and changes
3. Generates appropriate title using conventional commit format if not provided
4. Creates comprehensive PR description following project template:
   - Summary section with bullet points
   - Changes section detailing modifications
   - Test plan with checkboxes
   - Claude Code attribution
5. Creates pull request targeting main branch
6. Provides PR URL for review

## Examples
```bash
/cpr                                    # Auto-generate title and description
/cpr "feat: add user authentication"    # Custom title, auto description
/cpr "fix: resolve login bug" "Fixes issue with OAuth flow"  # Custom title and description
```

## Template Format
The generated PR description follows this structure:
```markdown
## Summary
- Key changes in bullet points

## Changes
- Detailed list of modifications
- Technical implementation details

## Test plan
- [x] Completed validation steps
- [ ] Remaining test items

🤖 Generated with [Claude Code](https://claude.ai/code)
```

## Error Cases
- Not on a git branch
- Branch not pushed to origin
- GitHub MCP not configured
- Insufficient permissions
- Network connectivity issues

## Dependencies
- GitHub MCP server configured in `.mcp.json`
- Valid GitHub authentication
- Repository push access