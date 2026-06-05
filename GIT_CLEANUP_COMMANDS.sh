# ─────────────────────────────────────────────────────────────────
# GIT CLEANUP — Remove accidentally committed shell output files
# Run these commands one by one in your project root terminal
# ─────────────────────────────────────────────────────────────────

# Step 1: Remove the files from Git tracking (but keep locally if they exist)
git rm --cached git main

# Step 2: Also delete the actual files from disk (they are garbage, safe to delete)
rm -f git main

# Step 3: Stage the deletion
git add -A

# Step 4: Commit with a clear, professional message
git commit -m "chore: remove accidentally committed shell output files"

# Step 5: Push to main
git push origin main

# ─────────────────────────────────────────────────────────────────
# OPTIONAL: Rename the repo from "-salary-tracker" to "salary-tracker"
# Do this in GitHub → Settings → Repository name (cannot be done via CLI)
# Then update your local remote:
# git remote set-url origin https://github.com/KASHIF290/salary-tracker.git
# ─────────────────────────────────────────────────────────────────
