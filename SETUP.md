# DevVerse — Setup Guide

Time needed: **about 5 minutes**. No coding required.

## 1. Create your profile repository
1. Click **Use this template → Create a new repository** (or **Fork**).
2. **Repository name must equal your GitHub username.** Example: username `alexcarter` → repo `alexcarter/alexcarter`.
3. Set it to **Public**. GitHub shows its `README.md` on your profile automatically.

## 2. Edit `config.yml` (the only file you touch)
Open `config.yml` in the GitHub web editor (pencil icon) and change:

| Key | What it does |
|---|---|
| `github_username` | **Required.** Switches the generator on. Must match your username. |
| `name`, `role`, `location`, `bio` | Your identity (banner + terminal). |
| `theme` | `matrix`, `cyberpunk`, `dracula`, `tokyo`, `ocean`. |
| `taglines` | Lines that type under the banner. |
| `skills` | Icon IDs from <https://skillicons.dev> (`py`, `cpp`, `js`, `linux`, `docker` ...). |
| `learning` / `building` / `exploring` | The three "currently" cards. |
| `cyber_focus` | Shown in the cyber-lab terminal. |
| `projects` | Repo names to show as pinned cards. |
| `socials` | Handles or full URLs. Empty = hidden. |
| `features` | Turn any section on/off with `true` / `false`. |

> Wrap any text that contains `:` or `#` in "double quotes".

## 3. Allow the workflows to save files
**Settings → Actions → General → Workflow permissions → Read and write permissions → Save.**

## 4. Run the workflows once
**Actions** tab → pick each workflow → **Run workflow**:
1. **Build Profile** — generates your `README.md` and animated SVGs
2. **Contribution Snake** — creates the snake (stored on an `output` branch)
3. **3D Contribution Graph** — creates the 3D graph

After this, everything refreshes automatically (on every `config.yml` edit and on a schedule).

## 5. Done 🎉
Open `github.com/<your-username>`.

---

## Troubleshooting
- **Nothing happens / "Setup mode" in the log** → `github_username` in `config.yml` is still `yourusername`.
- **Workflow fails with a permission error** → redo step 3.
- **Snake / 3D graph image is broken** → run those two workflows once and wait ~1 minute. The README snake needs the `output` branch to exist.
- **Image looks old** → GitHub caches images; hard-refresh (Ctrl+Shift+R).
- **A skill icon is blank** → the ID does not exist on skillicons.dev; check the spelling.
- **Local preview (optional):** `node scripts/generate.js --out preview --force` (needs Node 18+), then open `preview/README.md`.

## Please support the creator
The generated profile ends with a small credit and ⭐ star / 👤 follow buttons for the template creator. This is part of the license — thank you for keeping it!
