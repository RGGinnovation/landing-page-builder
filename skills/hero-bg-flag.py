# Renders public/assets/rgg/hero-bg-flag-hd.webp (2880x900, alpha fade built in). Needs numpy, scipy, Pillow.
import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import map_coordinates, gaussian_filter

# ---- flag texture (official proportions, 1.9:1) ----
TH = 2600; TW = int(TH * 1.9)
tex = Image.new("RGB", (TW, TH), "#F4F4F2")
d = ImageDraw.Draw(tex)
red, blue = (178, 34, 52), (40, 45, 94)
sh = TH / 13
for i in range(0, 13, 2):
    d.rectangle([0, round(i * sh), TW, round((i + 1) * sh) - 1], fill=red)
cw, ch = int(TH * 0.76), int(sh * 7)
d.rectangle([0, 0, cw, ch], fill=blue)
def star(cx, cy, r):
    pts = []
    for k in range(10):
        a = -np.pi / 2 + k * np.pi / 5
        rr = r if k % 2 == 0 else r * 0.382
        pts.append((cx + rr * np.cos(a), cy + rr * np.sin(a)))
    d.polygon(pts, fill="#F4F4F2")
E, F, G, H = ch / 10, ch / 10, cw / 12, cw / 12
r = TH * 0.0616 / 2
for row in range(9):
    cols = 6 if row % 2 == 0 else 5
    for c in range(cols):
        x = G + (2 * c + (0 if row % 2 == 0 else 1)) * H
        y = E + row * F
        star(x, y, r)
T = np.asarray(tex).astype(np.float32) / 255.0

# ---- waving warp, rendered 2x then downsampled ----
OW, OH = 2880, 900
S = 2
W, Hh = OW * S, OH * S
yy, xx = np.mgrid[0:Hh, 0:W].astype(np.float32)
xn, yn = xx / W, yy / Hh
ph = 2 * np.pi * (xn * 2.6) + 0.6
wave = 0.040 * np.sin(ph) + 0.014 * np.sin(2 * np.pi * xn * 5.1 + 1.7) + 0.004 * np.sin(2 * np.pi * (xn * 11 + yn * 2))
# flag spans ~1.25 output widths, canton lower left
u = (xn * 1.05 + 0.0) * TW
v = (yn * 0.95 + 0.02 + wave * (0.55 + 0.45 * yn)) * TH
rgb = np.stack([map_coordinates(T[..., c], [v, u], order=1, mode="reflect") for c in range(3)], -1)
# fold shading from the wave slope
slope = np.cos(ph) * 0.9 + 0.35 * np.cos(2 * np.pi * xn * 5.1 + 1.7) + 0.15 * np.cos(2 * np.pi * (xn * 11 + yn * 2))
shade = 0.9 + 0.17 * slope
rgb = np.clip(rgb * shade[..., None], 0, 1)
# soft studio light from the upper left, calmer toward the right edge
light = 0.92 + 0.10 * np.exp(-((xn - 0.28) ** 2) / 0.18)
rgb = np.clip(rgb * light[..., None], 0, 1)
# gentle desaturation so it sits behind the portrait
gray = rgb.mean(-1, keepdims=True)
rgb = gray + (rgb - gray) * 0.82
img = Image.fromarray((rgb * 255).astype(np.uint8)).resize((OW, OH), Image.LANCZOS)
# very light depth of field only (keeps it crisp)
arr = np.asarray(img).astype(np.float32)
arr = np.stack([gaussian_filter(arr[..., c], 0.7) for c in range(3)], -1)
# alpha: fade in from the top so the hero color shows above the flag
a = np.clip((np.linspace(0, 1, OH) - 0.05) / 0.55, 0, 1) ** 1.3
alpha = np.repeat(a[:, None], OW, 1)
out = np.dstack([arr, alpha * 255]).clip(0, 255).astype(np.uint8)
Image.fromarray(out, "RGBA").save("hero-bg-flag-hd.webp", quality=90, method=6)
Image.fromarray(out, "RGBA").save("hero-bg-flag-hd.png")
print("flag ok")
