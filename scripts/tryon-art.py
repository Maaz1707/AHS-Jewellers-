"""
Draws the virtual try-on artwork as SVG (scripts/tryon-svg/*.svg).
scripts/tryon-art.mjs then renders each to a transparent PNG in public/tryon.

These are stand-ins drawn for the prototype. Replace them with cut-out
photographs of the real pieces (transparent PNG, same framing) before launch.
"""
import math, os

OUT = os.path.join(os.path.dirname(__file__), "tryon-svg")
os.makedirs(OUT, exist_ok=True)

DEFS = """
<defs>
  <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#7a5418"/><stop offset="0.28" stop-color="#e9c46a"/>
    <stop offset="0.5" stop-color="#fbe7a8"/><stop offset="0.72" stop-color="#c79a3e"/>
    <stop offset="1" stop-color="#6f4b14"/>
  </linearGradient>
  <linearGradient id="goldV" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fbe7a8"/><stop offset="0.45" stop-color="#d9ad52"/>
    <stop offset="1" stop-color="#76511a"/>
  </linearGradient>
  <radialGradient id="bead" cx="0.35" cy="0.3" r="0.75">
    <stop offset="0" stop-color="#fff4cf"/><stop offset="0.35" stop-color="#e7bf62"/>
    <stop offset="1" stop-color="#6c4813"/>
  </radialGradient>
  <radialGradient id="pearl" cx="0.35" cy="0.3" r="0.8">
    <stop offset="0" stop-color="#ffffff"/><stop offset="0.55" stop-color="#efe8dc"/>
    <stop offset="1" stop-color="#b8ad9c"/>
  </radialGradient>
  <radialGradient id="ruby" cx="0.35" cy="0.3" r="0.8">
    <stop offset="0" stop-color="#ff8a95"/><stop offset="0.4" stop-color="#b3132a"/>
    <stop offset="1" stop-color="#4a0510"/>
  </radialGradient>
  <radialGradient id="emerald" cx="0.35" cy="0.3" r="0.8">
    <stop offset="0" stop-color="#9ff0c8"/><stop offset="0.4" stop-color="#127a50"/>
    <stop offset="1" stop-color="#03301e"/>
  </radialGradient>
  <radialGradient id="diamond" cx="0.4" cy="0.35" r="0.75">
    <stop offset="0" stop-color="#ffffff"/><stop offset="0.5" stop-color="#e6ecf2"/>
    <stop offset="0.8" stop-color="#9aa7b4"/><stop offset="1" stop-color="#f5f8fb"/>
  </radialGradient>
  <radialGradient id="polki" cx="0.4" cy="0.35" r="0.8">
    <stop offset="0" stop-color="#fffdf5"/><stop offset="0.6" stop-color="#e8e2cf"/>
    <stop offset="1" stop-color="#a99f86"/>
  </radialGradient>
  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
    <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#2a1a08" flood-opacity="0.35"/>
  </filter>
</defs>
"""


def svg(w, h, body):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">{DEFS}<g filter="url(#shadow)">{body}</g></svg>'


def gem(x, y, r, fill, ring=True):
    s = ""
    if ring:
        s += f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r * 1.32:.1f}" fill="url(#gold)"/>'
    s += f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.1f}" fill="url(#{fill})"/>'
    s += f'<circle cx="{x - r * 0.35:.1f}" cy="{y - r * 0.35:.1f}" r="{r * 0.22:.1f}" fill="#fff" opacity="0.75"/>'
    return s


def bead(x, y, r, fill="bead"):
    return f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.1f}" fill="url(#{fill})"/>'


def flower(x, y, r, centre="ruby"):
    s = ""
    for k in range(8):
        a = k * math.pi / 4
        px, py = x + math.cos(a) * r * 0.62, y + math.sin(a) * r * 0.62
        s += f'<ellipse cx="{px:.1f}" cy="{py:.1f}" rx="{r * 0.38:.1f}" ry="{r * 0.24:.1f}" transform="rotate({math.degrees(a):.1f} {px:.1f} {py:.1f})" fill="url(#gold)" stroke="#6f4b14" stroke-width="1"/>'
    s += gem(x, y, r * 0.36, centre)
    return s


def jhumka(stone=None, drops="bead"):
    w, h = 400, 700
    cx = w / 2
    b = flower(cx, 56, 46, stone or "bead") if stone else flower(cx, 56, 46, "bead")
    # link
    b += f'<rect x="{cx - 7}" y="96" width="14" height="44" rx="7" fill="url(#goldV)"/>'
    b += bead(cx, 150, 14)
    # dome
    top, bottom, half = 170, 430, 150
    dome = f"M{cx - 26},{top} C{cx - 70},{top + 40} {cx - half},{bottom - 120} {cx - half},{bottom} L{cx + half},{bottom} C{cx + half},{bottom - 120} {cx + 70},{top + 40} {cx + 26},{top} Z"
    b += f'<path d="{dome}" fill="url(#gold)" stroke="#6f4b14" stroke-width="2"/>'
    # engraved bands
    for t in (0.35, 0.58, 0.8):
        y = top + (bottom - top) * t
        hw = half * (0.25 + 0.75 * t ** 0.8)
        b += f'<path d="M{cx - hw},{y} Q{cx},{y + 18} {cx + hw},{y}" fill="none" stroke="#6f4b14" stroke-width="2.5" opacity="0.7"/>'
        b += f'<path d="M{cx - hw},{y + 4} Q{cx},{y + 22} {cx + hw},{y + 4}" fill="none" stroke="#fff3c4" stroke-width="1.5" opacity="0.6"/>'
        if stone and t == 0.58:
            for k in range(-2, 3):
                b += gem(cx + k * hw * 0.38, y + 14 - abs(k) * 3, 9, stone)
    # highlight
    b += f'<path d="M{cx - 40},{top + 40} C{cx - 80},{top + 120} {cx - 100},{bottom - 80} {cx - 96},{bottom - 20}" fill="none" stroke="#fff6d6" stroke-width="10" opacity="0.35" stroke-linecap="round"/>'
    # rim
    b += f'<ellipse cx="{cx}" cy="{bottom}" rx="{half + 6}" ry="22" fill="url(#goldV)" stroke="#6f4b14" stroke-width="2"/>'
    # hanging drops around the rim
    n = 13
    for k in range(n):
        x = cx - half + k * (2 * half) / (n - 1)
        y = bottom + 18 + math.sin(k / (n - 1) * math.pi) * 10
        b += f'<line x1="{x:.1f}" y1="{bottom + 10}" x2="{x:.1f}" y2="{y + 34:.1f}" stroke="#a37a2c" stroke-width="2"/>'
        b += bead(x, y + 44, 11, drops)
    return svg(w, h, b)


def chandbali():
    w, h = 520, 640
    cx = w / 2
    b = flower(cx, 52, 44, "emerald")
    b += f'<rect x="{cx - 7}" y="90" width="14" height="40" rx="7" fill="url(#goldV)"/>'
    # crescent: outer and inner arcs
    oy, R, r = 150, 230, 150
    outer = f"M{cx - R},{oy + 40} A{R},{R} 0 0 0 {cx + R},{oy + 40}"
    inner = f"A{R - 60},{R - 110} 0 0 1 {cx - R},{oy + 40}"
    b += f'<path d="{outer} L{cx + R - 18},{oy + 30} Q{cx},{oy + 300} {cx - R + 18},{oy + 30} Z" fill="url(#gold)" stroke="#6f4b14" stroke-width="2"/>'
    # filigree dots along the crescent
    for k in range(1, 16):
        a = math.pi * k / 16
        x = cx - math.cos(a) * (R - 32)
        y = oy + 40 + math.sin(a) * (R - 60)
        b += gem(x, y, 8, "ruby" if k % 3 else "emerald", ring=False)
    # centre emerald
    b += gem(cx, oy + 205, 22, "emerald")
    # top bar joining crescent tips to the link
    b += f'<path d="M{cx - R + 10},{oy + 40} Q{cx},{oy - 40} {cx + R - 10},{oy + 40}" fill="none" stroke="url(#goldV)" stroke-width="10"/>'
    b += bead(cx, oy + 5, 14)
    # pearl fringe
    n = 19
    for k in range(n):
        a = math.pi * (k + 0.5) / n
        x = cx - math.cos(a) * R
        y = oy + 40 + math.sin(a) * (R - 10)
        b += f'<line x1="{x:.1f}" y1="{y:.1f}" x2="{x:.1f}" y2="{y + 30:.1f}" stroke="#a37a2c" stroke-width="2"/>'
        b += bead(x, y + 40, 10, "pearl")
    return svg(w, h, b)


def solitaire():
    w = h = 200
    c = 100
    b = ""
    for a in (45, 135, 225, 315):
        x, y = c + math.cos(math.radians(a)) * 72, c + math.sin(math.radians(a)) * 72
        b += f'<circle cx="{x:.1f}" cy="{y:.1f}" r="13" fill="url(#bead)"/>'
    b += f'<circle cx="{c}" cy="{c}" r="76" fill="url(#diamond)" stroke="#8d99a6" stroke-width="2"/>'
    for k in range(8):
        a = k * math.pi / 4
        b += f'<line x1="{c}" y1="{c}" x2="{c + math.cos(a) * 76:.1f}" y2="{c + math.sin(a) * 76:.1f}" stroke="#ffffff" stroke-width="2" opacity="0.7"/>'
    pts = " ".join(f"{c + math.cos(k * math.pi / 4) * 40:.1f},{c + math.sin(k * math.pi / 4) * 40:.1f}" for k in range(8))
    b += f'<polygon points="{pts}" fill="#f7fbff" stroke="#b9c3cc" stroke-width="2" opacity="0.9"/>'
    b += f'<circle cx="{c - 26}" cy="{c - 28}" r="10" fill="#fff"/>'
    return svg(w, h, b)


def bar_stud():
    w, h = 120, 300
    b = f'<path d="M48,20 C30,90 30,200 60,280 L76,276 C50,200 52,95 70,24 Z" fill="url(#gold)" stroke="#6f4b14" stroke-width="2"/>'
    b += f'<path d="M56,40 C44,100 44,190 64,260" fill="none" stroke="#fff4cc" stroke-width="5" opacity="0.6" stroke-linecap="round"/>'
    b += bead(60, 22, 14)
    return svg(w, h, b)


def arc_points(w, top, depth, n, x0=None, x1=None, power=1.0):
    """Points along a U-shaped curve hanging from (x0,top) to (x1,top)."""
    x0 = x0 if x0 is not None else w * 0.08
    x1 = x1 if x1 is not None else w * 0.92
    pts = []
    for k in range(n):
        t = k / (n - 1)
        a = math.pi * t
        x = x0 + (x1 - x0) * (1 - math.cos(a)) / 2
        y = top + depth * (math.sin(a) ** power)
        pts.append((x, y, a))
    return pts


def choker():
    w, h = 1000, 640
    b = ""
    # band of kundan blocks
    pts = arc_points(w, 80, 230, 23, power=0.85)
    for i, (x, y, a) in enumerate(pts):
        p0 = pts[max(0, i - 1)]
        p1 = pts[min(len(pts) - 1, i + 1)]
        ang = math.degrees(math.atan2(p1[1] - p0[1], p1[0] - p0[0]))
        b += f'<g transform="rotate({ang:.1f} {x:.1f} {y:.1f})">'
        b += f'<rect x="{x - 24:.1f}" y="{y - 30:.1f}" width="48" height="60" rx="6" fill="url(#gold)" stroke="#6f4b14" stroke-width="2"/>'
        b += f'<rect x="{x - 16:.1f}" y="{y - 22:.1f}" width="32" height="44" rx="4" fill="url(#polki)"/>'
        b += "</g>"
        if i % 2 == 0:
            b += gem(x, y + 2, 7, "ruby", ring=False)
        # drop
        if 2 <= i <= len(pts) - 3:
            b += f'<line x1="{x:.1f}" y1="{y + 30:.1f}" x2="{x:.1f}" y2="{y + 56:.1f}" stroke="#a37a2c" stroke-width="2"/>'
            b += bead(x, y + 64, 9, "pearl")
            b += gem(x, y + 86, 8, "emerald" if i % 2 else "ruby", ring=False)
    # centre pendant
    cx, cy = w / 2, 80 + 230 + 70
    b += f'<path d="M{cx},{cy - 60} L{cx + 70},{cy} L{cx},{cy + 110} L{cx - 70},{cy} Z" fill="url(#gold)" stroke="#6f4b14" stroke-width="2"/>'
    b += gem(cx, cy + 5, 34, "polki")
    b += gem(cx, cy + 5, 14, "ruby", ring=False)
    for k in range(-3, 4):
        b += bead(cx + k * 18, cy + 120 + abs(k) * -4, 8, "pearl")
    # ties at the back
    b += f'<path d="M{pts[0][0]:.1f},{pts[0][1]:.1f} L{pts[0][0] - 30:.1f},{pts[0][1] - 60:.1f}" stroke="#7a1420" stroke-width="5"/>'
    b += f'<path d="M{pts[-1][0]:.1f},{pts[-1][1]:.1f} L{pts[-1][0] + 30:.1f},{pts[-1][1] - 60:.1f}" stroke="#7a1420" stroke-width="5"/>'
    return svg(w, h, b)


def rani_haar():
    w, h = 1000, 1100
    b = ""
    # three graduated strands of gold beads and polki
    for s, (depth, r) in enumerate([(420, 9), (560, 10), (700, 11)]):
        pts = arc_points(w, 40 + s * 12, depth, 60 + s * 8, x0=w * (0.12 + s * 0.02), x1=w * (0.88 - s * 0.02), power=1.25)
        d = "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y, _ in pts)
        b += f'<path d="{d}" fill="none" stroke="#a37a2c" stroke-width="3"/>'
        for i, (x, y, _) in enumerate(pts):
            if i % 2 == 0:
                b += bead(x, y, r, "pearl" if (i // 2) % 4 == 3 else "bead")
        # polki stations on the longest strand
        if s == 2:
            for i in range(6, len(pts) - 6, 9):
                x, y, _ = pts[i]
                b += gem(x, y, 14, "polki")
    # pendant
    cx, cy = w / 2, 40 + 24 + 700
    b += f'<ellipse cx="{cx}" cy="{cy + 70}" rx="90" ry="110" fill="url(#gold)" stroke="#6f4b14" stroke-width="2"/>'
    b += f'<ellipse cx="{cx}" cy="{cy + 70}" rx="66" ry="84" fill="url(#polki)"/>'
    b += gem(cx, cy + 70, 30, "emerald")
    for k in range(10):
        a = k * math.pi / 5
        b += gem(cx + math.cos(a) * 50, cy + 70 + math.sin(a) * 64, 9, "polki", ring=False)
    for k in range(-2, 3):
        x = cx + k * 34
        b += f'<line x1="{x}" y1="{cy + 170}" x2="{x}" y2="{cy + 215}" stroke="#a37a2c" stroke-width="2"/>'
        b += gem(x, cy + 232, 14, "emerald", ring=False)
    return svg(w, h, b)


def diamond_line():
    w, h = 1000, 620
    b = ""
    pts = arc_points(w, 60, 380, 64, power=1.1)
    d = "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y, _ in pts)
    b += f'<path d="{d}" fill="none" stroke="#c8ced6" stroke-width="6"/>'
    for i, (x, y, _) in enumerate(pts):
        r = 8 + 5 * math.sin(math.pi * i / (len(pts) - 1)) ** 4
        b += f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r + 3:.1f}" fill="#d9dee4" stroke="#8d99a6" stroke-width="1"/>'
        pts8 = " ".join(f"{x + math.cos(k * math.pi / 4 + 0.39) * r:.1f},{y + math.sin(k * math.pi / 4 + 0.39) * r:.1f}" for k in range(8))
        b += f'<polygon points="{pts8}" fill="url(#diamond)" stroke="#aab4be" stroke-width="0.8"/>'
        b += f'<path d="M{x - r * 0.6:.1f},{y:.1f} L{x:.1f},{y - r * 0.6:.1f} L{x + r * 0.6:.1f},{y:.1f} L{x:.1f},{y + r * 0.6:.1f} Z" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.9"/>'
        if i % 5 == 0:
            b += f'<path d="M{x:.1f},{y - r * 1.4:.1f} L{x:.1f},{y + r * 1.4:.1f} M{x - r * 1.4:.1f},{y:.1f} L{x + r * 1.4:.1f},{y:.1f}" stroke="#fff" stroke-width="1.2" opacity="0.85"/>'
    cx, cy = w / 2, 60 + 380 + 40
    b += f'<path d="M{cx},{cy - 24} L{cx + 26},{cy + 10} L{cx},{cy + 60} L{cx - 26},{cy + 10} Z" fill="url(#diamond)" stroke="#9aa5b1" stroke-width="2"/>'
    return svg(w, h, b)


pieces = {
    "temple-jhumka": jhumka(None, "bead"),
    "ruby-jhumka": jhumka("ruby", "pearl"),
    "panna-chandbali": chandbali(),
    "solitaire-studs": solitaire(),
    "petite-studs": bar_stud(),
    "kundan-choker": choker(),
    "polki-rani-haar": rani_haar(),
    "diamond-line": diamond_line(),
}
for name, s in pieces.items():
    with open(os.path.join(OUT, f"{name}.svg"), "w", encoding="utf-8") as f:
        f.write(s)
print("wrote", len(pieces))
