# Migration Guide — Windows to Mac / Linux

If you decide to switch to a Mac or Linux machine, here's everything to back up and how to restore it.

---

## Part 1: Project Files (essential)

These are all your actual work — the code, documents, and tools. Just copy the folders.

| What | Windows Path | Why |
|------|-------------|-----|
| Backend code + docs | `D:\c3000c\volunteering-rewards-app\` | All code, sprint plans, scripts, memory backup |
| Courseware docs | `D:\Developer Courseware\_sem4term1-RP-C3000C-Capstone Projects\` | Sprint breakdowns, reports |
| MD-to-DOCX converter | `D:\sep_venv\md-to-docx\` | Your docx conversion tool |
| GitHub | Already online at `github.com/XonLoke/volunteering-rewards-app` | All code is already pushed |

**To back up:** Copy these folders to an external drive or cloud storage.

---

## Part 2: Claude Chat History (nice to have but complex)

This is your conversation archive — every chat you've had with me.

**Location on Windows:**
```
%LOCALAPPDATA%\Claude-3p\local-agent-mode-sessions\
```
That expands to:
```
C:\Users\Lenovo\AppData\Local\Claude-3p\local-agent-mode-sessions\
```

Inside are folders named by session ID. Each contains `.jsonl` files — those are the full conversation transcripts.

**On a Mac, chats are stored at:**
```
~/Library/Application Support/Claude/storage/
```

**Important:** You **cannot** simply copy Windows session files to a Mac and expect Claude Desktop to see them. The storage formats are different.

However, after installing Claude on the Mac, you can:

1. Open Claude Desktop on the Mac
2. Paste the **Revival Prompt** from `REVIVAL_PROTOCOL.md`
3. Claude will use `list_sessions` and `read_transcript` to read your chat history (if the Windows sessions are somehow accessible)

---

## Part 3: My Memory & Skills (the context I've built)

These are what I've learned about your project, team, and workflow.

| What | Windows Path |
|------|-------------|
| Memory files | `C:\Users\Lenovo\AppData\Local\Claude-3p\local-agent-mode-sessions\...\memory\` |
| Saved skills | `C:\Users\Lenovo\AppData\Roaming\Claude\local-agent-mode-sessions\skills-plugin\` |

**These won't transfer directly to Mac either.** But the **memory backup** at `D:\c3000c\volunteering-rewards-app\CLAUDE_MEMORY_BACKUP.md` captures all of it in a readable format. Just have Claude read that file on the new machine.

---

## The Quick & Practical Migration Checklist

| Step | What to do |
|------|-----------|
| 1 | Copy `D:\c3000c\volunteering-rewards-app\` to an external drive or cloud |
| 2 | Copy `D:\Developer Courseware\...\Sprint Management\` to the same place |
| 3 | Copy `D:\sep_venv\md-to-docx\` (if you want the docx converter) |
| 4 | On the new Mac/Linux machine, install Claude Desktop |
| 5 | Copy the project folders to the new machine |
| 6 | Open Claude Desktop and paste the `REVIVAL_PROMPT.md` content |
| 7 | Claude will read `CLAUDE_MEMORY_BACKUP.md` and restore all context |
| 8 | (Optional) Install the saved teammate skills via `save_skill` tool if needed |

---

## What You'll Lose (and what makes up for it)

| Lost | Recovered by |
|------|-------------|
| Full chat transcripts | The revival prompt + memory backup cover all key decisions and code |
| Teammate virtual skills (v-Nurain, v-Vivian, v-Grace) | These are account-level — you can reinstall them via plugins |
| md-to-docx skill | Re-installable since it's an account-level skill |

**Bottom line:** The code and documents (Part 1) are what actually matter. The memory backup + revival prompt can restore 95% of Claude's project context on a new machine.
