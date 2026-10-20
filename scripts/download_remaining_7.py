import os
import subprocess
import shutil

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
CROWD_DIR = os.path.join(BASE_DIR, "sounds", "crowd")
SCRATCH_DIR = os.path.join(BASE_DIR, "scratch", "torcidas_dl")

TARGETS_7 = [
    ("bra_b", "ponte_preta", "hino torcida ponte preta campinas", ["ponte_preta_sp"]),
    ("bra_c", "brusque", "torcida brusque fc forca quadricolor", ["brusque_fc"]),
    ("bra_d", "bangu", "torcida bangu alvirrubro", ["bangu_ac"]),
    ("bra_d", "ferroviario", "torcida ferroviario atletico clube cearense", ["ferroviario_ce"]),
    ("bra_d", "tombense", "torcida tombense fc", ["tombense_mg"]),
    ("bra_d", "agua_santa", "torcida agua santa ec diadema", ["agua_santa_sp"]),
    ("bra_d", "velo_clube", "torcida velo clube rio claro", ["velo_clube_sp"])
]

def _propagate_copies(source_path, folder, slug, aliases):
    estaduais_dir = os.path.join(CROWD_DIR, "bra_estaduais")
    os.makedirs(estaduais_dir, exist_ok=True)
    est_target = os.path.join(estaduais_dir, f"{slug}.mp3")
    if not os.path.exists(est_target):
        shutil.copy2(source_path, est_target)

    for a in aliases:
        a_target = os.path.join(CROWD_DIR, folder, f"{a}.mp3")
        if not os.path.exists(a_target):
            shutil.copy2(source_path, a_target)
        a_est = os.path.join(estaduais_dir, f"{a}.mp3")
        if not os.path.exists(a_est):
            shutil.copy2(source_path, a_est)

for folder, slug, query, aliases in TARGETS_7:
    target_folder_path = os.path.join(CROWD_DIR, folder)
    os.makedirs(target_folder_path, exist_ok=True)
    target_mp3 = os.path.join(target_folder_path, f"{slug}.mp3")
    if os.path.exists(target_mp3) and os.path.getsize(target_mp3) > 30000:
        print(f"Already exists: {slug}")
        continue
    
    print(f"Fetching {slug}: {query}")
    raw_path_base = os.path.join(SCRATCH_DIR, f"raw_{slug}")
    cmd_dl = [
        "python", "-m", "yt_dlp",
        "--no-warnings",
        "-q",
        "--extractor-args", "youtube:player_client=android,web",
        "-f", "ba/b",
        "--download-sections", "*00:10-00:50",
        "--force-keyframes-at-cuts",
        "-x",
        "--audio-format", "mp3",
        "-o", f"{raw_path_base}.%(ext)s",
        f"ytsearch1:{query}"
    ]
    subprocess.run(cmd_dl, capture_output=True, text=True)
    raw_mp3 = f"{raw_path_base}.mp3"
    if os.path.exists(raw_mp3) and os.path.getsize(raw_mp3) > 10000:
        filter_chain = "loudnorm=I=-16:TP=-1.5:LRA=11,afade=t=in:ss=0:d=0.5,afade=t=out:st=37:d=1.5"
        cmd_ffmpeg = [
            "ffmpeg", "-y",
            "-i", raw_mp3,
            "-t", "39",
            "-af", filter_chain,
            "-b:a", "128k",
            target_mp3
        ]
        subprocess.run(cmd_ffmpeg, capture_output=True, text=True)
        if os.path.exists(target_mp3) and os.path.getsize(target_mp3) > 10000:
            print(f"[SUCCESS] {slug}")
            _propagate_copies(target_mp3, folder, slug, aliases)
            try:
                os.remove(raw_mp3)
            except:
                pass
        else:
            print(f"[FAIL FFMPEG] {slug}")
    else:
        print(f"[FAIL DL] {slug}")
