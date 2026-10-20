import os
import subprocess

SFX_DIR = "sounds/sfx"
os.makedirs(SFX_DIR, exist_ok=True)

def run(cmd):
    print("Running:", cmd)
    res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if res.returncode != 0:
        print("ERROR:", res.stderr)
    return res.returncode == 0

# 1. whistle_foul (short blast ~0.4s)
run(f'ffmpeg -y -ss 00:00:01.20 -i scratch/referee_whistle.mp3 -t 0.50 -af "afade=t=in:ss=0:d=0.03,afade=t=out:st=0.38:d=0.10,loudnorm=I=-16:TP=-1.5:LRA=11" -b:a 128k {SFX_DIR}/whistle_foul.mp3')

# 2. whistle_card (sharp blast ~1.0s)
run(f'ffmpeg -y -ss 00:00:02.05 -i scratch/referee_whistle.mp3 -t 1.05 -af "afade=t=in:ss=0:d=0.03,afade=t=out:st=0.90:d=0.15,loudnorm=I=-16:TP=-1.5:LRA=11" -b:a 128k {SFX_DIR}/whistle_card.mp3')

# 3. whistle_start (short + long blast ~1.9s)
run(f'ffmpeg -y -ss 00:00:01.20 -i scratch/referee_whistle.mp3 -t 1.95 -af "afade=t=in:ss=0:d=0.03,afade=t=out:st=1.80:d=0.15,loudnorm=I=-16:TP=-1.5:LRA=11" -b:a 128k {SFX_DIR}/whistle_start.mp3')

# 4. whistle_halftime (two long blasts)
# We can take whistle_card, pause 0.2s, whistle_card
run(f'ffmpeg -y -i {SFX_DIR}/whistle_card.mp3 -filter_complex "[0:a]asplit=2[a1][a2];[a1]apad=pad_dur=0.25[p1];[p1][a2]concat=n=2:v=0:a=1[out]" -map "[out]" -b:a 128k {SFX_DIR}/whistle_halftime.mp3')

# 5. whistle_end (3 blasts: short, short, long)
run(f'ffmpeg -y -i {SFX_DIR}/whistle_foul.mp3 -i {SFX_DIR}/whistle_card.mp3 -filter_complex "[0:a]asplit=2[s1][s2];[s1]apad=pad_dur=0.15[p1];[s2]apad=pad_dur=0.20[p2];[p1][p2][1:a]concat=n=3:v=0:a=1[out]" -map "[out]" -b:a 128k {SFX_DIR}/whistle_end.mp3')

# 6. goal_celebration (~5.0s crowd cheer explosion)
run(f'ffmpeg -y -ss 00:00:01.00 -i scratch/goal_cheer.mp3 -t 5.50 -af "afade=t=in:ss=0:d=0.2,afade=t=out:st=4.5:d=1.0,loudnorm=I=-15:TP=-1.5:LRA=11" -b:a 128k {SFX_DIR}/goal_celebration.mp3')

# 7. goal_post (~1.0s metallic hit)
run(f'ffmpeg -y -ss 00:00:01.08 -i scratch/ball_post.mp3 -t 1.00 -af "afade=t=in:ss=0:d=0.02,afade=t=out:st=0.75:d=0.25,loudnorm=I=-15:TP=-1.5:LRA=11" -b:a 128k {SFX_DIR}/goal_post.mp3')

# 8. crowd_gasp (~1.6s gasp)
run(f'ffmpeg -y -ss 00:00:04.20 -i scratch/crowd_gasp.mp3 -t 1.60 -af "afade=t=in:ss=0:d=0.05,afade=t=out:st=1.1:d=0.50,loudnorm=I=-16:TP=-1.5:LRA=11" -b:a 128k {SFX_DIR}/crowd_gasp.mp3')

print("All SFX generation complete!")
