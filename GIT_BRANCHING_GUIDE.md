# Git Branching Guide — Volunteering Rewards App

**Team:** Xon, Nurain, Vivian, Grace  
**Repository:** `https://github.com/XonLoke/volunteering-rewards-app.git`  
**Date:** May 3, 2026

---

## Our Branches

```
main          ← Final, working version only (clean)
expo-starter  ← Expo template backup (reference only)
xon           ← Xon's personal branch
nurain        ← Nurain's personal branch
vivian        ← Vivian's personal branch
grace         ← Grace's personal branch
```

---

## Initial Setup (One-Time Only)

### Step 1: Create all branches

```bash
# Make sure you're on main first
git checkout main

# Create branches for everyone
git branch xon
git branch nurain
git branch vivian
git branch grace

# Push all branches to GitHub
git push -u origin xon
git push -u origin nurain
git push -u origin vivian
git push -u origin grace
```

### Step 2: Each team member clones and switches to their branch

```bash
# Clone the repo
git clone https://github.com/XonLoke/volunteering-rewards-app.git
cd volunteering-rewards-app

# Switch to YOUR branch (run only the one that applies to you)
git checkout xon      # Xon does this
git checkout nurain   # Nurain does this
git checkout vivian   # Vivian does this
git checkout grace    # Grace does this
```

---

## Daily Workflow

### Working on your own branch

```bash
# 1. Make sure you're on your branch
git checkout xon        # or nurain / vivian / grace

# 2. Pull latest changes from main (so you're not behind)
git merge main

# 3. Make your changes, then save them
git add .
git commit -m "Describe what you changed"
git push
```

### Merging your work into main

When your feature is complete and tested:

```bash
# 1. Switch to main
git checkout main

# 2. Pull the latest main (in case someone else merged first)
git pull origin main

# 3. Merge your branch into main
git merge xon          # or nurain / vivian / grace

# 4. Push main to GitHub
git push origin main

# 5. Switch back to your branch to keep working
git checkout xon        # or your branch name
```

### Getting teammates' latest changes

```bash
# From your branch:
git checkout main
git pull origin main    # get latest main from GitHub
git checkout xon        # back to your branch
git merge main          # merge latest main into your branch
```

---

## Quick Reference Card

| Task | Command |
|------|---------|
| See all branches | `git branch -a` |
| Switch to a branch | `git checkout xon` |
| Create a new branch | `git branch xon` |
| Create + switch | `git checkout -b xon` |
| Save your work | `git add .` → `git commit -m "message"` → `git push` |
| Merge main into your branch | `git checkout xon` → `git merge main` |
| Merge your branch into main | `git checkout main` → `git merge xon` → `git push` |
| Undo last commit (local only) | `git reset --soft HEAD~1` |
| See what branch you're on | `git branch` |

---

## Important Rules

1. **Never work directly on `main`** — always work on your personal branch
2. **Always pull latest `main`** before starting work each day
3. **Commit often** — small commits are easier to manage than big ones
4. **Write meaningful commit messages** — e.g. "Added QR scan screen" not "Update"
5. **Push to GitHub regularly** — so teammates can see your progress
6. **If you get a merge conflict**, stop and ask for help — don't force-push

---

## Visual Overview

```
Time ────────────────────────────────────────────────>
      
main    C1────C2──────────────────C5────────C7──────
              \                  /        /
xon           └──C3──C4────────┘        /
                                        /
nurain                              C6─┘

- C1, C2: Initial commits on main
- C3, C4: Xon's work on xon branch → merged to main at C5
- C6: Nurain's work on nurain branch → merged to main at C7
```
