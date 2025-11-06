# Git Worktree Add Command

Custom command to create a new git worktree for a branch in the `.worktree` directory.

## Usage
```
/gwtadd <branch-name>
```

## Parameters
- `branch-name`: Name of the branch to create a worktree for (required)

## Directory Structure
Creates worktrees in `.worktree/<branch-name>/` directory structure.

## Behavior
The command intelligently handles different scenarios:

1. **Existing local branch**: Creates worktree from the local branch
2. **Remote branch only**: Creates worktree and tracks the remote branch
3. **New branch**: Creates a new branch and worktree from current HEAD

## Validation
- Branch name is required
- Prevents creating duplicate worktrees for the same branch
- Automatically creates `.worktree` directory if it doesn't exist

## Examples
```bash
/gwtadd feature/new-ui        # Create worktree for feature branch
/gwtadd hotfix/bug-123        # Create worktree for hotfix
/gwtadd experiment/prototype  # Create worktree for experimental work
```

## Use Cases
- **Parallel development**: Work on multiple branches simultaneously
- **Code review**: Check out PR branches without affecting main workspace
- **Hot fixes**: Quick fixes while preserving current work in progress
- **Experimentation**: Try different approaches in isolation

## Output
After successful creation, provides the path to access the new worktree:
```
cd .worktree/<branch-name>
```

## Error Cases
- Branch name not provided
- Worktree already exists for the specified branch
- Git repository issues