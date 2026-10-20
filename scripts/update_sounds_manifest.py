import os
import json
import re

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SOUNDS_DIR = os.path.join(BASE_DIR, "sounds")
CROWD_DIR = os.path.join(SOUNDS_DIR, "crowd")
SFX_DIR = os.path.join(SOUNDS_DIR, "sfx")
MANIFEST_PATH = os.path.join(SOUNDS_DIR, "sounds_manifest.json")

def format_title(slug):
    words = slug.split('_')
    formatted = []
    for w in words:
        if w.upper() in ['FC', 'EC', 'SC', 'AC', 'PR', 'SP', 'RJ', 'MG', 'RS', 'BA', 'PE', 'CE', 'GO', 'SC', 'DF', 'AL', 'MA', 'RN', 'PB', 'SE']:
            formatted.append(w.upper())
        elif w.lower() in ['de', 'do', 'da', 'dos', 'das']:
            formatted.append(w.lower())
        else:
            formatted.append(w.capitalize())
    return ' '.join(formatted)

def main():
    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    manifest["updatedAt"] = "2026-10-20T18:30:00.000Z"

    # Scan crowd folders
    folders = ["bra_a", "bra_b", "bra_c", "bra_d", "bra_estaduais", "arg_1"]
    crowd_clubs = manifest.get("crowdClubs", {})

    for fld in folders:
        dir_path = os.path.join(CROWD_DIR, fld)
        if not os.path.exists(dir_path):
            continue

        existing_entries = crowd_clubs.get(fld, [])
        entry_by_slug = {e["slug"]: e for e in existing_entries}

        files = sorted(os.listdir(dir_path))
        new_list = []

        for file in files:
            if not file.endswith(".mp3"):
                continue
            slug = file[:-4]
            size = os.path.getsize(os.path.join(dir_path, file))
            if size < 5000:
                continue

            if slug in entry_by_slug:
                new_list.append(entry_by_slug[slug])
            else:
                title = format_title(slug)
                new_list.append({
                    "club": title,
                    "slug": slug,
                    "filename": file,
                    "chant": f"Canto da torcida de {title}"
                })

        # Deduplicate
        seen = set()
        deduped = []
        for it in new_list:
            if it["slug"] not in seen:
                seen.add(it["slug"])
                deduped.append(it)

        crowd_clubs[fld] = deduped

    manifest["crowdClubs"] = crowd_clubs

    with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    print(f"Manifest updated successfully at {MANIFEST_PATH}")
    for fld, items in crowd_clubs.items():
        print(f" - {fld}: {len(items)} clubs")

if __name__ == "__main__":
    main()
