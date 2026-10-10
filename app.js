/* ---------------------------------------------------------
OLETUSOHJELMA (PT:n suunnitelma 19.7 + päivitys 25.7)
- Jalkaprässi jalat alhaalla: 2 -> 3 sarjaa
- Hack kyykky: 2 -> 3 sarjaa
- Leuanveto / Dippi: huomautus laite/lisäpaino-valinnasta
Päivitys 10.10.2026 (ohjelmaversio 2) — ylävartalon volyymi, vaihe 1:
- Rintapunnerrus laitteessa: 2 -> 3 sarjaa
- Ylätalja kapealla otteella: 2 -> 3 sarjaa
- Rintatuettu soutu laitteessa: 2 -> 3 sarjaa
- Rintatuettu t-kulmasoutu: 2 -> 3 sarjaa
- UUSI: Rintaflye laitteessa (pec deck) 2 x 10-15 (Ylä 2)
- Jalat ennallaan. Kädet vaihe 2:ssa, jos kyynärpää pysyy rauhallisena.
--------------------------------------------------------- */
const DEFAULT_PROGRAM = {
yla1: {
label: "Ylä 1",
exercises: [
{ id: "y1-1", name: "Rintapunnerrus istuen laitteessa", sets: 3, repMin: 6, repMax: 8 },
{ id: "y1-2", name: "Ylätalja kapealla otteella", sets: 3, repMin: 6, repMax: 8 },
{ id: "y1-3", name: "Vinopenkkipunnerrus laitteessa", sets: 2, repMin: 6, repMax: 8 },
{ id: "y1-4", name: "Rintatuettu soutu laitteessa leveällä otteella", sets: 3, repMin: 6, repMax: 10 },
{ id: "y1-5", name: "Vipunostot sivuille laitteessa", sets: 3, repMin: 8, repMax: 12 },
{ id: "y1-6", name: "Scott hauiskääntö käsipainolla", sets: 3, repMin: 8, repMax: 12 },
{ id: "y1-7", name: "Pään takaa punnerrus taljassa narulla", sets: 3, repMin: 8, repMax: 12 },
],
},
ala1: {
label: "Ala 1",
exercises: [
{ id: "a1-1", name: "Reisikoukistus maaten", sets: 3, repMin: 8, repMax: 12 },
{ id: "a1-2", name: "Jalkaprässi jalat alhaalla", sets: 3, repMin: 6, repMax: 8 },
{ id: "a1-3", name: "Hyperextension (takareisille)", sets: 2, repMin: 8, repMax: 12 },
{ id: "a1-4", name: "1 Jalan reisiojennus", sets: 2, repMin: 8, repMax: 12 },
{ id: "a1-5", name: "Pohkeet seisten laitteessa", sets: 3, repMin: 8, repMax: 10 },
],
},
yla2: {
label: "Ylä 2",
exercises: [
{ id: "y2-1", name: "Pystypunnerrus istuen laitteessa", sets: 2, repMin: 6, repMax: 8 },
{ id: "y2-2", name: "Leuanveto vastaotteella", sets: 2, repMin: 6, repMax: 10, note: "Laite tai lisäpainolla — valitse kerta kohtaisesti kyynärpään mukaan" },
{ id: "y2-3", name: "Dippi", sets: 2, repMin: 6, repMax: 10, note: "Laite tai lisäpainolla — valitse kerta kohtaisesti kyynärpään mukaan" },
{ id: "y2-4", name: "Rintatuettu t-kulmasoutu (yläselkä)", sets: 3, repMin: 6, repMax: 10 },
{ id: "y2-7", name: "Rintaflye laitteessa (pec deck)", sets: 2, repMin: 10, repMax: 15 },
{ id: "y2-5", name: "Hammerkääntö narulla taljassa", sets: 3, repMin: 8, repMax: 12 },
{ id: "y2-6", name: "Pushdown taljassa tangolla", sets: 2, repMin: 8, repMax: 12 },
],
},
ala2: {
label: "Ala 2",
exercises: [
{ id: "a2-1", name: "Reisikoukistus istuen", sets: 3, repMin: 8, repMax: 12 },
{ id: "a2-2", name: "Hack kyykky", sets: 3, repMin: 6, repMax: 8 },
{ id: "a2-3", name: "Lantionnosto laitteessa", sets: 2, repMin: 6, repMax: 8 },
{ id: "a2-4", name: "Reisiojennus laitteessa", sets: 2, repMin: 8, repMax: 12 },
{ id: "a2-5", name: "Pohkeet seisten laitteessa", sets: 3, repMin: 6, repMax: 8 },
{ id: "a2-6", name: "Vatsarutistus taljassa", sets: 3, repMin: 8, repMax: 12 },
],
},
};

const DAY_ORDER = ["yla1", "ala1", "yla2", "ala2"];
const LOG_KEY = "training-log-v1";
const PROGRAM_KEY = "custom-program-v1";
const PROGRAM_VERSION_KEY = "program-version";
const PROGRAM_VERSION = 2;
const MIGRATED_DAYS = { 2: ["yla1", "yla2"] };

const todayStr = () =>
new Date().toLocaleDateString("fi-FI", { day: "2-digit", month: "2-digit", year: "numeric" });

const genId = () => `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
const roundWeight = (w) => Math.round(w / 2.5) * 2.5;

/* ---------------------------------------------------------
OHJELMAN TALLENNUS (muokattava)
--------------------------------------------------------- */
let customProgram = null;

function loadProgram() {
try {
const raw = localStorage.getItem(PROGRAM_KEY);
if (raw) customProgram = JSON.parse(raw);
} catch (e) {
console.error("Ohjelman lataus epäonnistui", e);
}
migrateProgram();
}

/* Vie oletusohjelman päivitykset puhelimeen tallennettuun ohjelmaan.
- sarjamäärät ja uudet liikkeet tulevat oletuksesta
- omat nimi-, toisto- ja huomautusmuutokset säilyvät
- itse lisätyt liikkeet säilyvät listan lopussa
- liikkeiden id:t eivät muutu, joten historia ja trendit säilyvät */
function migrateProgram() {
let stored = 1;
try {
stored = Number(localStorage.getItem(PROGRAM_VERSION_KEY)) || 1;
} catch (e) {}
if (stored >= PROGRAM_VERSION) return;

if (customProgram) {
for (let v = stored + 1; v <= PROGRAM_VERSION; v++) {
(MIGRATED_DAYS[v] || []).forEach((dayKey) => {
const custom = (customProgram[dayKey] && customProgram[dayKey].exercises) || [];
const byId = {};
custom.forEach((ex) => (byId[ex.id] = ex));
const defaults = DEFAULT_PROGRAM[dayKey].exercises;
const defaultIds = new Set(defaults.map((ex) => ex.id));
const merged = defaults.map((def) => {
const own = byId[def.id];
return own ? { ...def, ...own, sets: def.sets } : { ...def };
});
custom.filter((ex) => !defaultIds.has(ex.id)).forEach((ex) => merged.push(ex));
customProgram[dayKey] = {
label: (customProgram[dayKey] && customProgram[dayKey].label) || DEFAULT_PROGRAM[dayKey].label,
exercises: merged,
};
});
}
persistProgram();
}
try {
localStorage.setItem(PROGRAM_VERSION_KEY, String(PROGRAM_VERSION));
} catch (e) {}
}

function getProgram() {
return customProgram || DEFAULT_PROGRAM;
}

function persistProgram() {
try {
localStorage.setItem(PROGRAM_KEY, JSON.stringify(customProgram));
return true;
} catch (e) {
console.error("Ohjelman tallennus epäonnistui", e);
return false;
}
}

function saveProgramDay(dayKey, exercises) {
if (!customProgram) customProgram = JSON.parse(JSON.stringify(DEFAULT_PROGRAM));
customProgram[dayKey] = {
label: (customProgram[dayKey] && customProgram[dayKey].label) || DEFAULT_PROGRAM[dayKey].label,
exercises,
};
return persistProgram();
}

function resetProgramDay(dayKey) {
if (!customProgram) customProgram = JSON.parse(JSON.stringify(DEFAULT_PROGRAM));
customProgram[dayKey] = JSON.parse(JSON.stringify(DEFAULT_PROGRAM[dayKey]));
return persistProgram();
}

/* ---------------------------------------------------------
TREENILOKI
--------------------------------------------------------- */
let state = {
dayKey: "yla1",
tab: "treeni",
entries: {},
log: { sessions: [], lastByExercise: {} },
editDayKey: "yla1",
editExercises: [],
};

function loadLog() {
try {
const raw = localStorage.getItem(LOG_KEY);
if (raw) state.log = JSON.parse(raw);
} catch (e) {
console.error("Lokin lataus epäonnistui", e);
}
}

function persistLog() {
try {
localStorage.setItem(LOG_KEY, JSON.stringify(state.log));
return true;
} catch (e) {
console.error("Tallennus epäonnistui", e);
return false;
}
}

function resetEntriesForDay(dayKey) {
const entries = {};
getProgram()[dayKey].exercises.forEach((ex) => {
entries[ex.id] = Array.from({ length: ex.sets }, () => ({ weight: "", reps: "" }));
});
state.entries = entries;
}

function lastFor(exId) {
return state.log.lastByExercise[exId];
}

function hasAnyInput() {
return Object.values(state.entries).some((sets) =>
sets.some((s) => s.weight !== "" || s.reps !== "")
);
}

/* ---------------------------------------------------------
PROGRESSIOEHDOTUS
- katsoo kaksi viimeisintä kirjattua kertaa samasta liikkeestä
- nostaa vasta kun MOLEMMAT kerrat olivat täynnä (maltillinen)
--------------------------------------------------------- */
function sessionsFor(exId) {
return state.log.sessions.filter((s) => s.exercises && s.exercises[exId]);
}

function hitCeiling(sets, ex) {
return (
sets.length > 0 &&
sets.every((s) => s.weight !== "" && Number(s.reps) >= ex.repMax && Number(s.reps) > 0)
);
}

function belowFloor(sets, ex) {
return sets.some((s) => Number(s.reps) > 0 && Number(s.reps) < ex.repMin);
}

function topWeightOf(sets) {
return Math.max(...sets.map((s) => Number(s.weight) || 0));
}

function suggestion(ex) {
const recent = sessionsFor(ex.id).slice(0, 2); // uusin ensin
if (recent.length === 0) return null;

const newest = recent[0].exercises[ex.id];

if (recent.length >= 2) {
const second = recent[1].exercises[ex.id];
if (hitCeiling(newest, ex) && hitCeiling(second, ex)) {
const w = topWeightOf(newest);
const newW = roundWeight(w * 1.05);
return {
type: "up",
text: `Kaksi kertaa peräkkäin täynnä (${ex.repMax} toistoa) → nosta ${w}kg → ${newW}kg`,
};
}
if (hitCeiling(newest, ex)) {
return { type: "wait", text: "Täynnä — hae sama tulos vielä kerran ennen nostoa" };
}
} else if (hitCeiling(newest, ex)) {
return { type: "wait", text: "Täynnä ensimmäistä kertaa — hae sama tulos uudelleen ennen nostoa" };
}

if (belowFloor(newest, ex)) {
return { type: "hold", text: "Jäit haarukan alle → toista sama paino" };
}
return { type: "push", text: `Hae tänään ${ex.repMax} toistoa ennen kuormanlisäystä` };
}

/* ---------------------------------------------------------
KEHITYS-TRENDI (viimeisimmät 3 kertaa per liike)
--------------------------------------------------------- */
function scoreOf(sets) {
return Math.max(
...sets.map((s) => {
const w = Number(s.weight) || 0;
const r = Number(s.reps) || 0;
return w * (1 + r / 30);
})
);
}

function topSetOf(sets) {
let best = sets[0];
let bestScore = -1;
sets.forEach((s) => {
const w = Number(s.weight) || 0;
const r = Number(s.reps) || 0;
const sc = w * (1 + r / 30);
if (sc > bestScore) {
bestScore = sc;
best = s;
}
});
return best;
}

function computeTrend(ex) {
const sessions = sessionsFor(ex.id).slice(0, 3);
if (sessions.length === 0) return null;
const ordered = [...sessions].reverse();
const points = ordered.map((s) => ({
date: s.date,
sets: s.exercises[ex.id],
score: scoreOf(s.exercises[ex.id]),
}));

if (points.length < 2) {
return { type: "single", points };
}

const first = points[0].score;
const last = points[points.length - 1].score;
let type;
if (last > first * 1.02) type = "up";
else if (last < first * 0.98) type = "down";
else type = "flat";

return { type, points };
}

const TREND_RANK = { down: 0, flat: 1, single: 2, up: 3 };

/* ---------------------------------------------------------
RENDER — apurit
--------------------------------------------------------- */
const app = document.getElementById("app");

function el(tag, className, text) {
const e = document.createElement(tag);
if (className) e.className = className;
if (text !== undefined) e.textContent = text;
return e;
}

function render() {
app.innerHTML = "";
app.appendChild(renderHeader());
app.appendChild(renderTabs());

if (state.tab === "treeni") {
app.appendChild(renderDayPicker(state.dayKey, (k) => {
state.dayKey = k;
resetEntriesForDay(k);
render();
}));
app.appendChild(renderMainTreeni());
app.appendChild(renderSaveBar());
} else if (state.tab === "kehitys") {
app.appendChild(renderKehitys());
} else if (state.tab === "historia") {
app.appendChild(renderHistoria());
} else if (state.tab === "muokkaa") {
app.appendChild(renderDayPicker(state.editDayKey, (k) => {
state.editDayKey = k;
state.editExercises = JSON.parse(JSON.stringify(getProgram()[k].exercises));
render();
}));
app.appendChild(renderMuokkaa());
}
}

function renderHeader() {
const header = el("div", "header");
const top = el("div", "header-top");
top.appendChild(el("span", "eyebrow", "ALEKSI TÖLLI — RAUTALOKI"));
top.appendChild(el("span", "date-tag", todayStr()));
header.appendChild(top);
header.appendChild(el("h1", "title", "Treeniseuranta"));
return header;
}

function renderTabs() {
const nav = el("nav", "tab-row");
const tabs = [
["treeni", "Tänään"],
["kehitys", "Kehitys"],
["historia", "Historia"],
["muokkaa", "Muokkaa"],
];
tabs.forEach(([key, label]) => {
const btn = el("button", "tab-btn" + (state.tab === key ? " active" : ""), label);
btn.onclick = () => {
state.tab = key;
if (key === "muokkaa") {
state.editDayKey = state.dayKey;
state.editExercises = JSON.parse(JSON.stringify(getProgram()[state.editDayKey].exercises));
}
render();
};
nav.appendChild(btn);
});
return nav;
}

function renderDayPicker(activeKey, onPick) {
const wrap = el("div", "day-picker");
DAY_ORDER.forEach((k) => {
const btn = el("button", "day-btn" + (activeKey === k ? " active" : ""), getProgram()[k].label);
btn.onclick = () => onPick(k);
wrap.appendChild(btn);
});
return wrap;
}

/* ---------------------------------------------------------
TÄNÄÄN-VÄLILEHTI
--------------------------------------------------------- */
function renderMainTreeni() {
const main = el("main", "main");
const day = getProgram()[state.dayKey];

day.exercises.forEach((ex) => {
const card = el("section", "card");
const head = el("div", "card-head");
head.appendChild(el("h2", "ex-name", ex.name));
head.appendChild(el("span", "rep-range", `${ex.sets} sarjaa · ${ex.repMin}-${ex.repMax} toistoa`));
if (ex.note) head.appendChild(el("div", "ex-note", ex.note));
card.appendChild(head);

const last = lastFor(ex.id);
if (last) {
const lastRow = el("div", "last-row");
lastRow.appendChild(el("span", "last-label", `Viimeksi (${last.date}):`));
const values = el("span", "last-values");
last.sets.forEach((s) => {
values.appendChild(el("span", "chip", `${s.weight || "–"}kg×${s.reps || "–"}`));
});
lastRow.appendChild(values);
card.appendChild(lastRow);
}

const sug = suggestion(ex);
if (sug) {
const sugEl = el(
"div",
"suggestion" + (sug.type === "up" ? " up" : ""),
(sug.type === "up" ? "▲ " : "› ") + sug.text
);
card.appendChild(sugEl);
}

const grid = el("div", "sets-grid");
const headerRow = el("div", "sets-header-row");
headerRow.appendChild(el("span", "sets-header-cell", "Sarja"));
headerRow.appendChild(el("span", "sets-header-cell", "Kg"));
headerRow.appendChild(el("span", "sets-header-cell", "Toistot"));
grid.appendChild(headerRow);

if (!state.entries[ex.id]) {
state.entries[ex.id] = Array.from({ length: ex.sets }, () => ({ weight: "", reps: "" }));
}

state.entries[ex.id].forEach((s, idx) => {
const row = el("div", "set-row");
row.appendChild(el("span", "set-index", String(idx + 1)));

const weightInput = document.createElement("input");
weightInput.type = "number";
weightInput.inputMode = "decimal";
weightInput.className = "set-input";
weightInput.placeholder = last?.sets[idx]?.weight || "0";
weightInput.value = s.weight;
weightInput.oninput = (e) => {
state.entries[ex.id][idx].weight = e.target.value;
updateSaveBtn();
};
row.appendChild(weightInput);

const repsInput = document.createElement("input");
repsInput.type = "number";
repsInput.inputMode = "numeric";
repsInput.className = "set-input";
repsInput.placeholder = last?.sets[idx]?.reps || "0";
repsInput.value = s.reps;
repsInput.oninput = (e) => {
state.entries[ex.id][idx].reps = e.target.value;
updateSaveBtn();
};
row.appendChild(repsInput);

grid.appendChild(row);
});

card.appendChild(grid);
main.appendChild(card);
});

return main;
}

function updateSaveBtn() {
const btn = document.getElementById("save-btn");
if (btn) btn.disabled = !hasAnyInput();
}

function renderSaveBar() {
const bar = el("div", "save-bar");
const btn = document.createElement("button");
btn.id = "save-btn";
btn.className = "save-btn";
btn.disabled = !hasAnyInput();
btn.textContent = `Tallenna ${getProgram()[state.dayKey].label}`;
btn.onclick = saveWorkout;
bar.appendChild(btn);
return bar;
}

function saveWorkout() {
if (!hasAnyInput()) return;
const btn = document.getElementById("save-btn");
btn.textContent = "Tallennetaan…";
btn.disabled = true;

const day = getProgram()[state.dayKey];
const cleanEntries = {};
const exerciseNames = {};
day.exercises.forEach((ex) => {
const sets = state.entries[ex.id].filter((s) => s.weight !== "" || s.reps !== "");
if (sets.length > 0) {
cleanEntries[ex.id] = sets;
exerciseNames[ex.id] = ex.name;
}
});

const session = {
id: `${state.dayKey}-${Date.now()}`,
day: state.dayKey,
dayLabel: day.label,
date: todayStr(),
timestamp: Date.now(),
exercises: cleanEntries,
exerciseNames,
};

Object.entries(cleanEntries).forEach(([exId, sets]) => {
state.log.lastByExercise[exId] = { date: session.date, sets };
});
state.log.sessions = [session, ...state.log.sessions].slice(0, 200);

const ok = persistLog();
btn.textContent = ok ? "Tallennettu ✓" : "Virhe — yritä uudelleen";

setTimeout(() => {
resetEntriesForDay(state.dayKey);
render();
}, 1200);
}

/* ---------------------------------------------------------
KEHITYS-VÄLILEHTI
--------------------------------------------------------- */
function renderKehitys() {
const main = el("main", "main");

const allExercises = [];
DAY_ORDER.forEach((dayKey) => {
getProgram()[dayKey].exercises.forEach((ex) => {
allExercises.push({ ...ex, dayKey, dayLabel: getProgram()[dayKey].label });
});
});

const withTrend = allExercises.map((ex) => ({ ex, trend: computeTrend(ex) }));
const withData = withTrend.filter((x) => x.trend !== null);
const withoutData = withTrend.filter((x) => x.trend === null);

withData.sort((a, b) => TREND_RANK[a.trend.type] - TREND_RANK[b.trend.type]);

if (withData.length === 0) {
main.appendChild(
el("p", "empty-text", "Ei vielä tarpeeksi dataa trendien näyttämiseen. Kirjaa muutama treeni ensin.")
);
return main;
}

const labels = { up: "▲ Nousussa", flat: "→ Tasainen", down: "▼ Laskussa", single: "• Yksi kirjaus" };
const cls = { up: "trend-up", flat: "trend-flat", down: "trend-down", single: "trend-single" };

withData.forEach(({ ex, trend }) => {
const card = el("section", "card");
const head = el("div", "card-head");
head.appendChild(el("h2", "ex-name", ex.name));
head.appendChild(el("span", "rep-range", `${ex.dayLabel}`));
card.appendChild(head);

card.appendChild(el("div", `trend-badge ${cls[trend.type]}`, labels[trend.type]));

const historyRow = el("div", "trend-history");
trend.points.forEach((p, i) => {
const top = topSetOf(p.sets);
if (i > 0) historyRow.appendChild(el("span", "trend-arrow", "→"));
historyRow.appendChild(el("span", "chip", `${top.weight || "–"}kg×${top.reps || "–"}`));
});
card.appendChild(historyRow);

main.appendChild(card);
});

if (withoutData.length > 0) {
main.appendChild(el("p", "empty-text", `${withoutData.length} liikettä ei vielä kirjattu kertaakaan.`));
}

return main;
}

/* ---------------------------------------------------------
HISTORIA-VÄLILEHTI
--------------------------------------------------------- */
function exerciseNameFor(session, exId) {
if (session.exerciseNames && session.exerciseNames[exId]) return session.exerciseNames[exId];
const found = getProgram()[session.day]?.exercises.find((e) => e.id === exId);
return found ? found.name : exId;
}

function renderHistoria() {
const main = el("main", "main");
if (state.log.sessions.length === 0) {
main.appendChild(
el("p", "empty-text", 'Ei vielä tallennettuja treenejä. Kirjaa ensimmäinen "Tänään"-välilehdeltä.')
);
return main;
}

state.log.sessions.forEach((s) => {
const card = el("section", "history-card");
const head = el("div", "history-head");
const left = el("div");
left.appendChild(el("span", "history-day", s.dayLabel));
left.appendChild(el("span", "history-date", s.date));
head.appendChild(left);

const delBtn = el("button", "delete-btn", "Poista");
delBtn.onclick = () => {
state.log.sessions = state.log.sessions.filter((x) => x.id !== s.id);
persistLog();
render();
};
head.appendChild(delBtn);
card.appendChild(head);

Object.entries(s.exercises).forEach(([exId, sets]) => {
const exName = exerciseNameFor(s, exId);
const row = el("div", "history-ex-row");
row.appendChild(el("span", "history-ex-name", exName));
const setsWrap = el("span", "history-ex-sets");
sets.forEach((st) => {
setsWrap.appendChild(el("span", "chip", `${st.weight || "–"}kg×${st.reps || "–"}`));
});
row.appendChild(setsWrap);
card.appendChild(row);
});

main.appendChild(card);
});

return main;
}

/* ---------------------------------------------------------
MUOKKAA-VÄLILEHTI
--------------------------------------------------------- */
function renderMuokkaa() {
const main = el("main", "main");

const intro = el(
"p",
"empty-text",
"Muokkaa liikkeet, sarjat ja toistot suoraan täältä. Muutokset tallentuvat vain tähän puhelimeen."
);
intro.style.padding = "4px 2px 4px";
intro.style.textAlign = "left";
main.appendChild(intro);

state.editExercises.forEach((ex, idx) => {
const card = el("section", "card edit-card");

const nameRow = el("div", "edit-row");
const nameInput = document.createElement("input");
nameInput.type = "text";
nameInput.className = "edit-input edit-name-input";
nameInput.placeholder = "Liikkeen nimi";
nameInput.value = ex.name;
nameInput.oninput = (e) => {
state.editExercises[idx].name = e.target.value;
};
nameRow.appendChild(nameInput);

const delBtn = el("button", "delete-btn", "×");
delBtn.onclick = () => {
state.editExercises.splice(idx, 1);
render();
};
nameRow.appendChild(delBtn);
card.appendChild(nameRow);

const numsRow = el("div", "edit-nums-row");

const setsWrap = el("label", "edit-field");
setsWrap.appendChild(el("span", "edit-field-label", "Sarjat"));
const setsInput = document.createElement("input");
setsInput.type = "number";
setsInput.className = "edit-input";
setsInput.value = ex.sets;
setsInput.min = "1";
setsInput.oninput = (e) => {
state.editExercises[idx].sets = Math.max(1, Number(e.target.value) || 1);
};
setsWrap.appendChild(setsInput);
numsRow.appendChild(setsWrap);

const repMinWrap = el("label", "edit-field");
repMinWrap.appendChild(el("span", "edit-field-label", "Min toistot"));
const repMinInput = document.createElement("input");
repMinInput.type = "number";
repMinInput.className = "edit-input";
repMinInput.value = ex.repMin;
repMinInput.oninput = (e) => {
state.editExercises[idx].repMin = Number(e.target.value) || 0;
};
repMinWrap.appendChild(repMinInput);
numsRow.appendChild(repMinWrap);

const repMaxWrap = el("label", "edit-field");
repMaxWrap.appendChild(el("span", "edit-field-label", "Max toistot"));
const repMaxInput = document.createElement("input");
repMaxInput.type = "number";
repMaxInput.className = "edit-input";
repMaxInput.value = ex.repMax;
repMaxInput.oninput = (e) => {
state.editExercises[idx].repMax = Number(e.target.value) || 0;
};
repMaxWrap.appendChild(repMaxInput);
numsRow.appendChild(repMaxWrap);

card.appendChild(numsRow);

const noteInput = document.createElement("input");
noteInput.type = "text";
noteInput.className = "edit-input edit-note-input";
noteInput.placeholder = "Huomautus (valinnainen)";
noteInput.value = ex.note || "";
noteInput.oninput = (e) => {
state.editExercises[idx].note = e.target.value;
};
card.appendChild(noteInput);

const moveRow = el("div", "edit-move-row");
const upBtn = el("button", "move-btn", "↑");
upBtn.disabled = idx === 0;
upBtn.onclick = () => {
if (idx === 0) return;
const tmp = state.editExercises[idx - 1];
state.editExercises[idx - 1] = state.editExercises[idx];
state.editExercises[idx] = tmp;
render();
};
const downBtn = el("button", "move-btn", "↓");
downBtn.disabled = idx === state.editExercises.length - 1;
downBtn.onclick = () => {
if (idx === state.editExercises.length - 1) return;
const tmp = state.editExercises[idx + 1];
state.editExercises[idx + 1] = state.editExercises[idx];
state.editExercises[idx] = tmp;
render();
};
moveRow.appendChild(upBtn);
moveRow.appendChild(downBtn);
card.appendChild(moveRow);

main.appendChild(card);
});

const addBtn = el("button", "add-ex-btn", "+ Lisää liike");
addBtn.onclick = () => {
state.editExercises.push({ id: genId(), name: "", sets: 3, repMin: 8, repMax: 12, note: "" });
render();
};
main.appendChild(addBtn);

const actionRow = el("div", "edit-actions");

const resetBtn = el("button", "reset-btn", "Palauta oletukset");
resetBtn.onclick = () => {
const ok = window.confirm(
`Palautetaanko ${getProgram()[state.editDayKey].label} takaisin PT:n alkuperäiseen ohjelmaan? Tämä ei poista treenihistoriaasi.`
);
if (!ok) return;
resetProgramDay(state.editDayKey);
state.editExercises = JSON.parse(JSON.stringify(getProgram()[state.editDayKey].exercises));
if (state.dayKey === state.editDayKey) resetEntriesForDay(state.dayKey);
render();
};
actionRow.appendChild(resetBtn);

const saveBtn = el("button", "save-btn edit-save-btn", "Tallenna muutokset");
saveBtn.onclick = () => {
const cleaned = state.editExercises
.filter((ex) => ex.name && ex.name.trim() !== "")
.map((ex) => ({
id: ex.id,
name: ex.name.trim(),
sets: Math.max(1, Number(ex.sets) || 1),
repMin: Number(ex.repMin) || 1,
repMax: Math.max(Number(ex.repMin) || 1, Number(ex.repMax) || 1),
...(ex.note && ex.note.trim() ? { note: ex.note.trim() } : {}),
}));

const ok = saveProgramDay(state.editDayKey, cleaned);
saveBtn.textContent = ok ? "Tallennettu ✓" : "Virhe — yritä uudelleen";
if (state.dayKey === state.editDayKey) resetEntriesForDay(state.dayKey);
setTimeout(() => {
saveBtn.textContent = "Tallenna muutokset";
render();
}, 1200);
};
actionRow.appendChild(saveBtn);

main.appendChild(actionRow);

return main;
}

/* ---------------------------------------------------------
KÄYNNISTYS
--------------------------------------------------------- */
loadProgram();
loadLog();
resetEntriesForDay(state.dayKey);
state.editExercises = JSON.parse(JSON.stringify(getProgram()[state.editDayKey].exercises));
render();
