(function(){
'use strict';
if(window.topfilms_tv_loaded)return; window.topfilms_tv_loaded=true;
var BASE='https://malysh-sl2.github.io/Top-films/data/';
var tabs=[['movies-top','ТОП ФІЛЬМІВ'],['movies-find','ЗНАХІДКИ ФІЛЬМІВ'],['series-top','ТОП СЕРІАЛІВ'],['series-find','ЗНАХІДКИ СЕРІАЛІВ']];
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(x){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]})}
function Component(){
 var root=$('<div class="tf-screen"></div>'),scroll=new Lampa.Scroll({mask:false,over:true,step:250}),body=$('<div class="tf-body"></div>'),last=null,tab='movies-top',page=0,busy=false,more=true,dead=false,serial=0, net=null;
 var cacheKey='',cachePages=null, restoring=false, active=false, watched={};
 function readWatched(){try{['history','viewed'].forEach(function(type){(Lampa.Favorite.get({type:type})||[]).forEach(function(m){watched[String(m.id)]=true})})}catch(e){console.log('Top Films: історія недоступна',e)}}
 var filters={from:2026,to:9999,genres:[],excluded:[],countries:[],age:''};
 var genres=[["28", "Бойовик"], ["37", "Вестерн"], ["10752", "Військовий"], ["9648", "Детектив"], ["10762", "Дитячий"], ["99", "Документальний"], ["18", "Драма"], ["10759", "Екшн і Пригоди"], ["27", "Жахи"], ["36", "Історичний"], ["35", "Комедія"], ["80", "Кримінал"], ["10749", "Мелодрама"], ["10766", "Мильна опера"], ["10402", "Музика"], ["16", "Мультфільм"], ["10765", "Науково фантастичний"], ["10763", "Новини"], ["10768", "Політика та війна"], ["12", "Пригоди"], ["10764", "Реаліті-шоу"], ["10751", "Сімейний"], ["10770", "Телефільм"], ["10767", "Ток-шоу"], ["53", "Трилер"], ["878", "Фантастика"], ["14", "Фентезі"]];
 var countries=[["UA", "Україна"], ["RU", "Росія"], ["GB", "Велика Британія"], ["PL", "Польща"], ["IT", "Італія"], ["AU", "Австралія"], ["AT", "Австрія"], ["AZ", "Азербайджан"], ["AL", "Албанія"], ["DZ", "Алжир"], ["AS", "Американське Самоа"], ["AO", "Ангола"], ["AD", "Андорра"], ["AQ", "Антарктика"], ["AR", "Аргентина"], ["AW", "Аруба"], ["AF", "Афганістан"], ["BS", "Багамські Острови"], ["BD", "Бангладеш"], ["BH", "Бахрейн"], ["BE", "Бельгія"], ["BM", "Бермудські Острови"], ["BY", "Білорусь"], ["BG", "Болгарія"], ["BO", "Болівія"], ["BA", "Боснія і Герцеговина"], ["BW", "Ботсвана"], ["BR", "Бразилія"], ["BF", "Буркіна-Фасо"], ["BI", "Бурунді"], ["BT", "Бутан"], ["VE", "Венесуела"], ["AM", "Вірменія"], ["VN", "Вʼєтнам"], ["GA", "Габон"], ["HT", "Гаїті"], ["GH", "Гана"], ["GP", "Гваделупа"], ["GT", "Гватемала"], ["GN", "Гвінея"], ["GI", "Гібралтар"], ["HN", "Гондурас"], ["HK", "Гонконг, О.А.Р. Китаю"], ["GR", "Греція"], ["GE", "Грузія"], ["DK", "Данія"], ["DM", "Домініка"], ["DO", "Домініканська Республіка"], ["EC", "Еквадор"], ["EE", "Естонія"], ["ET", "Ефіопія"], ["EG", "Єгипет"], ["ZW", "Зімбабве"], ["IL", "Ізраїль"], ["IN", "Індія"], ["ID", "Індонезія"], ["IQ", "Ірак"], ["IR", "Іран"], ["IE", "Ірландія"], ["IS", "Ісландія"], ["ES", "Іспанія"], ["JO", "Йорданія"], ["CV", "Кабо-Верде"], ["KZ", "Казахстан"], ["KH", "Камбоджа"], ["CM", "Камерун"], ["CA", "Канада"], ["QA", "Катар"], ["KE", "Кенія"], ["KG", "Киргизстан"], ["CN", "Китай"], ["CY", "Кіпр"], ["CO", "Колумбія"], ["CG", "Конго – Браззавіль"], ["CD", "Конго – Кіншаса"], ["XK", "Косово"], ["CR", "Коста-Рика"], ["CI", "Кот-дʼІвуар"], ["CU", "Куба"], ["KW", "Кувейт"], ["AN", "Кюрасао"], ["LV", "Латвія"], ["LT", "Литва"], ["LB", "Ліван"], ["LY", "Лівія"], ["LI", "Ліхтенштейн"], ["LU", "Люксембург"], ["MU", "Маврикій"], ["MO", "Макао, О.А.Р Китаю"], ["MW", "Малаві"], ["MY", "Малайзія"], ["MT", "Мальта"], ["MA", "Марокко"], ["MQ", "Мартиніка"], ["MX", "Мексика"], ["MZ", "Мозамбік"], ["MD", "Молдова"], ["MN", "Монголія"], ["MM", "Мʼянма (Бірма)"], ["NA", "Намібія"], ["NP", "Непал"], ["NE", "Нігер"], ["NG", "Нігерія"], ["NL", "Нідерланди"], ["NI", "Нікарагуа"], ["DE", "Німеччина"], ["NZ", "Нова Зеландія"], ["NO", "Норвегія"], ["AE", "ОАЕ"], ["CK", "Острови Кука"], ["PK", "Пакистан"], ["PS", "Палестинська Автономія"], ["PA", "Панама"], ["PY", "Парагвай"], ["PE", "Перу"], ["KR", "Південна Корея"], ["ZA", "Південно-Африканська Республіка"], ["MK", "Північна Македонія"], ["PT", "Португалія"], ["PR", "Пуерто-Рико"], ["SU", "Росія"], ["RW", "Руанда"], ["RO", "Румунія"], ["SV", "Сальвадор"], ["SA", "Саудівська Аравія"], ["SN", "Сенегал"], ["YU", "Сербія"], ["RS", "Сербія"], ["CS", "Сербія"], ["SY", "Сирія"], ["SG", "Сінгапур"], ["SK", "Словаччина"], ["SI", "Словенія"], ["SB", "Соломонові Острови"], ["SD", "Судан"], ["US", "США"], ["TJ", "Таджикистан"], ["TH", "Таїланд"], ["TW", "Тайвань"], ["TZ", "Танзанія"], ["TG", "Того"], ["TK", "Токелау"], ["TT", "Тринідад і Тобаго"], ["TN", "Туніс"], ["TR", "Туреччина"], ["UG", "Уганда"], ["HU", "Угорщина"], ["UZ", "Узбекистан"], ["UY", "Уругвай"], ["FO", "Фарерські Острови"], ["FJ", "Фіджі"], ["PH", "Філіппіни"], ["FI", "Фінляндія"], ["FK", "Фолклендські Острови"], ["FR", "Франція"], ["PF", "Французька Полінезія"], ["HR", "Хорватія"], ["TD", "Чад"], ["CZ", "Чехія"], ["CL", "Чилі"], ["ME", "Чорногорія"], ["CH", "Швейцарія"], ["SE", "Швеція"], ["LK", "Шрі-Ланка"], ["JM", "Ямайка"], ["JP", "Японія"], ["EH", "EH"], ["XC", "XC"], ["XG", "XG"], ["XI", "XI"]];
 var head=$('<div class="tf-title">Народний рейтинг</div>'), nav=$('<div class="tf-nav"></div>'),grid=$('<div class="tf-grid"></div>'),status=$('<div class="tf-status"></div>');
 function focus(el){last=el;if(!restoring){var box=scroll.render()[0].getBoundingClientRect(), r=el.getBoundingClientRect();if(r.top<box.top+20||r.bottom>box.bottom-20)scroll.update($(el),true);if($(el).closest('.tf-cell').length && grid.children().index($(el).closest('.tf-cell'))>=grid.children().length-11 && more && !busy)setTimeout(load,0)}}
 function refreshFocus(){
  if (!active || !Lampa.Controller.enabled || Lampa.Controller.enabled().name !== 'content') return;
  var previous=last && document.documentElement.contains(last) ? last : null;
  restoring=true;
  try { Lampa.Controller.collectionSet(scroll.render()); Lampa.Controller.collectionFocus(previous || false,scroll.render()); }
  finally { restoring=false; }
 }
 function mkbtn(text,cb){var el=$('<div class="tf-tab selector">'+esc(text)+'</div>');el.on('hover:focus',function(){focus(this)});el.on('hover:enter',cb);return el}
 function nearestVertical(nodes, direction){
  if(!last)return false;
  var a=last.getBoundingClientRect(),cx=a.left+a.width/2,cy=a.top+a.height/2,best=null,bestY=Infinity,bestX=Infinity;
  nodes.each(function(){var r=this.getBoundingClientRect(),dy=(r.top+r.height/2-cy)*(direction==='down'?1:-1),dx=Math.abs(r.left+r.width/2-cx);if(dy<=5||!r.width||!r.height)return;if(dy<bestY-8||(Math.abs(dy-bestY)<=8&&dx<bestX)){best=this;bestY=dy;bestX=dx}});
  if(best){Navigator.focus(best);return true}return false;
 }
 function moveVertical(dir){
  var inHeader=last && nav[0].contains(last), inFilter=last && $(last).closest('.tf-filter-nav').length;
  if(dir==='down' && inHeader && nearestVertical(body.find('.tf-filter-nav .selector'),'down'))return;
  if(dir==='down' && inFilter && nearestVertical(body.find('.tf-filter-nav .selector, .tf-grid .tf-card'),'down'))return;
  if(dir==='up' && inFilter && nearestVertical(body.find('.tf-filter-nav .selector, .tf-header .selector'),'up'))return;
  if(Navigator.canmove(dir))Navigator.move(dir);
  else if(dir==='down' && more)load();
  else if(dir==='up' && inHeader)Lampa.Controller.toggle('head');
 }
 function controller(){Lampa.Controller.add('content',{toggle:function(){Lampa.Controller.collectionSet(scroll.render());Lampa.Controller.collectionFocus(last||false,scroll.render())},up:function(){moveVertical('up')},down:function(){moveVertical('down')},left:function(){if(Navigator.canmove('left'))Navigator.move('left');else Lampa.Controller.toggle('menu')},right:function(){if(Navigator.canmove('right'))Navigator.move('right')},back:function(){Lampa.Activity.backward()}});Lampa.Controller.toggle('content')}

 function makeCard(m){return {id:m.id,media_type:m.type,title:m.title,name:m.title,poster_path:m.poster,release_date:m.year?m.year+'-01-01':'',first_air_date:m.year?m.year+'-01-01':'',source:'tmdb'};}
 function open(m){var card=makeCard(m);Lampa.Activity.push({url:'',title:m.title,component:'full',id:m.id,method:m.type==='tv'?'tv':'movie',card:card,source:'tmdb'});}
 function compact(n){n=Number(n)||0;return n>=10000 ? (Math.round(n/1000)+'т') : String(n)}
 function renderCard(m){var c=m.c||{},p=m.poster?'https://image.tmdb.org/t/p/w342'+m.poster:'',age=(m.age!==null && m.age!==undefined && m.age!=='' && isFinite(Number(m.age)))?'<span>'+esc(m.age)+'+</span>':'';
 var el=$('<div class="tf-card selector"><div class="tf-poster">'+(p?'<img loading="lazy" src="'+esc(p)+'">':'')+'<span class="tf-score">'+esc(Number(m.score).toFixed(1))+'</span><span class="tf-year-age">'+esc(m.year||'')+(age?' '+age:'')+'</span></div><div class="tf-reactions"><span>🔥'+esc(compact(c.fire))+'</span><span>👍'+esc(compact(c.like))+'</span><span>🤔'+esc(compact(c.think))+'</span><span>😴'+esc(compact(c.sleep))+'</span><span>💩'+esc(compact(c.shit))+'</span></div><div class="tf-name">'+esc(m.title)+'</div></div>');
 var cell=$('<div class="tf-cell"></div>');
 el.data('tf-item',m);el.on('hover:focus',function(){focus(this)});el.on('hover:enter',function(){open(m)});
 cell.append(el);grid.append(cell)}
 function historyMenu(m,card){
  Lampa.Select.show({title:m.title,items:[{title:'✓ Переглянуто — додати в історію',value:'history'}],
   onSelect:function(){
    var cell=$(card).closest('.tf-cell');
    try{Lampa.Favorite.add('history',makeCard(m),100);}
    catch(e){Lampa.Noty.show('Не вдалося додати до історії');Lampa.Controller.toggle('content');return;}
    watched[String(m.id)]=true;
    var next=cell.next().find('.tf-card')[0] || cell.prev().find('.tf-card')[0] || nav.find('.tf-tab')[0];
    cell.remove();last=next;Lampa.Controller.toggle('content');refreshFocus();
    Lampa.Noty.show('Додано до історії Lampa');
    if(more && grid.children().length<15)setTimeout(load,0);
   },onBack:function(){Lampa.Controller.toggle('content')}});
 }
 var holdTimer=null,holdCard=null,holdShown=false;
 function isOK(e){return e.key==='Enter'||e.key==='NumpadEnter'||[13,23,29443,117,65385].indexOf(e.keyCode)>=0}
 function keyDown(e){
  if(!active || !isOK(e))return;
  if(holdCard){e.preventDefault();e.stopImmediatePropagation();return;}
  if(!last || !$(last).hasClass('tf-card') || !Lampa.Controller.enabled || Lampa.Controller.enabled().name!=='content')return;
  holdCard=last;holdShown=false;e.preventDefault();e.stopImmediatePropagation();
  holdTimer=setTimeout(function(){if(!holdCard || !active)return;holdShown=true;historyMenu($(holdCard).data('tf-item'),holdCard)},3000);
 }
 function keyUp(e){
  if(!holdCard || !isOK(e))return;
  e.preventDefault();e.stopImmediatePropagation();clearTimeout(holdTimer);
  var card=holdCard,shown=holdShown;holdCard=null;holdTimer=null;holdShown=false;
  if(!shown && active && document.documentElement.contains(card))open($(card).data('tf-item'));
 }
 function cancelHold(){clearTimeout(holdTimer);holdTimer=null;holdCard=null;holdShown=false;}

 function passes(m){
  if(watched[String(m.id)])return false;
  var year=parseInt(m.year,10), g=(m.g||[]).map(String), cs=m.co||[];
  if(!year || year<filters.from || year>filters.to)return false;
  if(filters.genres.length && !filters.genres.some(function(v){return g.indexOf(v)>=0}))return false;
  if(filters.excluded.some(function(v){return g.indexOf(v)>=0}))return false;
  if(filters.countries.length && !filters.countries.some(function(v){return cs.indexOf(v)>=0}))return false;
  if(filters.age==='adult' && !(m.age>=18))return false;
  if(filters.age==='noadult' && m.age>=18)return false;
  return true;
 }
 function pickOne(title,key,choices){
  var opts=choices.map(function(c){return {title:c[1],value:c[0],selected:String(filters[key])===String(c[0])}});
  Lampa.Select.show({title:title,items:opts,onSelect:function(v){filters[key]=v.value;updateFilterLabel();Lampa.Controller.toggle('content');select(tab)},onBack:function(){Lampa.Controller.toggle('content')}});
 }
 function pickMany(title,key,choices){
  var values=filters[key].slice();
  var opts=choices.map(function(c){return {title:c[1],value:c[0],checkbox:true,checked:values.indexOf(c[0])>=0}});
  Lampa.Select.show({title:title+' — ОК: вибрати, Назад: застосувати',items:opts,nohide:true,onCheck:function(v){var i=values.indexOf(v.value);if(v.checked && i<0)values.push(v.value);if(!v.checked && i>=0)values.splice(i,1)},onBack:function(){filters[key]=values;Lampa.Controller.toggle('content');select(tab)}});
 }
 function updateFilterLabel(){body.find('.tf-year-filter').text('Рік від '+filters.from)}
 function setupFilters(){
  var row=$('<div class="tf-nav tf-filter-nav"></div>'),years=[];
  for(var y=2026;y>=1950;y--)years.push([y,String(y)]);
  row.append(mkbtn('Рік від '+filters.from,function(){pickOne('Рік виходу: від','from',years)}).addClass('tf-year-filter'));
  row.append(mkbtn('Жанри',function(){pickMany('Жанри','genres',genres)}));
  row.append(mkbtn('Виключити жанри',function(){pickMany('Виключити жанри','excluded',genres)}));
  row.append(mkbtn('Країни',function(){pickMany('Країни','countries',countries)}));
  row.append(mkbtn('Вік',function(){pickOne('Вік','age',[['','Усі'],['adult','Лише 18+'],['noadult','Без 18+']])}));
  row.append(mkbtn('Скинути фільтри',function(){filters={from:2026,to:9999,genres:[],excluded:[],countries:[],age:''};updateFilterLabel();select(tab)}));
  return row;
 }

 function load(){
  if(busy||!more||dead)return;
  busy=true;status.text('Завантаження…');
  var current=serial,next=page+1,pack=Math.ceil(next/10),packKey=tab+'-pack-'+pack;
  function show(pages){
   if(dead||serial!==current)return;
   if(typeof pages==='string'){try{pages=JSON.parse(pages)}catch(e){pages=null}}
   if(!Array.isArray(pages)){busy=false;status.text('Не вдалося прочитати дані');return}
   cacheKey=packKey;cachePages=pages;
   var data=pages[(next-1)%10];busy=false;
   if(!Array.isArray(data)){more=false;status.text('Кінець списку');return}
   page=next;data.filter(passes).forEach(renderCard);
   refreshFocus();
   more=data.length===30 && (((next-1)%10)<pages.length-1 || pages.length===10);
   status.text(more?'Гортайте вниз для наступних фільмів':(grid.children().length?'Кінець списку':'Нічого не знайдено'));
   if(more && (grid.children().length<15 || (last && $(last).closest('.tf-cell').length && grid.children().index($(last).closest('.tf-cell'))>=grid.children().length-6))) setTimeout(load,0);
  }
  if(cacheKey===packKey && cachePages){show(cachePages);return}
  net=new Lampa.Reguest();net.timeout(20000);
  net.silent(BASE+packKey+'.json',show,function(){if(dead||serial!==current)return;busy=false;more=false;status.text(page?'Кінець списку або помилка мережі':'Не вдалося завантажити базу. Перевірте інтернет та файли GitHub.');});
 }

 function select(key){serial++;tab=key;page=0;busy=false;more=true;grid.empty();status.empty();nav.children().removeClass('tf-selected');nav.find('[data-tab="'+key+'"]').addClass('tf-selected');refreshFocus();load()}
 this.create=function(){readWatched();tabs.forEach(function(t){var b=mkbtn(t[1],function(){select(t[0])});b.attr('data-tab',t[0]);nav.append(b)});var header=$('<div class="tf-header"></div>');header.append(head,nav);body.append(header,setupFilters(),grid,status);scroll.append(body);root.append(scroll.render());scroll.onEnd=load;select(tab);return root};
 this.render=function(){return root};this.start=function(){active=true;readWatched();window.addEventListener('keydown',keyDown,true);window.addEventListener('keyup',keyUp,true);controller()};this.pause=function(){active=false;cancelHold();window.removeEventListener('keydown',keyDown,true);window.removeEventListener('keyup',keyUp,true)};this.stop=function(){active=false;cancelHold();window.removeEventListener('keydown',keyDown,true);window.removeEventListener('keyup',keyUp,true)};this.back=function(){Lampa.Activity.backward()};this.destroy=function(){dead=true;cancelHold();window.removeEventListener('keydown',keyDown,true);window.removeEventListener('keyup',keyUp,true);serial++;if(net)net.clear();scroll.destroy();root.remove()};
}
function init(){
 Lampa.Component.add('topfilms_tv',Component);
 if(!document.getElementById('topfilms-style'))$('head').append('<style id="topfilms-style">.tf-screen{height:calc(100vh - 7em);overflow:hidden}.tf-screen > .scroll{height:100%}.tf-body{padding:3.8em 2.2em 4em}.tf-header{display:flex;align-items:center;gap:1em;flex-wrap:wrap;margin-bottom:1.2em}.tf-header .tf-nav{flex:1;justify-content:center;margin:0}.tf-title{font-size:1.5em;font-weight:800;color:#fff;background:transparent;padding:.5em .7em;border-radius:.4em;white-space:nowrap}.tf-nav{display:flex;flex-wrap:wrap;gap:.5em;margin-bottom:1.5em}.tf-tab{padding:.65em 1.3em;min-width:10em;text-align:center;background:transparent;color:#fff;border-radius:.5em}.tf-header .tf-tab{background:#090909;color:#fff;min-width:8em}.tf-header .tf-selected{background:#090909;color:#fff}.tf-header .tf-tab.focus{background:#fff;color:#111}.tf-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));column-gap:1.4em;row-gap:3em}.tf-cell{min-width:0}.tf-card{border-radius:.5em;padding:.35em;background:transparent;color:#fff}.tf-poster{position:relative;aspect-ratio:2/3;background:#1a1a1a;overflow:hidden;border-radius:.3em}.tf-poster img{width:100%;height:100%;object-fit:cover}.tf-name{font-weight:bold;margin:.35em 0 .3em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tf-meta{display:flex;align-items:center;gap:.35em;min-height:1.7em;font-size:.85em}.tf-year{opacity:.85}.tf-age{font-weight:700;color:#fff;padding:.08em .1em}.tf-score,.tf-year-age{position:absolute;bottom:.45em;background:rgba(0,0,0,.72);border-radius:.38em;padding:.18em .42em;line-height:1.2;color:#fff}.tf-score{right:.45em;font-size:1.1em;font-weight:800}.tf-year-age{left:.45em;font-size:.75em;font-weight:700}.tf-reactions{margin-top:.85em;display:flex;flex-wrap:nowrap;justify-content:space-between;gap:.08em;white-space:nowrap;font-size:.68em;line-height:1.7;letter-spacing:-.025em}.tf-reactions span{white-space:nowrap}.tf-seen{text-align:center;background:#34485b;border-radius:.4em;margin-top:.3em;padding:.4em;font-weight:700;font-size:.8em}.tf-seen.focus{background:#fff;color:#111}.tf-tab.focus{background:#fff;color:#111;transform:scale(1.03)}.tf-card.focus{background:transparent;color:#fff;transform:none}.tf-card.focus .tf-poster{outline:3px solid #fff;outline-offset:3px}.tf-status{padding:2em 0;opacity:.7}@media(max-width:700px){.tf-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}</style>');
 if($('.menu [data-action="topfilms_tv"]').length)return;
 var item=$('<li class="menu__item selector" data-action="topfilms_tv"><div class="menu__ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3.1 6.3 7 .99-5.05 4.92 1.2 6.99L12 17.9l-6.25 3.3 1.2-6.99L1.9 9.3l7-.99z"/></svg></div><div class="menu__text">Top Films</div></li>');item.on('hover:enter',function(){Lampa.Activity.push({url:'',title:'Top Films',component:'topfilms_tv',page:1})});var menu=$('.menu .menu__list').first();if(!menu.length)menu=$('.menu ul').first();menu.append(item);
}
if(window.appready)init();else Lampa.Listener.follow('app',function(e){if(e.type==='ready')init()});
})();
