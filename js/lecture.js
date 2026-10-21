(function () {
  // ---------- 등장 애니메이션 ----------
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('on'); io.unobserve(en.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal, #bars, .pencil, .dash.grow').forEach(function (el) { io.observe(el); });

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
  var tabs = document.querySelectorAll('#tabs a');
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
  modal.addEventListener('click', function (e) { if (e.target === modal) closeM(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeM(); });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = document.getElementById('fName').value.trim();
    var phone = document.getElementById('fPhone').value.replace(/\D/g, '');
    if (!name) { err.textContent = '이름을 입력해 주세요.'; return; }
    if (!/^01\d{8,9}$/.test(phone)) { err.textContent = '휴대폰 번호를 정확히 입력해 주세요. (예: 010-1234-5678)'; return; }
    if (!document.getElementById('fAgree').checked) { err.textContent = '이용약관 및 개인정보 수집 · 이용에 동의해 주세요.'; return; }
    err.textContent = '';
    // TODO: 실제 신청 접수(구글 시트, CRM 등) 연결 위치
    modal.classList.add('sent');
    document.querySelectorAll('.sc2 .go').forEach(function (b) { b.classList.add('done'); b.lastChild.textContent = '신청 완료'; });
  });

  // ---------- 찜 / 링크 복사 ----------
  document.getElementById('likeBtn').addEventListener('click', function () { this.classList.toggle('on'); });
  document.getElementById('shareBtn').addEventListener('click', function () {
    var btn = this;
    if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(function () {
      btn.title = '링크가 복사되었습니다'; btn.style.background = '#e5eeff';
      setTimeout(function () { btn.style.background = ''; }, 1200);
    }).catch(function () {});
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
  var KEY = 'abl_perk_start', LIMIT = (+box.dataset.minutes || 30) * 60 * 1000, start;
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
