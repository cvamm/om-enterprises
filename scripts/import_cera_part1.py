#!/usr/bin/env python3
"""Part 1 of 3: config + tile specs."""
import fitz, urllib.request, urllib.error, json, io, os, time, sys, re

ENV_PATH = r"C:\Users\anjua\OneDrive\Desktop\OM Tiles\kanpur-tiles\.env.local"
with open(ENV_PATH) as f:
    for line in f:
        line = line.strip()
        if line.startswith("NEXT_PUBLIC_SUPABASE_URL="):
            SUPABASE_URL = line.split("=", 1)[1]
        elif line.startswith("SUPABASE_SERVICE_ROLE_KEY="):
            SERVICE_KEY = line.split("=", 1)[1]

BUCKET = "tiles"
PDF_PATH = r"C:\Users\anjua\OneDrive\Desktop\tiles.pdf"

TILE_SPECS = [
    # LUSTROUS 600x1200
    (42,0,0,"CalaboZo","T313169NA","Lustrous","glossy","vitrified",[600,1200,9],31,4,["bathroom"]),
    (42,0,1,"Norme White","T313225NA","Lustrous","glossy","vitrified",[600,1200,9],31,4,["kitchen"]),
    (42,0,2,"Cancite Beige","T313147NA","Lustrous","glossy","vitrified",[600,1200,9],31,4,["bathroom"]),
    (42,1,0,"Thila Grey","T313170NA","Lustrous","glossy","vitrified",[600,1200,9],31,4,["kitchen"]),
    (42,1,1,"Zaffiro Natural","T313217NA","Lustrous","glossy","vitrified",[600,1200,9],31,4,["bathroom"]),
    (42,1,2,"Zaffiro Blue","T313218NA","Lustrous","glossy","vitrified",[600,1200,9],31,4,["kitchen"]),
    (44,0,0,"Oromin Beige","T313270NA","Lustrous","glossy","vitrified",[600,1200,9],31,4,["bathroom"]),
    (44,0,1,"Corinto Beige","T313220NA","Lustrous","glossy","vitrified",[600,1200,9],31,4,["kitchen"]),
    (44,0,2,"Cracker Grey","T313222NA","Lustrous","glossy","vitrified",[600,1200,9],31,4,["bathroom"]),
    (44,1,0,"Ocean Crema","T313076NA","Lustrous","glossy","vitrified",[600,1200,9],31,4,["kitchen"]),
    (44,1,1,"Basalt Beige","T313140NA","Lustrous","glossy","vitrified",[600,1200,9],31,4,["bathroom"]),
    (44,1,2,"Basalt Grey","T313141NA","Lustrous","glossy","vitrified",[600,1200,9],31,4,["kitchen"]),
    (46,0,0,"Daena","T313007NA","Lustrous","glossy","vitrified",[600,1200,9],31,4,["bathroom"]),
    (46,0,1,"Delrose","T313005NA","Lustrous","glossy","vitrified",[600,1200,9],31,4,["kitchen"]),
    (46,0,2,"Imperial Red","T324003NA","Lustrous","glossy","vitrified",[600,1200,9],31,4,["bathroom"]),
    (46,1,0,"Calcutta White","T313045NA","Lustrous","glossy","vitrified",[600,1200,9],31,4,["kitchen"]),
    (46,1,1,"Bianco Carrara","T313055NA","Lustrous","glossy","vitrified",[600,1200,9],31,4,["bathroom"]),
    (46,1,2,"Deluccio","T313006NA","Lustrous","glossy","vitrified",[600,1200,9],31,4,["kitchen"]),
    (48,0,0,"Albite White","T313152NA","Lustrous","glossy","vitrified",[600,1200,9],31,4,["bathroom"]),
    (48,0,1,"Soul White","T313098NA","Lustrous","glossy","vitrified",[600,1200,9],31,4,["kitchen"]),
    (48,0,2,"Indiana Marble","T313158NA","Lustrous","glossy","vitrified",[600,1200,9],31,4,["bathroom"]),
    (48,1,0,"Olivia White","T313153NA","Lustrous","glossy","vitrified",[600,1200,9],31,4,["kitchen"]),
    (48,1,1,"Hamber Grey","T313150NA","Lustrous","glossy","vitrified",[600,1200,9],31,4,["bathroom"]),
    (48,1,2,"Hamber Slate","T313149NA","Lustrous","glossy","vitrified",[600,1200,9],31,4,["kitchen"]),
    # LUSTROUS BM 600x1200
    (54,0,0,"Michael White","T313202NA","Lustrous BM","glossy","vitrified",[600,1200,9],31,4,["bathroom"]),
    (54,0,1,"Udon","T313194NA","Lustrous BM","glossy","vitrified",[600,1200,9],31,4,["kitchen"]),
    (54,0,2,"Lumix Grey","T313204NA","Lustrous BM","glossy","vitrified",[600,1200,9],31,4,["bathroom"]),
    (54,1,0,"Mirage","T313199NA","Lustrous BM","glossy","vitrified",[600,1200,9],31,4,["kitchen"]),
    (56,0,0,"Weber White","T313260NA","Lustrous BM","glossy","vitrified",[600,1200,9],31,4,["bathroom"]),
    (56,0,1,"Weber Decor","T313268NA","Lustrous BM","glossy","vitrified",[600,1200,9],31,4,["kitchen"]),
    (56,0,2,"Weber Beige","T313259NA","Lustrous BM","glossy","vitrified",[600,1200,9],31,4,["bathroom"]),
    (56,1,0,"Monolith Bianco","T313256NA","Lustrous BM","glossy","vitrified",[600,1200,9],31,4,["kitchen"]),
    (56,1,1,"Nylo Nero","T313266NA","Lustrous BM","glossy","vitrified",[600,1200,9],31,4,["bathroom"]),
    (56,1,2,"Monolith Nero","T313255NA","Lustrous BM","glossy","vitrified",[600,1200,9],31,4,["kitchen"]),
    # FOSSIL 600x1200
    (58,0,0,"Morgan White","T313155NA","Fossil","glossy","vitrified",[600,1200,9],31,4,["bathroom"]),
    (58,0,1,"Alaska White Grey","T313114NA","Fossil","glossy","vitrified",[600,1200,9],31,4,["kitchen"]),
    (58,0,2,"Magma Green","T324002NA","Fossil","glossy","vitrified",[600,1200,9],31,4,["bathroom"]),
    (58,1,0,"Prada Grey","T313092NA","Fossil","glossy","vitrified",[600,1200,9],31,4,["kitchen"]),
    (58,1,1,"Repliq Satvario","T313227NA","Fossil","glossy","vitrified",[600,1200,9],31,4,["bathroom"]),
    (58,1,2,"Grevis Aqua","T313219NA","Fossil","glossy","vitrified",[600,1200,9],31,4,["kitchen"]),
    (60,0,0,"Haven Light Grey","T313100NA","Fossil","glossy","vitrified",[600,1200,9],31,4,["bathroom"]),
    (60,0,1,"Haven Dark Grey","T313099NA","Fossil","glossy","vitrified",[600,1200,9],31,4,["kitchen"]),
    (60,1,0,"Monolith Ivory","T313257NA","Fossil","glossy","vitrified",[600,1200,9],31,4,["bathroom"]),
    (60,1,1,"Nylo Taupe","T313267NA","Fossil","glossy","vitrified",[600,1200,9],31,4,["kitchen"]),
    (60,1,2,"Monolith Taupe","T313258NA","Fossil","glossy","vitrified",[600,1200,9],31,4,["bathroom"]),
]

def api(method, path, body=None):
    url = f"{SUPABASE_URL}{path}"
    h = {"apikey": SERVICE_KEY, "Authorization": f"Bearer {SERVICE_KEY}", "Accept": "application/json"}
    data = json.dumps(body).encode() if body else None
    if data: h["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=data, headers=h, method=method)
    try:
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read()) if r.read() else {}
    except urllib.error.HTTPError as e:
        err = e.read().decode()[:300]
        print(f"  HTTP {e.code}: {err}", file=sys.stderr)
        return None

def slugify(name):
    return re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')

print(f"Total tiles to process: {len(TILE_SPECS)}")
print("Config loaded.")
