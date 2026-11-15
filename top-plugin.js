(function(){
'use strict';
if(window.topfilms_tv_loaded)return; window.topfilms_tv_loaded=true;
var BASE='https://malysh-sl2.github.io/Top-films/data/';
var tabs=[['movies-top','ТОП фільмів'],['movies-find','Знахідки фільмів'],['series-top','ТОП серіалів'],['series-find','Знахідки серіалів']];
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(x){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]})}
function Component(){
 var root=$('<div class="tf-screen"></div>'),scroll=new Lampa.Scroll({mask:false,over:true,step:250}),body=$('<div class="tf-body"></div>'),last=null,tab='movies-top',page=0,busy=false,more=true,dead=false,serial=0, net=null;
 var cacheKey='',cachePages=null, restoring=false, active=false;
 var filters={year:'',genre:'',country:'',age:''};
 var genres=[['28','Бойовик'],['12','Пригоди'],['16','Мультфільм'],['35','Комедія'],['80','Кримінал'],['99','Документальний'],['18','Драма'],['10751','Сімейний'],['14','Фентезі'],['36','Історичний'],['27','Жахи'],['10402','Музика'],['9648','Детектив'],['10749','Мелодрама'],['878','Фантастика'],['10770','Телефільм'],['53','Трилер'],['10752','Військовий'],['37','Вестерн']];
 var countries=[['UA','Україна'],['US','США'],['GB','Велика Британія'],['PL','Польща'],['FR','Франція'],['DE','Німеччина'],['IT','Італія'],['ES','Іспанія'],['CA','Канада'],['AU','Австралія'],['KR','Південна Корея'],['JP','Японія'],['IN','Індія'],['RU','Росія']];
 var head=$('<div class="tf-title">Народний рейтинг</div>'), nav=$('<div class="tf-nav"></div>'),grid=$('<div class="tf-grid"></div>'),status=$('<div class="tf-status"></div>');
 function focus(el){last=el;if(!restoring)scroll.update($(el),true)}
 function refreshFocus(){
  if (!active || !Lampa.Controller.enabled || Lampa.Controller.enabled().name !== 'content') return;
  var previous=last && document.documentElement.contains(last) ? last : null;
  restoring=true;
  try { Lampa.Controller.collectionSet(scroll.render()); Lampa.Controller.collectionFocus(previous || false,scroll.render()); }
  finally { restoring=false; }
 }
 function mkbtn(text,cb){var el=$('<div class="tf-tab selector">'+esc(text)+'</div>');el.on('hover:focus',function(){focus(this)});el.on('hover:enter',cb);return el}
 function controller(){Lampa.Controller.add('content',{toggle:function(){Lampa.Controller.collectionSet(scroll.render());Lampa.Controller.collectionFocus(last||false,scroll.render())},up:function(){if(Navigator.canmove('up'))Navigator.move('up');else Lampa.Controller.toggle('head')},down:function(){if(Navigator.canmove('down'))Navigator.move('down');else if(more)load()},left:function(){if(Navigator.canmove('left'))Navigator.move('left');else Lampa.Controller.toggle('menu')},right:function(){if(Navigator.canmove('right'))Navigator.move('right')},back:function(){Lampa.Activity.backward()}});Lampa.Controller.toggle('content')}
 function open(m){var card={id:m.id,media_type:m.type,title:m.title,name:m.title,poster_path:m.poster,release_date:m.year?m.year+'-01-01':'',first_air_date:m.year?m.year+'-01-01':''};Lampa.Activity.push({url:'',title:m.title,component:'full',id:m.id,method:m.type==='tv'?'tv':'movie',card:card,source:'tmdb'});}
 function renderCard(m){var c=m.c||{},p=m.poster?'https://image.tmdb.org/t/p/w342'+m.poster:'';
 var el=$('<div class="tf-card selector"><div class="tf-poster">'+(p?'<img loading="lazy" src="'+esc(p)+'">':'')+'</div><div class="tf-name">'+esc(m.title)+'</div><div class="tf-meta">'+esc(m.year)+' · ★ '+esc(m.score)+'</div><div class="tf-reactions">🔥 '+esc(c.fire||0)+'　👍 '+esc(c.like||0)+'<br>🤔 '+esc(c.think||0)+'　😴 '+esc(c.sleep||0)+'　💩 '+esc(c.shit||0)+'</div></div>');
 el.on('hover:focus',function(){focus(this)});el.on('hover:enter',function(){open(m)});grid.append(el)}

 function passes(m){
  if(filters.year && String(m.year)!==filters.year)return false;
  if(filters.genre && (m.g||[]).map(String).indexOf(filters.genre)<0)return false;
  if(filters.country && (m.co||[]).indexOf(filters.country)<0)return false;
  if(filters.age==='adult' && !(m.age>=18))return false;
  if(filters.age==='noadult' && m.age>=18)return false;
  return true;
 }
 function pickFilter(title,key,choices){
  var opts=[{title:'Усі',value:''}];
  choices.forEach(function(c){opts.push({title:c[1],value:c[0],selected:filters[key]===c[0]})});
  Lampa.Select.show({title:title,items:opts,onSelect:function(v){filters[key]=v.value;Lampa.Controller.toggle('content');select(tab)},onBack:function(){Lampa.Controller.toggle('content')}});
 }
 function setupFilters(){
  var row=$('<div class="tf-nav"></div>'),years=[];
  for(var y=2026;y>=1950;y--)years.push([String(y),String(y)]);
  row.append(mkbtn('Рік',function(){pickFilter('Рік виходу','year',years)}));
  row.append(mkbtn('Жанр',function(){pickFilter('Жанр','genre',genres)}));
  row.append(mkbtn('Країна',function(){pickFilter('Країна','country',countries)}));
  row.append(mkbtn('Вік',function(){pickFilter('Вік','age',[['adult','Лише 18+'],['noadult','Без 18+']])}));
  row.append(mkbtn('Скинути фільтри',function(){filters={year:'',genre:'',country:'',age:''};select(tab)}));
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
   if(more && grid.children().length<15) setTimeout(load,0);
  }
  if(cacheKey===packKey && cachePages){show(cachePages);return}
  net=new Lampa.Reguest();net.timeout(20000);
  net.silent(BASE+packKey+'.json',show,function(){if(dead||serial!==current)return;busy=false;more=false;status.text(page?'Кінець списку або помилка мережі':'Не вдалося завантажити базу. Перевірте інтернет та файли GitHub.');});
 }

 function select(key){serial++;tab=key;page=0;busy=false;more=true;grid.empty();status.empty();nav.children().removeClass('tf-selected');nav.find('[data-tab="'+key+'"]').addClass('tf-selected');refreshFocus();load()}
 this.create=function(){tabs.forEach(function(t){var b=mkbtn(t[1],function(){select(t[0])});b.attr('data-tab',t[0]);nav.append(b)});nav.append(mkbtn('👤 Мій кабінет',function(){Lampa.Activity.push({url:'',title:'Мій кабінет',component:'bookmarks',page:1});}));body.append(head,nav,setupFilters(),grid,status);scroll.append(body);root.append(scroll.render());scroll.onEnd=load;select(tab);return root};
 this.render=function(){return root};this.start=function(){active=true;controller()};this.pause=function(){active=false};this.stop=function(){active=false};this.back=function(){Lampa.Activity.backward()};this.destroy=function(){dead=true;serial++;if(net)net.clear();scroll.destroy();root.remove()};
}
function init(){
 Lampa.Component.add('topfilms_tv',Component);
 if(!document.getElementById('topfilms-style'))$('head').append('<style id="topfilms-style">.tf-screen{height:calc(100vh - 7em);overflow:hidden}.tf-screen > .scroll{height:100%}.tf-body{padding:1.6em 2.2em 4em}.tf-title{font-size:2.2em;font-weight:800;background:#183253;padding:.35em .7em;border-radius:.3em;margin-bottom:.7em}.tf-nav{display:flex;flex-wrap:wrap;gap:.5em;margin-bottom:1.5em}.tf-tab{padding:.65em .9em;background:#263444;border-radius:.5em}.tf-selected{background:#805520}.tf-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:1.2em}.tf-card{border-radius:.5em;padding:.35em;background:#1b2531}.tf-poster{aspect-ratio:2/3;background:#263444;overflow:hidden;border-radius:.3em}.tf-poster img{width:100%;height:100%;object-fit:cover}.tf-name{font-weight:bold;margin:.4em 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tf-meta,.tf-reactions{font-size:.8em;opacity:.9}.tf-card.focus,.tf-tab.focus{background:#fff;color:#111;transform:scale(1.03)}.tf-status{padding:2em 0;opacity:.7}@media(max-width:700px){.tf-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}</style>');
 if($('.menu [data-action="topfilms_tv"]').length)return;
 var item=$('<li class="menu__item selector" data-action="topfilms_tv"><div class="menu__ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3.1 6.3 7 .99-5.05 4.92 1.2 6.99L12 17.9l-6.25 3.3 1.2-6.99L1.9 9.3l7-.99z"/></svg></div><div class="menu__text">Top Films</div></li>');item.on('hover:enter',function(){Lampa.Activity.push({url:'',title:'Top Films',component:'topfilms_tv',page:1})});var menu=$('.menu .menu__list').first();if(!menu.length)menu=$('.menu ul').first();menu.append(item);
}
if(window.appready)init();else Lampa.Listener.follow('app',function(e){if(e.type==='ready')init()});
})();
