# Git Switch Command

Custom command to switch to an existing git branch or create a new one if it doesn't exist.

## Usage
```
/gsw <branch-name>
```

## Parameters
- `branch-name`: Name of the branch to switch to (required)

## Validation
- Branch name cannot contain spaces
- Branch name cannot be empty

## Behavior
1. First attempts to switch to existing branch
2. If branch doesn't exist, creates and switches to new branch
3. Provides feedback on success/failure

## Examples
```bash
/gsw main
/gsw feature/new-component  
/gsw fix_custom_commands
```