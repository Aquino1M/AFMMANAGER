import os, sys, glob, subprocess
import UnityPy

bundle_dir = r"C:\Users\Aquino\Downloads\FM26CantosDaTorcida_v0.2.16_release\BepInEx\plugins\FM26CantosDaTorcida\Torcidas\Bundles"
output_base = os.path.abspath("sounds/crowd")

# Mapping bundle or slug to club slugs
bundle_map = {
    'corinthians': ['bra_a/corinthians', 'bra_estaduais/corinthians'],
    'flamengo': ['bra_a/flamengo', 'bra_estaduais/flamengo'],
    'palmeiras': ['bra_a/palmeiras', 'bra_estaduais/palmeiras'],
    'sao_paulo': ['bra_a/sao_paulo', 'bra_estaduais/sao_paulo'],
    'santos': ['bra_a/santos', 'bra_b/santos', 'bra_estaduais/santos'],
    'gremio': ['bra_a/gremio', 'bra_estaduais/gremio'],
    'internacional': ['bra_a/internacional', 'bra_estaduais/internacional'],
    'cruzeiro': ['bra_a/cruzeiro', 'bra_estaduais/cruzeiro'],
    'atletico_mg': ['bra_a/atletico_mg', 'bra_estaduais/atletico_mg'],
    'botafogo': ['bra_a/botafogo', 'bra_estaduais/botafogo'],
    'fluminense': ['bra_a/fluminense', 'bra_estaduais/fluminense'],
    'vasco': ['bra_a/vasco', 'bra_estaduais/vasco'],
    'bahia': ['bra_a/bahia', 'bra_estaduais/bahia'],
    'vitoria': ['bra_a/vitoria', 'bra_estaduais/vitoria'],
    'athletico_paranaense': ['bra_a/athletico_pr', 'bra_a/athletico_paranaense', 'bra_estaduais/athletico_pr'],
    'coritiba': ['bra_b/coritiba', 'bra_estaduais/coritiba'],
    'chapecoense': ['bra_b/chapecoense', 'bra_estaduais/chapecoense'],
    'mirassol': ['bra_a/mirassol', 'bra_b/mirassol', 'bra_estaduais/mirassol'],
    'red_bull_bragantino': ['bra_a/red_bull_bragantino', 'bra_a/bragantino', 'bra_estaduais/red_bull_bragantino'],
    'remo': ['bra_b/remo', 'bra_c/remo', 'bra_estaduais/remo']
}

print("Scanning bundles in:", bundle_dir)

for key, target_rel_paths in bundle_map.items():
    # Find matching bundle file
    b_file = os.path.join(bundle_dir, f"chants_{key}.bundle")
    if not os.path.exists(b_file):
        b_file = os.path.join(bundle_dir, f"{key}.bundle")
    
    if not os.path.exists(b_file):
        print(f"Bundle not found for {key}")
        continue
    
    print(f"\nProcessing {key} from {os.path.basename(b_file)}...")
    env = UnityPy.load(b_file)
    audio_clips = [obj.read() for obj in env.objects if obj.type.name == 'AudioClip']
    print(f"  Found {len(audio_clips)} audio clips")
    
    # Sort clips by sample size to get the richest chant
    best_clip = None
    best_sample_bytes = None
    max_len = 0
    
    for clip in audio_clips:
        for s_name, s_bytes in clip.samples.items():
            if len(s_bytes) > max_len:
                max_len = len(s_bytes)
                best_clip = clip
                best_sample_bytes = s_bytes
                
    if not best_sample_bytes:
        print(f"  No sample bytes found for {key}")
        continue
        
    # Write temp wav
    temp_wav = os.path.abspath(f"sounds/temp_{key}.wav")
    with open(temp_wav, "wb") as f:
        f.write(best_sample_bytes)
    
    # Process each target path with ffmpeg
    for rel in target_rel_paths:
        out_mp3 = os.path.join(output_base, f"{rel}.mp3")
        os.makedirs(os.path.dirname(out_mp3), exist_ok=True)
        
        # ffmpeg: trim to max 45s, normalize audio, fade in 0.5s, fade out 1s
        cmd = [
            "C:\\ffmpeg\\bin\\ffmpeg.exe", "-y", "-i", temp_wav,
            "-t", "45",
            "-af", "loudnorm=I=-16:TP=-1.5:LRA=11,afade=t=in:ss=0:d=0.5,afade=t=out:st=44:d=1.0",
            "-b:a", "128k", "-ar", "44100",
            out_mp3
        ]
        res = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        if res.returncode == 0 and os.path.exists(out_mp3):
            size_kb = os.path.getsize(out_mp3) // 1024
            print(f"  [OK] Saved {rel}.mp3 ({size_kb} KB)")
        else:
            print(f"  [ERR] Error converting to {out_mp3}")
            
    # Cleanup temp wav
    if os.path.exists(temp_wav):
        os.remove(temp_wav)

# Create ambient_default from corinthians or flamengo sample
default_src = os.path.join(output_base, "bra_a/flamengo.mp3")
default_dest = os.path.join(output_base, "ambient_default.mp3")
if os.path.exists(default_src):
    import shutil
    shutil.copyfile(default_src, default_dest)
    print(f"\n[OK] Created ambient_default.mp3 from flamengo chant")

print("\nBundle extraction completed!")
