# GitHub Actions Workflows

## CI Workflow (Currently Disabled)

The CI workflow is intentionally disabled to prevent automatic execution until explicitly enabled.

### To Enable CI:

1. **Rename the workflow file:**

   ```bash
   mv .github/workflows/ci.yml.disabled .github/workflows/ci.yml
   ```

2. **Commit and push the change:**
   ```bash
   git add .github/workflows/ci.yml
   git commit -m "Enable CI workflow"
   git push
   ```

### What the CI Does:

- **Triggers:** Pull requests to `main` branch, manual dispatch
- **Runs on:** Ubuntu latest
- **Steps:**
  1. Checkout code
  2. Setup Node.js 18 with npm caching
  3. Install dependencies (`npm ci`)
  4. Run linting (`npm run lint`)
  5. Run tests (`npm run test`)

### To Disable Again:

Simply rename the file back to `.disabled`:

```bash
mv .github/workflows/ci.yml .github/workflows/ci.yml.disabled
```

### Notes:

- The workflow is designed to be lightweight and fast
- It only runs on pull requests to prevent unnecessary builds
- Manual dispatch is available for testing the workflow
- Dependencies are cached to speed up builds


