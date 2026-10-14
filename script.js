/* ============================================================
   DATA
   Each event has a capacity and a "seed" number of seats that
   are already taken, so the participant counter has something
   to show before anyone registers.
   ============================================================ */
const EVENTS = [
  {
    id: "ethical-hacking",
    title: "Intro to Ethical Hacking Workshop",
    category: "Tech",
    date: "2026-10-24", time: "1:00 PM – 5:00 PM",
    venue: "Computer Laboratory 2",
    organizer: "IT Department",
    capacity: 40, seed: 31,
    description: "A hands-on session on how attackers think and how defenders respond. You will scan a practice network, spot common weaknesses, and learn how to fix them. Bring a laptop with a virtual machine tool installed.",
    agenda: ["Welcome and safety rules", "Reconnaissance basics", "Guided lab: finding weak passwords", "Hardening a small network", "Q&A and certificates"]
  },
  {
    id: "career-fair",
    title: "Career Fair and Resume Clinic",
    category: "Career",
    date: "2026-10-29", time: "9:00 AM – 4:00 PM",
    venue: "Main Gymnasium",
    organizer: "Office of Student Affairs",
    capacity: 200, seed: 143,
    description: "Meet hiring teams from local companies, get your resume reviewed by working professionals, and join short mock interviews. Wear business casual and bring printed copies of your resume.",
    agenda: ["Company booths open", "Resume clinic (walk-in)", "Mock interview rounds", "Panel: your first job in IT", "Raffle and closing"]
  },
  {
    id: "wellness-talk",
    title: "Mental Health Awareness Talk",
    category: "Wellness",
    date: "2026-10-27", time: "2:00 PM – 4:00 PM",
    venue: "AVR, 3rd Floor",
    organizer: "Guidance Office",
    capacity: 80, seed: 52,
    description: "A practical talk on handling academic stress, building healthy routines, and knowing where to find support on and off campus. Open to all year levels.",
    agenda: ["Opening remarks", "Talk: stress during finals season", "Small group sharing (optional)", "Campus support services overview"]
  },
  {
    id: "hackathon",
    title: "Intercollegiate Hackathon: 24 Hours of Code",
    category: "Tech",
    date: "2026-11-07", time: "8:00 AM (Sat) – 8:00 AM (Sun)",
    venue: "Innovation Hub",
    organizer: "Computer Society",
    capacity: 120, seed: 84,
    description: "Form a team of up to four and build a working web or mobile prototype in 24 hours around the theme \"Tools for Local Communities\". Mentors will be on site all night. Meals are provided.",
    agenda: ["Registration and team check-in", "Theme reveal and kickoff", "Mentor rounds", "Midnight snack break", "Demos and judging", "Awarding"]
  },
  {
    id: "photo-walk",
    title: "Photography Walk: Intramuros",
    category: "Arts",
    date: "2026-11-01", time: "6:00 AM – 11:00 AM",
    venue: "Fort Santiago Gate, Intramuros",
    organizer: "Photography Club",
    capacity: 25, seed: 25,
    description: "A guided morning walk through Intramuros with tips on composition and golden-hour light. Any camera is welcome, including phones. This event is already full.",
    agenda: ["Meet-up at the gate", "Composition mini-lesson", "Guided walk and shooting", "Photo sharing over coffee"]
  },
  {
    id: "futsal",
    title: "Futsal Friendly: IT vs. Business",
    category: "Sports",
    date: "2026-11-14", time: "3:00 PM – 6:00 PM",
    venue: "University Covered Court",
    organizer: "Sports Committee",
    capacity: 30, seed: 18,
    description: "A friendly match between the IT and Business departments. Register as a player or as a supporter. Wear rubber shoes and bring your own water bottle.",
    agenda: ["Team lineup", "First half", "Halftime", "Second half", "Photos and awarding"]
  },
  {
    id: "orientation",
    title: "Freshmen Orientation Day",
    category: "Career",
    date: "2026-10-10", time: "8:00 AM – 12:00 PM",
    venue: "Main Gymnasium",
    organizer: "Office of Student Affairs",
    capacity: 150, seed: 150,
    description: "Welcome program for incoming students. Registration for this event has closed.",
    agenda: ["Welcome", "Campus tour", "Student life overview"]
  }
];

const COURSES = [
  "BS Information Technology", "BS Computer Science", "BS Information Systems",
  "BS Business Administration", "BS Accountancy", "Other"
];
const YEARS = ["1st year", "2nd year", "3rd year", "4th year"];

/* ============================================================
   STORAGE
   Registrations are saved in the browser (localStorage), so
   the counter and confirmation survive a page refresh.
   ============================================================ */
const KEY = "pasok.registrations.v1";

function loadRegs() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; }
  catch (e) { return []; }
}
function saveRegs(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); }
  catch (e) { toast("Could not save. Your browser may be blocking storage."); }
}

/* ============================================================
   HELPERS
   ============================================================ */
const $app = document.getElementById("app");

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function getEvent(id) { return EVENTS.find(e => e.id === id); }
function parseDate(iso) { const [y, m, d] = iso.split("-").map(Number); return new Date(y, m - 1, d); }
function fmtLong(iso) { return parseDate(iso).toLocaleDateString("en-PH", { weekday: "long", year: "numeric", month: "long", day: "numeric" }); }
function isPast(ev) {
  const t = new Date(); t.setHours(0, 0, 0, 0);
  return parseDate(ev.date) < t;
}
function takenSeats(ev) {
  const extra = loadRegs().filter(r => r.eventId === ev.id).reduce((n, r) => n + r.seats, 0);
  return Math.min(ev.capacity, ev.seed + extra);
}
function spotsLeft(ev) { return ev.capacity - takenSeats(ev); }
function status(ev) {
  if (isPast(ev)) return "closed";
  if (spotsLeft(ev) <= 0) return "full";
  return "open";
}
function makeRef() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return "PSK-" + code;
}
let toastTimer;
function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
}
function capBar(ev) {
  const taken = takenSeats(ev);
  const pct = Math.round((taken / ev.capacity) * 100);
  const left = ev.capacity - taken;
  const cls = left <= 0 ? "full" : pct >= 80 ? "warn" : "";
  return { pct, left, taken, cls };
}
function maskName(full) {
  const parts = full.trim().split(/\s+/);
  return parts.length > 1 ? parts[0] + " " + parts[parts.length - 1][0] + "." : parts[0];
}

/* ============================================================
   VIEW: EVENT LIST
   ============================================================ */
const filters = { q: "", cat: "All", hideFull: false };

function viewList() {
  const regs = loadRegs();
  const upcoming = EVENTS.filter(e => !isPast(e));
  const totalPeople = EVENTS.reduce((n, e) => n + takenSeats(e), 0);
  const cats = ["All", ...new Set(EVENTS.map(e => e.category))];

  $app.innerHTML = `
    <section class="hero">
      <div class="wrap">
        <h1>Find an event and save your seat.</h1>
        <p>Browse what is happening on campus, check how many seats are left, and register in under a minute.</p>
        <div class="stats">
          <div class="stat"><strong>${upcoming.length}</strong><span>upcoming events</span></div>
          <div class="stat"><strong>${totalPeople}</strong><span>participants registered</span></div>
          <div class="stat"><strong>${regs.length}</strong><span>registrations from this device</span></div>
        </div>
      </div>
    </section>
    <main>
      <div class="wrap">
        <div class="toolbar">
          <div class="search">
            <label for="q" class="sr" style="position:absolute;left:-9999px">Search events</label>
            <input id="q" type="search" placeholder="Search by title, venue, or organizer" value="${esc(filters.q)}">
          </div>
          <div class="chips" role="group" aria-label="Filter by category">
            ${cats.map(c => `<button type="button" class="chip" data-cat="${esc(c)}" aria-pressed="${filters.cat === c}">${esc(c)}</button>`).join("")}
          </div>
          <label class="toggle"><input type="checkbox" id="hide-full" ${filters.hideFull ? "checked" : ""}> Hide full and closed</label>
        </div>
        <div class="list" id="list"></div>
      </div>
    </main>`;

  document.getElementById("q").addEventListener("input", e => { filters.q = e.target.value; renderCards(); });
  document.getElementById("hide-full").addEventListener("change", e => { filters.hideFull = e.target.checked; renderCards(); });
  document.querySelectorAll(".chip").forEach(b => b.addEventListener("click", () => {
    filters.cat = b.dataset.cat;
    document.querySelectorAll(".chip").forEach(x => x.setAttribute("aria-pressed", x === b));
    renderCards();
  }));
  renderCards();
}

function renderCards() {
  const q = filters.q.trim().toLowerCase();
  const items = EVENTS
    .filter(e => filters.cat === "All" || e.category === filters.cat)
    .filter(e => !q || (e.title + " " + e.venue + " " + e.organizer).toLowerCase().includes(q))
    .filter(e => !filters.hideFull || status(e) === "open")
    .sort((a, b) => {
      // open events first (soonest first), then past events last
      const pa = isPast(a), pb = isPast(b);
      if (pa !== pb) return pa ? 1 : -1;
      return parseDate(a.date) - parseDate(b.date);
    });

  const list = document.getElementById("list");
  if (!items.length) {
    list.innerHTML = `<div class="empty"><strong>No events match your search.</strong><br>Try a different keyword or choose "All".</div>`;
    return;
  }
  list.innerHTML = items.map(ev => {
    const d = parseDate(ev.date);
    const c = capBar(ev);
    const st = status(ev);
    const label = st === "closed" ? "Registration closed" : st === "full" ? "Event is full" : `${c.left} ${c.left === 1 ? "seat" : "seats"} left`;
    return `
      <article class="ticket">
        <div class="stub" aria-hidden="true">
          <span class="day">${d.getDate()}</span>
          <span class="mon">${d.toLocaleDateString("en-PH", { month: "short" })}</span>
          <span class="dow">${d.toLocaleDateString("en-PH", { weekday: "short" })}</span>
        </div>
        <div class="info">
          <span class="tag">${esc(ev.category)}</span>
          <h2>${esc(ev.title)}</h2>
          <div class="meta"><span>${esc(fmtLong(ev.date))}</span><span>${esc(ev.time)}</span><span>${esc(ev.venue)}</span></div>
          <div class="cap-line">
            <div class="bar ${c.cls}" role="img" aria-label="${c.taken} of ${ev.capacity} seats taken"><i style="width:${c.pct}%"></i></div>
            <div class="cap-text">${c.taken} of ${ev.capacity} registered &middot; ${label}</div>
          </div>
        </div>
        <div class="action">
          <a class="btn ${st === "open" ? "primary" : "ghost"}" href="#/event/${esc(ev.id)}">${st === "open" ? "View and register" : "View details"}</a>
        </div>
      </article>`;
  }).join("");
}

/* ============================================================
   VIEW: EVENT DETAILS + REGISTRATION FORM
   ============================================================ */
function viewDetail(id) {
  const ev = getEvent(id);
  if (!ev) return viewNotFound();
  const c = capBar(ev);
  const st = status(ev);
  const names = loadRegs().filter(r => r.eventId === ev.id).map(r => maskName(r.name));

  $app.innerHTML = `
    <main>
      <div class="wrap">
        <div class="crumb"><a href="#/">&larr; All events</a></div>
        <div class="detail">
          <div>
            <div class="panel">
              <span class="tag">${esc(ev.category)}</span>
              <h1>${esc(ev.title)}</h1>
              <p>${esc(ev.description)}</p>
              <ul class="facts">
                <li><small>Date</small><b>${esc(fmtLong(ev.date))}</b></li>
                <li><small>Time</small><b>${esc(ev.time)}</b></li>
                <li><small>Venue</small><b>${esc(ev.venue)}</b></li>
                <li><small>Organizer</small><b>${esc(ev.organizer)}</b></li>
              </ul>
              <h3>Program</h3>
              <ol class="agenda">${ev.agenda.map(a => `<li>${esc(a)}</li>`).join("")}</ol>
            </div>
            <div class="panel">
              <h3>Participants</h3>
              <div class="big-count"><strong id="taken">${c.taken}</strong><span>of ${ev.capacity} seats taken</span></div>
              <div class="bar ${c.cls}" style="margin-top:12px" role="img" aria-label="${c.pct}% full"><i style="width:${c.pct}%"></i></div>
              <div class="cap-text">${st === "closed" ? "Registration closed" : c.left <= 0 ? "This event is full" : c.left + (c.left === 1 ? " seat" : " seats") + " left"}</div>
              ${names.length ? `<div class="attendees" aria-label="Recently registered on this device">${names.map(n => `<span>${esc(n)}</span>`).join("")}</div>` : ""}
            </div>
          </div>
          <aside class="sticky">
            <div class="panel" id="form-panel">${formHTML(ev, st, c)}</div>
          </aside>
        </div>
      </div>
    </main>`;

  if (st === "open") wireForm(ev);
}

function formHTML(ev, st, c) {
  if (st === "closed") return `<h3>Registration closed</h3><div class="notice info">This event has already taken place.</div><a class="btn ghost" href="#/">Browse other events</a>`;
  if (st === "full") return `<h3>This event is full</h3><div class="notice info">All ${ev.capacity} seats are taken. Check other events you may like.</div><a class="btn ghost" href="#/">Browse other events</a>`;
  const maxSeats = Math.min(5, c.left);
  return `
    <h3>Register for this event</h3>
    <form id="reg-form" novalidate>
      <div class="notice" id="form-error" role="alert" hidden></div>
      <div class="field"><label for="name">Full name</label>
        <input id="name" name="name" autocomplete="name" placeholder="Juan Dela Cruz">
        <div class="err" data-for="name"></div></div>
      <div class="field"><label for="email">Email address</label>
        <input id="email" name="email" type="email" autocomplete="email" placeholder="juan@example.com">
        <div class="err" data-for="email"></div></div>
      <div class="row2">
        <div class="field"><label for="phone">Mobile number</label>
          <input id="phone" name="phone" inputmode="tel" autocomplete="tel" placeholder="09XX XXX XXXX">
          <div class="err" data-for="phone"></div></div>
        <div class="field"><label for="seats">Seats</label>
          <select id="seats" name="seats">${Array.from({ length: maxSeats }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join("")}</select>
          <div class="hint">Including yourself</div></div>
      </div>
      <div class="row2">
        <div class="field"><label for="course">Course</label>
          <select id="course" name="course"><option value="">Choose one</option>${COURSES.map(x => `<option>${esc(x)}</option>`).join("")}</select>
          <div class="err" data-for="course"></div></div>
        <div class="field"><label for="year">Year level</label>
          <select id="year" name="year"><option value="">Choose one</option>${YEARS.map(x => `<option>${x}</option>`).join("")}</select>
          <div class="err" data-for="year"></div></div>
      </div>
      <div class="check"><input type="checkbox" id="agree" name="agree">
        <label for="agree">I will attend and understand that my seat may be released if I do not show up.</label></div>
      <div class="err" data-for="agree" style="margin:-8px 0 12px"></div>
      <button class="btn primary" type="submit" style="width:100%">Confirm registration</button>
    </form>`;
}

function wireForm(ev) {
  const form = document.getElementById("reg-form");
  const rules = {
    name: v => v.trim().length < 2 ? "Enter your full name." : /\d/.test(v) ? "Names cannot contain numbers." : "",
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Enter a valid email, like name@example.com.",
    phone: v => /^(09|\+639)\d{9}$/.test(v.replace(/[\s-]/g, "")) ? "" : "Enter a Philippine mobile number, like 09171234567.",
    course: v => v ? "" : "Choose your course.",
    year: v => v ? "" : "Choose your year level.",
    agree: (v, el) => el.checked ? "" : "Please tick the box to continue."
  };

  function check(name) {
    const el = form.elements[name];
    const msg = rules[name](el.value, el);
    const box = form.querySelector(`.err[data-for="${name}"]`);
    box.textContent = msg;
    const field = el.closest(".field");
    if (field) field.classList.toggle("invalid", !!msg);
    el.setAttribute("aria-invalid", !!msg);
    return !msg;
  }
  Object.keys(rules).forEach(n => {
    form.elements[n].addEventListener("blur", () => check(n));
    form.elements[n].addEventListener("input", () => { if (form.querySelector(`.err[data-for="${n}"]`).textContent) check(n); });
  });

  form.addEventListener("submit", e => {
    e.preventDefault();
    const errBox = document.getElementById("form-error");
    errBox.hidden = true;

    const results = Object.keys(rules).map(check);
    if (results.includes(false)) {
      const first = Object.keys(rules).find(n => !check(n));
      form.elements[first].focus();
      return;
    }

    const seats = parseInt(form.elements.seats.value, 10);
    const email = form.elements.email.value.trim().toLowerCase();
    const regs = loadRegs();

    // Re-check capacity at submit time
    if (seats > spotsLeft(ev)) {
      errBox.textContent = `Only ${spotsLeft(ev)} seat(s) left. Lower the number of seats and try again.`;
      errBox.hidden = false;
      return;
    }
    if (regs.some(r => r.eventId === ev.id && r.email === email)) {
      errBox.textContent = "This email is already registered for this event. Check My registrations to view your ticket.";
      errBox.hidden = false;
      return;
    }

    const reg = {
      ref: makeRef(),
      eventId: ev.id,
      name: form.elements.name.value.trim(),
      email,
      phone: form.elements.phone.value.replace(/[\s-]/g, ""),
      course: form.elements.course.value,
      year: form.elements.year.value,
      seats,
      createdAt: new Date().toISOString()
    };
    regs.push(reg);
    saveRegs(regs);
    location.hash = "#/confirmation/" + reg.ref;
  });
}

/* ============================================================
   VIEW: CONFIRMATION
   ============================================================ */
function viewConfirmation(ref) {
  const reg = loadRegs().find(r => r.ref === ref);
  if (!reg) return viewNotFound("We could not find that registration.");
  const ev = getEvent(reg.eventId);

  $app.innerHTML = `
    <main>
      <div class="wrap">
        <div class="confirm">
          <div class="tick" aria-hidden="true">&#10003;</div>
          <h1>You are registered, ${esc(reg.name.split(" ")[0])}.</h1>
          <p>Show this pass at the entrance. Take a screenshot or print it.</p>
          <div class="pass">
            <div class="pass-head"><small>${esc(ev.category)} event</small><h2>${esc(ev.title)}</h2></div>
            <div class="pass-body">
              <div><small>Date</small><b>${esc(fmtLong(ev.date))}</b></div>
              <div><small>Time</small><b>${esc(ev.time)}</b></div>
              <div><small>Venue</small><b>${esc(ev.venue)}</b></div>
              <div><small>Seats reserved</small><b>${reg.seats}</b></div>
              <div><small>Registered name</small><b>${esc(reg.name)}</b></div>
              <div><small>Email</small><b>${esc(reg.email)}</b></div>
            </div>
            <div class="pass-ref"><div><small style="color:var(--ink-soft)">Reference code</small></div><span class="ref-code">${esc(reg.ref)}</span></div>
          </div>
          <div class="actions">
            <button class="btn primary" type="button" onclick="window.print()">Print pass</button>
            <a class="btn ghost" href="#/my">My registrations</a>
            <a class="btn ghost" href="#/">Browse more events</a>
          </div>
        </div>
      </div>
    </main>`;
  window.scrollTo(0, 0);
}

/* ============================================================
   VIEW: MY REGISTRATIONS (view ticket / cancel)
   ============================================================ */
function viewMy() {
  const regs = loadRegs().slice().reverse();
  $app.innerHTML = `
    <main>
      <div class="wrap">
        <div class="crumb"></div>
        <div class="panel">
          <h1 style="font-size:2rem;margin-bottom:6px">My registrations</h1>
          <p style="color:var(--ink-soft);margin-top:0">Registrations made on this device.</p>
          ${regs.length ? regs.map(r => {
            const ev = getEvent(r.eventId);
            return `
              <div class="reg-item">
                <div>
                  <h3>${esc(ev.title)}</h3>
                  <p>${esc(fmtLong(ev.date))} &middot; ${r.seats} ${r.seats === 1 ? "seat" : "seats"} &middot; ${esc(r.name)} &middot; ${esc(r.ref)}</p>
                </div>
                <div class="reg-actions">
                  <a class="btn ghost small" href="#/confirmation/${esc(r.ref)}">View pass</a>
                  <button class="btn danger small" type="button" data-cancel="${esc(r.ref)}">Cancel</button>
                </div>
              </div>`;
          }).join("") : `<div class="empty">You have no registrations yet.<br><a href="#/">Browse events</a></div>`}
        </div>
      </div>
    </main>`;

  document.querySelectorAll("[data-cancel]").forEach(b => b.addEventListener("click", () => {
    const ref = b.dataset.cancel;
    if (!confirm("Cancel this registration? Your seat will be released.")) return;
    saveRegs(loadRegs().filter(r => r.ref !== ref));
    toast("Registration cancelled. Your seat was released.");
    viewMy();
  }));
}

function viewNotFound(msg) {
  $app.innerHTML = `<main><div class="wrap"><div class="crumb"></div><div class="empty"><strong>${esc(msg || "That page does not exist.")}</strong><br><a href="#/">Back to events</a></div></div></main>`;
}

/* ============================================================
   ROUTER
   ============================================================ */
function route() {
  const parts = (location.hash.replace(/^#\/?/, "") || "").split("/");
  const [page, param] = parts;
  document.getElementById("nav-events").removeAttribute("aria-current");
  document.getElementById("nav-my").removeAttribute("aria-current");

  if (!page) { document.getElementById("nav-events").setAttribute("aria-current", "page"); viewList(); }
  else if (page === "event") { document.getElementById("nav-events").setAttribute("aria-current", "page"); viewDetail(param); window.scrollTo(0, 0); }
  else if (page === "confirmation") viewConfirmation(param);
  else if (page === "my") { document.getElementById("nav-my").setAttribute("aria-current", "page"); viewMy(); }
  else viewNotFound();
}
window.addEventListener("hashchange", route);

document.getElementById("reset-demo").addEventListener("click", () => {
  if (!confirm("Delete all registrations saved on this device?")) return;
  try { localStorage.removeItem(KEY); } catch (e) {}
  toast("Demo data cleared.");
  location.hash = "#/";
  route();
});

route();
