from PIL import Image
from pathlib import Path

root = Path(__file__).resolve().parents[1]
logo = Image.open(root / "frontend/branding/logo.png").convert("RGBA")
w, h = logo.size
side = min(w, h)
left = (w - side) // 2
top = (h - side) // 2
logo = logo.crop((left, top, left + side, top + side))


def make_square(size, bg=(34, 52, 74, 255)):
    im = Image.new("RGBA", (size, size), bg)
    pad = max(1, int(size * 0.06))
    scaled = logo.resize((size - 2 * pad, size - 2 * pad), Image.Resampling.LANCZOS)
    im.paste(scaled, (pad, pad), scaled)
    return im


sizes = [16, 24, 32, 48, 64, 128, 256]
frames = [make_square(s) for s in sizes]
ico_path = root / "desktop/build/icon.ico"
ico_path.parent.mkdir(parents=True, exist_ok=True)
frames[-1].save(ico_path, format="ICO", sizes=[(s, s) for s in sizes])
print("desktop", ico_path, ico_path.stat().st_size)

icons = root / "frontend/icons"
icons.mkdir(parents=True, exist_ok=True)
frames[-1].save(icons / "icon.ico", format="ICO", sizes=[(s, s) for s in sizes])
make_square(180).convert("RGB").save(icons / "icon-180.png", "PNG")
make_square(192).convert("RGB").save(icons / "icon-192.png", "PNG")
make_square(512).convert("RGB").save(icons / "icon-512.png", "PNG")
make_square(48).save(icons / "favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
print("web icons ok")

res = root / "mobile/android/app/src/main/res"
mip_map = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}
for folder, size in mip_map.items():
    d = res / folder
    d.mkdir(parents=True, exist_ok=True)
    img = make_square(size)
    img.save(d / "ic_launcher.png", "PNG")
    img.save(d / "ic_launcher_round.png", "PNG")
    # adaptive foreground: logo on transparent with safe zone
    fg = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    pad = int(size * 0.18)
    scaled = logo.resize((size - 2 * pad, size - 2 * pad), Image.Resampling.LANCZOS)
    fg.paste(scaled, (pad, pad), scaled)
    fg.save(d / "ic_launcher_foreground.png", "PNG")
    print("android", folder, size)

# Native Android splash full-bleed cover
bg = Image.open(root / "frontend/branding/background.jpg").convert("RGB")
tw, th = 1080, 1920
scale = max(tw / bg.width, th / bg.height)
nw, nh = int(bg.width * scale), int(bg.height * scale)
bg2 = bg.resize((nw, nh), Image.Resampling.LANCZOS)
left = (nw - tw) // 2
top = (nh - th) // 2
bg2 = bg2.crop((left, top, left + tw, top + th))
draw = res / "drawable"
draw.mkdir(parents=True, exist_ok=True)
# styles.xml uses @drawable/splash — keep XML name; replace png if present
out = draw / "splash.png"
bg2.save(out, "PNG")
print("splash", out, out.stat().st_size)
print("done")
