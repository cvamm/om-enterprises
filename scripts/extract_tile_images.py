"""Extract real tile images from CERA PDF by rendering tile regions."""
import fitz
import re
import os

PDF_PATH = r"C:\Users\anjua\OneDrive\Desktop\tiles.pdf"
OUTPUT_DIR = r"C:\Users\anjua\OneDrive\Desktop\OM Tiles\kanpur-tiles\public\tiles\cera"

doc = fitz.open(PDF_PATH)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Product names from import_cera.mjs
PRODUCT_NAMES = {}
with open(r"C:\Users\anjua\OneDrive\Desktop\OM Tiles\kanpur-tiles\scripts\import_cera.mjs") as f:
    for line in f:
        m = re.match(r'\["([^"]+)","([^"]+)"', line)
        if m:
            name, code = m.group(1), m.group(2)
            PRODUCT_NAMES[code] = name

print(f"Loaded {len(PRODUCT_NAMES)} product names")

# Code regex - just match T + 6 digits + 2 letters
CODE_RE = re.compile(r'T\d{6}[A-Z]{2}')

saved = 0
skipped = 0
missing = []

for page_num in range(len(doc)):
    page = doc[page_num]
    text = page.get_text()
    
    codes = CODE_RE.findall(text)
    if not codes:
        continue
    
    # Filter to only known codes
    known_codes = [c for c in codes if c in PRODUCT_NAMES]
    if not known_codes:
        continue
    
    page_w = page.rect.width
    page_h = page.rect.height
    num_codes = len(known_codes)
    
    # Get text block positions
    blocks_data = page.get_text("dict")["blocks"]
    code_positions = []
    
    for block in blocks_data:
        if block["type"] == 0:
            block_text = ""
            for line in block["lines"]:
                for span in line["spans"]:
                    block_text += span["text"]
            
            for code in known_codes:
                if code in block_text:
                    bbox = block["bbox"]
                    code_positions.append({
                        "code": code,
                        "text_y": bbox[1],  # top of this text block
                        "text_x": bbox[0],
                    })
    
    if not code_positions:
        continue
    
    # Sort by y first (top to bottom), then by x (left to right)
    code_positions.sort(key=lambda x: (x["text_y"], x["text_x"]))
    
    # Determine layout
    # Check if codes are on same y-level (side by side) or different (stacked)
    y_positions = sorted(set(cp["text_y"] for cp in code_positions))
    
    if len(y_positions) == 1:
        # All on same row - side by side
        tiles_per_row = num_codes
        rows = 1
    else:
        # Multiple rows
        tiles_per_row = num_codes // len(y_positions)
        rows = len(y_positions)
    
    # Assign each code to a grid position
    for i, cp in enumerate(code_positions):
        col = i % tiles_per_row
        row = i // tiles_per_row
        
        cell_w = page_w / tiles_per_row
        cell_h = page_h / rows
        
        x0 = col * cell_w
        x1 = (col + 1) * cell_w
        y0 = 60  # skip header
        y1 = cp["text_y"] - 10  # just above the code text
        
        if y1 <= y0:
            skipped += 1
            continue
        
        crop_rect = fitz.Rect(x0, y0, x1, y1)
        mat = fitz.Matrix(2, 2)
        pix = page.get_pixmap(matrix=mat, clip=crop_rect, dpi=300)
        
        if pix.width < 100 or pix.height < 100:
            skipped += 1
            continue
        
        name = PRODUCT_NAMES[cp["code"]]
        safe_name = re.sub(r'[^\w\s-]', '', name).strip().replace(' ', '-')
        filename = f"{cp['code']}-{safe_name}.jpg"
        filepath = os.path.join(OUTPUT_DIR, filename)
        pix.save(filepath, output="jpeg", jpg_quality=92)
        saved += 1

print(f"\nDone. Saved: {saved}, Skipped: {skipped}")
files = os.listdir(OUTPUT_DIR)
print(f"Files in output dir: {len(files)}")

# Check which codes are still missing
imported_codes = set()
for f in files:
    m = re.match(r'(T\d{6}[A-Z]{2})', f)
    if m:
        imported_codes.add(m.group(1))

missing_codes = [c for c in PRODUCT_NAMES if c not in imported_codes]
if missing_codes:
    print(f"\nMissing {len(missing_codes)} codes:")
    for c in missing_codes[:10]:
        print(f"  {c}: {PRODUCT_NAMES[c]}")

doc.close()
