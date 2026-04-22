function render() {
  var h = "";
  if (S.view === "home")     h = rHome();
  else if (S.view === "workout")  h = rWorkout();
  else if (S.view === "timer")    h = rTimer();
  else if (S.view === "progress") h = rProgress();
  else if (S.view === "history")  h = rHistory();
  h += rNav();
  document.getElementById("app").innerHTML = h;
  bindAll();
}

function rHome() {
  var done = doneCnt(), pct = Math.round((done / 5) * 100);
  var bar = "";
  for (var i = 0; i < 6; i++) {
    var d = isDone(i), a = S.day === i;
    bar += '<div class="day-pill' + (a ? " active" : "") + (d ? " done" : "") + '" data-a="setday" data-v="' + i + '">' +
      '<span class="day-label">' + DAYS_SHORT[i] + "</span>" +
      '<div class="day-dot' + (d ? " done" : "") + '"></div></div>';
  }
  var rk = DAY_ROUTINE[S.day], card = "";
  if (rk === 0) {
    card = '<div class="card" style="cursor:default"><div class="card-emoji">😴</div>' +
      '<div class="card-name">Descans</div>' +
      '<div style="font-size:13px;color:var(--muted);margin-top:6px">Recuperació activa — estira, camina, descansa</div></div>';
  } else {
    var r = ROUTINE[rk], d2 = isDone(S.day);
    card = '<div class="card' + (d2 ? " done" : "") + '">' +
      '<div class="card-emoji">' + r.emoji + "</div>" +
      '<div class="card-day">' + DAY_NAMES[S.day] + "</div>" +
      '<div class="card-name">' + r.name + "</div>" +
      '<span class="pill pill-' + r.type + '">' + (r.type === "gym" ? "GYM" : r.type === "cardio" ? "CARDIO" : "FUNCIONAL") + "</span>" +
      (d2 ? '<div class="done-badge">✓ Completat!</div>' : "") + "</div>" +
      (!d2 ? '<button class="btn btn-primary" data-a="goworkout">INICIAR SESSIÓ &#8594;</button>' : "");
  }
  var list = "";
  for (var j = 0; j < 6; j++) {
    var rk2 = DAY_ROUTINE[j], r2 = rk2 ? ROUTINE[rk2] : null, dj = isDone(j);
    list += '<div class="wl-item" data-a="setday" data-v="' + j + '">' +
      '<div class="wl-icon' + (dj ? " done" : "") + '">' + (dj ? "✓" : (r2 ? r2.emoji : "😴")) + "</div>" +
      "<div>" +
      '<div class="wl-name' + (dj ? " done" : "") + '">' + DAY_NAMES[j] + "</div>" +
      '<div class="wl-sub">' + (r2 ? r2.name : "Descans") + "</div></div></div>";
  }
  return '<div class="header"><div class="title">GYM TRACKER</div>' +
    '<div class="subtitle">Setmana ' + getWK().split("W")[1] + " · " + done + "/5 sessions</div>" +
    '<div class="prog-bar"><div class="prog-fill" style="width:' + pct + '%"></div></div></div>' +
    '<div class="week-bar">' + bar + "</div>" +
    '<div class="section">' + card + "</div>" +
    '<div class="week-list"><div class="wl-label">TOTA LA SETMANA</div>' + list + "</div>";
}

function rWorkout() {
  var rk = DAY_ROUTINE[S.day];
  if (!rk) { S.view = "home"; return rHome(); }
  var r = ROUTINE[rk];
  var allDone = r.exercises.every(function(ex, i){ return getSets(S.day, i) >= ex.sets; });
  var rows = "";
  for (var i = 0; i < r.exercises.length; i++) {
    var ex = r.exercises[i], comp = getSets(S.day, i), done = comp >= ex.sets;
    var dots = "";
    for (var s = 0; s < ex.sets; s++)
      dots += '<div class="set-dot' + (s < comp ? " filled" : "") + '" data-a="mset" data-d="' + S.day + '" data-i="' + i + '" data-t="' + ex.sets + '"></div>';
    var isOpen = S.openEx === i;
    var lw = S.pd[S.day+"-"+i] ? S.pd[S.day+"-"+i].slice(-1)[0] : null;
    var iv = S.wi[S.day+"-"+i] || "";
    rows += '<div class="ex-row' + (done ? " done" : "") + '" data-a="toggleex" data-i="' + i + '">' +
      '<div class="ex-info"><div class="ex-name">' + ex.name + "</div>" +
      '<div class="ex-meta">' + ex.sets + " sèries × " + ex.reps + "</div></div>" +
      '<div class="set-dots">' + dots + "</div></div>" +
      (isOpen ? '<div class="weight-panel">' +
        '<input class="w-input" type="number" inputmode="decimal" placeholder="Pes (kg)" value="' + iv + '" data-a="winput" data-d="' + S.day + '" data-i="' + i + '">' +
        '<button class="w-btn" data-a="wsave" data-d="' + S.day + '" data-i="' + i + '">Guardar</button>' +
        (lw ? '<span class="w-last">Últim: ' + lw.weight + "kg</span>" : "") + "</div>" : "");
  }
  return '<div class="header">' +
    '<button class="back-btn" data-a="goback">&#8592; Tornar</button>' +
    '<div class="title">' + r.emoji + " " + r.name + "</div>" +
    '<div class="subtitle">' + DAY_NAMES[S.day] + " · " + r.exercises.length + " exercicis</div></div>" +
    '<div class="section"><div class="hint">Toca els cercles per marcar sèries</div>' + rows +
    '<button class="btn ' + (allDone ? "btn-success" : "btn-primary") + '" data-a="markdone" data-d="' + S.day + '" style="margin-top:14px">' +
    (allDone ? "✓ SESSIÓ COMPLETADA" : "MARCAR COM A FETA &#8594;") + "</button></div>";
}

function rTimer() {
  return '<div class="header"><div class="title">&#9201; CRONÒMETRE</div>' +
    '<div class="subtitle">Temps de descans entre sèries</div></div>' +
    '<div class="timer-wrap"><div id="tdyn">' + tHTML() + "</div></div>";
}

function rProgress() {
  var c = "";
  for (var di = 0; di < 6; di++) {
    var rk = DAY_ROUTINE[di];
    if (!rk || ROUTINE[rk].type === "cardio") continue;
    var r = ROUTINE[rk], cards = "";
    for (var ei = 0; ei < r.exercises.length; ei++) {
      var ex = r.exercises[ei], k = di+"-"+ei, data = S.pd[k] || [];
      var last = data.length ? data[data.length-1] : null;
      var prev = data.length > 1 ? data[data.length-2] : null;
      var diff = (last && prev) ? (last.weight - prev.weight).toFixed(1) : null;
      var chart = "";
      if (data.length > 1) {
        var arr = data.slice(-8);
        var mn = Math.min.apply(null, arr.map(function(x){ return x.weight; }));
        var mx = Math.max.apply(null, arr.map(function(x){ return x.weight; }));
        chart = '<div class="mini-chart">';
        for (var bi = 0; bi < arr.length; bi++) {
          var p = mx === mn ? 50 : Math.round(((arr[bi].weight - mn) / (mx - mn)) * 80) + 20;
          chart += '<div class="mini-bar' + (bi === arr.length-1 ? " last" : "") + '" style="height:' + p + '%"></div>';
        }
        chart += "</div>";
      }
      cards += '<div class="pc"><div class="pc-head"><div class="pc-name">' + ex.name + "</div>" +
        "<div style='text-align:right'>" +
        (last ? '<div class="pc-weight">' + last.weight + "kg</div>" : "") +
        (diff !== null ? '<div class="pc-diff ' + (parseFloat(diff) >= 0 ? "up" : "down") + '">' + (parseFloat(diff) >= 0 ? "+" : "") + diff + "kg</div>" : "") +
        (!last ? '<span style="font-size:12px;color:#444">Sense dades</span>' : "") +
        "</div></div>" + chart + "</div>";
    }
    c += '<div class="ps"><div class="ps-label">' + r.emoji + " " + r.name.toUpperCase() + "</div>" + cards + "</div>";
  }
  return '<div class="header"><div class="title">&#128200; PROGRESSIÓ</div>' +
    '<div class="subtitle">Registre de pesos per exercici</div></div>' +
    '<div class="section" style="padding-top:16px">' + c + "</div>";
}

function rHistory() {
  var items = "";
  if (!S.hd.length) {
    items = '<div class="empty">Encara no hi ha sessions.<br>Completa la teva primera sessió! 💪</div>';
  } else {
    for (var i = 0; i < S.hd.length; i++) {
      var h = S.hd[i];
      items += '<div class="hi-item"><div class="hi-icon">' + (h.emoji || "✓") + "</div>" +
        "<div><div class='hi-name'>" + h.routine + "</div><div class='hi-date'>" + h.day + " · " + h.date + "</div></div></div>";
    }
  }
  return '<div class="header"><div class="title">&#128203; HISTORIAL</div>' +
    '<div class="subtitle">' + S.hd.length + " sessions registrades</div></div>" +
    '<div class="section" style="padding-top:16px">' + items + "</div>";
}

function rNav() {
  var tabs = [
    {id:"home",    icon:"🏠", label:"Inici"},
    {id:"workout", icon:"💪", label:"Sessió"},
    {id:"timer",   icon:"⏱", label:"Descans"},
    {id:"progress",icon:"📈", label:"Progrés"},
    {id:"history", icon:"📋", label:"Historial"}
  ];
  return "<nav>" + tabs.map(function(t) {
    return '<button class="nav-btn' + (S.view === t.id ? " active" : "") + '" data-a="nav" data-v="' + t.id + '">' +
      '<span class="nav-icon">' + t.icon + "</span>" +
      '<span class="nav-label">' + t.label + "</span></button>";
  }).join("") + "</nav>";
}
