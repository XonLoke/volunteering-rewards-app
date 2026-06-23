# Sprint Update Template

## Task
Update sprint status reports and commit changes to GitHub.

## Steps

### 1. Check working tree
```bash
git status
git diff
```

### 2. Update status document
- Edit `docs/Sprint 4 & 5 Status Report v1.3.md` (or latest version)
- Update completion status, dates, blockers

### 3. Commit changes
```bash
git add -A
git commit -m "docs: update sprint status — <summary of what changed>"
git push origin main
```

### 4. Tag if milestone reached
```bash
git tag v1.1.0
git push origin v1.1.0
```

## Typical update content
- What was completed this session
- Any blockers or issues found
- Test results summary
- Next steps planned
