"""Build logo-full.png (emblem + text) and app icons from background.jpg."""
from PIL import Image
import os

ROOT = os.path.join(os.path.dirname(__file__), "..", "frontend")
BG = os.path.join(ROOT, "branding", "background.jpg")
LOGO_FULL = os.path.join(ROOT, "branding", "logo-full.png")
ICONS = os.path.join(ROOT, "icons")
BUILD_ICO = os.path.join(os.path.dirname(__file__), "..", "desktop", "build", "icon.ico")


def crop_brand(im):
    w, h = im.size
    # emblem + S4 BUSINESS-MANAGEMENTS SERVERS text (exclude extra blur/star)
    return im.crop((int(w * 0.04), int(h * 0.02), int(w * 0.97), int(h * 0.90)))


def fit_square_transparent(im, size, pad=0.02):
    s = int(size * (1 - pad * 2))
    im2 = im.copy()
    im2.thumbnail((s, s), Image.Resampling.LANCZOS)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    x = (size - im2.width) // 2
    y = (size - im2.height) // 2
    out.paste(im2, (x, y), im2 if im2.mode == "RGBA" else None)
    return out


def main():
    bg = Image.open(BG).convert("RGBA")
    full = crop_brand(bg)
    full.save(LOGO_FULL, optimize=True)
    print("logo-full.png", full.size)

    for size, name in [(180, "icon-180.png"), (192, "icon-192.png"), (512, "icon-512.png")]:
        fit_square_transparent(full, size, pad=0.01).save(os.path.join(ICONS, name), optimize=True)

    ico_sizes = [16, 24, 32, 48, 64, 128, 256]
    ico_imgs = [fit_square_transparent(full, s, pad=0.01) for s in ico_sizes]
    ico_imgs[0].save(
        os.path.join(ICONS, "favicon.ico"),
        format="ICO",
        sizes=[(s, s) for s in ico_sizes],
        append_images=ico_imgs[1:],
    )
    ico_imgs[-1].save(BUILD_ICO, format="ICO", sizes=[(256, 256)])
    print("Icons regenerated from logo-full.png")


if __name__ == "__main__":
    main()
