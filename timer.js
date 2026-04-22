const DAYS_SHORT = ["Dl","Dm","Dc","Dj","Dv","Ds"];
const DAY_NAMES  = ["Dilluns","Dimarts","Dimecres","Dijous","Divendres","Dissabte/Dg"];

const ROUTINE = {
  1:{name:"Pit · Espatlla · Tríceps",emoji:"💪",type:"gym",exercises:[
    {name:"Press de pit amb barra",sets:4,reps:"8-12"},
    {name:"Chest fly cable/mancuernes",sets:3,reps:"10-12"},
    {name:"Press militar mancuernes",sets:4,reps:"8-12"},
    {name:"Elevacions laterals",sets:3,reps:"12-15"},
    {name:"Fons a les barres (dips)",sets:3,reps:"8-12"},
    {name:"Extensions tríceps cable",sets:3,reps:"12-15"}
  ]},
  2:{name:"Cardio — Running",emoji:"🏃",type:"cardio",exercises:[
    {name:"Escalfament caminar",sets:1,reps:"5 min"},
    {name:"Córrer 5-6 km @ 6min/km",sets:1,reps:"30-36 min"},
    {name:"Refredament estiraments",sets:1,reps:"5 min"}
  ]},
  3:{name:"Esquena · Bíceps",emoji:"🔙",type:"gym",exercises:[
    {name:"Rem amb barra/mancuernes",sets:4,reps:"8-12"},
    {name:"Rem en cable assegut",sets:3,reps:"10-12"},
    {name:"Dominades / Pulldown",sets:4,reps:"8-12"},
    {name:"Curl bíceps mancuernes",sets:3,reps:"10-12"},
    {name:"Curl martell",sets:3,reps:"10-12"},
    {name:"Hiperextensions lumbar",sets:3,reps:"12-15"}
  ]},
  4:{name:"Cames · Glutis",emoji:"🦵",type:"gym",exercises:[
    {name:"Sentadilla amb barra",sets:4,reps:"8-12"},
    {name:"Premsa de cames",sets:3,reps:"10-12"},
    {name:"Pes mort romanès",sets:4,reps:"8-12"},
    {name:"Llenadures (lunges)",sets:3,reps:"10 cada cama"},
    {name:"Extensions quàdriceps",sets:3,reps:"12-15"},
    {name:"Curl isquiotibials",sets:3,reps:"12-15"},
    {name:"Elevació de bessons",sets:4,reps:"15-20"}
  ]},
  5:{name:"Funcional · Core",emoji:"⚡",type:"func",exercises:[
    {name:"Planxa",sets:3,reps:"45 seg"},
    {name:"Abdominals",sets:3,reps:"20"},
    {name:"Russian twists",sets:3,reps:"20"},
    {name:"Mountain climbers",sets:3,reps:"30 seg"},
    {name:"Burpees",sets:3,reps:"10"}
  ]}
};

// 0=Dilluns(descans), 1=Dimarts, 2=Dimecres, 3=Dijous, 4=Divendres, 5=Dissabte/Dg
const DAY_ROUTINE = [0,1,2,3,4,5];

function getWK() {
  const now = new Date();
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const dn = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dn);
  const ys = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return d.getUTCFullYear() + "-W" + Math.ceil((((d - ys) / 86400000) + 1) / 7);
}

function todayIdx() {
  return ({1:0,2:1,3:2,4:3,5:4,6:5,0:5})[new Date().getDay()];
}

function lsGet(k, def) {
  try { return JSON.parse(localStorage.getItem(k) || "null") || def; }
  catch { return def; }
}

function lsSave() {
  try {
    localStorage.setItem("gw", JSON.stringify(S.wd));
    localStorage.setItem("gp", JSON.stringify(S.pd));
    localStorage.setItem("gh", JSON.stringify(S.hd));
  } catch(e) {}
}

var S = {
  view: "home",
  day: todayIdx(),
  openEx: null,
  wd: lsGet("gw", {}),
  pd: lsGet("gp", {}),
  hd: lsGet("gh", []),
  wi: {},
  T: {total:90, rem:90, run:false, fin:false, iid:null}
};

function toast(m) {
  document.querySelectorAll(".toast").forEach(function(e){ e.remove(); });
  var t = document.createElement("div");
  t.className = "toast"; t.textContent = m;
  document.body.appendChild(t);
  setTimeout(function(){ t.remove(); }, 2500);
}

function isDone(d) {
  return S.wd[getWK()] && S.wd[getWK()][d] && S.wd[getWK()][d].done === true;
}

function getSets(d, i) {
  return (S.wd[getWK()] && S.wd[getWK()][d] && S.wd[getWK()][d].sets && S.wd[getWK()][d].sets[i]) || 0;
}

function markSet(d, i, tot) {
  var wk = getWK(), cur = getSets(d,i), nx = cur >= tot ? 0 : cur + 1;
  if (!S.wd[wk]) S.wd[wk] = {};
  if (!S.wd[wk][d]) S.wd[wk][d] = {};
  if (!S.wd[wk][d].sets) S.wd[wk][d].sets = {};
  S.wd[wk][d].sets[i] = nx;
  lsSave(); render();
}

function markDone(d) {
  var rk = DAY_ROUTINE[d]; if (!rk) return;
  var wk = getWK();
  if (!S.wd[wk]) S.wd[wk] = {};
  if (!S.wd[wk][d]) S.wd[wk][d] = {};
  S.wd[wk][d].done = true;
  var r = ROUTINE[rk];
  S.hd.unshift({date: new Date().toLocaleDateString("ca-ES"), day: DAY_NAMES[d], routine: r.name, emoji: r.emoji});
  if (S.hd.length > 60) S.hd = S.hd.slice(0, 60);
  lsSave(); S.view = "home"; render(); toast("💪 Sessió completada!");
}

function saveW(d, i) {
  var v = parseFloat(S.wi[d+"-"+i]); if (!v || isNaN(v)) return;
  var k = d+"-"+i;
  if (!S.pd[k]) S.pd[k] = [];
  S.pd[k].push({date: new Date().toLocaleDateString("ca-ES"), weight: v});
  if (S.pd[k].length > 30) S.pd[k] = S.pd[k].slice(-30);
  S.wi[d+"-"+i] = ""; lsSave(); render(); toast("✅ Pes guardat!");
}

function doneCnt() {
  return Object.values(S.wd[getWK()] || {}).filter(function(d){ return d && d.done; }).length;
}
