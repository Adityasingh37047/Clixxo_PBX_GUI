import re
from pathlib import Path

root = Path(r"D:\Clixxo_PBX_GUI\src")
pattern = re.compile(r"<<<<<<< HEAD\n(.*?)\n=======\n(.*?)\n>>>>>>> develop\n", re.DOTALL)

for p in sorted(root.rglob("*")):
    if p.suffix not in {".jsx", ".js", ".css"}:
        continue
    text = p.read_text(encoding="utf-8", errors="replace")
    if "<<<<<<< HEAD" not in text:
        continue
    blocks = pattern.findall(text)
    print(f"{len(blocks):3d} {p.relative_to(root.parent)}")
