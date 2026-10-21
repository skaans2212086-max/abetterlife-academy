/* 페이지에 들어오면 항상 맨 위부터 (새로고침 · 뒤로가기 포함)
   단, 주소에 #섹션(예: lecture.html#curriculum)이 있으면 그 섹션으로 이동 */
(function () {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  function toTop() {
    var id = decodeURIComponent(location.hash.slice(1));
    if (id && document.getElementById(id)) return;
    window.scrollTo(0, 0);
  }
  window.addEventListener('DOMContentLoaded', toTop);
  window.addEventListener('load', toTop);
  window.addEventListener('pageshow', function (e) { if (e.persisted) toTop(); });
})();
