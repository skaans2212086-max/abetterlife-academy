(function () {
  // ---------- 등장 애니메이션 ----------
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('on'); io.unobserve(en.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal, #bars, .pencil, .dash.grow, .cbars').forEach(function (el) { io.observe(el); });

  // ---------- 숫자 카운트 ----------
  var cio = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      cio.unobserve(en.target);
      var el = en.target, to = parseFloat(el.dataset.to), dec = +(el.dataset.dec || 0), t0 = null;
      function step(t) {
        if (!t0) t0 = t;
        var p = Math.min((t - t0) / 1600, 1), n = to * (1 - Math.pow(1 - p, 3));
        el.textContent = dec ? n.toFixed(dec) : (el.hasAttribute('data-comma') ? Math.round(n).toLocaleString('ko-KR') : Math.round(n));
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.count').forEach(function (el) { cio.observe(el); });

  // ---------- 후기 카드 무한 슬라이드 (복제) ----------
  var track = document.getElementById('marquee');
  if (track) track.innerHTML += track.innerHTML;

  // ---------- 탭 활성화 (스크롤 위치) ----------
  var tabs = document.querySelectorAll('#tabs a:not([hidden])');
  var targets = Array.prototype.map.call(tabs, function (a) { return document.querySelector(a.getAttribute('href')); });
  function spy() {
    var y = window.scrollY + 200, idx = 0;
    targets.forEach(function (t, i) { if (t && t.getBoundingClientRect().top + window.scrollY <= y) idx = i; });
    tabs.forEach(function (a, i) { a.classList.toggle('on', i === idx); });
  }
  window.addEventListener('scroll', spy, { passive: true });

  // ---------- 라이브 카운트다운 ----------
  var live = new Date('2026-11-02T20:00:00+09:00').getTime();
  var cells = {};
  document.querySelectorAll('#timer [data-u]').forEach(function (b) { cells[b.dataset.u] = b; });
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function tick() {
    var s = Math.max(0, Math.floor((live - Date.now()) / 1000));
    cells.d.textContent = pad(Math.floor(s / 86400));
    cells.h.textContent = pad(Math.floor(s % 86400 / 3600));
    cells.m.textContent = pad(Math.floor(s % 3600 / 60));
    cells.s.textContent = pad(s % 60);
  }
  tick(); setInterval(tick, 1000);

  // ---------- 신청 모달 ----------
  var modal = document.getElementById('modal');
  var form = document.getElementById('applyForm');
  var err = document.getElementById('fErr');
  function openM() { modal.classList.add('open'); setTimeout(function () { document.getElementById('fName').focus(); }, 200); }
  function closeM() { modal.classList.remove('open'); }
  document.querySelectorAll('.js-apply').forEach(function (b) { b.addEventListener('click', openM); });
  document.getElementById('mClose').addEventListener('click', closeM);
  // 바깥(어두운 배경)을 눌렀다 뗀 경우에만 닫기 — 상자 안에서 드래그하다 밖에서 떼면 닫히지 않음
  var downOnBackdrop = false;
  modal.addEventListener('mousedown', function (e) { downOnBackdrop = e.target === modal; });
  modal.addEventListener('click', function (e) { if (e.target === modal && downOnBackdrop) closeM(); downOnBackdrop = false; });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeM(); });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = document.getElementById('fName').value.trim();
    var phone = document.getElementById('fPhone').value.replace(/\D/g, '');
    if (!name) { err.textContent = '이름을 입력해 주세요.'; return; }
    if (!/^01\d{8,9}$/.test(phone)) { err.textContent = '휴대폰 번호를 정확히 입력해 주세요. (예: 010-1234-5678)'; return; }
    if (!document.getElementById('fAgree').checked) { err.textContent = '이용약관 및 개인정보 수집 · 이용에 동의해 주세요.'; return; }
    err.textContent = '';
    // 1) 카카오톡 오픈채팅방을 새 창으로 (클릭 직후에 열어야 팝업 차단을 피함)
    var KAKAO = 'https://open.kakao.com/o/gZ85spTi';
    var win = null;
    try { win = window.open(KAKAO, '_blank'); } catch (x) {}
    modal.classList.add('sent');
    if (!win) modal.classList.add('need-click');   // 새 창이 막힌 경우: 노란 버튼을 눌러 입장
    // 2) 구글 시트에 이름 · 연락처 저장 (Apps Script 웹 앱)
    var SHEET_URL = 'https://script.google.com/macros/s/AKfycbziKo2OpXMiVpTmsmWIM7S8bQ3omAFxm4bW3taHWu4C84Es7YphOS9hcXttnTFx_Oy-ng/exec';
    if (SHEET_URL) {
      var body = new URLSearchParams({ name: name, phone: document.getElementById('fPhone').value.trim(), agree: 'Y', source: '무료 LIVE 신청 (1:1 맞춤 교육 페이지)' });
      try { fetch(SHEET_URL, { method: 'POST', mode: 'no-cors', body: body }); } catch (x) {}
    }
    document.querySelectorAll('.sc2 .go.js-apply').forEach(function (b) { b.classList.add('done'); b.lastChild.textContent = '신청 완료'; });
  });

  // ---------- 찜 / 링크 복사 ----------
  document.getElementById('likeBtn').addEventListener('click', function () { this.classList.toggle('on'); });
  // 공유 버튼 → "링크 복사하기" 작은 메뉴
  var shareBtn = document.getElementById('shareBtn');
  var SHARE_URL = 'https://www.abetterlife-academy.com/coaching.html';
  var pop = document.createElement('div');
  pop.className = 'share-pop'; pop.hidden = true;
  pop.innerHTML = '<p class="sp-t">이 강의 공유하기</p><div class="sp-url"><input type="text" id="shareUrl" readonly aria-label="공유 링크"></div>' +
    '<button type="button" class="sp-copy" id="shareCopy">🔗 링크 복사하기</button>';
  shareBtn.parentNode.style.position = 'relative';
  shareBtn.parentNode.appendChild(pop);
  var urlBox = pop.querySelector('#shareUrl'), copyBtn = pop.querySelector('#shareCopy');
  urlBox.value = /^https?:/.test(location.href) && location.hostname.indexOf('abetterlife') > -1 ? location.href.split('#')[0] : SHARE_URL;
  shareBtn.addEventListener('click', function (e) { e.stopPropagation(); pop.hidden = !pop.hidden; copyBtn.textContent = '🔗 링크 복사하기'; copyBtn.classList.remove('done'); });
  pop.addEventListener('click', function (e) { e.stopPropagation(); });
  document.addEventListener('click', function () { pop.hidden = true; });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') pop.hidden = true; });
  function copied() { copyBtn.textContent = '✓ 복사되었습니다'; copyBtn.classList.add('done'); setTimeout(function () { pop.hidden = true; }, 1200); }
  copyBtn.addEventListener('click', function () {
    var t = urlBox.value;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(copied).catch(function () { urlBox.select(); copyBtn.textContent = '주소를 선택했어요 · Ctrl+C로 복사'; });
    } else { urlBox.select(); try { document.execCommand('copy'); copied(); } catch (x) {} }
  });
})();

// 선착순 남은 자리 · 진행 막대 (버튼의 신청 수 하나만 바꾸면 전부 따라 바뀜)
(function () {
  var c = document.getElementById('applyCount'); if (!c) return;
  var box = document.querySelector('.seats'), total = box ? +box.dataset.total : 100;
  var taken = Math.min(+c.textContent || 0, total), left = total - taken;
  var set = function (id, v) { var e = document.getElementById(id); if (e) e.textContent = v; };
  set('seatLeft', left); set('seatLeftM', left); set('seatTaken', taken);
  var bar = document.querySelector('.seats-bar'); if (bar) bar.setAttribute('aria-valuenow', taken);
  var fill = document.getElementById('seatFill');
  if (fill) requestAnimationFrame(function () { setTimeout(function () { fill.style.width = (taken / total * 100) + '%'; }, 300); });
})();

// AI 프롬프트 혜택 30분 타이머 (방문자별로 첫 방문 시점부터 30분, 새로고침해도 이어짐)
(function () {
  var box = document.getElementById('perk'); if (!box) return;
  var KEY = 'abl_perk_start_coaching', LIMIT = (+box.dataset.minutes || 30) * 60 * 1000, start;
  try { start = +localStorage.getItem(KEY); if (!start) { start = Date.now(); localStorage.setItem(KEY, start); } } catch (e) { start = Date.now(); }
  var t = document.getElementById('perkTime'), tm = document.getElementById('perkTimeM'), fill = document.getElementById('perkFill'),
      note = document.getElementById('perkNote'), label = document.getElementById('applyLabel'), bar = box.querySelector('.perk-bar');
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function tick() {
    var left = LIMIT - ((Date.now() - start) % LIMIT), s = Math.ceil(left / 1000), txt = pad(Math.floor(s / 60)) + ':' + pad(s % 60);
    t.textContent = txt; if (tm) tm.textContent = txt;
    var tt = document.getElementById('perkTimeTop'), ft = document.getElementById('perkFillTop');
    if (tt) tt.textContent = left <= 0 ? '종료' : txt; if (ft) ft.style.width = (left / LIMIT * 100) + '%';
    var top = document.getElementById('perkTop'); if (top) { top.classList.toggle('low', left < 5 * 60 * 1000); top.classList.toggle('end', left <= 0); }
    var pct = left / LIMIT * 100; fill.style.width = pct + '%'; bar.setAttribute('aria-valuenow', Math.round(pct));
    box.classList.toggle('low', left < 5 * 60 * 1000);
  }
  var iv = setInterval(tick, 1000); tick();
})();

// 첫 화면 스포트라이트: 화면을 어둡게 하고 '입장하기' 버튼만 밝게 + 빨간 화살표
(function () {
  var btn = document.querySelector('.go-enter'); if (!btn) return;
  var spot = document.createElement('div'); spot.className = 'enter-spot';
  var dim = document.createElement('div'); dim.className = 'enter-dim'; dim.innerHTML = '<i></i><i></i><i></i><i></i>';
  var p = dim.children;
  var arrow = document.createElement('div'); arrow.className = 'enter-arrow';
  arrow.innerHTML = '<svg viewBox="0 0 80 40" aria-hidden="true"><path d="M4 20h60" stroke="#ff2d3d" stroke-width="7" stroke-linecap="round"/><path d="M50 6l20 14-20 14" fill="none" stroke="#ff2d3d" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var on = false;
  function place() {
    var r = btn.getBoundingClientRect(), pad = 8;
    spot.style.left = (r.left - pad) + 'px'; spot.style.top = (r.top - pad) + 'px';
    spot.style.width = (r.width + pad * 2) + 'px'; spot.style.height = (r.height + pad * 2) + 'px';
    var L = r.left - pad, T = r.top - pad, R = r.right + pad, B = r.bottom + pad;   // 버튼 주변 4장으로 화면 어둡게
    p[0].style.cssText = 'left:0;top:0;right:0;height:' + Math.max(0, T) + 'px';
    p[1].style.cssText = 'left:0;top:' + B + 'px;right:0;bottom:0';
    p[2].style.cssText = 'left:0;top:' + T + 'px;width:' + Math.max(0, L) + 'px;height:' + (B - T) + 'px';
    p[3].style.cssText = 'left:' + R + 'px;top:' + T + 'px;right:0;height:' + (B - T) + 'px';
    var down = window.innerWidth <= 640;   // 모바일: 버튼 위에서 아래로 가리킴
    arrow.classList.toggle('down', down);
    if (down) { arrow.style.left = (r.left + r.width / 2 - 30) + 'px'; arrow.style.top = (r.top - pad - 74) + 'px'; }
    else { arrow.style.left = (r.left - pad - 96) + 'px'; arrow.style.top = (r.top + r.height / 2 - 30) + 'px'; }
  }
  function close() {
    if (!on) return; on = false;
    spot.classList.remove('show'); arrow.classList.remove('show'); dim.classList.remove('show');
    setTimeout(function () { spot.remove(); arrow.remove(); dim.remove(); }, 400);
    window.removeEventListener('resize', place); window.removeEventListener('scroll', place);
  }
  function open() {
    document.body.appendChild(dim); document.body.appendChild(spot); document.body.appendChild(arrow);
    var r = btn.getBoundingClientRect();
    if (r.bottom > window.innerHeight - 20) window.scrollTo({ top: window.scrollY + r.top - window.innerHeight / 2 + r.height / 2, behavior: 'instant' });
    place(); on = true;
    requestAnimationFrame(function () { dim.classList.add('show'); spot.classList.add('show'); arrow.classList.add('show'); });
    window.addEventListener('resize', place); window.addEventListener('scroll', place, { passive: true });
  }
  // 어두운 부분을 누르면 닫기 (버튼은 그대로 눌림)
  document.addEventListener('click', function (e) {
    if (!on) return;
    if (btn.contains(e.target)) { close(); return; }
    e.preventDefault(); e.stopPropagation(); close();
  }, true);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  window.addEventListener('wheel', close, { passive: true });
  window.addEventListener('touchmove', close, { passive: true });
  window.addEventListener('load', function () { setTimeout(open, 500); });
})();
