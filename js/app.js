// app.js: pantallas, formularios, búsqueda, filtros y guardado (localStorage)
let S;try{S=JSON.parse(localStorage.getItem(KEY))}catch(e){}S=S||seed();
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
if(!S.v2){seed().brawlers.forEach(b=>{if(!S.brawlers.some(x=>x.nombre===b.nombre))S.brawlers.push(b)});S.v2=1;save()}
let tab='clubs',adding=false,fp='';
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
const num=v=>Math.max(0,parseInt(v)||0),fmt=n=>n.toLocaleString('es-AR');
const mt=q=>x=>!q||JSON.stringify(x).toLowerCase().includes(q);
const tg=t=>'#'+t.trim().replace(/^#/,'').toUpperCase();
const clubName=t=>(S.clubs.find(c=>c.tag===t)||{}).nombre||'Sin club';
const av=(src,t,c='')=>`<div class="av ${c}"><b>${esc((t||'?')[0])}</b>${src?`<img src="${esc(src)}" alt="" loading="lazy" onerror="this.remove()">`:''}</div>`;
const fld=(l,h)=>`<label>${l}${h}</label>`;
const sel=(n,p)=>`<select name="${n}">${p.map(([v,l])=>`<option value="${esc(v)}">${esc(l)}</option>`).join('')}</select>`;
const o=a=>a.map(x=>[x,x]);
const none='<p class="mu">No hay nada para mostrar. Probá agregar uno con el botón de arriba.</p>';
const V={
clubs:{title:'Clubs',
 form:()=>fld('Tag del club','<input name="tag" placeholder="#C16" maxlength="15" required>')+fld('Nombre','<input name="nombre" maxlength="30" required>')+fld('Trofeos','<input name="trofeos" type="number" min="0" value="0">')+fld('Tipo',sel('tipo',o(['Abierto','Invitación','Cerrado']))),
 save:f=>{f.tag=tg(f.tag);if(S.clubs.some(c=>c.tag===f.tag))return 'Ese tag de club ya existe';S.clubs.push({tag:f.tag,nombre:f.nombre.trim(),trofeos:num(f.trofeos),tipo:f.tipo})},
 list:q=>`<div class="grid">${S.clubs.map((c,i)=>({...c,i})).filter(mt(q)).sort((a,b)=>b.trofeos-a.trofeos).map(c=>{const ms=S.jugadores.filter(j=>j.club===c.tag);return `<div class="card click" onclick="openClub(${c.i})"><div class="t big">${esc(c.nombre)}</div><div class="mu">${esc(c.tag)} <span class="pill">${esc(c.tipo)}</span></div><div class="stat">🏆 ${fmt(c.trofeos)}</div><div class="stack">${ms.slice(0,8).map(j=>av(pImg(j.icon),j.nombre,'xs')).join('')}<span class="mu">${ms.length} miembro${ms.length==1?'':'s'}</span></div><div class="acts"><button class="btn s" onclick="event.stopPropagation();del('clubs',${c.i})">Eliminar</button></div></div>`}).join('')||none}</div>`},
jugadores:{title:'Jugadores',
 form:fc=>fld('Tag del jugador','<input name="tag" placeholder="#J16" maxlength="15" required>')+fld('Nombre','<input name="nombre" maxlength="30" required>')+(fc?'':fld('Club',sel('club',[['','Sin club'],...S.clubs.map(c=>[c.tag,c.nombre])])))+fld('Nivel','<input name="nivel" type="number" min="0" value="1">')+fld('Copas','<input name="copas" type="number" min="0" value="0">')+`<div class="full mu">Foto de perfil<div class="icons" style="margin-top:6px">${pk()}</div></div>`,
 save:f=>{f.tag=tg(f.tag);if(S.jugadores.some(j=>j.tag===f.tag))return 'Ese tag de jugador ya existe';S.jugadores.push({tag:f.tag,club:f.club,nombre:f.nombre.trim(),nivel:num(f.nivel),copas:num(f.copas),icon:+f.icon||28000000})},
 list:q=>`<div class="grid">${S.jugadores.map((j,i)=>({...j,i})).filter(mt(q)).sort((a,b)=>b.copas-a.copas).map(pcard).join('')||none}</div>`},
brawlers:{title:'Brawlers',
 form:()=>fld('Nombre',`<input name="nombre" list="bl" maxlength="20" required><datalist id="bl">${Object.keys(BID).map(k=>`<option value="${k}">`).join('')}</datalist>`)+fld('Calidad',sel('calidad',o(Object.keys(RC))))+fld('Clase',sel('clase',o(CLASES)))+fld('Foto (URL, opcional)','<input name="img" type="url" placeholder="Se completa sola si es un brawler conocido">'),
 save:f=>{if(S.brawlers.some(b=>b.nombre.toLowerCase()===f.nombre.trim().toLowerCase()))return 'Ese brawler ya existe';S.brawlers.push({nombre:f.nombre.trim(),calidad:f.calidad,clase:f.clase,img:f.img.trim()})},
 list:q=>`<div class="grid">${S.brawlers.map((b,i)=>({...b,i})).filter(mt(q)).filter(b=>(!F.cal||b.calidad===F.cal)&&(!F.clase||b.clase===F.clase)).sort(F.ord==='az'?(a,b)=>a.nombre.localeCompare(b.nombre,'es'):F.ord==='za'?(a,b)=>b.nombre.localeCompare(a.nombre,'es'):(a,b)=>a.i-b.i).map(b=>`<div class="card center">${av(bImg(b),b.nombre,'br lg')}<div class="t big">${esc(b.nombre)}</div><span class="pill" style="background:${RC[b.calidad]||'#777'}">${esc(b.calidad)}</span><div class="mu">${esc(b.clase)} · ${S.jb.filter(r=>r.brawler===b.nombre).length} jugadores</div><div class="acts"><button class="btn s" onclick="foto(${b.i})">Foto</button><button class="btn s" onclick="del('brawlers',${b.i})">Eliminar</button></div></div>`).join('')||none}</div>`},
jb:{title:'Brawlers de cada jugador',
 form:()=>!S.jugadores.length||!S.brawlers.length?'<p class="mu full">Primero cargá al menos un jugador y un brawler.</p>':fld('Jugador',sel('jugador',S.jugadores.map(j=>[j.tag,j.nombre+' ('+j.tag+')'])))+fld('Brawler',sel('brawler',S.brawlers.map(b=>b.nombre).sort().map(n=>[n,n])))+fld('Fuerza (1-11)','<input name="fuerza" type="number" min="1" max="11" value="1">')+fld('Copas del brawler','<input name="copas" type="number" min="0" value="0">'),
 save:f=>{if(!f.jugador)return 'Falta elegir jugador y brawler';f.fuerza=Math.min(11,Math.max(1,num(f.fuerza)));f.copas=num(f.copas);const r=S.jb.find(x=>x.jugador===f.jugador&&x.brawler===f.brawler);if(r)Object.assign(r,f);else S.jb.push(f)},
 list:q=>{const rs=S.jb.map((r,i)=>({...r,i,n:(S.jugadores.find(j=>j.tag===r.jugador)||{}).nombre||''})).filter(r=>(!fp||r.jugador===fp)&&mt(q)(r));
  return `<div class="filt"><select onchange="fp=this.value;render()"><option value="">Todos los jugadores</option>${S.jugadores.map(j=>`<option value="${esc(j.tag)}" ${j.tag===fp?'selected':''}>${esc(j.nombre)}</option>`).join('')}</select></div>`+(rs.map(r=>{const j=S.jugadores.find(j=>j.tag===r.jugador)||{nombre:'?'},b=S.brawlers.find(b=>b.nombre===r.brawler)||{nombre:r.brawler};return `<div class="row"><div class="who">${av(pImg(j.icon),j.nombre,'sm')}<b>${esc(j.nombre)}</b></div><div class="who">${av(bImg(b),b.nombre,'sm br')}<b>${esc(b.nombre)}</b></div><div>Fuerza <b class="y">${r.fuerza}</b></div><div>🏆 ${fmt(r.copas)}</div><button class="btn s" onclick="del('jb',${r.i})">Quitar</button></div>`}).join('')||none)}}
};
let club='',pick=-1;
const Q={clubs:'',jugadores:'',brawlers:'',jb:'',miembros:''},F={cal:'',clase:'',ord:''};
const PH={clubs:'Buscar club por nombre o tag',jugadores:'Buscar jugador por nombre o tag',brawlers:'Buscar brawler',jb:'Buscar en la colección',miembros:'Buscar miembro del club'};
const fsel=(k,all,o)=>`<select onchange="F.${k}=this.value;relist()"><option value="">${all}</option>${o.map(x=>`<option ${F[k]===x?'selected':''}>${esc(x)}</option>`).join('')}</select>`;
const tools=k=>`<div class="tools"><label class="search">🔍<input value="${esc(Q[k])}" placeholder="${PH[k]}" oninput="Q[k='${k}']=this.value;relist()"></label>${k==='brawlers'?fsel('cal','Todas las calidades',Object.keys(RC))+fsel('clase','Todas las clases',CLASES)+`<select onchange="F.ord=this.value;relist()"><option value="">Orden de lanzamiento</option><option value="az" ${F.ord==='az'?'selected':''}>A → Z</option><option value="za" ${F.ord==='za'?'selected':''}>Z → A</option></select>`:''}</div>`;
const members=q=>{const c=S.clubs.find(x=>x.tag===club);return `<div class="grid">${S.jugadores.map((j,i)=>({...j,i})).filter(j=>j.club===c.tag&&mt(q)(j)).sort((a,b)=>b.copas-a.copas).map(pcard).join('')||none}</div>`};
function relist(){const k=club&&tab==='clubs'?'miembros':tab,q=Q[k].trim().toLowerCase();$('#lst').innerHTML=k==='miembros'?members(q):V[tab].list(q)}
const pk=on=>ICONS.map((i,k)=>`<label${on?` onclick="${on(i)}"`:''}>${on?'':`<input type="radio" name="icon" value="${i}" ${k?'':'checked'}>`}<div class="av sm"><img src="${pImg(i)}" alt="" loading="lazy" onerror="this.closest('label').remove()"></div></label>`).join('');
const pcard=j=>`<div class="card"><div class="top"><div class="click" onclick="pick=pick===${j.i}?-1:${j.i};render()" title="Cambiar foto">${av(pImg(j.icon),j.nombre)}</div><div><div class="t big">${esc(j.nombre)}</div><div class="mu">${esc(j.tag)}</div></div></div>${pick===j.i?`<div class="icons">${pk(i=>`setIcon(${j.i},${i})`)}</div>`:''}<div class="mu">Club: <b>${esc(clubName(j.club))}</b></div><div class="stat">🏆 ${fmt(j.copas)} <span class="mu">Nivel ${j.nivel} · ${S.jb.filter(r=>r.jugador===j.tag).length} brawlers</span></div><div class="acts"><button class="btn s" onclick="copas(${j.i})">Editar copas</button>${club?`<button class="btn s" onclick="quitar(${j.i})">Sacar del club</button>`:''}<button class="btn s" onclick="del('jugadores',${j.i})">Eliminar</button></div></div>`;
function detail(q){const c=S.clubs.find(x=>x.tag===club);if(!c){club='';return ''}
 const all=S.jugadores.filter(j=>j.club===c.tag),ms=S.jugadores.map((j,i)=>({...j,i})).filter(j=>j.club===c.tag&&mt(q)(j)).sort((a,b)=>b.copas-a.copas);
 return `<button class="btn s" onclick="club='';adding=false;render()">← Volver a clubs</button><div class="bar" style="margin-top:14px"><div><h2>${esc(c.nombre)}</h2><div class="mu">${esc(c.tag)} · ${esc(c.tipo)} · 🏆 ${fmt(c.trofeos)} · ${all.length} miembro${all.length==1?'':'s'}</div></div><button class="btn" onclick="adding=!adding;render()">${adding?'Cancelar':'＋ Agregar miembro'}</button></div>${adding?`<form class="card form" onsubmit="addM(event)">${V.jugadores.form(c.tag)}<button class="btn full">Guardar miembro</button></form>`:''}${tools('miembros')}<div id="lst">${members(Q.miembros.trim().toLowerCase())}</div>`}
const openClub=i=>{club=S.clubs[i].tag;Q.miembros='';adding=false;render()};
const setIcon=(i,id)=>{S.jugadores[i].icon=id;pick=-1;save();render()};
const quitar=i=>{S.jugadores[i].club='';save();render();toast('Jugador sacado del club')};
function addM(e){e.preventDefault();const f=Object.fromEntries(new FormData(e.target));f.club=club;const err=V.jugadores.save(f);if(err)return toast(err);save();adding=false;render();toast('Miembro agregado ✔')}
function foto(i){const v=prompt('Pegá la URL de la imagen del brawler',S.brawlers[i].img||'');if(v===null)return;S.brawlers[i].img=v.trim();save();render()}
function render(){const q=Q[tab].trim().toLowerCase(),v=V[tab];
 $('#nav').innerHTML=Object.keys(NAMES).map(k=>`<button class="${k===tab?'on':''}" onclick="go('${k}')">${NAMES[k]} <small>${S[k].length}</small></button>`).join('');
 $('#main').innerHTML=tab==='clubs'&&club?detail(q):`<div class="bar"><h2>${v.title}</h2><button class="btn" onclick="adding=!adding;render()">${adding?'Cancelar':'＋ Agregar'}</button></div>${adding?`<form class="card form" onsubmit="add(event)">${v.form()}<button class="btn full">Guardar</button></form>`:''}${tools(tab)}<div id="lst">${v.list(q)}</div>`}
const go=k=>{tab=k;adding=false;club='';pick=-1;render()};
function add(e){e.preventDefault();const f=Object.fromEntries(new FormData(e.target)),err=V[tab].save(f);if(err)return toast(err);save();adding=false;render();toast('Guardado ✔')}
function del(k,i){const x=S[k][i];
 if(k==='clubs'&&S.jugadores.some(j=>j.club===x.tag))return toast('No se puede eliminar: el club tiene jugadores');
 if(k==='brawlers'&&S.jb.some(r=>r.brawler===x.nombre))return toast('No se puede eliminar: hay jugadores con este brawler');
 if(!confirm('¿Eliminar?'))return;
 if(k==='jugadores')S.jb=S.jb.filter(r=>r.jugador!==x.tag);
 S[k].splice(i,1);save();render()}
function copas(i){const x=S.jugadores[i],v=prompt('Nuevas copas de '+x.nombre,x.copas);if(v===null)return;x.copas=num(v);save();render();toast('Copas actualizadas ✔')}
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('on'),2200)}
render();
