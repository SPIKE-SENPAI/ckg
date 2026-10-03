(() => {
  const $ = (id) => document.getElementById(id);
  const occupations = [
    'Dokter Internship','Belum/Tidak Bekerja','Pelajar','Mahasiswa','Ibu Rumah Tangga','TNI','POLRI','ASN (Kantor Pemerintah)','Pegawai Swasta','Wirausaha/Pekerja Mandiri','Pensiunan','Pejabat Negara / Pejabat Daerah','Pengusaha','Dokter','Bidan','Perawat','Apoteker','Psikolog','Tenaga Kesehatan Lainnya','Dosen','Guru','Peneliti','Pengacara','Notaris','Hakim/Jaksa/Tenaga Peradilan Lainnya','Akuntan','Insinyur','Arsitek','Konsultan','Wartawan','Pedagang','Petani / Pekebun','Nelayan / Perikanan','Peternak','Tokoh Agama','Juru Masak','Pelaut','Sopir','Pilot','Masinis','Atlet','Pekerja Seni','Penjahit / Perancang Busana','Karyawan kantor / Pegawai Administratif','Teknisi / Mekanik','Pekerja Pabrik / Buruh','Pekerja Konstruksi','Pekerja Pertukangan','Pekerja Migran','Lainnya'
  ];
  const marital = ['Menikah','Belum Menikah','Cerai Hidup','Cerai Mati'];
  const genders = ['Laki-laki','Perempuan'];
  const fields = {
    nik:{label:'NIK peserta',type:'text',placeholder:'16 digit',group:'identity'},
    name:{label:'Nama lengkap',type:'text',required:true,group:'identity'},
    dob:{label:'Tanggal lahir',type:'date',group:'identity'},
    gender:{label:'Jenis kelamin',type:'select',options:genders,group:'identity'},
    whatsapp:{label:'Nomor WhatsApp',type:'tel',placeholder:'08xxxxxxxxxx',group:'identity'},
    noNik:{label:'Tidak punya NIK',type:'checkbox',group:'identity'},
    gNik:{label:'NIK wali',type:'text',placeholder:'16 digit',group:'guardian'},
    gName:{label:'Nama wali',type:'text',group:'guardian'},
    gDob:{label:'Tanggal lahir wali',type:'date',group:'guardian'},
    gGender:{label:'Jenis kelamin wali',type:'select',options:genders,group:'guardian'},
    gWhatsapp:{label:'Nomor WhatsApp wali',type:'tel',group:'guardian'},
    marital:{label:'Status pernikahan',type:'select',options:marital,group:'identity'},
    disability:{label:'Disabilitas',type:'select',options:['Tidak memiliki disabilitas','Memiliki disabilitas'],group:'identity'},
    occupation:{label:'Pekerjaan',type:'select',options:occupations,group:'identity'},
    school:{label:'Nama sekolah',type:'text',group:'school'},
    education:{label:'Jenjang pendidikan',type:'select',options:['SD','SMP','SMA','SMK','MA','MTs','MI','Lainnya'],group:'school'},
    class:{label:'Kelas',type:'select',options:Array.from({length:12},(_,i)=>`Kelas ${i+1}`),group:'school'},
    province:{label:'Provinsi',type:'text',group:'address'},
    city:{label:'Kabupaten/Kota',type:'text',group:'address'},
    district:{label:'Kecamatan',type:'text',group:'address'},
    village:{label:'Kelurahan/Desa',type:'text',group:'address'},
    address:{label:'Detail alamat domisili',type:'textarea',placeholder:'Maksimal 60 karakter untuk Local',group:'address',full:true},
    smoking:{label:'Status merokok',type:'select',options:['Ya','Pasif','Tidak'],group:'health'},
    weight:{label:'Berat badan (kg)',type:'number',group:'health'},
    height:{label:'Tinggi badan (cm)',type:'number',group:'health'},
    waist:{label:'Lingkar perut (cm)',type:'number',group:'health'},
    systolic:{label:'Tekanan darah sistolik',type:'number',group:'health'},
    diastolic:{label:'Tekanan darah diastolik',type:'number',group:'health'},
    sugar:{label:'Gula darah',type:'number',group:'health'},
    ear:{label:'Telinga',type:'select',options:['Normal','Gangguan'],group:'health'},
    eyes:{label:'Mata',type:'select',options:['Normal','Gangguan ringan','Gangguan sedang','Gangguan berat','Buta'],group:'health'},
    teeth:{label:'Gigi',type:'select',options:['Normal','Lubang','Cabut'],group:'health'},
    cataract:{label:'Katarak',type:'select',options:['Normal','Curiga Katarak'],group:'health'},
    caries:{label:'Karies',type:'select',options:['Tidak ada','1','2','3','>3'],group:'health'},
    fitness:{label:'Kebugaran',type:'select',options:['Baik Sekali','Baik','Cukup','Kurang','Kurang Sekali'],group:'health'},
    menstruation:{label:'Menstruasi',type:'select',options:['Ya','Tidak'],group:'health'},
    glasses:{label:'Kacamata',type:'select',options:['Tidak','Ya'],group:'health'}
  };
  let participants = [], editingId = null, nextId = 1;
  const visible = (id,category,mode) => {
    if(id==='noNik'||['gNik','gName','gDob','gGender','gWhatsapp'].includes(id)) return mode==='local';
    if(['marital','disability','occupation'].includes(id)) return mode==='local' || (category==='umum' && id==='occupation');
    if(id==='school'||id==='education'||id==='class') return category==='sekolah';
    if(['province','city','district','village'].includes(id)) return category==='umum' || mode==='non_local';
    if(id==='address') return true;
    if(['smoking','ear','eyes','teeth','cataract'].includes(id)) return category==='umum';
    if(['caries','fitness','menstruation','glasses'].includes(id)) return category==='sekolah';
    return true;
  };
  function makeField(id){
    const f=fields[id], wrap=document.createElement('label'); wrap.className='field'+(f.full?' full':'');
    if(f.type==='checkbox'){
      wrap.className='check-field full'; const input=document.createElement('input'); input.type='checkbox';input.id='f_'+id;input.name=id;wrap.append(input,document.createTextNode(f.label));return wrap;
    }
    const span=document.createElement('span');span.textContent=f.label+(f.required?' *':'');wrap.append(span);
    let input;
    if(f.type==='select'){
      input=document.createElement('select');input.add(new Option('Pilih '+f.label.toLowerCase(),''));f.options.forEach(o=>input.add(new Option(o,o)));
    } else if(f.type==='textarea') { input=document.createElement('textarea');input.rows=2;input.maxLength=$('mode').value==='local'?60:300; }
    else {input=document.createElement('input');input.type=f.type; if(f.placeholder)input.placeholder=f.placeholder; if(f.required)input.required=true;if(f.type==='text'&&id==='nik')input.maxLength=16;}
    input.id='f_'+id;input.name=id;wrap.append(input);return wrap;
  }
  function buildForm(){
    const category=$('category').value,mode=$('mode').value;
    const groups={identity:[],guardian:[],school:[],address:[],health:[]};
    Object.keys(fields).forEach(id=>{if(visible(id,category,mode))groups[fields[id].group].push(id)});
    for(const [group,ids] of Object.entries(groups)){
      const target=$(group==='identity'?'identityFields':group==='guardian'?'guardianFields':group==='school'?'schoolFields':group==='address'?'addressFields':'healthFields');
      target.replaceChildren(...ids.map(makeField));
    }
    $('guardianSection').hidden=mode!=='local';$('schoolSection').hidden=category!=='sekolah';
    $('addressSection').hidden=false;
    $('formTitle').textContent=category==='sekolah'?'Identitas Peserta Sekolah':'Identitas Peserta Umum';
    updateFilename();renderList();resetForm();
  }
  function updateFilename(){const c=$('category').value,m=$('mode').value;$('filename').value=`template_ckg_${c}_${m}`;}
  function getValue(id){const el=$('f_'+id);if(!el)return '';if(el.type==='checkbox')return el.checked?'YA':'TIDAK';return el.value.trim();}
  function setValue(id,val){const el=$('f_'+id);if(!el)return;if(el.type==='checkbox')el.checked=val==='YA'||val===true;else el.value=val??'';}
  function syncGuardian(){const cb=$('f_noNik');const local=$('mode').value==='local';$('guardianSection').hidden=!local||!cb||!cb.checked;}
  function resetForm(){editingId=null;$('participantForm').reset();$('saveBtn').textContent='＋ Tambahkan peserta';syncGuardian();}
  function formData(){const obj={};Object.keys(fields).forEach(id=>obj[id]=getValue(id));return obj;}
  function notify(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(notify.timer);notify.timer=setTimeout(()=>t.classList.remove('show'),2400);}
  function renderList(){
    const q=$('searchInput').value.toLowerCase();const list=$('participantList');list.replaceChildren();
    const filtered=participants.filter(p=>(p.data.name+' '+p.data.nik).toLowerCase().includes(q));
    if(!filtered.length){const d=document.createElement('div');d.className='empty-state';d.innerHTML=participants.length?'<div>⌕</div><strong>Peserta tidak ditemukan</strong><p>Coba kata pencarian lain.</p>':'<div>▤</div><strong>Belum ada peserta</strong><p>Isi formulir di samping, lalu tekan Tambahkan peserta.</p>';list.append(d);}
    filtered.forEach((p,i)=>{const card=document.createElement('div');card.className='person-card';const index=document.createElement('div');index.className='person-index';index.textContent=String(participants.indexOf(p)+1).padStart(2,'0');const info=document.createElement('div');info.className='person-info';const strong=document.createElement('strong');strong.textContent=p.data.name||'(Tanpa nama)';const small=document.createElement('small');small.textContent=(p.data.nik||'NIK kosong')+' · '+(p.data.gender||'Gender belum dipilih');info.append(strong,small);const actions=document.createElement('div');actions.className='person-actions';[['Edit','edit'],['Salin','copy'],['Hapus','delete']].forEach(([label,act])=>{const b=document.createElement('button');b.className='icon-btn';b.textContent=label;b.onclick=()=>act==='edit'?editParticipant(p.id):act==='copy'?duplicateParticipant(p.id):deleteParticipant(p.id);actions.append(b)});card.append(index,info,actions);list.append(card);});
    $('countBadge').textContent=participants.length;$('validCount').textContent=participants.length?`${participants.length} data tersimpan`:'Belum ada data';$('listSummary').textContent=`${participants.length} peserta ditambahkan`;$('exportBtn').disabled=!participants.length;$('exportHint').textContent=participants.length?'Pastikan jenis dan format ekspor sudah sesuai.':'Tambahkan peserta terlebih dahulu.';
  }
  function editParticipant(id){const p=participants.find(x=>x.id===id);if(!p)return;editingId=id;Object.entries(p.data).forEach(([k,v])=>setValue(k,v));syncGuardian();$('saveBtn').textContent='Simpan perubahan';$('participantForm').scrollIntoView({behavior:'smooth',block:'start'});}
  function duplicateParticipant(id){const p=participants.find(x=>x.id===id);if(!p)return;participants.push({id:nextId++,data:{...p.data,name:p.data.name+' (Salinan)'}});renderList();notify('Peserta berhasil disalin.');}
  function deleteParticipant(id){participants=participants.filter(x=>x.id!==id);if(editingId===id)resetForm();renderList();}
  $('participantForm').addEventListener('submit',e=>{e.preventDefault();const data=formData();if(!data.name){notify('Nama peserta perlu diisi.');return;}if($('mode').value==='local'&&data.noNik==='YA'){const missing=['gNik','gName','gDob','gGender','gWhatsapp'].some(k=>!data[k]);if(missing){notify('Lengkapi data wali untuk peserta tanpa NIK.');return;}}if(editingId){const p=participants.find(x=>x.id===editingId);if(p)p.data=data;notify('Perubahan peserta disimpan.');}else{participants.push({id:nextId++,data});notify('Peserta ditambahkan ke daftar.');}resetForm();renderList();});
  $('resetBtn').onclick=()=>resetForm();$('searchInput').oninput=renderList;$('clearAllBtn').onclick=()=>{if(!participants.length)return;if(confirm('Hapus semua peserta dari sesi ini?')){participants=[];resetForm();renderList();}};
  let lastSetup={category:$('category').value,mode:$('mode').value};
  function handleSetupChange(){const next={category:$('category').value,mode:$('mode').value};if(participants.length&&!confirm('Mengubah jenis atau format akan menghapus daftar peserta sesi ini agar data tidak salah masuk ke template. Lanjutkan?')){$('category').value=lastSetup.category;$('mode').value=lastSetup.mode;return;}if(participants.length){participants=[];nextId=1;}lastSetup=next;buildForm();}
  $('category').onchange=handleSetupChange;$('mode').onchange=handleSetupChange;document.addEventListener('change',e=>{if(e.target&&e.target.id==='f_noNik')syncGuardian();});
  document.querySelectorAll('.nav-item').forEach(b=>b.onclick=()=>{document.querySelectorAll('.nav-item').forEach(x=>x.classList.toggle('active',x===b));const view=b.dataset.view;$('convertView').hidden=view!=='convert';$('guideView').hidden=view!=='guide';$('usersView').hidden=view!=='users';$('pageTitle').textContent=view==='guide'?'Panduan Penggunaan':view==='users'?'Manajemen Pengguna':'Konversi Data Peserta';});
  $('backBtn').onclick=()=>document.querySelector('[data-view="convert"]').click();
  const col=(n)=>{let s='';while(n){let r=(n-1)%26;s=String.fromCharCode(65+r)+s;n=Math.floor((n-1)/26)}return s;};
  const fmtDate=(v)=>{if(!v)return '';const [y,m,d]=v.split('-');return `${d}/${m}/${y}`;};
  const txt=(v)=>v==null?'':String(v);
  function mapRow(d,category,mode){
    const x={};const put=(n,v)=>x[n]=txt(v);const date=v=>fmtDate(v);
    if(category==='sekolah'&&mode==='local'){
      put(1,d.nik);put(2,d.name);put(3,date(d.dob));put(4,d.gender);put(5,d.whatsapp);put(6,d.noNik||'TIDAK');put(7,d.gNik);put(8,d.gName);put(9,date(d.gDob));put(10,d.gGender);put(11,d.gWhatsapp);put(12,d.marital);put(13,d.disability);put(14,d.occupation);put(15,d.school);put(16,d.class);put(17,d.address);put(18,d.weight);put(19,d.height);put(20,d.waist);put(21,d.systolic);put(22,d.diastolic);put(23,d.sugar);put(24,d.caries);put(25,d.fitness);put(26,d.menstruation);put(27,d.glasses);
    } else if(category==='sekolah'&&mode==='non_local'){
      put(1,d.nik);put(2,d.name);put(3,d.class);put(4,d.school);put(5,d.gender==='Laki-laki'?'L':d.gender==='Perempuan'?'P':'');put(6,date(d.dob));put(7,d.whatsapp);put(8,d.province);put(9,d.city);put(10,d.district);put(11,d.village);put(12,d.address);put(13,d.weight);put(14,d.height);put(15,d.waist);put(16,d.systolic);put(17,d.diastolic);put(18,d.sugar);put(19,d.caries);put(20,d.fitness);put(21,d.menstruation);put(22,d.glasses);
    } else if(category==='umum'&&mode==='local'){
      put(1,d.nik);put(2,d.name);put(3,date(d.dob));put(4,d.gender);put(5,d.whatsapp);put(6,d.noNik||'TIDAK');put(7,d.gNik);put(8,d.gName);put(9,date(d.gDob));put(10,d.gGender);put(11,d.gWhatsapp);put(12,d.marital);put(13,d.disability);put(14,d.occupation);put(15,d.province);put(16,d.city);put(17,d.district);put(18,d.village);put(19,d.address);put(20,d.smoking);put(21,d.weight);put(22,d.height);put(23,d.waist);put(24,d.systolic);put(25,d.diastolic);put(26,d.sugar);put(27,d.ear);put(28,d.eyes);put(29,d.teeth);put(30,d.cataract);
    } else {
      put(1,d.nik);put(2,d.name);put(3,date(d.dob));put(4,d.gender==='Laki-laki'?'L':d.gender==='Perempuan'?'P':'');put(5,d.whatsapp);put(6,(d.marital||'').toUpperCase());put(7,d.province);put(8,d.city);put(9,d.district);put(10,d.village);put(11,d.address);put(12,d.occupation);put(13,d.smoking);put(14,d.weight);put(15,d.height);put(16,d.waist);put(17,d.systolic);put(18,d.diastolic);put(19,d.sugar);put(20,d.ear);put(21,d.eyes);put(22,d.teeth);put(23,d.cataract);
    }
    return x;
  }
  const XMLNS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
  const RELNS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
  const PKGREL = 'http://schemas.openxmlformats.org/package/2006/relationships';
  const CTNS = 'http://schemas.openxmlformats.org/package/2006/content-types';
  const parseXml = (s) => new DOMParser().parseFromString(s,'application/xml');
  const xmlText = (doc) => new XMLSerializer().serializeToString(doc);
  const first = (node,ns,name) => node.getElementsByTagNameNS(ns,name)[0] || null;
  function colIndex(ref){let m=ref.match(/[A-Z]+/);let n=0;for(const ch of m[0])n=n*26+ch.charCodeAt(0)-64;return n;}
  function findSheetPath(wbDoc,relsDoc,sheetName){
    const sheets=wbDoc.getElementsByTagNameNS(XMLNS,'sheet');
    for(const sh of sheets){if(sh.getAttribute('name')!==sheetName)continue;const rid=sh.getAttributeNS(RELNS,'id');const rels=relsDoc.getElementsByTagNameNS(PKGREL,'Relationship');for(const rel of rels){if(rel.getAttribute('Id')===rid){const target=rel.getAttribute('Target');return target.startsWith('/')?target.slice(1):'xl/'+target.replace(/^\.\//,'');}}}
    return null;
  }
  function addCellValue(doc,rowEl,ref,value,numeric=false){
    let cell=[...rowEl.getElementsByTagNameNS(XMLNS,'c')].find(c=>c.getAttribute('r')===ref);
    if(!cell){cell=doc.createElementNS(XMLNS,'c');cell.setAttribute('r',ref);const target=colIndex(ref);const cells=[...rowEl.getElementsByTagNameNS(XMLNS,'c')];const before=cells.find(c=>colIndex(c.getAttribute('r'))>target);if(before)rowEl.insertBefore(cell,before);else rowEl.appendChild(cell);}
    [...cell.childNodes].forEach(n=>{if(n.nodeType===1&&['v','is','f'].includes(n.localName))cell.removeChild(n);});
    if(value===''||value===null||value===undefined){cell.removeAttribute('t');return;}
    if(numeric&&Number.isFinite(Number(value))){cell.removeAttribute('t');const v=doc.createElementNS(XMLNS,'v');v.textContent=String(Number(value));cell.appendChild(v);}
    else{cell.setAttribute('t','inlineStr');const is=doc.createElementNS(XMLNS,'is');const t=doc.createElementNS(XMLNS,'t');const str=String(value);if(/^\s|\s$/.test(str))t.setAttributeNS('http://www.w3.org/XML/1998/namespace','xml:space','preserve');t.textContent=str;is.appendChild(t);cell.appendChild(is);}
  }
  function clearSheetRows(doc){
    const sd=first(doc,XMLNS,'sheetData');if(!sd)return;
    for(const row of [...sd.getElementsByTagNameNS(XMLNS,'row')]){if(Number(row.getAttribute('r'))<2)continue;for(const cell of [...row.getElementsByTagNameNS(XMLNS,'c')]){for(const child of [...cell.childNodes])if(child.nodeType===1&&['v','is','f'].includes(child.localName))cell.removeChild(child);cell.removeAttribute('t');}}
  }
  function ensureRow(doc,sheetData,n){
    let row=[...sheetData.getElementsByTagNameNS(XMLNS,'row')].find(r=>Number(r.getAttribute('r'))===n);if(row)return row;
    row=doc.createElementNS(XMLNS,'row');row.setAttribute('r',String(n));const before=[...sheetData.getElementsByTagNameNS(XMLNS,'row')].find(r=>Number(r.getAttribute('r'))>n);if(before)sheetData.insertBefore(row,before);else sheetData.appendChild(row);return row;
  }
  function updateDimension(doc,requiredRows){const dim=first(doc,XMLNS,'dimension');if(!dim)return;const ref=dim.getAttribute('ref')||'A1:A1';const m=ref.match(/^([A-Z]+\d+):([A-Z]+)(\d+)$/);if(m){const oldRows=Number(m[3])||1;dim.setAttribute('ref',`${m[1]}:${m[2]}${Math.max(oldRows,requiredRows)}`);}}
  function setReferenceSheet(zip,wbDoc,relsDoc,typesDoc){
    const existing=first(wbDoc,XMLNS,'sheets');let sheet=[...existing.getElementsByTagNameNS(XMLNS,'sheet')].find(s=>s.getAttribute('name')==='Referensi');let path;
    if(sheet){path=findSheetPath(wbDoc,relsDoc,'Referensi');sheet.setAttribute('state','veryHidden');}
    else{
      const sheetIds=[...existing.getElementsByTagNameNS(XMLNS,'sheet')].map(s=>Number(s.getAttribute('sheetId'))||0);const sheetId=Math.max(0,...sheetIds)+1;
      const rels=[...relsDoc.getElementsByTagNameNS(PKGREL,'Relationship')];const ids=rels.map(r=>Number((r.getAttribute('Id')||'').replace('rId',''))||0);const rid='rId'+(Math.max(0,...ids)+1);
      const paths=Object.keys(zip.files).filter(p=>/^xl\/worksheets\/sheet\d+\.xml$/.test(p));const numbers=paths.map(p=>Number(p.match(/sheet(\d+)/)[1]));const n=Math.max(0,...numbers)+1;path=`xl/worksheets/sheet${n}.xml`;
      sheet=wbDoc.createElementNS(XMLNS,'sheet');sheet.setAttribute('name','Referensi');sheet.setAttribute('sheetId',String(sheetId));sheet.setAttribute('state','veryHidden');sheet.setAttributeNS(RELNS,'r:id',rid);existing.appendChild(sheet);
      const rel=relsDoc.createElementNS(PKGREL,'Relationship');rel.setAttribute('Id',rid);rel.setAttribute('Type',RELNS+'/worksheet');rel.setAttribute('Target',`worksheets/sheet${n}.xml`);first(relsDoc,PKGREL,'Relationships').appendChild(rel);
      const ov=typesDoc.createElementNS(CTNS,'Override');ov.setAttribute('PartName',`/${path}`);ov.setAttribute('ContentType','application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml');first(typesDoc,CTNS,'Types').appendChild(ov);
    }
    const refDoc=parseXml(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="${XMLNS}"><sheetData/></worksheet>`);const sd=first(refDoc,XMLNS,'sheetData');
    ['Pekerjaan',...occupations].forEach((v,i)=>{const row=refDoc.createElementNS(XMLNS,'row');row.setAttribute('r',String(i+1));const cell=refDoc.createElementNS(XMLNS,'c');cell.setAttribute('r',`A${i+1}`);cell.setAttribute('t','inlineStr');const is=refDoc.createElementNS(XMLNS,'is');const t=refDoc.createElementNS(XMLNS,'t');t.textContent=v;is.appendChild(t);cell.appendChild(is);row.appendChild(cell);sd.appendChild(row);});
    zip.file(path,xmlText(refDoc));
    let names=first(wbDoc,XMLNS,'definedNames');if(!names){names=wbDoc.createElementNS(XMLNS,'definedNames');const calc=first(wbDoc,XMLNS,'calcPr');if(calc)wbDoc.documentElement.insertBefore(names,calc);else wbDoc.documentElement.appendChild(names);}
    let def=[...names.getElementsByTagNameNS(XMLNS,'definedName')].find(x=>x.getAttribute('name')==='DaftarPekerjaan');if(!def){def=wbDoc.createElementNS(XMLNS,'definedName');def.setAttribute('name','DaftarPekerjaan');names.appendChild(def);}def.textContent="'Referensi'!$A$2:$A$"+(occupations.length+1);
    return path;
  }
  function updateOccupationValidation(doc,category,mode){
    const col=(category==='umum'&&mode==='non_local')?'L':'N';const end=(category==='umum'&&mode==='non_local')?500:1000;
    let dvs=first(doc,XMLNS,'dataValidations');if(!dvs){dvs=doc.createElementNS(XMLNS,'dataValidations');const anchor=['hyperlinks','printOptions','pageMargins','pageSetup','headerFooter','rowBreaks','colBreaks','extLst'].map(n=>first(doc,XMLNS,n)).find(Boolean);if(anchor)doc.documentElement.insertBefore(dvs,anchor);else doc.documentElement.appendChild(dvs);}
    let dv=[...dvs.getElementsByTagNameNS(XMLNS,'dataValidation')].find(x=>(x.getAttribute('sqref')||'').split(/\s+/).some(r=>r.startsWith(col)));
    if(!dv){dv=doc.createElementNS(XMLNS,'dataValidation');dv.setAttribute('type','list');dv.setAttribute('allowBlank','1');dv.setAttribute('showErrorMessage','1');dvs.appendChild(dv);dvs.setAttribute('count',String(dvs.getElementsByTagNameNS(XMLNS,'dataValidation').length));}
    dv.setAttribute('sqref',`${col}2:${col}${end}`);let formula=first(dv,XMLNS,'formula1');if(!formula){formula=doc.createElementNS(XMLNS,'formula1');dv.appendChild(formula);}formula.textContent='DaftarPekerjaan';
  }
  async function exportXlsx(){
    if(!window.JSZip){notify('Library ZIP belum termuat. Periksa koneksi internet.');return;}
    const category=$('category').value,mode=$('mode').value,key=`${category}_${mode}`;const base=window.CKG_TEMPLATES?.[key];if(!base){notify('Template tidak ditemukan.');return;}
    $('exportBtn').disabled=true;$('exportBtn').textContent='Menyiapkan Excel…';
    try{
      const zip=await JSZip.loadAsync(base,{base64:true});
      const wbPath='xl/workbook.xml',relsPath='xl/_rels/workbook.xml.rels',typesPath='[Content_Types].xml';
      const [wbText,relsText,typesText]=await Promise.all([zip.file(wbPath).async('string'),zip.file(relsPath).async('string'),zip.file(typesPath).async('string')]);
      const wbDoc=parseXml(wbText),relsDoc=parseXml(relsText),typesDoc=parseXml(typesText);
      const targetName=mode==='local'?'Data Peserta':'Sheet1';const sheetPath=findSheetPath(wbDoc,relsDoc,targetName);if(!sheetPath||!zip.file(sheetPath))throw new Error('Lembar data pada template tidak ditemukan.');
      const sheetDoc=parseXml(await zip.file(sheetPath).async('string'));clearSheetRows(sheetDoc);const sheetData=first(sheetDoc,XMLNS,'sheetData');
      const numericCols = new Set(category==='sekolah' ? (mode==='local'?[18,19,20,21,22,23]:[13,14,15,16,17,18]) : (mode==='local'?[21,22,23,24,25,26]:[14,15,16,17,18,19]));
      participants.forEach((p,i)=>{const row=ensureRow(sheetDoc,sheetData,i+2);const values=mapRow(p.data,category,mode);Object.entries(values).forEach(([c,v])=>{const col=Number(c);addCellValue(sheetDoc,row,`${colName(col)}${i+2}`,v,numericCols.has(col));});});
      updateDimension(sheetDoc,participants.length+1);zip.file(sheetPath,xmlText(sheetDoc));
      if((category==='umum'&&mode==='local')||(category==='umum'&&mode==='non_local')||(category==='sekolah'&&mode==='local')){
        const refPath=setReferenceSheet(zip,wbDoc,relsDoc,typesDoc);const existingRef=zip.file(refPath);if(existingRef){};
        updateOccupationValidation(sheetDoc,category,mode);zip.file(sheetPath,xmlText(sheetDoc));
      }
      zip.file(wbPath,xmlText(wbDoc));zip.file(relsPath,xmlText(relsDoc));zip.file(typesPath,xmlText(typesDoc));
      const blob=await zip.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:6}});
      let name=$('filename').value.trim().replace(/\.xlsx$/i,'').replace(/[\\/:*?"<>|]/g,'_').replace(/\s+/g,'_');if(!name)name=`template_ckg_${key}`;name=name.slice(0,90)+'.xlsx';
      const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2500);notify('File Excel berhasil dibuat.');
    }catch(err){console.error(err);notify('Ekspor gagal: '+(err.message||'periksa template'));}
    finally{$('exportBtn').disabled=!participants.length;$('exportBtn').textContent='↓ Unduh Excel (.xlsx)';}
  }
  function colName(n){let s='';while(n){const r=(n-1)%26;s=String.fromCharCode(65+r)+s;n=Math.floor((n-1)/26);}return s;}
  $('exportBtn').onclick=exportXlsx;
  buildForm();
})();
