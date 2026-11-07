const staffOptions=['Yuri','Janelle','Ning','Felix','明月','Phyllis','Penny2','修賢','蔡大哥','賴先生','冠汝','Lilian','Tina','Chris','Ebi','Louis','Simmy'];
const $=id=>document.getElementById(id),key='funapple-pickup-v1',clone=x=>JSON.parse(JSON.stringify(x)),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const trip=(time,school,car,staff,names,note='',mode='接送')=>({time,school,car,staff,names,note,mode});
const initial=[];
let db={days:{'2026-11-04':initial},templates:{}},saveError=false;try{const saved=JSON.parse(localStorage.getItem(key));if(saved?.days&&saved?.templates)db=saved}catch{};
function normalize(t){
 if(t.school==='新光'&&t.note==='名單待補')t.note='';
 const parts=t.names.split(/[、，,\n]+/).map(x=>x.trim()).filter(Boolean);
 if(parts.length&&parts.every(x=>/^.+[（(][^（）()]+[）)]$/.test(x))){let previous='';t.names=parts.map((x,i)=>{const m=x.match(/^(.+)[（(]([^（）()]+)[）)]$/),prefix=m[2]!==previous&&i?'，'+m[2]+'：':i?'、':'';previous=m[2];return prefix+m[1]}).join('')}
}
for(const group of [db.days,db.templates])for(const rows of Object.values(group))rows.forEach(normalize);
const taipeiDate = new Intl.DateTimeFormat('en', {
 timeZone: 'Asia/Taipei',
 year: 'numeric',
 month: '2-digit',
 day: '2-digit',
});
function today() {
 const {year, month, day} = Object.fromEntries(
  taipeiDate.formatToParts(new Date()).map(({type, value}) => [type, value])
 );
 return `${year}-${month}-${day}`;
}
$('date').value=today();
const names=t=>t.names.split(/[、，,\n]+/).map(s=>s.trim().replace(/^[^：:]+[：:]/,'').trim()).filter(Boolean),day=()=>db.days[$('date').value]||[];
function save(){queueMicrotask(()=>window.queueCloudSave?.());try{localStorage.setItem('funapple-pickup-cloud-cache',JSON.stringify(db));saveError=false;$('status').textContent='已儲存於此瀏覽器'}catch{saveError=true;$('status').textContent='儲存失敗，請立即下載備份。'}}
function pickupPeriod(time){return !time?'時間待補':time>'14:00'?'下午接送':'中午接送'}
function notification(){const date=$('date').value,[y,m,d]=date.split('-');let out=[`@All ${+m}/${+d}（${'日一二三四五六'[new Date(date+'T12:00:00').getDay()]}）接送`],last='',section='';let total=0;const seen=new Set(),duplicate=new Set();[...day()].sort((a,b)=>a.time.localeCompare(b.time)).forEach(t=>{const period=pickupPeriod(t.time);if(period!==section){out.push('',period+'：');section=period;last=null}if(t.time!==last){out.push('',`⏰ ${t.time||'時間待補'}${t.mode==='送回'?' 送回':' 出發'}`);last=t.time}const n=names(t);total+=n.length;n.forEach(x=>{if(seen.has(x))duplicate.add(x);seen.add(x)});out.push(`${t.school||'學校待補'}${n.length?` ${n.length}人`:''}${t.car?`（${t.car}）`:''} ${t.staff||'人員待補'}${t.mode==='送回'?'送回':''}${t.names.trim()?'：'+t.names.trim():t.school.trim()==='新光'?'':'：名單待補'}${t.note?'\n備註：'+t.note:''}`)});$('preview').value=out.join('\n');$('stats').textContent=`${day().length} 項安排 · 已列名 ${total} 人次（不含未列名接送）${duplicate.size?' ｜重複姓名請核對：'+[...duplicate].join('、'):''}`;}
function render(){const rows=day();$('cards').innerHTML=rows.length?rows.map((t,i)=>`<article class="card"><button class="remove" data-remove="${i}">刪除</button><h3>${esc(t.time)}　${esc(t.school)||'新增安排'}</h3><div class="fields">${[['time','時間','time'],['school','學校／接送順序','text'],['car','車號','text'],['staff','接送與隨車人員','text']].map(([k,l,type])=>`<label>${l}<input data-i="${i}" data-k="${k}" type="${type}" ${k==='car'?'list="vehicleOptions" placeholder="選車號或手動輸入"':''} value="${esc(t[k])}"></label>`).join('')}<label class="wide">加入接送人員（可連續選擇多人）<select data-staff-add="${i}"><option value="">選擇人員加入</option>${staffOptions.map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join('')}</select><small>可選兩到三位或更多；上方人員欄可直接手填、修改或刪除，以「＋」分隔。</small></label><label>方式<select data-i="${i}" data-k="mode"><option value="接送" ${t.mode==='接送'?'selected':''}>接回</option><option ${t.mode==='送回'?'selected':''}>送回</option></select></label><label class="wide">學生姓名（新光可留白；兩校同車可寫「甲、乙，新高：丙、丁」）<textarea data-i="${i}" data-k="names">${esc(t.names)}</textarea></label><label class="wide">當日異動／備註<input data-i="${i}" data-k="note" value="${esc(t.note)}"></label></div></article>`).join(''):'<div class="card"><h3>這天還沒有安排</h3><p>新增車次、複製上週同一天，或套用已儲存的每週底表。</p></div>';notification();}
$('cards').oninput=e=>{const {i,k}=e.target.dataset;if(k){day()[+i][k]=e.target.value;save();notification()}};
$('cards').onchange=e=>{if(e.target.dataset.staffAdd!==undefined&&e.target.value){const i=+e.target.dataset.staffAdd,t=day()[i],parts=t.staff.split(/[＋+、，,]+/).map(x=>x.trim()).filter(Boolean);if(!parts.includes(e.target.value))parts.push(e.target.value);t.staff=parts.join('＋');save();render()}};
$('cards').onclick=e=>{if(e.target.dataset.remove!==undefined&&confirm('刪除此車次？')){day().splice(+e.target.dataset.remove,1);save();render()}};
$('date').onchange=()=>{if(!$('date').value)return;$('status').textContent='';render()};
$('today').onclick=()=>{
 $('date').value=today();
 $('date').onchange();
};
function shift(n){let d=new Date($('date').value+'T12:00:00');d.setDate(d.getDate()+n);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
$('prev').onclick=()=>{$('date').value=shift(-1);render()};$('next').onclick=()=>{$('date').value=shift(1);render()};
function replace(rows){if(day().length&&!confirm('取代當天現有安排？'))return;db.days[$('date').value]=clone(rows);save();render()}
$('lastweek').onclick=()=>{const rows=db.days[shift(-7)];if(!rows)return $('status').textContent='上週同一天沒有儲存的安排。';replace(rows)};
const weekday=()=>new Date($('date').value+'T12:00:00').getDay();
$('saveTemplate').onclick=()=>{if(!day().length)return;if(db.templates[weekday()]&&!confirm('取代這個星期的底表？'))return;db.templates[weekday()]=clone(day());save();$('status').textContent='已存為星期'+ '日一二三四五六'[weekday()]+'底表，其他日期不受影響。'};
$('useTemplate').onclick=()=>{const rows=db.templates[weekday()];if(!rows)return $('status').textContent='此星期尚未建立底表，請先編輯一天後儲存。';replace(rows)};
$('add').onclick=()=>{const d=$('date').value;db.days[d]??=[];db.days[d].push(trip('12:25','','','',''));save();render()};
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText($('preview').value);$('status').textContent='已複製，可貼到群組。'}catch{$('preview').focus();$('preview').select();$('status').textContent='請複製已選取的通知文字。'}};
$('export').onclick=()=>{const a=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify(db,null,2)],{type:'application/json'}));a.href=url;a.download='funapple-pickup-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
$('import').onchange=async e=>{try{const data=JSON.parse(await e.target.files[0].text());if(!data.days||!data.templates)throw Error();for(const group of [data.days,data.templates])for(const rows of Object.values(group)){if(!Array.isArray(rows)||rows.some(t=>!['time','school','car','staff','names','note','mode'].every(k=>typeof t[k]==='string')))throw Error()}if(!confirm('匯入會取代目前全部日期與底表，確定已備份？'))return;db=data;for(const group of [db.days,db.templates])for(const rows of Object.values(group))rows.forEach(normalize);save();render()}catch{$('status').textContent='無法匯入，請選擇本系統匯出的備份檔。'}e.target.value=''};render();
