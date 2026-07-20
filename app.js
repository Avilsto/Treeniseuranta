/* ---------------------------------------------------------
   OHJELMADATA (PT:n suunnitelma 19.7)
--------------------------------------------------------- */
const PROGRAM = {
  yla1: {
    label: "Ylä 1",
    exercises: [
      { id: "y1-1", name: "Rintapunnerrus istuen laitteessa", sets: 2, repMin: 6, repMax: 8 },
      { id: "y1-2", name: "Ylätalja kapealla otteella", sets: 2, repMin: 6, repMax: 8 },
      { id: "y1-3", name: "Vinopenkkipunnerrus laitteessa", sets: 2, repMin: 6, repMax: 8 },
      { id: "y1-4", name: "Rintatuettu soutu laitteessa leveällä otteella", sets: 2, repMin: 6, repMax: 10 },
      { id: "y1-5", name: "Vipunostot sivuille laitteessa", sets: 3, repMin: 8, repMax: 12 },
      { id: "y1-6", name: "Scott hauiskääntö käsipainolla", sets: 3, repMin: 8, repMax: 12 },
      { id: "y1-7", name: "Pään takaa punnerrus taljassa narulla", sets: 3, repMin: 8, repMax: 12 },
    ],
  },
  ala1: {
    label: "Ala 1",
    exercises: [
      { id: "a1-1", name: "Reisikoukistus maaten", sets: 3, repMin: 8, repMax: 12 },
      { id: "a1-2", name: "Jalkaprässi jalat alhaalla", sets: 2, repMin: 6, repMax: 8 },
      { id: "a1-3", name: "Hyperextension (takareisille)", sets: 2, repMin: 8, repMax: 12 },
      { id: "a1-4", name: "1 Jalan reisiojennus", sets: 2, repMin: 8, repMax: 12 },
      { id: "a1-5", name: "Pohkeet seisten laitteessa", sets: 3, repMin: 8, repMax: 10 },
    ],
  },
  yla2: {
    label: "Ylä 2",
    exercises: [
      { id: "y2-1", name: "Pystypunnerrus istuen laitteessa", sets: 2, repMin: 6, repMax: 8 },
      { id: "y2-2", name: "Leuanveto vastaotteella", sets: 2, repMin: 6, repMax: 10 },
      { id: "y2-3", name: "Dippi kehonpainolla", sets: 2, repMin: 6, repMax: 10 },
      { id: "y2-4", name: "Rintatuettu t-kulmasoutu (yläselkä)", sets: 2, repMin: 6, repMax: 10 },
      { id: "y2-5", name: "Hammerkääntö narulla taljassa", sets: 3, repMin: 8, repMax: 12 },
      { id: "y2-6", name: "Pushdown taljassa tangolla", sets: 2, repMin: 8, repMax: 12 },
    ],
  },
  ala2: {
    label: "Ala 2",
    exercises: [
      { id: "a2-1", name: "Reisikoukistus istuen", sets: 3, repMin: 8, repMax: 12 },
      { id: "a2-2", name: "Hack kyykky", sets: 2, repMin: 6, repMax: 8 },
      { id: "a2-3", name: "Lantionnosto laitteessa", sets: 2, repMin: 6, repMax: 8 },
      { id: "a2-4", name: "Reisiojennus laitteessa", sets: 2, repMin: 8, repMax: 12 },
      { id: "a2-5", name: "Pohkeet seisten laitteessa", sets: 3, repMin: 6, repMax: 8 },
      { id: "a2-6", name: "Vatsarutistus taljassa", sets: 3, repMin: 8, repMax: 12 },
    ],
  },
};

const DAY_ORDER = ["yla1", "ala1", "yla2", "ala2"];
const STORAGE_KEY = "training-log-v1";

const todayStr = () =>
  new Date().toLocaleDateString("fi-FI", { day: "2-digit", month: "2-digit", year: "numeric" });

/* ---------------------------------------------------------
   TILA
--------------------------------------------------------- */
let state = {
  dayKey: "yla1",
  tab: "treeni",
  entries: {},
  log: { sessions: [], lastByExercise: {} },
  saveState: "idle",
};

function loadLog() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state.log = JSON.parse(raw);
  } catch (e) {
    console.error("Lokin lataus epäonnistui", e);
  }
}

function persistLog() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.log));
    return true;
  } catch (e) {
    console.error("Tallennus epäonnistui", e);
    return false;
  }
}

function resetEntriesForDay(dayKey) {
  const entries = {};
  PROGRAM[dayKey].exercises.forEach((ex) => {
    entries[ex.id] = Array.from({ length: ex.sets }, () => ({ weight: "", reps: "" }));
  });
  state.entries = entries;
}

function lastFor(exId) {
  return state.log.lastByExercise[exId];
}

function suggestion(ex) {
  const last = lastFor(ex.id);
  if (!last) return null;
  const nums = last.sets.map((s) => Number(s.reps)).filter((n) => n > 0);
  if (nums.length === 0) return null;
  const hitTop = last.sets.every((s) => Number(s.reps) >= ex.repMax && Number(s.reps) > 0);
  const anyBelowMin = last.sets.some((s) => Number(s.reps) < ex.repMin && Number(s.reps) > 0);
  if (hitTop) return { type: "up", text: "Kaikki sarjat täynnä viimeksi → nosta painoa n. 5%" };
  if (anyBelowMin) return { type: "hold", text: "Jäit haarukan alle → toista sama paino" };
  return { type: "push", text: `Hae tänään ${ex.repMax} toistoa ennen kuormanlisäystä` };
}

function hasAnyInput() {
  return Object.values(state.entries).some((sets) =>
    sets.some((s) => s.weight !== "" || s.reps !== "")
  );
}

/* ---------------------------------------------------------
   RENDER
--------------------------------------------------------- */
const app = document.getElementById("app");

function render() {
  app.innerHTML = "";
  app.appendChild(renderHeader());
  app.appendChild(renderTabs());

  if (state.tab === "treeni") {
    app.appendChild(renderDayPicker());
    app.appendChild(renderMainTreeni());
    app.appendChild(renderSaveBar());
  } else {
    app.appendChild(renderHistoria());
  }
}

function el(tag, className, text) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (text !== undefined) e.textContent = text;
  return e;
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
  ["treeni", "historia"].forEach((t) => {
    const btn = el("button", "tab-btn" + (state.tab === t ? " active" : ""), t === "treeni" ? "Tänään" : "Historia");
    btn.onclick = () => {
      state.tab = t;
      render();
    };
    nav.appendChild(btn);
  });
  return nav;
}

function renderDayPicker() {
  const wrap = el("div", "day-picker");
  DAY_ORDER.forEach((k) => {
    const btn = el("button", "day-btn" + (state.dayKey === k ? " active" : ""), PROGRAM[k].label);
    btn.onclick = () => {
      state.dayKey = k;
      resetEntriesForDay(k);
      render();
    };
    wrap.appendChild(btn);
  });
  return wrap;
}

function renderMainTreeni() {
  const main = el("main", "main");
  const day = PROGRAM[state.dayKey];

  day.exercises.forEach((ex) => {
    const card = el("section", "card");
    const head = el("div", "card-head");
    head.appendChild(el("h2", "ex-name", ex.name));
    head.appendChild(el("span", "rep-range", `${ex.sets} sarjaa · ${ex.repMin}-${ex.repMax} toistoa`));
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
      const sugEl = el("div", "suggestion" + (sug.type === "up" ? " up" : ""), (sug.type === "up" ? "▲ " : "› ") + sug.text);
      card.appendChild(sugEl);
    }

    const grid = el("div", "sets-grid");
    const headerRow = el("div", "sets-header-row");
    headerRow.appendChild(el("span", "sets-header-cell", "Sarja"));
    headerRow.appendChild(el("span", "sets-header-cell", "Kg"));
    headerRow.appendChild(el("span", "sets-header-cell", "Toistot"));
    grid.appendChild(headerRow);

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
  btn.textContent = `Tallenna ${PROGRAM[state.dayKey].label}`;
  btn.onclick = saveWorkout;
  bar.appendChild(btn);
  return bar;
}

function saveWorkout() {
  if (!hasAnyInput()) return;
  const btn = document.getElementById("save-btn");
  btn.textContent = "Tallennetaan…";
  btn.disabled = true;

  const day = PROGRAM[state.dayKey];
  const cleanEntries = {};
  day.exercises.forEach((ex) => {
    const sets = state.entries[ex.id].filter((s) => s.weight !== "" || s.reps !== "");
    if (sets.length > 0) cleanEntries[ex.id] = sets;
  });

  const session = {
    id: `${state.dayKey}-${Date.now()}`,
    day: state.dayKey,
    dayLabel: day.label,
    date: todayStr(),
    timestamp: Date.now(),
    exercises: cleanEntries,
  };

  Object.entries(cleanEntries).forEach(([exId, sets]) => {
    state.log.lastByExercise[exId] = { date: session.date, sets };
  });
  state.log.sessions = [session, ...state.log.sessions].slice(0, 100);

  const ok = persistLog();
  btn.textContent = ok ? "Tallennettu ✓" : "Virhe — yritä uudelleen";

  setTimeout(() => {
    resetEntriesForDay(state.dayKey);
    render();
  }, 1200);
}

function renderHistoria() {
  const main = el("main", "main");
  if (state.log.sessions.length === 0) {
    main.appendChild(el("p", "empty-text", 'Ei vielä tallennettuja treenejä. Kirjaa ensimmäinen "Tänään"-välilehdeltä.'));
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
      const exName = PROGRAM[s.day]?.exercises.find((e) => e.id === exId)?.name || exId;
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
   KÄYNNISTYS
--------------------------------------------------------- */
loadLog();
resetEntriesForDay(state.dayKey);
render();
