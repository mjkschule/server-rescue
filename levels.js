/* =====================================================================
   SERVER-RESCUE – Inhalte (Texte, Zahlen, Varianten)
   ---------------------------------------------------------------------
   Hier kannst du Texte und Zahlen ändern, ohne die Spiel-Logik anzufassen.

   Schreibweise in Texten:
     [[3/4]]   → gestapelter Bruch (KaTeX)
     $...$     → beliebiger KaTeX-Ausdruck, z. B. $\tfrac{1}{2} < \tfrac{2}{3}$
     **fett**  → fett

   Rätsel-Typen: lock (Zahlenschloss), gap (Lückenrechnung), choice (Begründung
   wählen), sort (Drag & Drop in Kästen), order (ordnen), paint (färben),
   whole (das Ganze färben), refine (verfeinern/vergröbern), series
   (Trainingsserie mit Zufallsaufgaben), explore (System-Info), egypt
   (Stammbruch-Zerlegung).

   "variants": Pro Spiel wird zufällig EINE Variante gewählt; ihre Felder
   überschreiben die Grundwerte des Rätsels.
   ===================================================================== */

/* PIN für den Lehrkraft-Modus (5× auf das Logo tippen) */
const LEHRER_PIN = "2708";

/* Ränge: ab wie vielen Sternen (von 15) */
const RAENGE = [
  { min: 15, name: "Server-Legende", medal: "legend",
    text: "Unglaublich: alle Sterne, keine Hilfe! Glitch hat keine Chance gegen dich. Du bist eine echte Server-Legende." },
  { min: 12, name: "Gold-Rescuer", medal: "gold",
    text: "Stark! Du hast Glitchs Fallen fast ohne Hilfe durchschaut. Anteile, Kürzen, Erweitern und Vergleichen – du hast den Durchblick." },
  { min: 9, name: "Silber-Rescuer", medal: "silver",
    text: "Sehr gut! Du hast den Server mit wenig Hilfe gerettet. Mit etwas Training holst du dir beim nächsten Mal Gold." },
  { min: 0, name: "Bronze-Rescuer", medal: "bronze",
    text: "Server gerettet! Du hast alle fünf Firewalls geknackt und nicht aufgegeben. Genau so geht Training: dranbleiben!" }
];

const STORY = {
  title: "Server gesperrt!",
  intro: [
    "Der Hacker **Glitch** hat euren Lieblings-Gameserver gesperrt und die Spielwelt in Bruchstücke zerlegt.",
    "Als **Rescue-Team** knackt ihr fünf Firewalls. Jede gibt ein Code-Fragment frei.",
    "Am Ende setzt ihr das Master-Passwort zusammen – und der Server läuft wieder."
  ],
  password: "SERVERONLINE",
  teamRule: "Erst diskutieren, dann tippt **ein:e Pilot:in** ein. Wechselt die Pilot:in in jedem Level."
};

/* ---------- Figuren-Bausteine (für die Viertel-Prüfung) ---------- */
const FIG = {
  quadA:  { t: "grid", c: 2, r: 2, on: [1] },
  diagE:  { t: "poly", w: 4, h: 4, parts: [
            { p: [[0,4],[4,4],[2,2]], f: 1 }, { p: [[0,0],[4,0],[2,2]] },
            { p: [[0,0],[0,4],[2,2]] }, { p: [[4,0],[4,4],[2,2]] } ] },
  splitF: { t: "grid", c: 4, r: 2, on: [0, 6] },
  trickG: { t: "poly", w: 4, h: 4, parts: [
            { p: [[0,0],[2,0],[2,2],[0,2]], f: 1 }, { p: [[2,0],[4,0],[4,2],[2,2]] },
            { p: [[0,2],[1,2],[1,4],[0,4]] }, { p: [[1,2],[4,2],[4,4],[1,4]] } ] },
  stripB: { t: "poly", w: 4, h: 2, parts: [
            { p: [[0,0],[0.5,0],[0.5,2],[0,2]], f: 1 }, { p: [[0.5,0],[1.5,0],[1.5,2],[0.5,2]] },
            { p: [[1.5,0],[2.5,0],[2.5,2],[1.5,2]] }, { p: [[2.5,0],[4,0],[4,2],[2.5,2]] } ] },
  pieD:   { t: "pie", angles: [55, 95, 100, 110], on: [0] },
  rowsH:  { t: "poly", w: 4, h: 4, parts: [
            { p: [[0,0],[4,0],[4,1],[0,1]] }, { p: [[0,1],[4,1],[4,2.5],[0,2.5]], f: 1 },
            { p: [[0,2.5],[4,2.5],[4,3.2],[0,3.2]] }, { p: [[0,3.2],[4,3.2],[4,4],[0,4]] } ] },
  pieI:   { t: "pie", angles: [125, 80, 80, 75], on: [0] }
};

const LEVELS = [
/* =================================================================== */
{
  id: 1, name: "Login-Lobby", topic: "Anteile ablesen", fragment: "SER", afb: "I–II",
  intro: "Glitch hat die Skins der Lobby umgefärbt. Lest die Anteile genau ab – aber Vorsicht: Nicht alle Teile sind gleich groß!",
  team: "Pilot:in für Level 1 wählen. Die anderen zählen mit und prüfen.",
  puzzles: [
    {
      type: "lock", title: "Skin-Scan",
      text: "Glitch hat einen Skin umgefärbt. Welcher Anteil des Skins ist **orange**?",
      mode: "equiv",
      variants: [
        { fig: { t: "grid", c: 4, r: 4, on: [1, 2, 4, 7, 13, 14], color: "o" }, answer: [6, 16],
          solution: "16 gleich große Pixel, 6 davon orange: [[6/16]] (gekürzt [[3/8]])." },
        { fig: { t: "grid", c: 4, r: 3, on: [0, 3, 5, 6, 9], color: "o" }, answer: [5, 12],
          solution: "12 gleich große Pixel, 5 davon orange: [[5/12]]." },
        { fig: { t: "grid", c: 5, r: 4, on: [0, 4, 6, 8, 11, 13, 15, 19], color: "o" }, answer: [8, 20],
          solution: "20 gleich große Pixel, 8 davon orange: [[8/20]] (gekürzt [[2/5]])." }
      ],
      hints: [
        "In wie viele **gleich große** Pixel ist der Skin geteilt? Das ist der Nenner. Der Zähler zählt die orangen Pixel.",
        "Beispiel: Ein Skin mit 8 Pixeln, 3 davon orange → 3 von 8 → [[3/8]] (drei Achtel)."
      ]
    },
    {
      type: "sort", title: "Viertel-Check",
      text: "Glitch behauptet: „Überall ist ein Viertel gefärbt.“ Ziehe jede Figur in den richtigen Kasten.",
      bins: [ { id: "ja", label: "✔ ein Viertel" }, { id: "nein", label: "✘ kein Viertel" } ],
      pick: 6,
      cards: [
        { fig: FIG.quadA,  bin: "ja",   why: "4 gleich große Quadrate, eins gefärbt." },
        { fig: FIG.diagE,  bin: "ja",   why: "Beide Diagonalen teilen das Quadrat in 4 gleich große Dreiecke." },
        { fig: FIG.splitF, bin: "ja",   why: "2 von 8 gleich großen Teilen = [[2/8]] = [[1/4]]. Die Teile müssen nicht zusammenhängen." },
        { fig: FIG.trickG, bin: "ja",   why: "Das gefärbte Stück passt genau 4-mal ins Ganze – also ein Viertel, auch wenn die anderen Stücke verschieden sind." },
        { fig: FIG.stripB, bin: "nein", why: "Die 4 Streifen sind verschieden breit. Der gefärbte ist viel schmaler als ein Viertel." },
        { fig: FIG.pieD,   bin: "nein", why: "Die Kreisstücke sind verschieden groß. Das gefärbte ist kleiner als ein Viertel." },
        { fig: FIG.rowsH,  bin: "nein", why: "Die Streifen sind verschieden hoch. Der gefärbte ist größer als ein Viertel." },
        { fig: FIG.pieI,   bin: "nein", why: "4 Stücke, aber nicht gleich groß. Das gefärbte ist mehr als ein Viertel." }
      ],
      wrongToBin: {
        ja:   "Du hast die Stücke gezählt – prüfe ihre Größe. Sind alle Teile gleich groß?",
        nein: "Denk an die Faltungen: Gleich groß zählt, die Form ist egal. Passt das gefärbte Stück 4-mal ins Ganze?"
      },
      solution: "Viertel: 4 gleich große Teile oder ein Stück, das genau 4-mal ins Ganze passt. Kein Viertel: Stücke verschieden groß.",
      hints: [
        "Gleich große Teile, Form egal! Frage dich bei jeder Figur: Passt das gefärbte Stück genau 4-mal ins Ganze?",
        "Zeichne in Gedanken Hilfslinien: Teile große Stücke so, dass sie so groß werden wie das gefärbte. Bekommst du genau 4?"
      ]
    },
    {
      type: "lock", title: "Hilfslinien-Hack",
      text: "Nicht alle Stücke sind gleich groß. Welcher Anteil ist **gefärbt**? Tipp: Denk dir Hilfslinien.",
      mode: "equiv",
      variants: [
        { fig: { t: "poly", w: 4, h: 4, parts: [
            { p: [[0,0],[2,0],[2,4],[0,4]] }, { p: [[2,0],[4,0],[4,2],[2,2]], f: 1 }, { p: [[2,2],[4,2],[4,4],[2,4]] } ],
            guides: [[0,2,2,2]] },
          answer: [1, 4], wrong: { "1/3": "Du hast die Stücke gezählt – prüfe ihre Größe. Ist die linke Hälfte so groß wie das gefärbte Stück?" },
          solution: "Eine Hilfslinie teilt die linke Hälfte. Dann gibt es 4 gleich große Teile, eins ist gefärbt: [[1/4]]." },
        { fig: { t: "poly", w: 6, h: 3, parts: [
            { p: [[0,0],[2,0],[2,3],[0,3]] }, { p: [[2,0],[4,0],[4,3],[2,3]] },
            { p: [[4,0],[6,0],[6,1],[4,1]] }, { p: [[4,1],[6,1],[6,2],[4,2]], f: 1 }, { p: [[4,2],[6,2],[6,3],[4,3]] } ],
            guides: [[0,1,4,1],[0,2,4,2]] },
          answer: [1, 9], wrong: { "1/5": "Du hast die 5 Stücke gezählt – prüfe ihre Größe. Wie oft passt das gefärbte Stück in ein großes Stück?" },
          solution: "Die großen Stücke werden je in 3 Teile geteilt. Dann gibt es 9 gleich große Teile: [[1/9]]." },
        { fig: { t: "poly", w: 4, h: 4, parts: [
            { p: [[0,0],[2,0],[2,4],[0,4]] }, { p: [[2,0],[4,0],[4,2],[2,2]] },
            { p: [[2,2],[4,2],[2,4]] }, { p: [[4,2],[4,4],[2,4]], f: 1 } ],
            guides: [[0,2,2,2],[2,0,4,2],[0,0,2,2],[0,2,2,4]] },
          answer: [1, 8], wrong: { "1/4": "Du hast die 4 Stücke gezählt – prüfe ihre Größe. Das Dreieck ist nur die Hälfte von einem Viertel." },
          solution: "Rechte Hälfte → Viertel → das Dreieck ist die Hälfte eines Viertels: [[1/8]]." }
      ],
      hints: [
        "Sind alle Stücke gleich groß? Wenn nicht: Teile die großen Stücke so, dass sie so groß werden wie das gefärbte. Dann zähle neu.",
        "Tippe auf „Hilfslinien zeigen“ und zähle die gleich großen Teile.",
      ],
      showGuidesOnHint: 2
    },
    {
      type: "series", title: "Scan-Serie", gen: "read", count: 5,
      text: "Training! Gib den gefärbten Anteil **vollständig gekürzt** an. 5 Scans müssen klappen.",
      solution: "Teile zählen (Nenner), gefärbte Teile zählen (Zähler), dann Zähler und Nenner durch den größten gemeinsamen Teiler teilen.",
      hints: [
        "Erst ablesen: gefärbte Teile von allen Teilen. Dann kürzen: Durch welche Zahl kannst du Zähler UND Nenner teilen?",
        "Beispiel: 6 von 8 Teilen → [[6/8]]. 6 und 8 sind beide durch 2 teilbar → [[3/4]]."
      ]
    }
  ]
},
/* =================================================================== */
{
  id: 2, name: "Pixel-Werkstatt", topic: "Anteile darstellen & das Ganze finden", fragment: "VER", afb: "I–II",
  intro: "Glitch hat Skins und Lebensbalken zerschossen. Repariert sie – manchmal fehlt sogar das Ganze!",
  team: "Neue:r Pilot:in! Beim Färben darf jede:r einmal tippen – aber vorher gemeinsam planen.",
  puzzles: [
    {
      type: "paint", title: "Skin-Reparatur",
      text: "Färbe genau [[%z/%n]] des Skins. Achtung: Das Raster hat nicht %n Pixel!",
      variants: [
        { cols: 4, rows: 3, target: [2, 3], solution: "12 Pixel, ein Drittel sind 4 Pixel. [[2/3]] sind 8 Pixel – Form egal." },
        { cols: 6, rows: 4, target: [5, 6], solution: "24 Pixel, ein Sechstel sind 4 Pixel. [[5/6]] sind 20 Pixel – Form egal." },
        { cols: 4, rows: 4, target: [3, 8], solution: "16 Pixel, ein Achtel sind 2 Pixel. [[3/8]] sind 6 Pixel – Form egal." },
        { cols: 5, rows: 4, target: [3, 5], solution: "20 Pixel, ein Fünftel sind 4 Pixel. [[3/5]] sind 12 Pixel – Form egal." }
      ],
      hints: [
        "Der Nenner sagt: Denk dir das Raster in so viele gleich große Bereiche. Wie viele Pixel hat EIN Bereich?",
        "Beispiel: [[3/4]] von 16 Pixeln: Ein Viertel sind 16 : 4 = 4 Pixel. Drei Viertel sind 3 · 4 = 12 Pixel."
      ]
    },
    {
      type: "whole", title: "Das Ganze finden",
      text: "Das orange Item ist nur [[%a/%b]] des ganzen Skins. Färbe die fehlenden Pixel blau, bis der ganze Skin fertig ist.",
      cols: 8, rows: 5,
      variants: [
        { piece: [17, 18], frac: [1, 3], solution: "[[1/3]] = 2 Pixel → das Ganze sind 3 Drittel = 6 Pixel. Also 4 Pixel dazu." },
        { piece: [10, 18, 19], frac: [3, 4], solution: "[[3/4]] = 3 Pixel → [[1/4]] = 1 Pixel → das Ganze = 4 Pixel. Also 1 Pixel dazu." },
        { piece: [10, 11, 18, 19], frac: [2, 5], solution: "[[2/5]] = 4 Pixel → [[1/5]] = 2 Pixel → das Ganze = 10 Pixel. Also 6 Pixel dazu." },
        { piece: [9, 10, 11, 17, 18, 19], frac: [3, 7], solution: "[[3/7]] = 6 Pixel → [[1/7]] = 2 Pixel → das Ganze = 14 Pixel. Also 8 Pixel dazu." }
      ],
      hints: [
        "Rechne rückwärts: Wie viele Pixel sind EIN Teil (Zähler 1)? Wie viele solche Teile braucht das Ganze?",
        "Beispiel: [[3/4]] sind 6 Pixel. Dann ist [[1/4]] = 6 : 3 = 2 Pixel. Das Ganze sind 4 Viertel = 8 Pixel."
      ]
    },
    {
      type: "gap", title: "Energie-Rückrechnung",
      text: "Dein Lebensbalken zeigt noch **%p Pixel**. Das sind [[%a/%b]] der vollen Energie.",
      variants: [
        { p: 6, a: 3, b: 8, answer: [2, 16], solution: "6 Pixel sind 3 Achtel → 1 Achtel = 2 Pixel → 8 Achtel = 16 Pixel." },
        { p: 10, a: 5, b: 6, answer: [2, 12], solution: "10 Pixel sind 5 Sechstel → 1 Sechstel = 2 Pixel → 6 Sechstel = 12 Pixel." },
        { p: 9, a: 3, b: 4, answer: [3, 12], solution: "9 Pixel sind 3 Viertel → 1 Viertel = 3 Pixel → 4 Viertel = 12 Pixel." },
        { p: 8, a: 2, b: 5, answer: [4, 20], solution: "8 Pixel sind 2 Fünftel → 1 Fünftel = 4 Pixel → 5 Fünftel = 20 Pixel." }
      ],
      strip: true,
      rows: [ "[[1/%b]] der Energie sind **?** Pixel.", "Die volle Energie hat **?** Pixel." ],
      hints: [
        "Erst EIN Teil: Der Zähler %a sagt, dass %p Pixel aus %a gleich großen Teilen bestehen.",
        "Beispiel: 6 Pixel sind [[3/4]]. Dann ist [[1/4]] = 6 : 3 = 2 Pixel und das Ganze 4 · 2 = 8 Pixel."
      ]
    },
    {
      type: "series", title: "Werkstatt-Serie", gen: "paint", count: 4,
      text: "Training! Färbe jeweils den angegebenen Anteil. 4 Reparaturen müssen klappen.",
      solution: "Anzahl aller Pixel durch den Nenner teilen (= ein Teil), dann mal den Zähler.",
      hints: [
        "Wie viele Pixel hat das Raster? Teile durch den Nenner – so viele Pixel sind EIN Teil.",
        "Beispiel: [[2/3]] von 18 Pixeln: 18 : 3 = 6, dann 2 · 6 = 12 Pixel."
      ]
    }
  ]
},
/* =================================================================== */
{
  id: 3, name: "Loot-Schmiede", topic: "Kürzen und Erweitern", fragment: "ON", afb: "I–II",
  intro: "In der Schmiede werden Items verfeinert und vergröbert. Glitch hat Fake-Items untergemischt. Gleich viel wert – oder Fälschung?",
  team: "Pilot:in wechseln! Erklärt euch gegenseitig: Was passiert beim Erweitern mit den Teilen?",
  puzzles: [
    {
      type: "sort", title: "Item-Paare",
      text: "Ziehe jedes Item zu dem Bruch, der **gleich viel wert** ist. Fälschungen kommen in den Fake-Kasten.",
      variants: [
        { bins: [ { id: "a", label: "[[2/3]]" }, { id: "b", label: "[[3/4]]" }, { id: "c", label: "[[2/5]]" }, { id: "x", label: "⚠ Fake" } ],
          cards: [ { t: "[[8/12]]", bin: "a" }, { t: "[[10/15]]", bin: "a" }, { t: "[[9/12]]", bin: "b" }, { t: "[[15/20]]", bin: "b" },
                   { t: "[[4/10]]", bin: "c" }, { t: "[[6/15]]", bin: "c" },
                   { t: "[[4/5]]", bin: "x", why: "[[4/5]] entsteht aus [[2/3]], wenn man zu Zähler und Nenner 2 addiert. Plus ändert den Wert!" },
                   { t: "[[3/7]]", bin: "x", why: "[[3/7]] entsteht aus [[2/5]], wenn man 1 addiert. Plus ändert den Wert!" } ] },
        { bins: [ { id: "a", label: "[[3/5]]" }, { id: "b", label: "[[5/6]]" }, { id: "c", label: "[[1/4]]" }, { id: "x", label: "⚠ Fake" } ],
          cards: [ { t: "[[9/15]]", bin: "a" }, { t: "[[12/20]]", bin: "a" }, { t: "[[10/12]]", bin: "b" }, { t: "[[15/18]]", bin: "b" },
                   { t: "[[3/12]]", bin: "c" }, { t: "[[5/20]]", bin: "c" },
                   { t: "[[5/7]]", bin: "x", why: "[[5/7]] entsteht aus [[3/5]], wenn man 2 addiert. Plus ändert den Wert!" },
                   { t: "[[2/5]]", bin: "x", why: "[[2/5]] entsteht aus [[1/4]], wenn man 1 addiert. Plus ändert den Wert!" } ] }
      ],
      wrongToBin: { x: "Dieses Item ist echt! Kürze es vollständig – zu welchem Bruch passt es?" },
      wrongFake: "Fälschung! Glitch hat zu Zähler und Nenner dieselbe Zahl **addiert**. Erweitern heißt: mit derselben Zahl **malnehmen**.",
      wrongDefault: "Kürze das Item vollständig. Passt es dann zu diesem Bruch?",
      solution: "Erweitern/Kürzen heißt: Zähler und Nenner mit derselben Zahl malnehmen bzw. durch dieselbe Zahl teilen. Addieren ändert den Wert.",
      hints: [
        "Kürze jedes Item so weit wie möglich. Dann siehst du, zu welchem Bruch es gehört.",
        "Beispiel: [[8/12]] – beide durch 4 teilbar → [[2/3]]. Aber [[4/5]] lässt sich nicht kürzen – es ist nicht [[2/3]]!"
      ]
    },
    {
      type: "refine", title: "Verfeinern",
      dir: "fein",
      text: "Verfeinere die Einteilung mit dem Regler. Jedes Stück wird in gleich große Teile zerlegt.",
      variants: [
        { from: [2, 3], to: 15, answer: [10, 5], solution: "Jedes Drittel in 5 Teile: [[2/3]] = [[10/15]], erweitert mit 5." },
        { from: [3, 4], to: 20, answer: [15, 5], solution: "Jedes Viertel in 5 Teile: [[3/4]] = [[15/20]], erweitert mit 5." },
        { from: [5, 6], to: 18, answer: [15, 3], solution: "Jedes Sechstel in 3 Teile: [[5/6]] = [[15/18]], erweitert mit 3." },
        { from: [3, 5], to: 20, answer: [12, 4], solution: "Jedes Fünftel in 4 Teile: [[3/5]] = [[12/20]], erweitert mit 4." }
      ],
      hints: [
        "Stell den Regler so ein, dass der Streifen genau so viele Teile hat wie der neue Nenner.",
        "Beispiel: [[2/3]] → Neuntel: Jedes Drittel in 3 Teile → [[6/9]]. Zähler und Nenner werden beide mal 3 genommen."
      ]
    },
    {
      type: "refine", title: "Vergröbern",
      dir: "grob",
      text: "Fasse Teile zusammen, bis die Einteilung **so grob wie möglich** ist. Dann hast du vollständig gekürzt.",
      variants: [
        { from: [12, 16], answer: [3, 4, 4], solution: "Je 4 Teile zusammenfassen: [[12/16]] = [[3/4]], gekürzt mit 4." },
        { from: [10, 15], answer: [2, 3, 5], solution: "Je 5 Teile zusammenfassen: [[10/15]] = [[2/3]], gekürzt mit 5." },
        { from: [18, 24], answer: [3, 4, 6], solution: "Je 6 Teile zusammenfassen: [[18/24]] = [[3/4]], gekürzt mit 6." },
        { from: [16, 20], answer: [4, 5, 4], solution: "Je 4 Teile zusammenfassen: [[16/20]] = [[4/5]], gekürzt mit 4." }
      ],
      hints: [
        "Zusammenfassen klappt nur, wenn die gefärbten UND die ungefärbten Teile genau aufgehen. Probiere große Gruppen.",
        "Beispiel: [[6/8]]: Je 2 zusammen → [[3/4]]. Je 4 zusammen geht nicht (6 : 4 geht nicht auf). Also ist [[3/4]] am gröbsten."
      ]
    },
    {
      type: "series", title: "Schmiede-Serie", gen: "forge", count: 6,
      text: "Training! Erweitern und Kürzen im Schnelldurchlauf. 6 Items müssen klappen.",
      solution: "Erweitern: Zähler und Nenner mit derselben Zahl malnehmen. Kürzen: Zähler und Nenner durch dieselbe Zahl teilen.",
      hints: [
        "Vergleiche die Nenner (oder die Zähler): Mit welcher Zahl wurde malgenommen oder geteilt? Mach dasselbe mit der anderen Zahl.",
        "Beispiel: [[3/4]] = [[?/20]]: 4 · 5 = 20, also auch 3 · 5 = 15 → [[15/20]]."
      ]
    }
  ]
},
/* =================================================================== */
{
  id: 4, name: "Glitch-Bugs", topic: "Fehler finden & begründen", fragment: "LI", afb: "II–III",
  intro: "Glitch verbreitet falsche Behauptungen im Chat. Entlarvt die Bugs – mit Begründung!",
  team: "Diskutiert jede Antwort, bevor die Pilot:in tippt. Jede:r muss die Begründung erklären können.",
  puzzles: [
    {
      type: "choice", title: "Lena oder Ben?",
      variants: [
        { fig: { t: "poly", w: 4, h: 3, parts: [
              { p: [[0,0],[2,0],[2,3],[0,3]] }, { p: [[2,0],[4,0],[4,1.5],[2,1.5]], f: 1 }, { p: [[2,1.5],[4,1.5],[4,3],[2,3]] } ],
              guides: [[0,1.5,2,1.5]] },
          text: "Lena sagt: „Das ist [[1/3]], denn 1 von 3 Stücken ist gefärbt.“ Ben sagt: „Das ist [[1/4]].“",
          steps: [
            { q: "Wer hat recht?", options: [ { t: "Ben", ok: true }, { t: "Lena", fb: "Du hast die Stücke gezählt – prüfe ihre Größe. Ist das linke Stück so groß wie das gefärbte?" }, { t: "beide", fb: "Ein Anteil kann nicht gleichzeitig [[1/3]] und [[1/4]] sein." } ] },
            { q: "Warum?", options: [
              { t: "Eine Hilfslinie halbiert das linke Stück. Dann gibt es 4 gleich große Teile.", ok: true },
              { t: "Es sind 3 Stücke, also Drittel.", fb: "Sind alle Teile gleich groß? Nur dann darfst du einfach zählen." },
              { t: "Das gefärbte Stück ist oben rechts.", fb: "Die Lage ist egal. Es kommt auf die Größe an." } ] }
          ],
          solution: "Ben hat recht: Mit einer Hilfslinie entstehen 4 gleich große Teile, eins ist gefärbt → [[1/4]]. Lena hat Stücke gezählt, die nicht gleich groß sind." },
        { fig: { t: "poly", w: 6, h: 4, parts: [
              { p: [[0,0],[6,0],[6,2],[0,2]] }, { p: [[0,2],[2,2],[2,4],[0,4]], f: 1 }, { p: [[2,2],[4,2],[4,4],[2,4]] }, { p: [[4,2],[6,2],[6,4],[4,4]] } ],
              guides: [[2,0,2,2],[4,0,4,2]] },
          text: "Lena sagt: „Das ist [[1/4]], denn 1 von 4 Stücken ist gefärbt.“ Ben sagt: „Das ist [[1/6]].“",
          steps: [
            { q: "Wer hat recht?", options: [ { t: "Ben", ok: true }, { t: "Lena", fb: "Du hast die Stücke gezählt – prüfe ihre Größe. Ist das obere Stück so groß wie das gefärbte?" }, { t: "beide", fb: "Ein Anteil kann nicht gleichzeitig [[1/4]] und [[1/6]] sein." } ] },
            { q: "Warum?", options: [
              { t: "Zwei Hilfslinien teilen das obere Stück in 3 Teile. Dann gibt es 6 gleich große Teile.", ok: true },
              { t: "Es sind 4 Stücke, also Viertel.", fb: "Sind alle Teile gleich groß? Nur dann darfst du einfach zählen." },
              { t: "Unten sind 3 Stücke, also Drittel.", fb: "Der Nenner bezieht sich auf das ganze Rechteck, nicht nur auf die untere Hälfte." } ] }
          ],
          solution: "Ben hat recht: Das obere Stück ist 3 Teile groß. Insgesamt 6 gleich große Teile, eins gefärbt → [[1/6]]." }
      ],
      hints: [
        "Sind alle Stücke gleich groß? Wie oft passt das gefärbte Stück in das größte Stück?",
        "Tippe auf „Hilfslinien zeigen“. Zähle dann die gleich großen Teile."
      ],
      showGuidesOnHint: 2
    },
    {
      type: "choice", title: "Lukas' Bug",
      fig: { t: "strips12", rows: [ { n: "%a", k: 1, label: "[[1/%a]]" }, { n: "%b", k: 1, label: "[[1/%b]]" } ] },
      text: "Lukas schreibt im Chat: „[[1/%b]] ist mehr als [[1/%a]], weil %b größer ist als %a.“ Der 12er-Streifen hilft dir.",
      variants: [
        { a: 3, b: 4, ka: 4, kb: 3, kx: 8 },
        { a: 4, b: 6, ka: 3, kb: 2, kx: 6 },
        { a: 6, b: 12, ka: 2, kb: 1, kx: 4 }
      ],
      steps: [
        { q: "Hat Lukas recht?", options: [ { t: "Nein", ok: true }, { t: "Ja", fb: "Schau auf den Streifen: Welches gefärbte Stück ist länger?" } ] },
        { q: "Wie viele Kästchen des 12er-Streifens sind [[1/%a]]?", options: [ { t: "%ka", ok: true }, { t: "%kx", fb: "Das wären [[2/%a]]. Der Nenner nennt, in wie viele Teile die 12 Kästchen geteilt werden: 12 : %a = ?" }, { t: "%kb", fb: "Das ist [[1/%b]]. Lies noch einmal genau." } ] },
        { q: "Was passiert, wenn der Nenner größer wird (Zähler gleich)?", options: [
          { t: "Mehr Teile – dafür ist jedes Teil kleiner.", ok: true },
          { t: "Größerer Nenner – größerer Bruch.", fb: "Das ist genau Lukas' Bug. Mehr Teile vom selben Ganzen …?" },
          { t: "Der Nenner spielt keine Rolle.", fb: "Der Nenner nennt die Art der Teile – also auch ihre Größe." } ] }
      ],
      solution: "Lukas irrt: [[1/%a]] = %ka Kästchen, [[1/%b]] = %kb Kästchen. Je größer der Nenner, desto mehr Teile – desto kleiner jedes Teil.",
      hints: [
        "Stell dir vor: Eine Pizza wird einmal an %a und einmal an %b Kinder verteilt. Wann bekommt jedes Kind mehr?",
        "12er-Streifen: 12 : %a = %ka Kästchen, 12 : %b = %kb Kästchen."
      ]
    },
    {
      type: "sort", title: "Gilt immer – nie – kommt darauf an",
      text: "Glitch postet „Regeln“. Ordne jede Aussage richtig ein.",
      bins: [ { id: "immer", label: "gilt immer" }, { id: "nie", label: "gilt nie" }, { id: "kommt", label: "kommt darauf an" } ],
      pick: 5,
      cards: [
        { t: "Multipliziert man Zähler und Nenner mit derselben Zahl, bleibt der Wert gleich.", bin: "immer", why: "Das ist Erweitern: Jedes Teil wird gleich fein zerlegt, der Anteil bleibt." },
        { t: "Addiert man zu Zähler und Nenner dieselbe Zahl, bleibt der Wert gleich.", bin: "kommt", why: "Meist falsch: [[1/2]] → [[2/3]]. Nur wenn Zähler = Nenner (Wert 1) stimmt es: [[2/2]] → [[3/3]]." },
        { t: "Wird ein Ganzes in 4 Stücke geteilt, ist jedes Stück ein Viertel.", bin: "kommt", why: "Nur, wenn die 4 Stücke gleich groß sind." },
        { t: "Beim Kürzen wird der Bruch kleiner.", bin: "nie", why: "Kürzen vergröbert nur die Einteilung. Der Wert bleibt gleich." },
        { t: "Jeder Bruch lässt sich kürzen.", bin: "kommt", why: "[[6/8]] ja, aber [[3/4]] nicht – 3 und 4 haben keinen gemeinsamen Teiler außer 1." },
        { t: "Jeder Bruch lässt sich erweitern.", bin: "immer", why: "Man kann jede Einteilung verfeinern, z. B. mit 2 erweitern." },
        { t: "Ein Bruch mit größerem Nenner ist kleiner.", bin: "kommt", why: "Bei gleichem Zähler ja: [[1/4]] < [[1/3]]. Aber [[3/4]] > [[1/3]]." },
        { t: "Erweitert man [[1/2]], erhält man einen Bruch mit ungeradem Nenner.", bin: "nie", why: "Der Nenner wird 2 · k – immer gerade." }
      ],
      wrongToBin: {
        immer: "Suche ein Gegenbeispiel! Findest du einen Bruch, bei dem es nicht klappt?",
        nie: "Probiere ein Beispiel: Gibt es einen Fall, in dem die Aussage doch stimmt?",
        kommt: "Probiere mehrere Beispiele. Klappt es wirklich nur manchmal?"
      },
      solution: "Teste jede Aussage mit Beispielen und suche Gegenbeispiele.",
      hints: [
        "Teste jede Aussage mit 2–3 Beispielen. Ein einziges Gegenbeispiel reicht, damit etwas nicht „immer“ gilt.",
        "Beispiel: „Zähler und Nenner plus 1“: [[1/2]] → [[2/3]] – nicht gleich! Aber [[2/2]] → [[3/3]] – gleich. Also: kommt darauf an."
      ]
    },
    {
      type: "choice", title: "Glitchs Kürz-Trick",
      text: "Glitch „kürzt“ so: Er streicht in Zähler und Nenner dieselbe Ziffer. $\\dfrac{%z}{%n}$ → $\\dfrac{%rz}{%rn}$",
      variants: [
        { z: "1\\cancel{6}", n: "\\cancel{6}4", rz: 1, rn: 4, resultOk: true, solution: "[[16/64]] = [[1/4]] stimmt zufällig (durch 16 gekürzt). Aber Ziffern streichen ist kein Kürzen!" },
        { z: "1\\cancel{2}", n: "\\cancel{2}4", rz: 1, rn: 4, resultOk: false, solution: "[[12/24]] = [[1/2]], nicht [[1/4]]. Ziffern streichen ist kein Kürzen – man muss Zähler und Nenner durch dieselbe Zahl teilen." },
        { z: "2\\cancel{6}", n: "\\cancel{6}5", rz: 2, rn: 5, resultOk: true, solution: "[[26/65]] = [[2/5]] stimmt zufällig (durch 13 gekürzt). Aber Ziffern streichen ist kein Kürzen!" },
        { z: "3\\cancel{4}", n: "\\cancel{4}8", rz: 3, rn: 8, resultOk: false, solution: "[[34/48]] = [[17/24]], nicht [[3/8]]. Ziffern streichen ist kein Kürzen." }
      ],
      steps: [
        { q: "Stimmt das Ergebnis?", options: [ { t: "Ja", okIf: "resultOk" }, { t: "Nein", okIf: "!resultOk" } ],
          fb: "Prüfe richtig: Kürze den Bruch durch eine Zahl, die Zähler und Nenner teilt – oder erweitere das Ergebnis." },
        { q: "Ist Glitchs Methode richtig?", options: [
          { t: "Nein – beim Kürzen teilt man Zähler und Nenner durch dieselbe Zahl.", ok: true },
          { t: "Ja – gleiche Ziffern darf man streichen.", fb: "Teste die Methode: [[12/24]] → [[1/4]]? Aber [[12/24]] ist die Hälfte!" },
          { t: "Ja, wenn das Ergebnis stimmt.", fb: "Ein Zufallstreffer macht eine Methode nicht richtig. Gilt sie IMMER?" } ] }
      ],
      hints: [
        "Prüfe das Ergebnis rückwärts: Erweitere das Ergebnis. Kommst du wieder auf den Bruch?",
        "Beispiel: Stimmt [[12/24]] = [[1/4]]? [[1/4]] mit 12 erweitert ist [[12/48]], nicht [[12/24]]."
      ]
    }
  ]
},
/* =================================================================== */
{
  id: 5, name: "Boss-Firewall", topic: "Brüche vergleichen (neu!)", fragment: "NE", afb: "II–III",
  intro: "Die letzte Firewall vergleicht Drop-Raten, Rankings und Anteile. Lade zuerst die System-Info – dann kommt der Boss!",
  team: "Boss-Level! Plant jede Antwort gemeinsam. Jede:r erklärt einmal eine Regel.",
  puzzles: [
    {
      type: "explore", title: "System-Info: Vergleichen", free: true,
      screens: [
        { kind: "sameDen", title: "1 / 3 · Gleicher Nenner",
          text: "Beide Streifen haben **Zwölftel**. Verändere die Zähler und vergleiche die gefärbten Längen.",
          q: "Bei **gleichem Nenner** ist der Bruch größer, der …",
          options: [ { t: "den größeren Zähler hat.", ok: true }, { t: "den kleineren Zähler hat.", fb: "Schau auf die Streifen: Mehr gleich große Teile sind mehr." } ] },
        { kind: "sameNum", title: "2 / 3 · Gleicher Zähler",
          text: "Beide Brüche haben den **Zähler 3**. Verändere die Nenner und vergleiche.",
          q: "Bei **gleichem Zähler** ist der Bruch größer, der …",
          options: [ { t: "den kleineren Nenner hat.", ok: true }, { t: "den größeren Nenner hat.", fb: "Großer Nenner = viele Teile = kleine Teile. Gleich viele kleine Teile sind weniger." } ] },
        { kind: "common", title: "3 / 3 · Gemeinsame Einteilung",
          text: "[[2/3]] oder [[3/4]]? Verfeinere **beide** Streifen gleich, bis die Teile gleich groß sind.",
          q: "Bei welcher Einteilung kannst du direkt vergleichen? (kleinste)",
          options: [ { t: "Zwölftel – denn 12 ist das kleinste gemeinsame Vielfache von 3 und 4.", ok: true }, { t: "Siebtel – denn 3 + 4 = 7.", fb: "Lassen sich Drittel in Siebtel zerlegen? Probiere es mit dem Regler." }, { t: "Vierundzwanzigstel – es muss 3 · 4 · 2 sein.", fb: "24 klappt auch, ist aber nicht die kleinste gemeinsame Einteilung." } ] }
      ]
    },
    {
      type: "choice", title: "Loot-Truhen",
      fig: { t: "chests" },
      text: "Truhe A droppt **%a von %na** Items als legendär, Truhe B **%b von %nb**. Welche Truhe hat die höhere Drop-Rate?",
      variants: [
        { a: 4, na: 16, b: 3, nb: 10, best: "B", why: "[[4/16]] = [[1/4]] = [[5/20]] und [[3/10]] = [[6/20]]", wrongWhy: "[[4/16]] = [[8/32]] und [[3/10]] = [[6/32]]",
          solution: "[[4/16]] = [[1/4]] = [[5/20]] < [[6/20]] = [[3/10]]. Truhe B ist besser – obwohl sie weniger legendäre Items hat!" },
        { a: 6, na: 20, b: 5, nb: 15, best: "B", why: "[[6/20]] = [[3/10]] = [[9/30]] und [[5/15]] = [[1/3]] = [[10/30]]", wrongWhy: "[[6/20]] = [[12/40]] und [[5/15]] = [[10/40]]",
          solution: "[[6/20]] = [[9/30]] < [[10/30]] = [[5/15]]. Truhe B ist besser." },
        { a: 9, na: 12, b: 7, nb: 10, best: "A", why: "[[9/12]] = [[3/4]] = [[15/20]] und [[7/10]] = [[14/20]]", wrongWhy: "[[9/12]] = [[18/24]] und [[7/10]] = [[21/24]]",
          solution: "[[9/12]] = [[3/4]] = [[15/20]] > [[14/20]] = [[7/10]]. Truhe A ist besser." }
      ],
      steps: [
        { q: "Welche Truhe hat die höhere Drop-Rate?", options: [ { t: "Truhe A", okIf: "best=A" }, { t: "Truhe B", okIf: "best=B" }, { t: "gleich", okIf: "never" } ],
          fb: "Achtung: Es zählt nicht die Anzahl, sondern der **Anteil**. Bringe beide Brüche auf einen gemeinsamen Nenner." },
        { q: "Welche Rechnung beweist es?", options: [ { t: "%why", ok: true }, { t: "%wrongWhy", fb: "Prüfe das Erweitern: Wurden Zähler und Nenner mit derselben Zahl multipliziert?" }, { t: "%a > %b, also ist A besser.", fb: "Du hast nur die Anzahl verglichen. Der Anteil hängt auch vom Ganzen ab." } ] }
      ],
      hints: [
        "Schreibe beide Drop-Raten als Bruch. Kürze zuerst, dann suche einen gemeinsamen Nenner.",
        "Beispiel: [[1/4]] und [[3/10]]: Vielfache von 4: 4, 8, 12, 16, **20** … Vielfache von 10: 10, **20**. → [[5/20]] und [[6/20]]."
      ]
    },
    {
      type: "sort", title: "Datentransfer: mehr oder weniger als die Hälfte?",
      text: "Jeder Download zeigt, welcher Anteil schon geladen ist. Ziehe jeden Bruch in den richtigen Kasten.",
      bins: [ { id: "lt", label: "weniger als [[1/2]]" }, { id: "eq", label: "genau [[1/2]]" }, { id: "gt", label: "mehr als [[1/2]]" } ],
      pick: 7,
      cards: [
        { t: "[[59/90]]", bin: "gt" }, { t: "[[43/80]]", bin: "gt" }, { t: "[[7/13]]", bin: "gt" }, { t: "[[6/11]]", bin: "gt" },
        { t: "[[3/7]]", bin: "lt" }, { t: "[[21/43]]", bin: "lt" }, { t: "[[50/101]]", bin: "lt" }, { t: "[[4/9]]", bin: "lt" },
        { t: "[[12/24]]", bin: "eq" }, { t: "[[35/70]]", bin: "eq" }
      ],
      wrongDefault: "Vergleiche den Zähler mit der **Hälfte des Nenners**. Ist er größer, kleiner oder genau gleich?",
      solution: "Trick: Ist der Zähler mehr als die Hälfte des Nenners, ist der Bruch mehr als [[1/2]] (z. B. 59 > 45).",
      hints: [
        "Du musst nicht erweitern! Berechne die Hälfte des Nenners und vergleiche sie mit dem Zähler.",
        "Beispiel: [[7/13]]: Die Hälfte von 13 ist 6,5. 7 > 6,5 → mehr als [[1/2]]."
      ]
    },
    {
      type: "order", title: "Ranking-Hack",
      text: "Glitch hat das Team-Ranking manipuliert: %wrong. Tippe die Brüche in der **richtigen** Reihenfolge an – mit dem **kleinsten** beginnen.",
      variants: [
        { items: ["1/4", "1/5", "1/3"], wrong: "$\\dfrac14 < \\dfrac15 < \\dfrac13$", solution: "Gleicher Zähler: kleinerer Nenner → größer. [[1/5]] < [[1/4]] < [[1/3]]." },
        { items: ["4/5", "4/6", "4/7"], wrong: "$\\dfrac45 < \\dfrac46 < \\dfrac47$", solution: "Gleicher Zähler: [[4/7]] < [[4/6]] < [[4/5]]." },
        { items: ["2/3", "9/15", "4/5"], wrong: "$\\dfrac23 < \\dfrac{9}{15} < \\dfrac45$", solution: "Auf Fünfzehntel: [[9/15]] < [[10/15]] < [[12/15]], also [[9/15]] < [[2/3]] < [[4/5]]." },
        { items: ["3/8", "1/2", "4/6", "3/4"], wrong: "$\\dfrac12 < \\dfrac38 < \\dfrac34 < \\dfrac46$", solution: "Auf Vierundzwanzigstel: [[9/24]] < [[12/24]] < [[16/24]] < [[18/24]]." },
        { items: ["5/24", "8/16", "26/48", "7/8"], wrong: "$\\dfrac{8}{16} < \\dfrac{5}{24} < \\dfrac78 < \\dfrac{26}{48}$", solution: "Auf Achtundvierzigstel: [[10/48]] < [[24/48]] < [[26/48]] < [[42/48]]." }
      ],
      hints: [
        "Gleicher Zähler oder gleicher Nenner? Dann hilft die Regel aus der System-Info. Sonst: gemeinsamen Nenner suchen.",
        "Beispiel: [[2/3]] und [[3/5]]: kgV von 3 und 5 ist 15 → [[10/15]] und [[9/15]] → [[3/5]] < [[2/3]]."
      ]
    },
    {
      type: "charge", title: "Schild aufladen",
      text: "Glitchs letzter Angriff! Lade den Schild mit Energie-Stücken auf.",
      /* Runden: build = Ziel genau treffen · sum = zusammenrechnen · compare = was ist mehr?
         Brüche als [Zähler, Nenner]. Nenner müssen 12 teilen (2, 3, 4, 6, 12). */
      variants: [
        { rounds: [
            { kind: "build", target: [3, 4] },
            { kind: "sum", parts: [[1, 2], [1, 3]] },
            { kind: "compare", left: [[1, 3], [1, 4]], right: [[1, 2]] } ],
          solution: "[[3/4]] = 9 Kästchen, z. B. [[1/2]] + [[1/4]] (6 + 3). · [[1/2]] + [[1/3]] = 6 + 4 = 10 Kästchen = [[10/12]] = [[5/6]]. · [[1/3]] + [[1/4]] = 7 Kästchen, [[1/2]] = 6 Kästchen → oben ist mehr." },
        { rounds: [
            { kind: "build", target: [5, 6] },
            { kind: "sum", parts: [[1, 4], [1, 6]] },
            { kind: "compare", left: [[1, 2], [1, 6]], right: [[3, 4]] } ],
          solution: "[[5/6]] = 10 Kästchen, z. B. [[1/2]] + [[1/3]] (6 + 4). · [[1/4]] + [[1/6]] = 3 + 2 = 5 Kästchen = [[5/12]]. · [[1/2]] + [[1/6]] = 8 Kästchen, [[3/4]] = 9 Kästchen → unten ist mehr." },
        { rounds: [
            { kind: "build", target: [7, 12] },
            { kind: "sum", parts: [[1, 3], [1, 4]] },
            { kind: "compare", left: [[1, 6], [1, 3]], right: [[1, 2]] } ],
          solution: "[[7/12]] = 7 Kästchen, z. B. [[1/3]] + [[1/4]] (4 + 3). · [[1/3]] + [[1/4]] = 4 + 3 = 7 Kästchen = [[7/12]]. · [[1/6]] + [[1/3]] = 6 Kästchen = [[1/2]] → gleich viel." }
      ],
      hints: [
        "Der Schild hat 12 Kästchen. Wie viele Kästchen ist jedes Stück? Lege es auf und zähle!",
        "Beispiel: [[1/4]] + [[1/6]] → 3 Kästchen + 2 Kästchen = 5 Kästchen = [[5/12]]. Achtung: Die Nenner werden **nicht** addiert!"
      ]
    }
  ]
},
/* =================================================================== */
{
  id: 6, name: "Secret Level: Pharao-Code", topic: "Ägyptische Brüche", fragment: null, bonus: true, afb: "III",
  intro: "Du hast einen versteckten Ordner gefunden: Vor 3500 Jahren schrieben ägyptische Schreiber fast nur **Stammbrüche** (Zähler 1) – und jeden nur einmal.",
  team: "Bonus! Teilt die Arbeit: Eine:r rechnet im 12er-Streifen, eine:r prüft.",
  puzzles: [
    {
      type: "choice", title: "Power-Up-Verteilung",
      fig: { t: "breads", n: 5 },
      text: "**5 Power-Ups** sollen gerecht an **8 Spieler** verteilt werden. Jeder bekommt [[5/8]]. Jeder Spieler soll aber nur **2 Stücke** bekommen.",
      steps: [
        { q: "Wie schneidest du?", options: [
          { t: "4 Power-Ups halbieren, das fünfte in 8 Teile.", ok: true },
          { t: "Jedes Power-Up in 8 Teile.", fb: "Gerecht – aber dann bekommt jeder 5 Stücke, nicht 2." },
          { t: "Alle 5 Power-Ups halbieren.", fb: "10 Hälften für 8 Spieler – 2 bleiben übrig. Nicht gerecht." } ] },
        { q: "Welche ägyptische Schreibweise passt?", options: [
          { t: "[[5/8]] = [[1/2]] + [[1/8]]", ok: true },
          { t: "[[5/8]] = [[1/4]] + [[1/4]] + [[1/8]]", fb: "[[1/4]] kommt doppelt vor – das ist bei den Ägyptern verboten." },
          { t: "[[5/8]] = [[1/3]] + [[1/5]]", fb: "Prüfe im 120er-Streifen: [[1/3]] + [[1/5]] = [[8/15]], nicht [[5/8]]." } ] }
      ],
      solution: "4 Power-Ups halbieren (8 Hälften), das fünfte in 8 Achtel. Jeder bekommt [[1/2]] + [[1/8]] = [[5/8]]: nur 16 Stücke statt 40.",
      hints: [
        "Jeder soll ein großes und ein kleines Stück bekommen. Wie viele Hälften kannst du verteilen?",
        "8 Spieler brauchen 8 Hälften = 4 Power-Ups. Das übrige Power-Up muss für 8 Spieler reichen."
      ]
    },
    {
      type: "egypt", title: "Schreib wie ein Ägypter",
      text: "Zerlege in **zwei verschiedene** Stammbrüche. Der 12er-Streifen hilft: Wie viele Kästchen ist jeder Stammbruch?",
      variants: [
        { target: [5, 6], terms: 2, solution: "[[5/6]] = 10 Kästchen = 6 + 4 → [[1/2]] + [[1/3]]." },
        { target: [2, 3], terms: 2, solution: "[[2/3]] = 8 Kästchen = 6 + 2 → [[1/2]] + [[1/6]]." },
        { target: [3, 4], terms: 2, solution: "[[3/4]] = 9 Kästchen = 6 + 3 → [[1/2]] + [[1/4]]." },
        { target: [5, 12], terms: 2, solution: "[[5/12]] = 5 Kästchen = 4 + 1 → [[1/3]] + [[1/12]] (oder 3 + 2 → [[1/4]] + [[1/6]])." }
      ],
      hints: [
        "Im 12er-Streifen: [[1/2]] = 6, [[1/3]] = 4, [[1/4]] = 3, [[1/6]] = 2, [[1/12]] = 1 Kästchen. Wie viele Kästchen hat der Bruch?",
        "Beispiel: [[7/12]] = 7 Kästchen = 6 + 1 → [[1/2]] + [[1/12]]."
      ]
    },
    {
      type: "egypt", title: "Doppelter Pharao-Code",
      text: "Für [[7/12]] gibt es **zwei verschiedene** Lösungen mit je zwei Stammbrüchen. Finde beide!",
      target: [7, 12], terms: 2, need: 2,
      solution: "[[7/12]] = 7 Kästchen: 6 + 1 → [[1/2]] + [[1/12]] und 4 + 3 → [[1/3]] + [[1/4]].",
      hints: [
        "7 Kästchen aus zwei verschiedenen Bausteinen: 6, 4, 3, 2 oder 1 Kästchen. Welche zwei ergeben 7?",
        "6 + 1 = 7 ist eine Lösung. Es gibt noch eine mit 4 und …?"
      ]
    }
  ]
}
];

/* Zufallsgeneratoren für die Trainingsserien (Bereiche hier anpassbar) */
const SERIES = {
  read:  { shapes: ["grid", "strip", "circle"], minN: 4, maxN: 16, reducibleShare: 0.8 },
  paint: { totals: [[3,4],[4,3],[4,4],[6,3],[5,4],[6,4],[4,6]], dens: [2,3,4,5,6,8] },
  forge: { kinds: ["up", "upNum", "down", "factor"], maxFactor: 6 }
};

/* Zeitplan-Vorschlag (nur Anzeige im Lehrkraft-Modus) */
const ZEITPLAN = [
  ["Start & Story", 2], ["Level 1", 7], ["Level 2", 7], ["Level 3", 8], ["Level 4", 8], ["Level 5", 10], ["Bonus / Puffer", 3]
];
