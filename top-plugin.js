(function () {
  'use strict';
  if (window.top_lampa_plugin_loaded) return;
  window.top_lampa_plugin_loaded = true;
  var scriptUrl = document.currentScript && document.currentScript.src;
  var defaultUrl = scriptUrl ? scriptUrl.replace(/[^/]*(?:\?.*)?$/, 'top.html') : '';
  var key = 'top_lampa_page_url';

  function TopComponent() {
    var root = $('<div style="height:100%;width:100%;position:relative;overflow:hidden;background:#080b12"></div>');
    var frame = $('<iframe title="TOP" allow="fullscreen; autoplay; encrypted-media" style="width:100%;height:100%;border:0;background:#080b12"></iframe>');
    var url = Lampa.Storage.get(key, '') || defaultUrl;
    var back = function () { Lampa.Activity.backward(); };
    var listener = function (e) {
      if (frame[0] && e.source === frame[0].contentWindow && e.data === 'top-lampa-back') back();
    };
    this.create = function () {
      if (!url || !/^https?:\/\//i.test(url)) {
        root.append('<div style="padding:2em">Вкажіть HTTPS-адресу файлу top.html у налаштуваннях інтерфейсу Lampa: «TOP: адреса сторінки».</div>');
      } else { frame.attr('src', url); root.append(frame); }
      window.addEventListener('message', listener);
      return root;
    };
    this.render = function () { return root; };
    this.start = function () {
      Lampa.Controller.add('content', {
        toggle: function () { if (url && frame[0]) frame[0].focus(); },
        back: back,
        left: function () { if (frame[0]) frame[0].focus(); },
        right: function () { if (frame[0]) frame[0].focus(); },
        up: function () { if (frame[0]) frame[0].focus(); },
        down: function () { if (frame[0]) frame[0].focus(); }
      });
      Lampa.Controller.toggle('content');
    };
    this.pause = function () {};
    this.stop = function () {};
    this.back = back;
    this.destroy = function () { window.removeEventListener('message', listener); frame.attr('src', 'about:blank'); root.remove(); };
  }
  function init() {
    Lampa.Component.add('top_page', TopComponent);
    if (Lampa.SettingsApi) Lampa.SettingsApi.addParam({
      component: 'interface',
      param: {name: key, type: 'input', default: defaultUrl},
      field: {name: 'TOP: адреса сторінки', description: 'HTTPS-посилання на опублікований файл top.html'}
    });
    if ($('.menu [data-action="top_page"]').length) return;
    var item = $('<li class="menu__item selector" data-action="top_page"><div class="menu__ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3.1 6.3 7 .99-5.05 4.92 1.2 6.99L12 17.9l-6.25 3.3 1.2-6.99L1.9 9.3l7-.99z"/></svg></div><div class="menu__text">TOP</div></li>');
    item.on('hover:enter', function () { Lampa.Activity.push({url:'', title:'TOP', component:'top_page', page:1}); });
    var menu = $('.menu .menu__list').first();
    if (!menu.length) menu = $('.menu ul').first();
    menu.append(item);
  }
  if (window.appready) init();
  else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') init(); });
})();
