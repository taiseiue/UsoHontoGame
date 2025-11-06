# Git Push Origin Command

Custom command to push the current branch to origin remote.

## Usage
```
/gpo
```

## Parameters
None - automatically detects current branch

## Validation
- Must be on a valid git branch
- Cannot be run in detached HEAD state

## Behavior
1. Detects the current branch name
2. Pushes the current branch to origin remote
3. Provides feedback on success/failure
4. Exits with error if not on any branch

## Examples
```bash
/gpo  # Pushes current branch to origin
```

## Error Cases
- Not in a git repository
- Not on any branch (detached HEAD)
- Network issues preventing push
- Permission issues with remote repository