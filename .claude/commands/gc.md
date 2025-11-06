# Git Commit Command Generator

## Role
You are an expert software engineer specializing in version control with Git and adhering to the Conventional Commits specification. Your task is to analyze the current git status, generate appropriate git add and commit commands, and execute them automatically. When multiple distinct purposes are identified, create separate commits for logical groupings.

## Context
When this command is invoked, you should:
1. Run `git status` and `git diff` to understand what files have been modified
2. Analyze the changes to identify distinct purposes and group related changes
3. Create separate commits for logically distinct changes when appropriate
4. Automatically stage and commit the changes with appropriate messages

## Task
1.  **Check Git Status:** Run `git status` and `git diff` to identify modified files
2.  **Analyze and Group Changes:** Identify distinct purposes of the changes and group them logically:
    - Look for unrelated changes that serve different purposes
    - Group files that belong to the same logical change
    - Consider separating by commit type (feat, fix, docs, etc.)
    - Examples of separate commits:
      * Bug fixes vs new features
      * Documentation updates vs code changes  
      * Configuration changes vs implementation changes
      * Test additions vs production code changes
3.  **Determine Commit Types:** Select appropriate types from Conventional Commits specification for each group:
    * `feat`: A new feature
    * `fix`: A bug fix
    * `docs`: Documentation only changes
    * `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
    * `refactor`: A code change that neither fixes a bug nor adds a feature
    * `perf`: A code change that improves performance
    * `test`: Adding missing tests or correcting existing tests
    * `build`: Changes that affect the build system or external dependencies
    * `ci`: Changes to our CI configuration files and scripts
    * `chore`: Other changes that don't modify src or test files
4.  **Execute Git Commands:** For each logical group, automatically run git add and git commit commands:
    * **`<type>[optional scope]: <description>`**
    * Include Claude Code attribution in commit message
    * Stage only the files relevant to each commit
    * Create commits in logical order (dependencies first, then dependent changes)

## Decision Logic for Separating Commits
- **Separate commits when:**
  * Changes serve completely different purposes (e.g., bug fix + new feature)
  * Changes affect different domains (e.g., frontend + backend, docs + code)  
  * Changes have different commit types (e.g., fix + feat, docs + refactor)
  * Changes could be reviewed or reverted independently
  * Changes address different issues or requirements

- **Single commit when:**
  * All changes work together toward one goal
  * Changes are interdependent and cannot work separately
  * All changes have the same commit type and purpose
  * Changes are small and cohesive

## Expected Behavior
When @gc is invoked, automatically:
1. Run git status and git diff commands in parallel
2. Analyze the changes and group them by logical purpose
3. Determine if multiple commits are needed based on the decision logic
4. For each commit group:
   - Stage only the relevant files using `git add <specific-files>`
   - Create a commit with proper Conventional Commits formatting
   - Include Claude Code attribution in commit message
5. Execute all commits in the appropriate order

## Examples
**Multiple Commits Scenario:**
```
Modified files: Security.kt (bug fix), README.md (docs), UserService.kt (new feature)
Result: 
  1. fix: resolve authentication label references in Security.kt
  2. feat: add user management functionality in UserService  
  3. docs: update README with authentication setup instructions
```

**Single Commit Scenario:**
```
Modified files: UserController.kt, UserService.kt, UserRepository.kt (all for same feature)
Result:
  1. feat: implement user profile management system
```

Do not just generate commands - execute them immediately.
