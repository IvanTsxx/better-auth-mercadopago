# Release Process Documentation

This document explains how releases are managed for `better-auth-mercadopago`.

---

## Tool: Changesets

We use [Changesets](https://github.com/changesets/changesets) for versioning and changelog management. Changesets is the industry standard for monorepos and libraries, providing:

- **Automated versioning** based on conventional commits
- **Changelog generation** from changeset files
- **Release PRs** that bundle multiple changes
- **GitHub Releases** integration

---

## Why Changesets?

| Feature | Changesets | Semantic Release | Manual |
|---------|------------|------------------|--------|
| Changelog | ✅ Auto-generated | ✅ Auto-generated | ❌ Manual |
| Version bump | ✅ PR-based | ❌ Direct push | ❌ Manual |
| Multi-package | ✅ Native | ⚠️ Complex | ❌ Manual |
| Review process | ✅ PR review | ❌ Automatic | ✅ Manual |
| GitHub Releases | ✅ Integrated | ✅ Integrated | ❌ Manual |

We chose **Changesets** because:

1. **Review safety** - Changes are batched in a PR for review before release
2. **Better Auth ecosystem alignment** - Better Auth uses changesets
3. **Flexibility** - Easy to manage pre-releases and multiple packages
4. **Developer experience** - Simple CLI for contributors

---

## How It Works

### For Contributors

When you make changes that affect the public API:

1. **Make your changes** (features, fixes, etc.)

2. **Add a changeset**:
   ```bash
   pnpm changeset
   ```
   
   This will:
   - Ask which packages are affected
   - Ask for the bump type (patch, minor, major)
   - Ask for a description of the changes
   - Create a `.changeset/*.md` file

3. **Commit the changeset** along with your code:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push
   ```

### For Maintainers

The release process is mostly automated via GitHub Actions:

1. **Changeset PR Creation**
   - When PRs with changesets are merged, a "Version Packages" PR is automatically created
   - This PR updates versions and changelogs

2. **Review & Merge**
   - Review the version packages PR
   - Merge when ready to release

3. **Automatic Publish**
   - When the version packages PR is merged, the package is automatically published to npm
   - A GitHub Release is created with the changelog

---

## Manual Release (if needed)

```bash
# 1. Update versions and changelogs
pnpm changeset version

# 2. Review changes
git diff

# 3. Commit version updates
git add .
git commit -m "chore(release): version packages"

# 4. Publish to npm
pnpm changeset publish

# 5. Push tags
git push --follow-tags
```

---

## Versioning Strategy

We follow [Semantic Versioning](https://semver.org/):

| Bump Type | When to Use | Example |
|-----------|-------------|---------|
| `patch` | Bug fixes, minor improvements | `0.2.2` → `0.2.3` |
| `minor` | New features (backward compatible) | `0.2.2` → `0.3.0` |
| `major` | Breaking changes | `0.2.2` → `1.0.0` |

### Pre-1.0.0

Before v1.0.0, minor versions may include breaking changes:
- `0.2.0` → `0.3.0` can have breaking changes
- Patch versions remain safe to upgrade

---

## Changelog Format

The changelog is automatically generated from changeset files:

```markdown
## 0.3.0

### Minor Changes

- feat: add subscription support with preapproval plans

### Patch Changes

- fix: resolve webhook signature verification edge case
- docs: improve README examples
```

---

## GitHub Actions Workflow

The release workflow (`.github/workflows/release.yml`) runs on every push to `main`:

1. Installs dependencies
2. Builds the package
3. Runs changesets action
4. Creates/updates the "Version Packages" PR
5. Publishes to npm when merged

### Required Secrets

| Secret | Description |
|--------|-------------|
| `NPM_TOKEN` | npm automation token for publishing |
| `GITHUB_TOKEN` | automatically provided by GitHub |

---

## Troubleshooting

### Changeset PR not created

- Check that changeset files were committed
- Verify the GitHub Action ran successfully
- Check the Actions tab for errors

### Publish failed

- Ensure `NPM_TOKEN` is set in repository secrets
- Verify the token has publish permissions
- Check if the version already exists on npm

### Wrong version bump

- Edit the changeset file before merging the Version Packages PR
- Or create a new changeset to correct it
