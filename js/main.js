(function () {
  // ---------- 헤더 & 스크롤 진행바 ----------
  var header = document.getElementById('header');
  var bar = document.getElementById('progress');
  var hero = document.querySelector('.hero');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('scrolled', y > hero.offsetHeight - 120);
    var max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- 모바일 메뉴 ----------
  var gnb = document.getElementById('gnb');
  document.getElementById('menuBtn').addEventListener('click', function () { gnb.classList.toggle('open'); });
  gnb.addEventListener('click', function (e) { if (e.target.closest('a') && e.target.getAttribute('href') !== '#') gnb.classList.remove('open'); });

  // ---------- 히어로 배경 텍스트(블러) ----------
  var lines = [
    '처음엔 반신반의했습니다. 대행사를 여러 번 바꿔봤지만 매번 노출 보고서만 받았거든요. 그런데 이번에는 상담 문의 자체가 달라졌습니다.',
    '블로그 글을 읽고 오신 환자분들은 이미 저희 병원을 신뢰하고 오십니다. 상담 시간이 절반으로 줄었습니다.',
    '플레이스 리뷰 관리만 맡겼는데 예약 전환이 눈에 띄게 늘었어요. 실장님들도 응대가 편해졌다고 합니다.',
    '유튜브 영상 하나로 지방에서도 환자분들이 찾아오십니다. 원장님 영상 보고 왔어요, 라는 말을 매일 듣습니다.',
    '광고비는 그대로인데 문의 단가가 내려갔습니다. 숫자로 보여주니 믿을 수밖에 없네요.',
    '개원 초기라 막막했는데 상권 분석부터 같이 해주셔서 방향이 잡혔습니다. 감사합니다.'
  ];
  var bg = document.getElementById('heroTextBg');
  var html = '';
  for (var c = 0; c < 3; c++) {
    html += '<div>';
    for (var i = 0; i < 9; i++) html += '<p>' + lines[(i + c * 2) % lines.length] + '</p>';
    html += '</div>';
  }
  bg.innerHTML = html;

  // ---------- 등장 애니메이션 ----------
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('on'); io.unobserve(en.target); }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  // ---------- 숫자 카운트 ----------
  var cio = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      cio.unobserve(en.target);
      var el = en.target, to = +el.dataset.to, t0 = null;
      function step(t) {
        if (!t0) t0 = t;
        var p = Math.min((t - t0) / 1600, 1);
        var n = Math.round(to * (1 - Math.pow(1 - p, 3)));
        el.textContent = el.hasAttribute('data-comma') ? n.toLocaleString('ko-KR') : n;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.count').forEach(function (el) { cio.observe(el); });

  // ---------- 타이핑 문구 ----------
  var phrases = ['우리 병원에 딱 맞는 마케팅을 알려줄 곳', '매출로 결과를 증명하는 대행사', '노출이 아니라 환자를 데려오는 곳', '진료 철학까지 이해해주는 파트너'];
  var typed = document.getElementById('typed');
  var pi = 0, ci = 0, del = false;
  function type() {
    var w = phrases[pi];
    typed.textContent = w.slice(0, ci);
    var delay = del ? 45 : 110;
    if (!del && ci === w.length) { del = true; delay = 1800; }
    else if (del && ci === 0) { del = false; pi = (pi + 1) % phrases.length; delay = 400; }
    ci += del ? -1 : 1;
    setTimeout(type, delay);
  }
  type();

  // ---------- 진행 섹션 물결 라인 ----------
  var svg = document.getElementById('waves');
  var paths = '';
  for (var k = 0; k < 46; k++) {
    var o = k * 9;
    // 왼쪽 물결
    paths += '<path d="M' + (-200 + o) + ',600 C' + (100 + o) + ',' + (380 - o * .3) + ' ' + (-50 + o) + ',' + (120 + o * .2) + ' ' + (300 + o * .6) + ',-20" stroke="rgba(90,120,230,' + (0.08 + k * 0.006) + ')" />';
    // 오른쪽 물결
    paths += '<path d="M' + (1800 - o) + ',620 C' + (1350 - o * .4) + ',' + (420 - o * .2) + ' ' + (1650 - o) + ',' + (160 + o * .3) + ' ' + (1250 - o * .5) + ',-20" stroke="rgba(110,140,240,' + (0.06 + k * 0.007) + ')" />';
  }
  svg.innerHTML = '<g fill="none" stroke-width="1.4">' + paths + '</g>';
})();

// 대표 영상: 소리 켜기 버튼
(function () {
  var v = document.getElementById('ceoVideo'), b = document.getElementById('unmuteBtn');
  if (!v || !b) return;
  b.addEventListener('click', function () { v.muted = false; v.volume = 1; v.play(); b.hidden = true; });
  v.addEventListener('volumechange', function () { b.hidden = !v.muted; });
})();
