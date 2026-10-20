import os
import re
import json

def norm_slug(name):
    # Same as JS normalizeSlug
    import unicodedata
    s = unicodedata.normalize('NFD', name)
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    s = s.lower()
    s = re.sub(r'[^a-z0-9]', '_', s)
    s = re.sub(r'_+', '_', s)
    return s.strip('_')

# Read competition teams from data/competition_teams.js
with open("data/competition_teams.js", "r", encoding="utf-8") as f:
    text = f.read()

# Extract arrays
bra_teams = {}
for league in ['bra-a', 'bra-b', 'bra-c', 'bra-d', 'bra-est-sp', 'bra-est-rj', 'bra-est-mg', 'bra-est-rs', 'bra-est-pr', 'bra-est-sc', 'bra-est-ba', 'bra-est-ce', 'bra-est-go', 'bra-est-pe']:
    m = re.search(r"'" + re.escape(league) + r"'\s*:\s*\[(.*?)\]", text, re.DOTALL)
    if m:
        items = re.findall(r"'([^']+)'", m.group(1))
        bra_teams[league] = items

print(f"Loaded {len(bra_teams)} leagues.")

# Check files on disk
existing_files = set()
for root, dirs, files in os.walk("sounds/crowd"):
    for file in files:
        if file.endswith(".mp3"):
            rel = os.path.relpath(os.path.join(root, file), "sounds/crowd")
            existing_files.add(rel.replace("\\", "/"))

print(f"Total existing crowd mp3s: {len(existing_files)}")

# Check coverage
for league, clubs in bra_teams.items():
    folder = league.replace("-", "_")
    if "est" in folder:
        folder = "bra_estaduais"
    
    missing = []
    found = []
    for c in clubs:
        slug = norm_slug(c)
        rel_path = f"{folder}/{slug}.mp3"
        # Also check fallback in bra_a / bra_b
        any_found = False
        for fld in [folder, "bra_a", "bra_b", "bra_c", "bra_d", "bra_estaduais"]:
            if f"{fld}/{slug}.mp3" in existing_files:
                any_found = True
                break
        if any_found:
            found.append(c)
        else:
            missing.append(c)
    print(f"\n[{league}] Total: {len(clubs)} | Found: {len(found)} | Missing: {len(missing)}")
    if missing:
        print(f"  Missing: {', '.join(missing[:15])}{'...' if len(missing) > 15 else ''}")
