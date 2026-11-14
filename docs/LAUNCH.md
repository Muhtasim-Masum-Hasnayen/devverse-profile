# Launch checklist (template owner)

1. `node scripts/brand.js --github YOUR_USERNAME --name "YOUR_NAME"` — run **once** (fills in your name everywhere, rebuilds previews).
   *(After running it, this line shows your real values.)*
2. Create a **public** repo `devverse-profile`, push everything, make sure the default branch is `main`
   (credit auto-restore fetches `creator.json` from `main`).
3. **Settings → General → tick "Template repository"** (this gives the green *Use this template* button).
4. Add **Topics**: `github-profile`, `readme-template`, `profile-readme`, `cse`, `hacker-theme`, `animated-svg`, `github-actions`.
5. Add a repo description: *"Premium animated GitHub profile template for CSE students. Fork, edit one file, go live."*
6. Pin the repo on your own profile; use DevVerse for your own profile repo too (social proof).
7. Share: r/github, r/developersIndia, r/bangladesh, dev.to, LinkedIn, Facebook CSE groups, Twitter/X.
8. Keep `creator.json` on `main` — every user's build reads it, so you can update your name/link later for all profiles.

## About credit protection (be realistic)
No public template can be 100% locked. DevVerse makes removal **hard and visibly a licence violation**:
- credit is baked into generated SVGs (banner signature + footer), not plain text;
- every build re-injects it, and re-fetches `creator.json` from your repo (editing the local copy does nothing);
- the LICENSE requires it.
A determined person can still edit `scripts/`. You can report license violations to GitHub (DMCA) if needed.
