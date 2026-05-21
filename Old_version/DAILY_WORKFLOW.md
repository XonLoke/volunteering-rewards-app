# Daily Workflow Guide — For the Whole Team

You don't need to understand git deeply. Just follow these steps in order.

---

## 🗺️ The Big Picture

```
main  ────────  ✅ Always working, always stable
                     │
      ┌──────────────┼──────────────┐──────────────┐
      ▼              ▼              ▼              ▼
     xon           nurain         vivian         grace
  (Xon's work)   (Nurain's)     (Vivian's)     (Grace's)
```

- **`main`** — The one source of truth. Everyone pulls from here.
- **Your branch** — Where you do your work. Push here often to save progress.
- **Xon** — Generates code → pushes to `xon` → merges to `main` → everyone pulls.

---



## 👑 Xon's Special Role — Code Delivery

Xon works with an AI code generator to build features. The flow is:

```
Xon + AI → code is generated → saved to local folder
       ↓
Step 1:  git add . && git commit -m "Added login API"
         git push origin xon                              ← save to Xon's working branch
       ↓
Step 2:  git checkout main
         git merge xon
         git push origin main                              ← release to main
       ↓
Step 3:  Tell team: "Pull latest from main"
```

**Rule:** Xon never pushes generated code directly to `main`. Always go through your `xon` branch first, then merge to `main`. This way `main` always has reviewed, working code.

---

## 🚀 First Time Setup (do this once)

Each team member opens **Command Prompt** and runs:

```bash
cd D:\c3000c\volunteering-rewards-app
git clone https://github.com/XonLoke/volunteering-rewards-app.git
cd volunteering-rewards-app
git checkout YOUR_BRANCH_NAME    # nurain / vivian / grace / xon
npm install                      # only if you're working on backend
```

---

## ☀️ Every Day — Start of Work

```bash
# Step 1: Get latest code from everyone
git checkout main
git pull origin main

# Step 2: Switch to your branch
git checkout YOUR_BRANCH_NAME    # nurain / vivian / grace / xon

# Step 3: Merge main's updates into your branch
git merge main
```

**Only if you get conflicts** → Stop and ask Xon or me for help.

---

## ✏️ While Working

Just edit files normally. When you want to save progress:

```bash
git add .
git commit -m "What you did — e.g. Added login screen"
git push origin YOUR_BRANCH_NAME
```

Do this **as often as you want**. Small commits are good.

---

## ✅ When Your Feature is Complete

Tell Xon. He'll review and merge to `main`.

---

## ❓ Common Questions

| Situation | What to do |
|-----------|-----------|
| "I want to see my teammates' latest changes" | `git checkout main` → `git pull` → back to your branch → `git merge main` |
| "I messed up my files" | Tell Xon — don't try to fix it yourself |
| "I want to undo my last commit" | `git reset --soft HEAD~1` (only if you haven't pushed yet) |
| "Git says 'merge conflict'" | **Stop and ask for help** — don't force push |
