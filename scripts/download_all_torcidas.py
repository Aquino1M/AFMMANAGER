import os
import re
import subprocess
import shutil
import time

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
CROWD_DIR = os.path.join(BASE_DIR, "sounds", "crowd")
SCRATCH_DIR = os.path.join(BASE_DIR, "scratch", "torcidas_dl")
os.makedirs(SCRATCH_DIR, exist_ok=True)

# Lista completa de clubes para enriquecer
TARGETS = [
    # Série A (Aliases e gaps)
    ("bra_a", "vasco_da_gama", "canto torcida vasco da gama sao januario", ["vasco"]),
    ("bra_a", "athletico_paranaense", "canto torcida athletico paranaense furacao", ["athletico_pr"]),
    ("bra_a", "red_bull_bragantino", "canto torcida bragantino massa bruta", ["bragantino"]),

    # Série B
    ("bra_b", "america_mg", "canto torcida america mg se o america jogar no ceu", ["america_mineiro"]),
    ("bra_b", "athletic_club", "torcida athletic club esquadrao sao joao del rei", ["athletic"]),
    ("bra_b", "atletico_go", "canto torcida atletico goianiense dragao antonio accioly", ["atletico_goianiense"]),
    ("bra_b", "avai", "canto torcida avai leao da ilha ressacada", ["avai_fc"]),
    ("bra_b", "botafogo_sp", "canto torcida botafogo sp ribeirao preto fiel forca", ["botafogo_ribeirao"]),
    ("bra_b", "ceara", "canto torcida ceara vozão cearamor castelao", ["ceara_sc"]),
    ("bra_b", "crb", "canto torcida crb regatas alagoas comando alvirrubro", ["crb_al"]),
    ("bra_b", "cuiaba", "canto torcida cuiaba dourado arena pantanal", ["cuiaba_ec"]),
    ("bra_b", "fortaleza", "canto torcida fortaleza leao do pici tuf castelao", ["fortaleza_ec"]),
    ("bra_b", "goias", "canto torcida goias esmeraldino forca jovem serra dourada", ["goias_ec"]),
    ("bra_b", "juventude", "canto torcida juventude alviverde mancha verde jaconero", ["ec_juventude"]),
    ("bra_b", "londrina", "canto torcida londrina tubarao falange cafe", ["londrina_ec"]),
    ("bra_b", "nautico", "canto torcida nautico timbu aflitos fanautico", ["clube_nautico"]),
    ("bra_b", "novorizontino", "torcida novorizontino jorjao tigre do vale", ["gremio_novorizontino"]),
    ("bra_b", "operario_pr", "canto torcida operario ferroviario trem fantasma germano krüger", ["operario", "operario_ferroviario"]),
    ("bra_b", "ponte_preta", "canto torcida ponte preta macaca majessoto", ["ponte_preta_sp"]),
    ("bra_b", "sao_bernardo", "torcida sao bernardo fc tigre do abc primeiro de maio", ["sao_bernardo_fc"]),
    ("bra_b", "sport", "canto torcida sport recife caza caza ilha do retiro", ["sport_recife"]),
    ("bra_b", "vila_nova", "canto torcida vila nova esquadrao vilanovense obba", ["vila_nova_go"]),

    # Série C
    ("bra_c", "amazonas_fc", "torcida amazonas fc onca pintada arena da amazonia", ["amazonas"]),
    ("bra_c", "anapolis", "torcida anapolis fc galo da comarca jonas duarte", ["anapolis_fc"]),
    ("bra_c", "barra_sc", "torcida barra fc balneario camboriu pescador", ["barra"]),
    ("bra_c", "botafogo_pb", "canto torcida botafogo pb belo alvinegro da estrela vermelha almeidão", ["botafogo_da_paraiba"]),
    ("bra_c", "brusque", "canto torcida brusque marreco quadricolor augusto bauer", ["brusque_fc"]),
    ("bra_c", "caxias", "canto torcida ser caxias grená centenario", ["ser_caxias"]),
    ("bra_c", "confianca", "canto torcida confianca sergipe trovao azul batistao", ["ad_confianca"]),
    ("bra_c", "ferroviaria", "canto torcida ferroviaria afe araraquara fonte luminosa", ["ferroviaria_sp"]),
    ("bra_c", "figueirense", "canto torcida figueirense furacao sc gavioes alvinegros orlando scarpelli", ["figueirense_fc"]),
    ("bra_c", "floresta", "torcida floresta ec cearense verdao", ["floresta_ce"]),
    ("bra_c", "guarani", "canto torcida guarani campinas bugre brinco de ouro furia", ["guarani_fc"]),
    ("bra_c", "inter_de_limeira", "canto torcida internacional de limeira leao major levy", ["internacional_de_limeira"]),
    ("bra_c", "itabaiana", "canto torcida itabaiana tremendao sergipe mendoncao", ["ao_itabaiana"]),
    ("bra_c", "ituano", "canto torcida ituano galo de itu novelli junior", ["ituano_fc"]),
    ("bra_c", "maranhao", "torcida maranhao atletico clube mac demolidor castelao", ["maranhao_ac"]),
    ("bra_c", "maringa", "canto torcida maringa fc dogao willie davids", ["maringa_fc"]),
    ("bra_c", "paysandu", "canto torcida paysandu terror bicolor papao curuzu", ["paysandu_sc"]),
    ("bra_c", "santa_cruz", "canto torcida santa cruz inferno coral arruda cobra coral", ["santa_cruz_pe"]),
    ("bra_c", "volta_redonda", "canto torcida volta redonda voltaco raulino de oliveira", ["volta_redonda_fc"]),
    ("bra_c", "ypiranga_rs", "canto torcida ypiranga de erechim canarinho colosso da lagoa", ["ypiranga"]),

    # Série D & Estaduais de Destaque
    ("bra_d", "abc", "canto torcida abc de natal camelo frasqueirao", ["abc_fc"]),
    ("bra_d", "america_rn", "canto torcida america de natal mecao arena das dunas", ["america_de_natal"]),
    ("bra_d", "brasiliense", "canto torcida brasiliense faccao jacare boca do jacare", ["brasiliense_fc"]),
    ("bra_d", "gama", "canto torcida gama ira jovem bezerrao alviverde", ["se_gama"]),
    ("bra_d", "csa", "canto torcida csa mutange azulao rei pele mancha azul", ["centro_sportivo_alagoano"]),
    ("bra_d", "sampaio_correa", "canto torcida sampaio correa bolivia querida castelao tubarao", ["sampaio_correa_ma"]),
    ("bra_d", "joinville", "canto torcida jec uniao tricolor joinville arena joinville", ["jec"]),
    ("bra_d", "treze", "canto torcida treze galo da borborema jovem do galo amigao", ["treze_fc"]),
    ("bra_d", "campinense", "canto torcida campinense raposa fera amigao", ["campinense_pb"]),
    ("bra_d", "portuguesa", "canto torcida portuguesa lusa leoes da fabulosa caninde", ["portuguesa_sp", "portuguesa_de_desportos"]),
    ("bra_d", "bangu", "canto torcida bangu alvirrubro moca bonita banguzeiros", ["bangu_ac"]),
    ("bra_d", "parana", "canto torcida parana clube furia independente vila capanema", ["parana_clube"]),
    ("bra_d", "ferroviario", "canto torcida ferroviario falange coral tubarao da barra elzir cabral", ["ferroviario_ce"]),
    ("bra_d", "tombense", "canto torcida tombense gaviao carangola almeidao", ["tombense_mg"]),
    ("bra_d", "moto_club", "canto torcida moto club papao do norte motense nhozinho santos", ["moto_club_ma"]),
    ("bra_d", "agua_santa", "canto torcida agua santa tubarao azul inamar diadema netuno", ["agua_santa_sp"]),
    ("bra_d", "velo_clube", "canto torcida velo clube benitao rio claro rubro verde", ["velo_clube_sp"]),
    ("bra_d", "brasil_de_pelotas", "canto torcida brasil de pelotas xavante bento freitas", ["ge_brasil"]),
    ("bra_d", "pelotas", "canto torcida lobo pelotas boca do lobo", ["ec_pelotas"]),
    ("bra_d", "marcilio_dias", "canto torcida marcilio dias furia marinheira itajai gigantao", ["cn_marcilio_dias"]),
    ("bra_d", "retro", "canto torcida retro fc brasil camaragibe arena pernambuco", ["retro_fc"])
]

def check_file_exists(folder, slug):
    path = os.path.join(CROWD_DIR, folder, f"{slug}.mp3")
    return os.path.exists(path) and os.path.getsize(path) > 30000

def download_and_process(folder, slug, query, aliases):
    target_folder_path = os.path.join(CROWD_DIR, folder)
    os.makedirs(target_folder_path, exist_ok=True)
    target_mp3 = os.path.join(target_folder_path, f"{slug}.mp3")
    
    # Check if file exists or already in another folder
    for fld in [folder, "bra_a", "bra_b", "bra_c", "bra_d", "bra_estaduais"]:
        candidate = os.path.join(CROWD_DIR, fld, f"{slug}.mp3")
        if os.path.exists(candidate) and os.path.getsize(candidate) > 30000:
            if candidate != target_mp3:
                shutil.copy2(candidate, target_mp3)
                print(f"[REUSE] {slug} found in {fld}, copied to {folder}/{slug}.mp3")
            _propagate_copies(target_mp3, folder, slug, aliases)
            return True

    # Check aliases
    for a in aliases:
        for fld in [folder, "bra_a", "bra_b", "bra_c", "bra_d", "bra_estaduais"]:
            candidate = os.path.join(CROWD_DIR, fld, f"{a}.mp3")
            if os.path.exists(candidate) and os.path.getsize(candidate) > 30000:
                shutil.copy2(candidate, target_mp3)
                print(f"[REUSE ALIAS] {a} found in {fld}, copied to {folder}/{slug}.mp3")
                _propagate_copies(target_mp3, folder, slug, aliases)
                return True

    print(f"\n[DOWNLOAD] Fetching {slug} ({query})...")
    raw_path_base = os.path.join(SCRATCH_DIR, f"raw_{slug}")
    
    # Use yt-dlp to download 40s section with verified options
    cmd_dl = [
        "python", "-m", "yt_dlp",
        "--no-warnings",
        "-q",
        "--extractor-args", "youtube:player_client=android,web",
        "-f", "ba/b",
        "--download-sections", "*00:15-00:55",
        "--force-keyframes-at-cuts",
        "-x",
        "--audio-format", "mp3",
        "-o", f"{raw_path_base}.%(ext)s",
        f"ytsearch1:{query}"
    ]
    
    res = subprocess.run(cmd_dl, capture_output=True, text=True)
    raw_mp3 = f"{raw_path_base}.mp3"
    
    if not os.path.exists(raw_mp3) or os.path.getsize(raw_mp3) < 10000:
        print(f"[WARN] Failed to download {slug}. Error: {res.stderr[:200]}")
        return False

    # Normalize audio with ffmpeg: 128k, loudnorm, fade in 0.5s, fade out 1.5s
    filter_chain = "loudnorm=I=-16:TP=-1.5:LRA=11,afade=t=in:ss=0:d=0.5,afade=t=out:st=37:d=1.5"
    cmd_ffmpeg = [
        "ffmpeg", "-y",
        "-i", raw_mp3,
        "-t", "39",
        "-af", filter_chain,
        "-b:a", "128k",
        target_mp3
    ]
    res_ff = subprocess.run(cmd_ffmpeg, capture_output=True, text=True)
    if os.path.exists(target_mp3) and os.path.getsize(target_mp3) > 10000:
        print(f"[SUCCESS] Processed {folder}/{slug}.mp3 ({os.path.getsize(target_mp3)} bytes)")
        _propagate_copies(target_mp3, folder, slug, aliases)
        # Clean scratch raw
        try:
            os.remove(raw_mp3)
        except:
            pass
        return True
    else:
        print(f"[ERROR] FFmpeg failed for {slug}: {res_ff.stderr[:200]}")
        return False

def _propagate_copies(source_path, folder, slug, aliases):
    # Copy to bra_estaduais
    estaduais_dir = os.path.join(CROWD_DIR, "bra_estaduais")
    os.makedirs(estaduais_dir, exist_ok=True)
    est_target = os.path.join(estaduais_dir, f"{slug}.mp3")
    if not os.path.exists(est_target):
        shutil.copy2(source_path, est_target)

    # Copy all aliases to folder and bra_estaduais
    for a in aliases:
        a_target = os.path.join(CROWD_DIR, folder, f"{a}.mp3")
        if not os.path.exists(a_target):
            shutil.copy2(source_path, a_target)
        a_est = os.path.join(estaduais_dir, f"{a}.mp3")
        if not os.path.exists(a_est):
            shutil.copy2(source_path, a_est)

def main():
    print(f"=== AFM MANAGER 2027: INICIANDO ENRIQUECIMENTO DE TORCIDAS ===")
    print(f"Total de clubes na fila: {len(TARGETS)}")
    success_count = 0
    fail_count = 0
    
    for i, (folder, slug, query, aliases) in enumerate(TARGETS, 1):
        print(f"[{i}/{len(TARGETS)}] Verificando {slug} ({folder})...")
        ok = download_and_process(folder, slug, query, aliases)
        if ok:
            success_count += 1
        else:
            fail_count += 1
        time.sleep(0.5)

    print(f"\n=======================================================")
    print(f"PROCESSAMENTO FINALIZADO!")
    print(f"Total Sucessos: {success_count} | Falhas: {fail_count}")
    print(f"=======================================================")

if __name__ == "__main__":
    main()
