# GitHub Repository Naming Conventions

## Overview

This document outlines the naming conventions for GitHub repositories in the Momentum ecosystem. Following these conventions ensures consistency, maintainability, and easy discovery of related repositories.

## General Naming Pattern

```
{product}-{component}-{technology?}
```

### Pattern Breakdown

- **`{product}`** - The product name (e.g., `momentum`)
- **`{component}`** - The functional component or service (e.g., `api`, `web`, `auth`)
- **`{technology}`** - Optional technology stack identifier (e.g., `node`, `go`, `python`)

## Core Principles

1. **Product Prefix**: All repositories must start with `momentum-` to ensure grouping and easy discovery
2. **Lowercase Only**: Use only lowercase letters for consistency
3. **Hyphen Separators**: Use hyphens (`-`) to separate words, never underscores or camelCase
4. **Concise Descriptors**: Keep component names short but descriptive
5. **No Version Numbers**: Avoid version numbers in repo names (use tags/branches instead)
6. **Technology Suffix**: Only add technology identifier when multiple implementations exist

## Repository Structure

### Core Repositories

| Repository Name | Purpose | Technology Stack |
|----------------|---------|------------------|
| `momentum` | Marketing site & authentication gateway | Next.js 15.5, React 19, NextAuth v5, TypeScript |
| `momentum-app` | Main dashboard application | Next.js 15, React 19, WebGL, TypeScript |
| `momentum-api` | Core backend API service (if needed) | Node.js/Express or Go |

**Note**: `momentum` (this repository) handles both marketing pages and authentication. It uses NextAuth v5 for Google OAuth and email magic links, then redirects authenticated users to `momentum-app` with JWT tokens. A separate `momentum-auth` microservice is not needed as authentication is integrated into the marketing site.

### Service Repositories

| Repository Name | Purpose |
|----------------|---------|
| `momentum-workers` | Background jobs and task processing |
| `momentum-websocket` | Real-time communication service |
| `momentum-notifications` | Notification service (email, push, in-app) |
| `momentum-analytics` | Analytics and telemetry service |
| `momentum-ml` | Machine learning and AI services |

### Infrastructure & Tools

| Repository Name | Purpose |
|----------------|---------|
| `momentum-infra` | Infrastructure as code (Terraform, K8s) |
| `momentum-config` | Shared configuration and secrets management |
| `momentum-docs` | Documentation and guides |
| `momentum-cli` | Command-line tools |

### Client Libraries & SDKs

| Repository Name | Purpose |
|----------------|---------|
| `momentum-sdk-js` | JavaScript/TypeScript SDK |
| `momentum-sdk-python` | Python SDK |
| `momentum-sdk-go` | Go SDK |
| `momentum-sdk-swift` | iOS/Swift SDK |
| `momentum-sdk-kotlin` | Android/Kotlin SDK |

### Mobile Applications

| Repository Name | Purpose |
|----------------|---------|
| `momentum-ios` | iOS mobile application |
| `momentum-android` | Android mobile application |
| `momentum-mobile` | React Native cross-platform app |

## Special Cases

### Multiple Implementations

When multiple implementations of the same component exist, add the technology identifier:

```
momentum-api-node      # Node.js implementation
momentum-api-go        # Go implementation
momentum-api-rust      # Rust implementation
```

### Microservices

For microservice architectures, maintain the pattern but be specific:

```
momentum-service-user     # User management service
momentum-service-payment  # Payment processing service
momentum-service-search   # Search service
```

### Internal Tools

For internal-only tools and utilities:

```
momentum-internal-admin   # Internal admin dashboard
momentum-internal-tools   # Internal tooling
```

## Repository Descriptions

Each repository should have a clear, concise description following this pattern:

```
[Emoji] [Product] [Component] - [Brief description]
```

### Examples

- 🚀 **Momentum Web** - Marketing website and landing pages
- 💫 **Momentum App** - Interactive dashboard with WebGL visualizations
- ⚡ **Momentum API** - Core backend service powering the Momentum platform
- 🔐 **Momentum Auth** - Authentication and authorization service
- 📊 **Momentum Analytics** - Analytics and telemetry collection service

## Repository Topics/Tags

Add consistent GitHub topics to improve discoverability:

### Common Topics
- `momentum`
- `momentum-platform`
- Component-specific: `api`, `frontend`, `backend`, `mobile`
- Technology-specific: `nextjs`, `react`, `typescript`, `nodejs`, `go`
- Purpose-specific: `authentication`, `analytics`, `websocket`

## Migration Strategy

For existing repositories that don't follow these conventions:

1. **Create new repository** with the correct name
2. **Migrate code** using Git remote operations
3. **Update dependencies** in other repos
4. **Archive old repository** with redirect notice
5. **Update documentation** and CI/CD pipelines

### Migration Example

```bash
# Clone existing repo
git clone https://github.com/username/old-repo-name
cd old-repo-name

# Add new remote
git remote add new-origin https://github.com/username/momentum-component

# Push to new repository
git push new-origin main

# Update origin
git remote set-url origin https://github.com/username/momentum-component
```

## Repository Settings

### Recommended Settings

- **Branch Protection**: Enable for `main` branch
- **Required Reviews**: At least 1 review for PRs
- **Automated Testing**: CI must pass before merge
- **Issue Templates**: Use consistent templates across repos
- **PR Templates**: Standardize PR descriptions

### Access Control

- **Public vs Private**: Core platform repos should be private initially
- **Team Access**: Use GitHub teams for access management
- **External Collaborators**: Document in README if applicable

## Examples in Practice

### Good Examples ✅

```
momentum-web
momentum-api
momentum-auth
momentum-sdk-js
momentum-service-payment
momentum-ios
```

### Bad Examples ❌

```
MomentumWeb           # Wrong case
momentum_api          # Wrong separator
momentum-backend-v2   # Version in name
momentum              # Too generic
web                   # Missing product prefix
momentum-new-api      # Ambiguous modifier
```

## Git Branch Naming Conventions

### Branch Naming Pattern

```
{type}/{short-description}
```

**Pattern Breakdown**:
- **`{type}`** - Branch category (see types below)
- **`{short-description}`** - Brief description using kebab-case

### Branch Types

**Feature Branches**:
```
feature/add-user-authentication
feature/implement-dark-mode
feature/create-payment-flow
```
- Used for: New features or enhancements
- Merged into: `main` or `develop`

**Bug Fix Branches**:
```
fix/login-button-alignment
fix/memory-leak-in-dashboard
fix/email-validation-error
```
- Used for: Bug fixes
- Merged into: `main` or `develop`

**Documentation Branches**:
```
docs/update-api-reference
docs/add-deployment-guide
docs/fix-readme-typos
```
- Used for: Documentation changes only
- Merged into: `main`

**Refactor Branches**:
```
refactor/simplify-auth-logic
refactor/optimize-database-queries
refactor/extract-utility-functions
```
- Used for: Code refactoring without changing functionality
- Merged into: `main` or `develop`

**Chore Branches**:
```
chore/update-dependencies
chore/configure-eslint
chore/setup-ci-pipeline
```
- Used for: Maintenance tasks, config changes, dependency updates
- Merged into: `main` or `develop`

**Hotfix Branches**:
```
hotfix/critical-security-patch
hotfix/production-login-error
hotfix/payment-gateway-timeout
```
- Used for: Critical production fixes
- Merged into: `main` and `develop`
- Created from: `main`

**Release Branches** (if using):
```
release/v1.2.0
release/v2.0.0-beta
```
- Used for: Preparing releases
- Merged into: `main` and `develop`

### Branch Naming Rules

1. **Lowercase Only**: Always use lowercase letters
2. **Kebab-case**: Use hyphens to separate words (`add-new-feature`, not `add_new_feature` or `addNewFeature`)
3. **Descriptive**: Name should clearly indicate purpose
4. **Concise**: Keep under 50 characters if possible
5. **No Special Characters**: Only alphanumeric and hyphens
6. **Issue Numbers** (optional): Can reference issue/ticket number

**With Issue Numbers**:
```
feature/123-add-user-profile
fix/456-resolve-logout-bug
docs/789-update-architecture-diagram
```

### Protected Branches

**Main Branch**:
```
main
```
- Production-ready code only
- Requires PR review before merge
- Protected from force push
- CI/CD must pass

**Development Branch** (if using Git Flow):
```
develop
```
- Integration branch for features
- Requires PR review before merge
- Protected from force push

### Branch Lifecycle

**1. Create Branch**:
```bash
# From main or develop
git checkout main
git pull origin main
git checkout -b feature/add-payment-integration
```

**2. Work on Branch**:
```bash
# Make changes, commit regularly
git add .
git commit -m "feat: Add Stripe payment integration"
```

**3. Push to Remote**:
```bash
git push origin feature/add-payment-integration
```

**4. Create Pull Request**:
- Use PR template
- Reference related issues
- Request reviews

**5. Merge & Delete**:
```bash
# After PR approval
git checkout main
git pull origin main
git branch -d feature/add-payment-integration
git push origin --delete feature/add-payment-integration
```

### Branch Naming Examples

**Good Examples ✅**:
```
feature/user-authentication
fix/navbar-responsive-layout
docs/update-readme
refactor/extract-api-client
chore/upgrade-react-19
hotfix/security-vulnerability
release/v1.0.0
```

**Bad Examples ❌**:
```
Feature/UserAuth           # Wrong case
fix_bug                    # Underscore separator, not descriptive
myFeatureBranch            # camelCase, not descriptive
feature-add-stuff          # Missing type prefix
new-feature-v2             # Version in branch name
fix/Fix-Bug-In-Login       # Mixed case
```

### Commit Message Convention (Related)

Follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages:

**Format**:
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types**:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, no logic change)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

**Examples**:
```bash
git commit -m "feat: Add Google OAuth login"
git commit -m "fix: Resolve memory leak in dashboard"
git commit -m "docs: Update API documentation"
git commit -m "refactor: Simplify authentication logic"
git commit -m "chore: Update dependencies to latest versions"
```

**With Scope**:
```bash
git commit -m "feat(auth): Add magic link authentication"
git commit -m "fix(ui): Correct button alignment on mobile"
git commit -m "docs(api): Add endpoint examples"
```

### Stale Branch Cleanup

**Identify Stale Branches**:
```bash
# List branches not updated in 30 days
git for-each-ref --sort=-committerdate refs/heads/ --format='%(committerdate:short) %(refname:short)'
```

**Delete Merged Branches**:
```bash
# Delete local branches already merged to main
git branch --merged main | grep -v "main" | xargs git branch -d

# Delete remote branches already merged
git branch -r --merged main | grep -v "main" | sed 's/origin\///' | xargs -n 1 git push --delete origin
```

**Automated Cleanup** (GitHub Actions):
Consider setting up automated stale branch deletion for branches merged > 7 days ago.

## Enforcement

### Automated Checks

Consider implementing:
- GitHub organization rules for repository naming
- **Branch naming validation** via GitHub Actions or pre-push hooks
- Pre-commit hooks in development
- CI/CD validation for cross-repo references
- **Protected branch rules** for `main` and `develop`

### Code Review Guidelines

Reviewers should verify:
- Repository references in documentation follow conventions
- Import paths and dependencies use correct names
- CI/CD configurations reference correct repository names
- **Branch names follow type/description pattern**
- **Commit messages follow Conventional Commits format**

## Future Considerations

As the platform grows, consider:
- Namespace prefixes for large service groups (e.g., `momentum-ml-training`, `momentum-ml-inference`)
- Geographic identifiers for region-specific deployments (e.g., `momentum-api-us-east`)
- Environment-specific repos if needed (avoid when possible, use branches/tags instead)

## Questions & Updates

For questions about naming conventions or to propose changes:
1. Open an issue in `momentum-docs`
2. Tag with `naming-convention`
3. Get team consensus before implementing changes

---

*Last Updated: December 2024*
*Version: 1.0.0*