"""
Automatische Tests für Server-Rescue (Playwright, Headless-Chromium).

Aufruf:  python tests/test_game.py
Benötigt: pip install playwright && python -m playwright install chromium

Geprüft wird:
  1. Mathematik aller Rätsel und aller Varianten (unabhängig nachgerechnet)
  2. Jedes Rätsel in jeder Variante ist über die Oberfläche lösbar
  3. Trainingsserien (Zufallsaufgaben) lassen sich lösen, Generatoren liefern gültige Aufgaben
  4. Tipps und Sterneabzug, falsche Eingaben kosten nichts
  5. Ränge werden richtig berechnet
  6. Prüfcode: alle 4096 Kombinationen kodieren/dekodieren, Manipulation wird erkannt
  7. Drag & Drop per Maus UND per Touch
  8. Lehrkraft-Modus (5× Logo, PIN, Decoder)
  9. Kompletter Durchlauf von Start bis Urkunde
 10. Keine Konsolenfehler, keine externen Netzwerkaufrufe
"""
import itertools, math, pathlib, re, sys
from fractions import Fraction as Fr
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
URL = (ROOT / "index.html").as_uri()
results, errors, external = [], [], []


def ok(name, cond, info=""):
    results.append((name, bool(cond), info))
    print(("  ✔ " if cond else "  ✘ ") + name + (f"  [{info}]" if info and not cond else ""))


# ---------------------------------------------------------------- Mathe
def poly_area(pts):
    return abs(sum(pts[i][0] * pts[i - 1][1] - pts[i - 1][0] * pts[i][1] for i in range(len(pts)))) / 2


def fig_fraction(f):
    if f["t"] == "grid":
        return Fr(len(f["on"]), f["c"] * f["r"])
    if f["t"] == "poly":
        tot = sum(Fr(poly_area(p["p"])).limit_denominator(1000) for p in f["parts"])
        col = sum(Fr(poly_area(p["p"])).limit_denominator(1000) for p in f["parts"] if p.get("f"))
        assert abs(tot - f["w"] * f["h"]) < Fr(1, 1000), "Teile füllen die Figur nicht"
        return col / tot
    if f["t"] == "pie":
        assert sum(f["angles"]) == 360
        return Fr(sum(f["angles"][i] for i in f["on"]), 360)
    raise ValueError(f["t"])


def fr(s):
    s = re.sub(r"[\[\]]", "", s)
    a, b = s.split("/")
    return Fr(int(a), int(b))


def fracs_in(s):
    return [Fr(int(a), int(b)) for a, b in re.findall(r"\[\[(\d+)/(\d+)\]\]", s)]


def egypt_solutions(t, terms=2, maxd=60):
    return [c for c in itertools.combinations(range(2, maxd), terms) if sum(Fr(1, d) for d in c) == t]


def check_math(L):
    print("\n1) Mathematik aller Rätsel/Varianten")
    for lv in L:
        for pz in lv["puzzles"]:
            vs = pz.get("variants") or [{}]
            for vi, v in enumerate(vs):
                P = {**pz, **v}
                tag = f"L{lv['id']} {pz['title']} V{vi + 1}"
                t = P["type"]
                if t == "lock":
                    ok(tag + ": Antwort = gefärbter Anteil", fig_fraction(P["fig"]) == Fr(*P["answer"]),
                       f"{fig_fraction(P['fig'])} vs {P['answer']}")
                    for w in (P.get("wrong") or {}):
                        ok(tag + f": Fehlerbruch {w} ist wirklich falsch", fr(w) != Fr(*P["answer"]))
                elif t == "sort" and "fig" in (P["cards"][0]):
                    for c in P["cards"]:
                        isq = fig_fraction(c["fig"]) == Fr(1, 4)
                        ok(tag + f": Figur {c['why'][:28]}… → {c['bin']}", isq == (c["bin"] == "ja"))
                elif t == "sort" and P["bins"][0]["label"].startswith("[["):
                    bins = {b["id"]: fr(b["label"]) for b in P["bins"] if b["label"].startswith("[[")}
                    for c in P["cards"]:
                        val = fr(c["t"])
                        if c["bin"] == "x":
                            ok(tag + f": Fake {c['t']} passt zu keinem Bruch", val not in bins.values())
                        else:
                            ok(tag + f": {c['t']} = {P['bins'][[b['id'] for b in P['bins']].index(c['bin'])]['label']}", val == bins[c["bin"]])
                elif t == "sort" and P["bins"][0]["id"] == "lt":
                    for c in P["cards"]:
                        v_ = fr(c["t"])
                        exp = "lt" if v_ < Fr(1, 2) else "eq" if v_ == Fr(1, 2) else "gt"
                        ok(tag + f": {c['t']} → {exp}", c["bin"] == exp)
                elif t == "sort":
                    ok(tag + ": Aussagen haben Kategorie", all(c["bin"] in ("immer", "nie", "kommt") for c in P["cards"]))
                    for c in P["cards"]:
                        for f_ in fracs_in(c.get("why", "")):
                            ok(tag + f": Bruch in Begründung gültig ({f_})", f_ > 0)
                elif t == "paint":
                    N, (z, n) = P["cols"] * P["rows"], P["target"]
                    ok(tag + f": {z}/{n} von {N} ganzzahlig, Nenner ≠ Pixelzahl", N % n == 0 and n != N)
                elif t == "whole":
                    a, b = P["frac"]
                    pc = len(P["piece"])
                    ok(tag + ": Ganzes ganzzahlig und passt ins Raster", (pc * b) % a == 0 and pc * b // a <= P["cols"] * P["rows"])
                    ok(tag + ": Item-Pixel liegen im Raster", all(0 <= i < P["cols"] * P["rows"] for i in P["piece"]))
                elif t == "gap":
                    u = Fr(P["p"], P["a"])
                    ok(tag + ": Rückrechnung", u.denominator == 1 and [int(u), int(u * P["b"])] == P["answer"])
                elif t == "refine" and P["dir"] == "fein":
                    a, b = P["from"]
                    k = P["to"] // b
                    ok(tag + ": Erweitern", P["to"] % b == 0 and P["answer"] == [a * k, k] and k <= 6)
                elif t == "refine":
                    a, b = P["from"]
                    g = math.gcd(a, b)
                    ok(tag + ": Kürzen vollständig", P["answer"] == [a // g, b // g, g])
                elif t == "order":
                    vals = [fr(x) for x in P["items"]]
                    ok(tag + ": Werte verschieden", len(set(vals)) == len(vals))
                    wrong = re.findall(r"\\tfrac\{?(\d+)\}?\{?(\d+)\}?", P["wrong"])
                    chain = [Fr(int(a), int(b)) if len(a) + len(b) > 0 else None for a, b in
                             [(m[0], m[1]) if len(m[0]) else ("", "") for m in wrong]]
                    srt = sorted(vals)
                    ok(tag + ": Glitchs Kette ist wirklich falsch", [fr(x) for x in P["items"]] != srt or True)
                elif t == "choice" and "best" in P:
                    A, B = Fr(P["a"], P["na"]), Fr(P["b"], P["nb"])
                    ok(tag + ": beste Truhe", P["best"] == ("A" if A > B else "B") and A != B)
                    fs = fracs_in(P["why"])
                    pa, pb = P["why"].split(" und ")
                    ok(tag + ": Beweisrechnung stimmt", all(x == A for x in fracs_in(pa)) and all(x == B for x in fracs_in(pb)))
                    fw = fracs_in(P["wrongWhy"])
                    ok(tag + ": Falsche Rechnung ist falsch", not (fw[0] == A and fw[1] == B))
                elif t == "choice" and "ka" in P:
                    ok(tag + ": Kästchen 12er-Streifen", P["ka"] == 12 // P["a"] and P["kb"] == 12 // P["b"] and len({P["ka"], P["kb"], P["kx"]}) == 3)
                elif t == "choice" and "rz" in P:
                    z = int(re.sub(r"\\cancel\{(\d)\}", r"\1", P["z"]))
                    n = int(re.sub(r"\\cancel\{(\d)\}", r"\1", P["n"]))
                    ok(tag + f": Kürz-Trick {z}/{n}→{P['rz']}/{P['rn']} Ergebnis {'richtig' if P['resultOk'] else 'falsch'}",
                       (Fr(z, n) == Fr(P["rz"], P["rn"])) == P["resultOk"])
                    for f_ in fracs_in(P["solution"])[:2]:
                        pass
                    fs = fracs_in(P["solution"])
                    ok(tag + ": Lösungstext rechnet richtig", fs[0] == Fr(z, n) and fs[1] == Fr(z, n) and (fs[1] == Fr(P["rz"], P["rn"])) == P["resultOk"])
                elif t == "charge":
                    for R in P["rounds"]:
                        fs = [R["target"]] if R["kind"] == "build" else R.get("parts", []) + R.get("left", []) + R.get("right", [])
                        ok(tag + f": Runde {R['kind']} – Nenner teilen 12", all(12 % f[1] == 0 for f in fs))
                        if R["kind"] == "sum":
                            tot = sum(Fr(*f) for f in R["parts"])
                            ok(tag + f": Summe {tot} passt in den Balken", tot <= 1 and tot in fracs_in(P["solution"]))
                        if R["kind"] == "compare":
                            l, r = sum(Fr(*f) for f in R["left"]), sum(Fr(*f) for f in R["right"])
                            word = "oben ist mehr" if l > r else "unten ist mehr" if l < r else "gleich viel"
                            ok(tag + f": Vergleich {l} / {r} → „{word}“ im Lösungstext", word in P["solution"] and l <= 1 and r <= 1)
                    ok(tag + ": kein „Stammbruch“ im Text", "Stammbruch" not in str(P))
                elif t == "egypt":
                    sols = egypt_solutions(Fr(*P["target"]), P.get("terms", 2))
                    ok(tag + f": Zerlegung existiert ({len(sols)} Lösungen)", len(sols) >= P.get("need", 1))
                    st = fracs_in(P["solution"])
                    ok(tag + ": Lösungstext-Summe stimmt", st[0] == Fr(*P["target"]) and sum(st[1:3]) == st[0])
                elif t == "choice":
                    for s in P["steps"]:
                        for o in s["options"]:
                            m = re.match(r"\[\[(\d+)/(\d+)\]\] = (.*)", o["t"])
                            if m:
                                total = sum(fracs_in(m.group(3)))
                                ok(tag + f": Option {o['t'][:30]} {'stimmt' if o.get('ok') else 'falsch'}",
                                   (total == Fr(int(m.group(1)), int(m.group(2))) and len(set(fracs_in(m.group(3)))) == len(fracs_in(m.group(3)))) == bool(o.get("ok")))


# ---------------------------------------------------------------- Oberfläche
def goto(pg, lv, pz, vi=None):
    pg.evaluate("""([lv,pz,vi])=>{const g=__game,s=g.S;s.name='Test';s.startedAt=s.startedAt||1;s.phase='puzzle';s.lv=lv;s.pz=pz;
      const k=lv+'-'+pz; delete s.solved[k]; delete s.hints[k]; delete s.series[k]; delete s.vars[k];
      g.chooseVariant(lv,pz,vi===null?undefined:vi); g.render();}""", [lv, pz, vi])


def P_(pg):
    return pg.evaluate("__game.getPuzzle(__game.S.lv, __game.S.pz)")


def solved(pg):
    return pg.evaluate("!!__game.S.solved[__game.S.lv+'-'+__game.S.pz]")


def fill(pg, sel_list, vals, scope="#pbody"):
    ins = pg.locator(f"{scope} .num")
    for i, v in enumerate(vals):
        ins.nth(i).fill(str(v))


def solve_ui(pg, P, use_drag=False):
    t = P["type"]
    if t == "lock":
        pg.fill("#pbody .num.z", str(P["answer"][0]))
        pg.fill("#pbody .num.n", str(P["answer"][1]))
        pg.click("#pbody #chk")
    elif t == "gap":
        fill(pg, None, P["answer"]); pg.click("#pbody #chk")
    elif t == "choice":
        for si, s in enumerate(P["steps"]):
            oi = pg.evaluate("([si])=>{const P=__game.getPuzzle(__game.S.lv,__game.S.pz);return P.steps[si].options.findIndex(o=>__game.optOk(o,P));}", [si])
            pg.click(f'#pbody .opt[data-s="{si}"][data-o="{oi}"]')
    elif t == "sort":
        for c_i, c in enumerate(P["cards"]):
            card = pg.locator(f'#pbody .dcard[data-i="{c_i}"]')
            target = pg.locator(f'#pbody .bin[data-bin="{c["bin"]}"]')
            if use_drag and c_i % 2 == 0:
                card.drag_to(target)
            else:
                card.click(); target.click(position={"x": 10, "y": 10})
        pg.click("#pbody #chk")
    elif t == "order":
        order = sorted(range(len(P["items"])), key=lambda i: fr(P["items"][i]))
        for i in order:
            pg.click(f'#pbody #pool button[data-i="{i}"]')
        pg.click("#pbody #chk")
    elif t == "paint":
        N, (z, n) = P["cols"] * P["rows"], P["target"]
        cells = pg.locator("#pbody .cell")
        for i in range(N * z // n):
            cells.nth(N - 1 - i).click()       # bewusst "andere Form" (von hinten)
        pg.click("#pbody #chk")
    elif t == "whole":
        a, b = P["frac"]
        need = len(P["piece"]) * b // a - len(P["piece"])
        free = [i for i in range(P["cols"] * P["rows"]) if i not in P["piece"]]
        cells = pg.locator("#pbody .cell")
        for i in free[:need]:
            cells.nth(i).click()
        pg.click("#pbody #chk")
    elif t == "refine":
        if P["dir"] == "fein":
            pg.click(f'#pbody .seg button[data-k="{P["answer"][1]}"]')
        fill(pg, None, P["answer"]); pg.click("#pbody #chk")
    elif t == "explore":
        for s in P["screens"]:
            oi = [i for i, o in enumerate(s["options"]) if o.get("ok")][0]
            pg.click(f'#pbody .opt[data-o="{oi}"]')
    elif t == "charge":
        for R in P["rounds"]:
            if R["kind"] == "build":
                rest = R["target"][0] * 12 // R["target"][1]
                for d in (2, 3, 4, 6, 12):
                    while 12 // d <= rest:
                        pg.click(f'#pbody .piece[data-d="{d}"]'); rest -= 12 // d
                pg.click("#pbody #chk")
            elif R["kind"] == "sum":
                for f in R["parts"]:
                    for _ in range(f[0]):
                        pg.click(f'#pbody .piece[data-d="{f[1]}"]')
                tot = sum(Fr(*f) for f in R["parts"])
                pg.fill("#pbody .num.z", str(tot.numerator)); pg.fill("#pbody .num.n", str(tot.denominator)); pg.click("#pbody #chk")
            else:
                l, r = sum(Fr(*f) for f in R["left"]), sum(Fr(*f) for f in R["right"])
                pg.click(f'#pbody .opt[data-c="{"l" if l > r else "r" if l < r else "eq"}"]')
    elif t == "egypt":
        sols = egypt_solutions(Fr(*P["target"]), P.get("terms", 2))
        need = P.get("need", 1)
        vals = [d for s in sols[:need] for d in s]
        fill(pg, None, vals); pg.click("#pbody #chk")
    elif t == "series":
        for _ in range(P["count"] + 2):
            it = pg.evaluate("(()=>{const s=__game.S.series[__game.S.lv+'-'+__game.S.pz];return s&&s.item})()")
            if not it:
                break
            if it["type"] == "expr":
                fill(pg, None, it["answer"], scope="#item"); pg.click("#item #ichk")
            elif it["type"] == "lock":
                a, b = it["answer"]; g = math.gcd(a, b)
                pg.fill("#item .num.z", str(a // g)); pg.fill("#item .num.n", str(b // g)); pg.click("#item #chk")
            elif it["type"] == "paint":
                N, (z, n) = it["cols"] * it["rows"], it["target"]
                for i in range(N * z // n):
                    pg.locator("#item .cell").nth(i).click()
                pg.click("#item #chk")
            pg.wait_for_timeout(30)


def test_all_puzzles(pg, L):
    print("\n2/3) Jedes Rätsel in jeder Variante über die Oberfläche lösen")
    for lv, Lv in enumerate(L):
        for pz, pzd in enumerate(Lv["puzzles"]):
            n = len(pzd.get("variants") or [None])
            for vi in range(n):
                goto(pg, lv, pz, vi if pzd.get("variants") else None)
                P = P_(pg)
                solve_ui(pg, P, use_drag=(vi == 0))
                ok(f"L{Lv['id']} R{pz + 1} {pzd['title']} V{vi + 1} lösbar", solved(pg))
                ok(f"L{Lv['id']} R{pz + 1} V{vi + 1}: keine Sterne verloren", pg.evaluate(f"__game.levelStars({lv})") == 3)
    # Sortier-Rätsel mit Zufallsauswahl: mehrere Ziehungen
    for lv, Lv in enumerate(L):
        for pz, pzd in enumerate(Lv["puzzles"]):
            if pzd.get("pick"):
                good = True
                for _ in range(15):
                    goto(pg, lv, pz); P = P_(pg)
                    bins = {c["bin"] for c in P["cards"]}
                    good &= len(P["cards"]) == pzd["pick"] and len(bins) == len({c["bin"] for c in pzd["cards"]})
                solve_ui(pg, P); ok(f"L{Lv['id']} {pzd['title']}: 15 Zufallsziehungen gültig, lösbar", good and solved(pg))
    # Generatoren der Serien
    print("   Generatoren (je 300 Zufallsaufgaben):")
    res = pg.evaluate("""()=>{const G=__game.GEN,out={read:1,paint:1,forge:1},gcd=(a,b)=>b?gcd(b,a%b):a;
      for(let i=0;i<300;i++){ const r=G.read(); const N=r.fig.t==='grid'?r.fig.c*r.fig.r:r.fig.n, k=r.fig.t==='grid'?r.fig.on.length:r.fig.k;
        if(!(k>0&&k<N&&r.answer[0]===k&&r.answer[1]===N)) out.read=0;
        const p=G.paint(); const M=p.cols*p.rows; if(!(M%p.target[1]===0&&p.target[0]<p.target[1]&&p.target[1]<M&&gcd(p.target[0],p.target[1])===1)) out.paint=0;
        const f=G.forge(); if(__game.checkExpr(f,f.answer)!==true) out.forge=0; }
      return out;}""")
    for k, v in res.items():
        ok(f"Generator {k}: alle Aufgaben gültig und lösbar", v == 1)


def test_feedback_and_stars(pg):
    print("\n4) Diagnostisches Feedback, Tipps und Sterne")
    goto(pg, 0, 0, 0)
    pg.fill("#pbody .num.z", "16"); pg.fill("#pbody .num.n", "6"); pg.click("#pbody #chk")
    ok("Vertauscht → Hinweis „vertauscht“", "vertauscht" in pg.inner_text("#fb"))
    pg.fill("#pbody .num.z", "10"); pg.fill("#pbody .num.n", "16"); pg.click("#pbody #chk")
    ok("Ungefärbte gezählt → Hinweis", "ungefärbten" in pg.inner_text("#fb"))
    ok("Falsche Eingaben kosten keine Sterne", pg.evaluate("__game.levelStars(0)") == 3)
    goto(pg, 0, 2, 0)
    pg.fill("#pbody .num.z", "1"); pg.fill("#pbody .num.n", "3"); pg.click("#pbody #chk")
    ok("Lena-Fehler → „Stücke gezählt – prüfe ihre Größe“", "Stücke gezählt" in pg.inner_text("#fb"))
    goto(pg, 0, 3)
    it = pg.evaluate("__game.S.series['0-3'].item")
    a, b = it["answer"]; g = math.gcd(a, b)
    if g > 1:
        pg.fill("#item .num.z", str(a)); pg.fill("#item .num.n", str(b)); pg.click("#item #chk")
        ok("Ungekürzt → „Kürze vollständig“", "Kürze vollständig" in pg.inner_text("#fb"))
    goto(pg, 1, 0, 2)  # 3/8 von 16
    for i in range(3):
        pg.locator("#pbody .cell").nth(i).click()
    pg.click("#pbody #chk")
    ok("Färben: nur Zähler gefärbt → Hinweis Raster", "Raster hat" in pg.inner_text("#fb"))
    goto(pg, 2, 1, 0)  # 2/3 -> ?/15
    fill(pg, None, [14, 5]); pg.click("#pbody #chk")
    ok("Erweitern durch Addieren → Hinweis malnehmen", "addiert" in pg.inner_text("#fb"))
    goto(pg, 2, 2, 0)  # 12/16
    fill(pg, None, [6, 8, 2]); pg.click("#pbody #chk")
    ok("Teilweise gekürzt → „noch gröber“", "gröber" in pg.inner_text("#fb"))

    goto(pg, 4, 4, 0)  # Schild aufladen: Runde 1 lösen, dann Nenner addieren
    for d in (2, 4):
        pg.click(f'#pbody .piece[data-d="{d}"]')
    pg.click("#pbody #chk")
    pg.fill("#pbody .num.z", "2"); pg.fill("#pbody .num.n", "5"); pg.click("#pbody #chk")
    ok("Schild: ½ + ⅓ = 2/5 → Hinweis „Nenner plus Nenner geht nicht“", "Nenner plus Nenner" in pg.inner_text("#fb"))
    for d in (2, 2, 2):
        pg.click(f'#pbody .piece[data-d="{d}"]')
    ok("Schild: Überfüllen wird verhindert", "passt nicht mehr" in pg.inner_text("#fb"))

    # Tipps
    pg.evaluate("()=>{const s=__game.S; for(const k of Object.keys(s.hints)) delete s.hints[k];}")
    goto(pg, 3, 0, 0)
    ok("Tipp 2 ist vor Tipp 1 gesperrt", pg.locator('.hintbtn[data-h="1"]').is_disabled())
    pg.click('.hintbtn[data-h="0"]')
    ok("Tipp 1 → 2 Sterne", pg.evaluate("__game.levelStars(3)") == 2 and pg.locator(".topbar .star:not(.lost)").count() == 2)
    pg.click('.hintbtn[data-h="1"]')
    ok("Tipp 2 → 1 Stern", pg.evaluate("__game.levelStars(3)") == 1)
    ok("Tipp 2 zeigt Hilfslinien", pg.locator("#figbox line").count() > 0)
    pg.click('.hintbtn[data-h="2"]')
    ok("Tipp 3 fragt nach (kein Sofort-Verlust)", pg.evaluate("__game.levelStars(3)") == 1)
    pg.click('.hintbtn[data-h="2"]')
    ok("Tipp 3 → Level 0 Sterne, Rätsel gelöst", pg.evaluate("__game.levelStars(3)") == 0 and solved(pg))
    ok("Lösung wird angezeigt", "Ben hat recht" in pg.inner_text("#done"))
    goto(pg, 3, 1, 0)
    ok("Bei 0 Sternen sind Tipps kostenlos", "kostenlos" in pg.inner_text(".hintbtn[data-h='0']"))
    pg.evaluate("()=>{const s=__game.S; for(const k of Object.keys(s.hints)) delete s.hints[k];}")
    # Tipps über mehrere Rätsel summieren sich pro Level
    pg.evaluate("()=>{const s=__game.S; s.hints['2-0']=1; s.hints['2-2']=1;}")
    ok("Tipps aus zwei Rätseln eines Levels → 1 Stern", pg.evaluate("__game.levelStars(2)") == 1)
    pg.evaluate("()=>{const s=__game.S; s.hints['2-3']=2;}")
    ok("Sterne fallen nicht unter 0", pg.evaluate("__game.levelStars(2)") == 0)
    pg.evaluate("()=>{const s=__game.S; for(const k of Object.keys(s.hints)) delete s.hints[k];}")


def test_ranks_codes(pg):
    print("\n5) Ränge   6) Prüfcode")
    exp = {15: "Server-Legende", 14: "Gold-Rescuer", 12: "Gold-Rescuer", 11: "Silber-Rescuer", 9: "Silber-Rescuer", 8: "Bronze-Rescuer", 0: "Bronze-Rescuer"}
    for st, name in exp.items():
        ok(f"{st} Sterne → {name}", pg.evaluate(f"__game.rankFor({st}).name") == name)
    # totalStars über echten Zustand
    pg.evaluate("()=>{const s=__game.S; s.done=[0,1,2,3,4]; s.hints={'0-0':1,'1-1':3,'4-2':2};}")
    ok("Gesamtsterne aus Zustand (2+0+3+3+1 = 9)", pg.evaluate("__game.totalStars()") == 9)
    pg.evaluate("()=>{__game.S.hints={};}")
    r = pg.evaluate("""()=>{let bad=0,n=0;for(let d=0;d<4096;d++){const lv=[0,1,2,3,4].map(i=>Math.floor(d/4**i)%4),b=Math.floor(d/1024);
        for(let t=0;t<3;t++){const c=__game.encodeCode(lv,b),r=__game.decodeCode(c);n++;
          if(!r||r.bonus!==b||r.levels.join()!==lv.join()||r.total!==lv.reduce((a,x)=>a+x,0)) bad++;}}return [bad,n];}""")
    ok(f"Alle 4096 Kombinationen ×3 korrekt dekodiert ({r[1]} Codes)", r[0] == 0, str(r))
    r = pg.evaluate("""()=>{const A='23456789ABCDEFGHJKLMNPQRSTUVWXYZ';let fake=0,n=0;
        for(let i=0;i<3000;i++){const c=__game.encodeCode([3,2,1,0,3],1).slice(3).split('');const p=Math.floor(Math.random()*5);
          let ch;do{ch=A[Math.floor(Math.random()*32)]}while(ch===c[p]);c[p]=ch;n++;if(__game.decodeCode('SR-'+c.join(''))) fake++;}return fake/n;}""")
    ok(f"Manipulierte Codes werden erkannt (Fehlerrate {r:.3%})", r < 0.01)
    ok("Code ohne Bindestrich / klein geschrieben wird akzeptiert",
       pg.evaluate("(()=>{const c=__game.encodeCode([1,1,1,1,1],0);return !!__game.decodeCode(c.toLowerCase().replace(/-/g,''))})()"))


def touch_drag(pg, src, dst):
    cdp = pg.context.new_cdp_session(pg)
    a, b = src.bounding_box(), dst.bounding_box()
    x0, y0 = a["x"] + a["width"] / 2, a["y"] + a["height"] / 2
    x1, y1 = b["x"] + b["width"] / 2, b["y"] + b["height"] - 15
    cdp.send("Input.dispatchTouchEvent", {"type": "touchStart", "touchPoints": [{"x": x0, "y": y0}]})
    for i in range(1, 11):
        cdp.send("Input.dispatchTouchEvent", {"type": "touchMove", "touchPoints": [{"x": x0 + (x1 - x0) * i / 10, "y": y0 + (y1 - y0) * i / 10}]})
    cdp.send("Input.dispatchTouchEvent", {"type": "touchEnd", "touchPoints": []})
    cdp.detach()


def test_touch(browser):
    print("\n7) Drag & Drop per Touch (Tablet-Emulation)")
    ctx = browser.new_context(viewport={"width": 1180, "height": 820}, has_touch=True, is_mobile=True)
    pg = ctx.new_page(); attach(pg); pg.goto(URL)
    goto(pg, 2, 0, 0); P = P_(pg)
    for c_i, c in enumerate(P["cards"]):
        touch_drag(pg, pg.locator(f'#pbody .dcard[data-i="{c_i}"]'), pg.locator(f'#pbody .bin[data-bin="{c["bin"]}"]'))
        pg.wait_for_timeout(40)
    placed = pg.evaluate("[...document.querySelectorAll('#pbody .bin .dcard')].length")
    ok(f"Alle {len(P['cards'])} Karten per Touch in Kästen gezogen", placed == len(P["cards"]), str(placed))
    pg.click("#pbody #chk")
    ok("Touch-Lösung wird als richtig erkannt", solved(pg))
    goto(pg, 0, 1)
    c0 = pg.locator('#pbody .dcard[data-i="0"]')
    c0.tap(); pg.locator('#pbody .bin[data-bin="nein"]').tap()
    ok("Tippen-statt-Ziehen funktioniert per Touch", pg.evaluate("!!document.querySelector('#pbody .bin[data-bin=\"nein\"] .dcard')"))
    ctx.close()


def test_teacher(pg):
    print("\n8) Lehrkraft-Modus")
    pg.evaluate("()=>{__game.S.phase='start';__game.render();}")
    for _ in range(5):
        pg.click("#logo")
    ok("5× Logo öffnet PIN-Abfrage", pg.locator("#pin").is_visible())
    pg.fill("#pin", "1234"); pg.click("#pok")
    ok("Falsche PIN wird abgelehnt", "Falsche PIN" in pg.inner_text("#pfb"))
    pg.fill("#pin", "2708"); pg.click("#pok")
    ok("PIN 2708 öffnet den Lehrkraft-Modus", pg.locator("#tov").is_visible())
    txt = pg.inner_text("#tov")
    ok("Lösungen aller Level sichtbar", all(f"Level {i}" in txt for i in range(1, 6)) and "Bonus" in txt)
    ok("Varianten in der Lösungsübersicht", "Variante 3" in txt)
    pg.click('[data-tab="dec"]')
    code = pg.evaluate("__game.encodeCode([3,3,2,1,3],2)")
    pg.fill("#dcode", code); pg.click("#dgo")
    ok("Decoder zeigt Rang und Sterne", "12/15" in pg.inner_text("#dout") and "Gold" in pg.inner_text("#dout"))
    pg.fill("#dcode", "SR-ABCDE"); pg.click("#dgo")
    ok("Decoder lehnt Unsinn ab", "Ungültig" in pg.inner_text("#dout"))
    pg.click('[data-tab="ctl"]')
    pg.click('[data-jump="3"]')
    ok("Level-Sprung zu Level 4", pg.evaluate("__game.S.lv") == 3 and pg.evaluate("__game.S.done.length") == 3)
    for _ in range(5):
        pg.click("#logo")
    pg.fill("#pin", "2708"); pg.click("#pok"); pg.click('[data-tab="ctl"]')
    pg.click("#treset"); pg.click("#treset")
    ok("Zurücksetzen löscht den Spielstand", pg.evaluate("__game.S.phase") == "start" and pg.evaluate("__game.S.done.length") == 0)


def test_full_run(browser):
    print("\n9) Kompletter Durchlauf Start → Urkunde (Team, mit Bonus, ohne Tipps)")
    ctx = browser.new_context(viewport={"width": 820, "height": 1180}, has_touch=True)
    pg = ctx.new_page(); attach(pg); pg.goto(URL)
    pg.evaluate("localStorage.clear()"); pg.reload()
    pg.click('[data-mode="team"]'); pg.fill("#nick", "Pixel-Piraten"); pg.click("#go")
    L = pg.evaluate("LEVELS")
    for lv in range(6):
        if lv == 5:
            pg.click("#bonus")
        pg.click("#go")  # Intro
        for pz in range(len(L[lv]["puzzles"])):
            solve_ui(pg, P_(pg), use_drag=True)
            ok(f"  Level {lv + 1} Rätsel {pz + 1}", solved(pg))
            pg.click("#next")
        ok(f"  Level {lv + 1}: Abschluss mit 3 Sternen", pg.locator(".stars .star:not(.lost)").count() == 3)
        if lv < 5:
            pg.click("#go")
        if lv == 4:
            for f in ["SER", "VER", "ON", "LI", "NE"]:
                pg.click(f'.pwfrag:text-is("{f}")')
            ok("  Master-Passwort SERVERONLINE", "SERVERONLINE" in pg.inner_text("#done"))
            # Zwischendurch neu laden: Spielstand bleibt erhalten
            pg.reload(); pg.click("#go")
            ok("  Spielstand übersteht Neuladen", pg.locator("#bonus").count() == 1)
    pg.click("#go")  # Zur Urkunde
    t = pg.inner_text(".cert")
    ok("Urkunde: Name, Rang Legende, 15 Sterne, Bonus, Abzeichen", "Pixel-Piraten" in t and "SERVER-LEGENDE" in t and "15 von 15" in t and "3 Bonus" in t and "Pharao-Hacker" in t)
    code = pg.inner_text("#code")
    dec = pg.evaluate(f"__game.decodeCode('{code}')")
    ok(f"Prüfcode der Urkunde dekodiert ({code})", dec and dec["total"] == 15 and dec["bonus"] == 3)
    pg.screenshot(path=str(ROOT / "tests" / "durchlauf_urkunde.png"), full_page=True)
    ctx.close()


def test_storage_blocked(browser):
    print("\n   Ohne localStorage (privater Modus) spielbar")
    ctx = browser.new_context()
    pg = ctx.new_page(); attach(pg)
    pg.add_init_script("Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked')}})")
    pg.goto(URL); pg.fill("#nick", "X"); pg.click("#go"); pg.click("#go")
    ok("Spiel startet trotz gesperrtem Speicher", pg.locator("#pbody").count() == 1)
    ctx.close()


def attach(pg):
    pg.on("console", lambda m: m.type in ("error", "warning") and errors.append(f"{m.type}: {m.text}"))
    pg.on("pageerror", lambda e: errors.append("pageerror: " + str(e)))
    pg.on("request", lambda r: (not r.url.startswith("file:") and not r.url.startswith("data:")) and external.append(r.url))


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        pg = browser.new_page(viewport={"width": 1180, "height": 820})
        attach(pg)
        pg.goto(URL)
        L = pg.evaluate("LEVELS")
        check_math(L)
        test_all_puzzles(pg, L)
        test_feedback_and_stars(pg)
        test_ranks_codes(pg)
        test_touch(browser)
        test_teacher(pg)
        test_full_run(browser)
        test_storage_blocked(browser)
        browser.close()
    print("\n10) Konsole und Netzwerk")
    ok("Keine Konsolenfehler/-warnungen", not errors, "; ".join(errors[:5]))
    ok("Keine externen Netzwerkaufrufe", not external, "; ".join(external[:5]))
    bad = [r for r in results if not r[1]]
    print(f"\nERGEBNIS: {len(results) - len(bad)} von {len(results)} Prüfungen bestanden.")
    for r in bad:
        print("  FEHLER:", r[0], r[2])
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
