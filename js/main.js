// Giao diện + nối với lớp mạng
import { CARD_INFO, CHARACTERS, ROLES, SUIT_SYMBOL, rankLabel, cardLabel } from './cards.js';
import { Host, Client } from './net.js';
import { imgTag, avatarTag } from './images.js';
import { sfx, fly, shake, flash, floatText, banner, toggleMute, isMuted, shoot, arrows, explode, sparkle, confetti, stamp, screenShake } from './fx.js';
import { THEMES, getTheme, setTheme, onThemeChange } from './themes.js';
import { musicSetTheme, musicToggle, musicIsOn, musicVolume, musicResumeIfOn } from './music.js';

const $ = s => document.querySelector(s);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

let net = null, isHost = false, myId = null, view = null, prevView = null, lobby = [];
let selectedCard = null;
let sidMode = false, sidPick = [];

// ---------- Màn hình ----------
function show(id) { document.querySelectorAll('.screen').forEach(s => s.classList.remove('active')); $('#' + id).classList.add('active'); }
let toastTimer;
function toast(msg, info = false) { const t = $('#toast'); t.textContent = msg; t.className = 'toast' + (info ? ' info' : ''); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.add('hidden'), 3000); }

// ---------- Home ----------
try { $('#inp-name').value = localStorage.getItem('bangvn-name') || ''; } catch (e) {}
const urlCode = new URLSearchParams(location.search).get('room');
if (urlCode) $('#inp-code').value = urlCode.toUpperCase();

function getName() {
  const n = $('#inp-name').value.trim();
  if (!n) { toast('Nhập tên trước đã!'); $('#inp-name').focus(); return null; }
  try { localStorage.setItem('bangvn-name', n); } catch (e) {}
  return n;
}
const handlers = {
  onLobby(players, code, started) { lobby = players; renderLobby(code); if (!started && !view) show('screen-lobby'); },
  onState(v) { prevView = view; view = v; if (!v) { prevView = null; show('screen-lobby'); return; } const first = !$('#screen-game').classList.contains('active'); show('screen-game'); render(); if (first) dealAnimation(); else animateDiff(prevView, view); },
  onError(msg) { toast(msg); },
  onJoined(id) { myId = id; },
  onDisconnect() { toast('Mất kết nối với chủ phòng. Tải lại trang để vào lại.'); },
};
$('#btn-create').onclick = () => {
  const n = getName(); if (!n) return;
  isHost = true; myId = 'host';
  net = new Host(n, handlers);
  $('#lobby-host-actions').classList.remove('hidden'); $('#lobby-msg').textContent = 'Gửi mã phòng cho bạn bè. Cần 4–7 người (có thể thêm bot).';
  show('screen-lobby'); $('#lobby-code').textContent = '…';
};
$('#btn-offline').onclick = () => {
  const n = getName(); if (!n) return;
  isHost = true; myId = 'host';
  net = new Host(n, handlers, true);
  for (let i = 0; i < 3; i++) net.addBot();
  $('#lobby-host-actions').classList.remove('hidden'); $('#btn-copy').classList.add('hidden');
  show('screen-lobby');
};
$('#btn-join').onclick = () => {
  const n = getName(); if (!n) return;
  const code = $('#inp-code').value.trim().toUpperCase();
  if (code.length !== 5) { toast('Mã phòng gồm 5 ký tự.'); return; }
  isHost = false; net = new Client(code, n, handlers);
  $('#lobby-host-actions').classList.add('hidden');
  show('screen-lobby'); $('#lobby-code').textContent = code; $('#lobby-msg').textContent = 'Đang kết nối…';
};
$('#btn-copy').onclick = () => {
  const code = $('#lobby-code').textContent;
  const url = location.origin + location.pathname + '?room=' + code;
  navigator.clipboard?.writeText(url).then(() => toast('Đã sao chép link mời!', true), () => toast(url, true));
};
$('#btn-add-bot').onclick = () => net?.addBot();
$('#btn-start').onclick = () => net?.start();
$('#btn-leave').onclick = () => { net?.destroy(); location.href = location.pathname; };
$('#btn-log-toggle').onclick = () => $('#log').classList.toggle('hidden');
$('#btn-mute').textContent = isMuted() ? '🔇' : '🔊';
$('#btn-mute').onclick = () => { $('#btn-mute').textContent = toggleMute() ? '🔇' : '🔊'; };
$('#modal').onclick = e => { if (e.target.id === 'modal') closeModal(); };

// ---------- Chủ đề + nhạc ----------
function renderThemeUI() {
  const t = getTheme();
  const pick = $('#theme-pick'); pick.innerHTML = '';
  for (const [k, th] of Object.entries(THEMES)) { const b = el('button', k === t ? 'on' : '', `${th.icon} ${th.name}`); b.onclick = () => setTheme(k); pick.appendChild(b); }
  const sel = $('#theme-select'); sel.innerHTML = Object.entries(THEMES).map(([k, th]) => `<option value="${k}"${k === t ? ' selected' : ''}>${th.icon} ${th.name}</option>`).join('');
}
function renderMusicUI() { const o = musicIsOn(); $('#btn-music-home').textContent = `🎵 Nhạc nền: ${o ? 'bật' : 'tắt'}`; $('#btn-music-home').classList.toggle('on', o); $('#btn-music').style.opacity = o ? 1 : .45; }
$('#theme-select').onchange = e => setTheme(e.target.value);
onThemeChange(t => { renderThemeUI(); musicSetTheme(t); });
$('#btn-music-home').onclick = $('#btn-music').onclick = () => { musicToggle(); renderMusicUI(); };
$('#music-vol').value = musicVolume(); $('#music-vol').oninput = e => musicVolume(+e.target.value);
document.addEventListener('pointerdown', () => musicResumeIfOn(), { once: true });
setTheme(getTheme()); renderMusicUI();


function renderLobby(code) {
  if (code) $('#lobby-code').textContent = code;
  const ul = $('#lobby-players'); ul.innerHTML = '';
  lobby.forEach((p, i) => {
    const li = el('li', '', `<span>${i + 1}. ${esc(p.name)}${p.id === 'host' ? ' 👑' : ''}${p.connected === false ? ' <span class="off">(mất kết nối)</span>' : ''}</span>`);
    if (isHost && p.id !== 'host') { const b = el('button', 'btn small ghost', p.isBot ? 'Xoá bot' : 'Mời ra'); b.onclick = () => net.removePlayer(p.id); li.appendChild(b); }
    ul.appendChild(li);
  });
  if (isHost) { $('#btn-start').disabled = lobby.length < 4 || lobby.length > 7; $('#btn-add-bot').disabled = lobby.length >= 7; $('#lobby-msg').textContent = `${lobby.length}/7 người. ${lobby.length < 4 ? 'Cần thêm ' + (4 - lobby.length) + ' người hoặc bot.' : 'Sẵn sàng!'}`; }
  else if (!view) $('#lobby-msg').textContent = 'Đang chờ chủ phòng bắt đầu…';
}

// ---------- Gửi action ----------
function send(a) { if (isHost) net.act('host', a); else net.act(a); selectedCard = null; }

// ---------- Lá bài ----------
const KIND_TAG = { brown: 'Dùng ngay', blue: 'Trang bị', gun: 'Súng' };
export function cardEl(c, size = '') {
  const info = CARD_INFO[c.type];
  const red = c.suit === 'H' || c.suit === 'D';
  const d = el('div', `pcard ${info.kind} ${size}`);
  d.innerHTML = `<div class="ctop"><span class="idx${red ? ' red' : ''}">${rankLabel(c.rank)}${SUIT_SYMBOL[c.suit]}</span><span class="ktag">${info.kind === 'gun' ? 'Tầm ' + info.range : KIND_TAG[info.kind]}</span></div>
    <div class="art">${imgTag(c.type)}</div>
    <div class="cname">${info.name}</div>`;
  d.title = `${info.name} (${info.en})\n${info.desc}`;
  d.dataset.cid = c.id;
  return d;
}
function backHTML(size = '') { return `<div class="pcard back ${size}"><div class="back-inner"><span>BANG!</span></div></div>`; }
function roleCardHTML(role, size = '') {
  const r = ROLES[role];
  return `<div class="pcard role ${size}"><div class="ctop"><span class="ktag">Vai trò</span></div><div class="art">${imgTag(role)}</div><div class="cname">${r.name}</div>${size === 'lg' ? `<div class="cdesc">${r.desc}</div>` : ''}</div>`;
}
function charCardHTML(id, size = '') {
  const ch = CHARACTERS[id];
  return `<div class="pcard char ${size}"><div class="ctop"><span class="ktag">Wanted</span><span class="chp">${'●'.repeat(ch.hp)}</span></div><div class="art">${imgTag(id)}</div>
    <div class="cname">${ch.name}</div>${size === 'lg' ? `<div class="cdesc">${ch.desc}</div>` : ''}</div>`;
}

// ---------- Render bàn chơi ----------
function me() { return view.players.find(p => p.id === myId); }
function seatOrder() {
  // xếp từ mình theo chiều kim đồng hồ
  const ps = view.players; const i = ps.findIndex(p => p.id === myId);
  return ps.slice(i).concat(ps.slice(0, i));
}
const SEATS = {
  3: [[10, 50], [50, 12], [90, 50]],
  4: [[9, 60], [27, 14], [73, 14], [91, 60]],
  5: [[7, 64], [17, 22], [50, 10], [83, 22], [93, 64]],
  6: [[6, 68], [13, 30], [35, 10], [65, 10], [87, 30], [94, 68]],
};
const SEATS_P = { // màn hình dọc (điện thoại)
  3: [[15, 50], [50, 9], [85, 50]],
  4: [[15, 66], [27, 13], [73, 13], [85, 66]],
  5: [[15, 74], [15, 38], [50, 8], [85, 38], [85, 74]],
  6: [[15, 80], [14, 49], [27, 15], [73, 15], [86, 49], [85, 80]],
};
function seatEl(pid) { return document.querySelector(`.seat[data-pid="${pid}"]`); }

function hpDots(p) {
  let s = ''; for (let i = 0; i < p.maxHp; i++) s += `<i class="${i < p.hp ? 'on' : ''}"></i>`;
  return `<div class="hpbar">${s}</div>`;
}

// ---------- Khung mô tả lá bài ----------
const tip = el('div', '', ''); tip.id = 'card-tip'; document.body.appendChild(tip);
function attachTip(ce, c, opt) {
  const info = CARD_INFO[c.type];
  ce.addEventListener('mouseenter', () => {
    tip.innerHTML = `<div class="te">${info.kind === 'gun' ? 'Súng · tầm ' + info.range : KIND_TAG[info.kind]} · ${rankLabel(c.rank)}${SUIT_SYMBOL[c.suit]}</div><div class="tn">${info.name}</div><div class="td">${info.desc}</div>${opt && !opt.ok ? `<div class="tw">⛔ ${opt.reason}</div>` : ''}`;
    const r = ce.getBoundingClientRect(); const x = Math.min(innerWidth - 260, Math.max(10, r.left + r.width / 2 - 125));
    tip.style.left = x + 'px'; tip.style.top = Math.max(50, r.top - 40 - tip.offsetHeight) + 'px'; tip.classList.add('on');
  });
  ce.addEventListener('mouseleave', () => tip.classList.remove('on'));
  ce.addEventListener('click', () => tip.classList.remove('on'));
}
// ---------- Bong bóng thoại ----------
function bubbleAt(pid, card) {
  const anchor = pid === myId ? $('#me-info') : seatEl(pid)?.querySelector('.avatar'); if (!anchor) return;
  const r = anchor.getBoundingClientRect(); const info = CARD_INFO[card.type];
  const b = el('div', 'bubble', `${imgTag(card.type)}<span>${info.name}</span>`);
  b.style.left = (r.left + r.width / 2) + 'px'; b.style.top = (r.top - 6) + 'px';
  document.body.appendChild(b); setTimeout(() => b.remove(), 2000);
}

function render() {
  const v = view; if (!v) return;
  const cur = v.players[v.turn];
  const pr = v.prompt;
  $('#turn-info').innerHTML = v.phase === 'ended' ? 'Ván đã kết thúc' : `Lượt ${v.turnCount} · <b>${esc(cur.name)}</b>${cur.id === myId ? ' (bạn)' : ''}`;

  // ---- Ghế quanh bàn ----
  const table = $('#table'); table.querySelectorAll('.seat').forEach(s => s.remove());
  const order = seatOrder(); const n = order.length;
  const waitingId = pr ? pr.player : null;
  order.forEach((p, k) => {
    if (k === 0) return; // mình ở dưới, hiện ở khu tay bài
    // vị trí ghế cố định theo số đối thủ: từ trái-dưới, lên trên, sang phải-dưới (chiều kim đồng hồ)
    const portrait = table.clientWidth < table.clientHeight * 1.15;
    const L = (portrait ? SEATS_P : SEATS)[Math.max(3, Math.min(6, n - 1))];
    const [x, y] = L[k - 1] || [50, 10];
    const seat = el('div', 'seat' + (p.id === cur.id ? ' current' : '') + (!p.alive ? ' dead' : '') + (p.id === waitingId ? ' waiting' : ''));
    seat.dataset.pid = p.id;
    seat.style.left = x + '%'; seat.style.top = y + '%';
    const ch = CHARACTERS[p.character];
    const role = p.role ? `<div class="role-chip ${p.role}" title="${ROLES[p.role].desc}">${ROLES[p.role].icon} ${ROLES[p.role].name}</div>` : '';
    seat.innerHTML = `
      <div class="avatar"><div class="face">${avatarTag(p.character)}</div>${p.distance != null ? `<div class="dist" title="Khoảng cách từ bạn">${p.distance}</div>` : ''}<div class="hcount" title="${p.handCount} lá trên tay">🂠${p.handCount}</div><div class="rng" title="Tầm bắn">🎯${p.gunRange}</div>${p.table.some(c => c.type === 'jail') ? '<div class="bars"></div>' : ''}${p.table.some(c => c.type === 'dynamite') ? '<div class="fuse">🧨</div>' : ''}${!p.alive ? '<div class="rip">☠</div>' : ''}</div>
      <div class="plate"><div class="pname">${esc(p.name)}</div><div class="pchar">${ch.name}</div>${hpDots(p)}${role}</div>
      <div class="equip ${x < 50 ? 'right' : 'left'}"></div>`;
    const eq = seat.querySelector('.equip');
    for (const c of p.table) { const m = cardEl(c, 'xs'); eq.appendChild(m); }
    // chọn mục tiêu
    if (selectedCard && v.myOptions?.[selectedCard]?.targets?.includes(p.id)) { seat.classList.add('targetable'); seat.onclick = () => chooseTarget(p); }
    else if (pr && pr.type === 'draw_option' && pr.player === myId && pr.character === 'jessejones' && p.alive && p.handCount) { seat.classList.add('targetable'); seat.onclick = () => send({ type: 'draw_from_player', target: p.id }); }
    else seat.onclick = () => showCharacter(p);
    table.appendChild(seat);
  });

  // ---- Giữa bàn ----
  $('#deck').innerHTML = backHTML('sm') + `<div class="pile-count">${v.deckCount}</div>`;
  const dp = $('#discard'); dp.innerHTML = '';
  if (v.discardTop) dp.appendChild(cardEl(v.discardTop, 'sm')); else dp.innerHTML = '<div class="pile-empty">Chồng bỏ</div>';
  renderPrompt();

  // ---- Khu của tôi ----
  const m = me(); const ch = CHARACTERS[m.character];
  const mine = $('#me-area');
  mine.classList.toggle('current', cur.id === myId && v.phase === 'playing');
  mine.classList.toggle('dead', !m.alive);
  $('#me-cards').innerHTML = charCardHTML(m.character, 'sm') + (m.role ? roleCardHTML(m.role, 'sm') : '');
  $('#me-cards .char').onclick = () => showCharacter(m);
  $('#me-info').innerHTML = `<div class="me-ava"><div class="face">${avatarTag(m.character)}</div></div><div><div class="pname">${esc(m.name)}</div>${hpDots(m)}<div class="muted">${ch.name} · tầm bắn ${m.gunRange}${m.bangs ? ' · đã bắn ' + m.bangs : ''}</div></div>`;
  const mt = $('#me-table'); mt.innerHTML = '';
  for (const c of m.table) mt.appendChild(cardEl(c, 'sm'));

  // ---- Tay bài (xoè quạt) ----
  const hand = $('#me-hand'); hand.innerHTML = '';
  const responding = pr && pr.player === myId && pr.type === 'respond';
  const discarding = pr && pr.player === myId && pr.type === 'discard';
  const cards = m.hand || []; const cnt = cards.length;
  hand.style.setProperty('--overlap', cnt <= 4 ? '-2px' : cnt <= 6 ? '-14px' : '-26px');
  cards.forEach((c, i) => {
    const ce = cardEl(c);
    const mid = (cnt - 1) / 2; const off = i - mid;
    ce.style.setProperty('--rot', (cnt > 1 ? off * Math.min(5, 24 / cnt) : 0) + 'deg');
    ce.style.setProperty('--lift', (Math.abs(off) * Math.abs(off) * (cnt > 5 ? 1.6 : 2.4)) + 'px');
    if (responding) {
      if (v.myResponses.includes(c.id)) { ce.classList.add('respond', 'playable'); ce.onclick = () => send({ type: 'respond_card', cardId: c.id }); }
      else ce.classList.add('disabled');
    } else if (discarding) {
      ce.classList.add('playable', 'discardable'); ce.onclick = () => send({ type: 'discard_card', cardId: c.id });
    } else if (sidMode && v.myOptions) {
      ce.classList.add('playable'); if (sidPick.includes(c.id)) ce.classList.add('selected');
      ce.onclick = () => { sidPick = sidPick.includes(c.id) ? sidPick.filter(x => x !== c.id) : [...sidPick, c.id].slice(-2); if (sidPick.length === 2) { send({ type: 'ability_sid', cardIds: sidPick }); sidMode = false; sidPick = []; } else render(); };
    } else if (v.myOptions) {
      const o = v.myOptions[c.id];
      if (o.ok) { ce.classList.add('playable'); if (selectedCard === c.id) ce.classList.add('selected'); ce.onclick = () => clickCard(c, o); }
      else { ce.classList.add('disabled'); ce.title += '\n⛔ ' + o.reason; ce.onclick = () => toast(o.reason); }
    }
    attachTip(ce, c, v.myOptions?.[c.id]);
    hand.appendChild(ce);
  });
  renderActions(); renderLog();
}

function renderActions() {
  const a = $('#actions'); a.innerHTML = '';
  const v = view, m = me(); const pr = v.prompt;
  if (v.phase === 'ended') {
    const names = { law: 'Phe Cảnh sát', outlaw: 'Tội phạm', renegade: 'Kẻ hai mặt' };
    a.appendChild(el('div', 'winner', `🏆 ${names[v.winner]} thắng!`));
    if (isHost) { const b = el('button', 'btn primary', 'Về phòng chờ'); b.onclick = () => net.restart(); a.appendChild(b); }
    return;
  }
  if (!m.alive) { a.appendChild(el('div', 'muted', 'Bạn đã bị loại – ngồi xem tiếp nhé')); return; }
  const myTurn = v.players[v.turn].id === myId && !pr && v.step === 'play';
  if (myTurn) {
    if (selectedCard) { const b = el('button', 'btn ghost', 'Huỷ chọn'); b.onclick = () => { selectedCard = null; render(); }; a.appendChild(b); }
    if (v.canSid) { const b = el('button', 'btn', sidMode ? 'Chọn 2 lá để bỏ…' : '💊 Bỏ 2 lá hồi 1 máu'); b.onclick = () => { sidMode = !sidMode; sidPick = []; selectedCard = null; render(); }; a.appendChild(b); }
    const b = el('button', 'btn primary', m.handCount > m.hp ? `Kết thúc lượt (bỏ ${m.handCount - m.hp} lá)` : 'Kết thúc lượt'); b.onclick = () => { sidMode = false; send({ type: 'end_turn' }); }; a.appendChild(b);
  }
}

function renderPrompt() {
  const v = view, p = $('#prompt'); p.innerHTML = ''; p.className = 'prompt';
  const pr = v.prompt;
  if (!pr || v.phase === 'ended') {
    const cur = v.players[v.turn];
    if (v.phase === 'playing') { p.classList.add('quiet'); p.textContent = cur.id === myId ? (selectedCard ? 'Chọn mục tiêu (người sáng viền đỏ)' : 'Tới lượt bạn – đánh bài hoặc kết thúc lượt') : `${cur.name} đang suy nghĩ…`; }
    return;
  }
  const who = v.players.find(x => x.id === pr.player);
  const src = pr.source ? v.players.find(x => x.id === pr.source) : null;
  const mine = pr.player === myId;
  if (mine) p.classList.add('mine');
  const kindText = { bang: `💥 ${src?.name} bắn ${mine ? 'bạn' : who.name}!`, gatling: `🔫 ${src?.name} quét Gatling!`, indians: `🏹 ${src?.name} gọi Thổ dân!`, duel: `⚔️ Đấu súng – ${mine ? 'tới bạn' : who.name} đáp trả` };
  if (pr.type === 'respond') {
    p.appendChild(el('div', 'ptitle', kindText[pr.kind]));
    if (mine) {
      const need = pr.kind === 'bang' || pr.kind === 'gatling' ? `Cần ${pr.need} lá Hụt!` : 'Cần 1 lá Bắn!';
      p.appendChild(el('div', 'sub', `${need} – bấm lá viền xanh trên tay, hoặc chịu mất 1 máu.`));
      const row = el('div', 'row'); const b = el('button', 'btn danger', '💔 Chịu đòn'); b.onclick = () => send({ type: 'take_hit' }); row.appendChild(b); p.appendChild(row);
    } else p.appendChild(el('div', 'sub', `Đang chờ ${who.name}…`));
    return;
  }
  if (pr.type === 'discard') { p.appendChild(el('div', 'ptitle', mine ? `Bỏ bớt ${me().handCount - me().hp} lá` : `${who.name} đang bỏ bớt bài…`)); if (mine) p.appendChild(el('div', 'sub', 'Bấm vào lá muốn bỏ.')); return; }
  if (pr.type === 'store') {
    p.appendChild(el('div', 'ptitle', `🏪 Tạp hóa – ${mine ? 'chọn 1 lá' : 'chờ ' + who.name + ' chọn'}`));
    const row = el('div', 'row');
    for (const c of pr.cards) { const ce = cardEl(c, 'sm'); if (mine) { ce.classList.add('playable'); ce.onclick = () => send({ type: 'store_pick', cardId: c.id }); } row.appendChild(ce); }
    p.appendChild(row); return;
  }
  if (pr.type === 'draw_option') {
    if (!mine) { p.appendChild(el('div', 'ptitle', `${who.name} đang rút bài…`)); return; }
    const row = el('div', 'row');
    if (pr.character === 'kitcarlson') {
      p.appendChild(el('div', 'ptitle', 'Kit Carlson: chọn 2 lá để giữ'));
      let keep = [];
      for (const c of pr.cards) { const ce = cardEl(c, 'sm'); ce.classList.add('playable'); ce.onclick = () => { keep = keep.includes(c.id) ? keep.filter(x => x !== c.id) : [...keep, c.id]; ce.classList.toggle('selected'); if (keep.length === 2) send({ type: 'kit_choose', keep }); }; row.appendChild(ce); }
    } else {
      p.appendChild(el('div', 'ptitle', pr.character === 'jessejones' ? 'Jesse Jones: rút từ bộ bài, hoặc bấm 1 người để lấy 1 lá tay họ' : 'Pedro Ramirez: rút từ bộ bài, hoặc lấy lá trên cùng chồng bỏ'));
      const b1 = el('button', 'btn primary', 'Rút 2 từ bộ bài'); b1.onclick = () => send({ type: 'draw_from_deck' }); row.appendChild(b1);
      if (pr.character === 'pedroramirez' && v.discardTop) { const b2 = el('button', 'btn', `Lấy ${cardLabel(v.discardTop)}`); b2.onclick = () => send({ type: 'draw_from_discard' }); row.appendChild(b2); }
    }
    p.appendChild(row);
  }
}

function clickCard(c, o) {
  sidMode = false;
  if (o.targetMode === 'none') { send({ type: 'play_card', cardId: c.id }); return; }
  selectedCard = selectedCard === c.id ? null : c.id;
  render();
}
function chooseTarget(p) {
  const o = view.myOptions[selectedCard];
  if (!o.pickCard) { send({ type: 'play_card', cardId: selectedCard, target: p.id }); return; }
  const cardType = me().hand.find(x => x.id === selectedCard).type;
  openModal(`<h3>${CARD_INFO[cardType].name} → ${esc(p.name)}</h3><p class="muted">Lấy lá nào?</p><div class="cards" id="pick-row"></div><button class="btn ghost" id="pick-cancel">Huỷ</button>`);
  const row = $('#pick-row');
  if (p.handCount) { const b = el('div', 'pick-hand', backHTML('sm') + `<div>Ngẫu nhiên trên tay (${p.handCount})</div>`); b.onclick = () => { closeModal(); send({ type: 'play_card', cardId: selectedCard, target: p.id, pick: 'hand' }); }; row.appendChild(b); }
  for (const c of p.table) { const ce = cardEl(c, 'sm'); ce.classList.add('playable'); ce.onclick = () => { closeModal(); send({ type: 'play_card', cardId: selectedCard, target: p.id, pick: c.id }); }; row.appendChild(ce); }
  $('#pick-cancel').onclick = closeModal;
}
function showCharacter(p) {
  const role = p.role ? roleCardHTML(p.role, 'lg') : '';
  openModal(`<div class="cards">${charCardHTML(p.character, 'lg')}${role}</div><h3>${esc(p.name)}</h3>
    <p>${p.alive ? `Máu ${p.hp}/${p.maxHp} · ${p.handCount} lá trên tay · tầm bắn ${p.gunRange}` : 'Đã bị loại'}${p.distance != null ? ` · cách bạn ${p.distance}` : ''}</p>
    <button class="btn" id="m-close">Đóng</button>`);
  $('#m-close').onclick = closeModal;
}
function openModal(html) { $('#modal-box').innerHTML = html; $('#modal').classList.remove('hidden'); }
function closeModal() { $('#modal').classList.add('hidden'); }

let lastLogLen = 0;
function renderLog() {
  const l = $('#log-list'); l.innerHTML = '';
  for (const line of view.log) l.appendChild(el('div', '', esc(line)));
  l.scrollTop = l.scrollHeight;
  lastLogLen = view.log.length;
}

// ---------- Hiệu ứng theo thay đổi state ----------
function anchorFor(pid) { return pid === myId ? $('#me-hand') : seatEl(pid); }
function dealAnimation() {
  const order = seatOrder(); let d = 0;
  for (let r = 0; r < 4; r++) for (const p of order) { if (p.handCount > r) fly(backHTML('sm'), $('#deck'), anchorFor(p.id), { delay: d, duration: 380 }); d += 45; }
  setTimeout(() => banner('BANG!', 'Cảnh sát trưởng đi trước'), 200);
}
function newLogLines(a, b) {
  const la = a.log, lb = b.log; if (!la.length) return lb;
  for (let j = lb.length - 1; j >= 0; j--) {
    if (lb[j] !== la[la.length - 1]) continue;
    let k = 1; while (k < 4 && j - k >= 0 && la.length - 1 - k >= 0 && lb[j - k] === la[la.length - 1 - k]) k++;
    if (k >= Math.min(4, la.length, j + 1)) return lb.slice(j + 1);
  }
  return lb.filter(x => !la.includes(x));
}
function pidByName(v, name) { name = name.trim(); return v.players.find(p => p.name === name)?.id; }
function animateDiff(a, b) {
  if (!a || !b) return;
  const lines = newLogLines(a, b);
  let hitDelay = 0;
  for (const line of lines) {
    let m;
    if ((m = line.match(/^(.+) 💥 bắn (.+)!$/))) {
      const s = pidByName(b, m[1]), t = pidByName(b, m[2]);
      sfx.shot(); shoot(anchorFor(s), anchorFor(t)); hitDelay = 260;
    } else if ((m = line.match(/^(.+) quét Súng Gatling!$/))) {
      const s = pidByName(b, m[1]); sfx.shot();
      b.players.filter(p => p.alive && p.id !== s).forEach((p, i) => { shoot(anchorFor(s), anchorFor(p.id), { delay: i * 110 }); setTimeout(() => sfx.shot(), i * 110); });
      hitDelay = 400; screenShake();
    } else if ((m = line.match(/^(.+) gọi Thổ dân! tấn công tất cả\.$/))) {
      const s = pidByName(b, m[1]); banner('🏹 Thổ dân tấn công!');
      b.players.filter(p => p.alive && p.id !== s).forEach((p, i) => arrows(anchorFor(s), anchorFor(p.id), { delay: 200 + i * 140, onHit: () => sfx.card() }));
      hitDelay = 700;
    } else if ((m = line.match(/^(.+) (?:đánh .+ né đạn|né được nhờ Thùng rượu)\.$/))) {
      const t = pidByName(b, m[1]); sfx.dodge(); setTimeout(() => stamp(anchorFor(t), 'HỤT!'), 280);
    } else if ((m = line.match(/^💥 Thuốc nổ nổ! (.+) mất 3 máu\.$/))) {
      const t = pidByName(b, m[1]); sfx.boom(); explode(anchorFor(t));
    } else if ((m = line.match(/thách (.+) Đấu súng!$/))) {
      banner('⚔ Đấu súng!', m[1].trim());
    } else if ((m = line.match(/nhốt (.+) vào Nhà tù\.$/))) {
      const t = pidByName(b, m[1]); setTimeout(() => stamp(anchorFor(t), 'NHÀ TÙ'), 350);
    } else if ((m = line.match(/^(.+) bị giam, mất lượt\.$/))) {
      stamp(anchorFor(pidByName(b, m[1])), 'MẤT LƯỢT');
    } else if (/mở Quán rượu/.test(line)) {
      banner('🥃 Quán rượu!', 'Mọi người hồi 1 máu');
    } else if ((m = line.match(/^(.+) mở Tạp hóa/))) {
      banner('🏪 Tạp hóa', 'Mỗi người chọn 1 lá');
    }
  }
  const txt = lines.join(' ');
  if (/hồi 1 máu|uống Bia|Quán rượu/.test(txt)) sfx.heal();
  if (/☠️/.test(txt)) sfx.death();
  // Lượt mới
  if (a.turn !== b.turn && b.phase === 'playing') { sfx.turn(); const cur = b.players[b.turn]; if (cur.id === myId) banner('Tới lượt bạn!'); }
  // Bài bay & máu
  for (const pb of b.players) {
    const pa = a.players.find(x => x.id === pb.id); if (!pa) continue;
    const anchor = anchorFor(pb.id); const box = pb.id === myId ? $('#me-area') : anchor; const txtAt = pb.id === myId ? $('#me-info') : anchor;
    const gained = pb.handCount - pa.handCount;
    if (gained > 0 && b.deckCount < a.deckCount) for (let i = 0; i < Math.min(gained, 4); i++) fly(backHTML('sm'), $('#deck'), anchor, { delay: i * 110, duration: 420 });
    if (pb.hp < pa.hp) setTimeout(() => { shake(box); flash(box); floatText(txtAt, `-${pa.hp - pb.hp}`); sfx.hit(); }, hitDelay);
    if (pb.hp > pa.hp && pb.alive) { floatText(txtAt, `+${pb.hp - pa.hp}`, '#3f8f4f'); flash(box, 'flash-heal'); sparkle(txtAt); }
    if (pa.alive && !pb.alive) setTimeout(() => banner(`☠ ${esc(pb.name)} bị loại`, pb.role ? ROLES[pb.role].name : ''), hitDelay + 300);
    if (pb.table.length > pa.table.length) { const nc = pb.table.find(c => !pa.table.some(x => x.id === c.id)); if (nc) { if (nc.type !== 'dynamite' || pa.handCount > pb.handCount) bubbleAt(nc.type === 'jail' ? a.players[a.turn].id : pb.id, nc); const tgt = pb.id === myId ? $('#me-table') : anchor?.querySelector('.equip'); const src = a.players[a.turn].id === myId ? $('#me-hand') : seatEl(a.players[a.turn].id); fly(cardEl(nc, 'sm').outerHTML, src || anchor, tgt || anchor, { duration: 450 }); } }
  }
  // Lá vừa bỏ bay về chồng bỏ
  if (b.discardTop && (!a.discardTop || a.discardTop.id !== b.discardTop.id)) {
    const loser = b.players.find(pb => { const pa = a.players.find(x => x.id === pb.id); return pa && pb.handCount < pa.handCount; });
    fly(cardEl(b.discardTop, 'sm').outerHTML, loser ? anchorFor(loser.id) : $('#deck'), $('#discard'), { duration: 420, rotate: (Math.random() * 10 - 5) });
    if (loser && b.phase === 'playing' && !(b.prompt && b.prompt.type === 'discard' && b.prompt.player === loser.id) && !(a.prompt && a.prompt.type === 'discard')) bubbleAt(loser.id, b.discardTop);
  }
  if (a.phase === 'playing' && b.phase === 'ended') {
    const names = { law: 'Phe Cảnh sát thắng!', outlaw: 'Tội phạm thắng!', renegade: 'Kẻ hai mặt thắng!' };
    setTimeout(() => { sfx.win(); confetti(); banner('🏆 ' + names[b.winner]); }, 700);
  }
}

// ---------- Luật tóm tắt ----------
$('#rules-content').innerHTML = `
<h4>Mục tiêu</h4>
<ul>${Object.values(ROLES).map(r => `<li><b>${r.icon} ${r.name}</b>: ${r.desc}</li>`).join('')}</ul>
<h4>Lượt chơi</h4><p>1) Rút 2 lá. 2) Đánh bài tuỳ ý (mỗi lượt chỉ 1 lá Bắn!). 3) Bỏ bài xuống bằng số máu.</p>
<h4>Khoảng cách</h4><p>Người ngồi cạnh = 1. Súng quyết định tầm bắn (không súng = 1). Mustang làm người khác thấy bạn xa hơn 1, Ống ngắm làm bạn thấy người khác gần hơn 1.</p>
<h4>Các lá bài</h4>
<ul>${Object.values(CARD_INFO).map(c => `<li><b>${c.name}</b> <i>(${c.en})</i>: ${c.desc}</li>`).join('')}</ul>
<h4>Nhân vật</h4>
<ul>${Object.values(CHARACTERS).map(c => `<li><b>${c.name}</b> (${c.hp} máu): ${c.desc}</li>`).join('')}</ul>
<p class="muted" style="font-size:12px">Tranh minh hoạ: Frederic Remington &amp; Charles M. Russell (public domain, Wikimedia Commons).</p>`;

window.addEventListener('beforeunload', e => { if (net && view && view.phase === 'playing') { e.preventDefault(); e.returnValue = ''; } });

// bài trang trí trang chủ
(() => {
  const hero = $('#hero-cards'); const pick = [['bang', 'S', 14], ['stagecoach', 'S', 9], ['beer', 'H', 8], ['winchester', 'S', 8], ['saloon', 'H', 5]];
  pick.forEach(([type, suit, rank], i) => { const c = cardEl({ id: 'h' + i, type, suit, rank }); const off = i - 2; c.style.setProperty('--r', off * 8 + 'deg'); c.style.setProperty('--y', Math.abs(off) * 10 + 'px'); c.style.setProperty('--d', i * 80 + 'ms'); hero.appendChild(c); });
})();
