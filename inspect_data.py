import re

with open('data/competition_teams.js', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

matches = re.findall(r"['\"]?([a-zA-Z0-9_-]+)['\"]?\s*:\s*\[([^\]]+)\]", text)
for comp, teams in matches[:25]:
    t_list = [t.strip().strip('\'"') for t in teams.split(',') if t.strip()]
    print(comp, len(t_list), t_list[:3])
