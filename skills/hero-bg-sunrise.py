# Renders public/assets/rgg/hero-bg-sunrise-hd.webp (2880x900, alpha fade built in). Needs numpy, Pillow.
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
OW, OH = 2880, 900
S = 2
W, H = OW * S, OH * S
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
xn, yn = xx / W, yy / H
def hexc(h): return np.array([int(h[i:i+2], 16) for i in (1, 3, 5)], np.float32) / 255
top, mid, low = hexc("#DCE3EA"), hexc("#E9EDF1"), hexc("#F8E4C8")
horizon = 0.70
t = np.clip(yn / horizon, 0, 1)
def sm(x): return x * x * (3 - 2 * x)
w1 = sm(np.clip(t / 0.62, 0, 1))[..., None]
w2 = sm(np.clip((t - 0.35) / 0.65, 0, 1))[..., None]
sky = top + (mid - top) * w1
sky = sky + (low - sky) * w2
# sun glow near the horizon, left of center (behind the portrait)
sx, sy = 0.34, horizon - 0.02
dist = np.sqrt(((xn - sx) * 1.9) ** 2 + ((yn - sy) * 3.2) ** 2)
glow = np.exp(-dist ** 2 / 0.05)[..., None]
core = np.exp(-dist ** 2 / 0.0035)[..., None]
sky = sky + (hexc("#FFE3B0") - sky) * glow * 0.75 + (hexc("#FFF6E4") - sky) * core * 0.85
# faint rays
ang = np.arctan2(yn - sy, (xn - sx) * 1.9)
rays = (0.5 + 0.5 * np.cos(ang * 26)) * np.exp(-dist / 0.55) * (yn < sy)
sky = sky + (1 - sky) * rays[..., None] * 0.06
img = Image.fromarray((np.clip(sky, 0, 1) * 255).astype(np.uint8))
d = ImageDraw.Draw(img)
# layered hills, crisp edges, soft slate tones (lighter far, deeper near)
def ridge(base, amp, freq, phase, color):
    pts = [(0, H)]
    for i in range(0, W + 1, 8):
        x = i / W
        y = base + amp * (0.6 * np.sin(2 * np.pi * (x * freq + phase)) + 0.4 * np.sin(2 * np.pi * (x * freq * 2.3 + phase * 1.7)))
        pts.append((i, y * H))
    pts.append((W, H))
    d.polygon(pts, fill=color)
ridge(horizon + 0.02, 0.025, 1.3, 0.1, (196, 204, 212))
ridge(horizon + 0.09, 0.030, 0.9, 0.55, (166, 176, 187))
ridge(horizon + 0.17, 0.028, 0.7, 0.2, (134, 145, 157))
img = img.resize((OW, OH), Image.LANCZOS)
arr = np.asarray(img).astype(np.float32)
arr += np.random.default_rng(3).normal(0, 0.8, arr.shape)  # dither, no banding
a = sm(np.clip((np.linspace(0, 1, OH) - 0.0) / 0.5, 0, 1))
out = np.dstack([arr, np.repeat(a[:, None], OW, 1) * 255]).clip(0, 255).astype(np.uint8)
Image.fromarray(out, "RGBA").save("hero-bg-sunrise-hd.webp", quality=90, method=6)
Image.fromarray(out, "RGBA").save("hero-bg-sunrise-hd.png")
print("ok")
