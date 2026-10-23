/**
 * Export the 23 stadium profiles already authored for AFM as individual GLBs.
 * This creates low-poly interpretations of the profile's existing style,
 * colors, capacity, roof type and recognizable silhouette details.
 * It does not overwrite the original progressive-stadium GLBs.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'js/core/real_football_engine.js'), 'utf8');
const start = source.indexOf('const profiles = [');
const end = source.indexOf('];', start);
if (start < 0 || end < 0) throw new Error('Could not locate the AFM stadium profile catalog.');
const snippet = source.slice(start, end + 2).replace('const profiles =', 'module.exports =');
const profileModule = { exports: null };
new Function('module', 'exports', snippet)(profileModule, profileModule.exports);
const profiles = profileModule.exports;
if (!Array.isArray(profiles) || profiles.length !== 23) throw new Error(`Expected 23 existing profiles, got ${profiles?.length}`);

const shape = {
  maracana:{form:'oval',roof:'ring',shell:'concrete',rx:1.0,rz:1.0,open:0.94,beams:28,pattern:1},
  'neo-quimica':{form:'rounded',roof:'partial',shell:'dark-led',rx:.84,rz:.84,open:.56,beams:16,pattern:2},
  'allianz-parque':{form:'rounded',roof:'full',shell:'facade-ribs',rx:.82,rz:.82,open:.24,beams:24,pattern:3},
  morumbi:{form:'oval',roof:'partial',shell:'concrete',rx:1.06,rz:1.06,open:.36,beams:12,pattern:4},
  'arena-gremio':{form:'rounded',roof:'full',shell:'metal-ribs',rx:.92,rz:.92,open:.24,beams:26,pattern:5},
  'beira-rio':{form:'oval',roof:'full',shell:'leaf',rx:.88,rz:.88,open:.22,beams:30,pattern:6},
  'arena-mrv':{form:'rounded',roof:'full',shell:'dark-led',rx:.78,rz:.78,open:.18,beams:20,pattern:7},
  mineirao:{form:'oval',roof:'ring',shell:'concrete',rx:1.04,rz:1.04,open:.68,beams:24,pattern:8},
  'nilton-santos':{form:'oval-track',roof:'partial',shell:'truss',rx:1.12,rz:1.12,open:.52,beams:16,pattern:9},
  'fonte-nova':{form:'horseshoe',roof:'ring',shell:'concrete',rx:.9,rz:.9,open:.82,beams:20,pattern:10},
  bernabeu:{form:'rounded',roof:'retractable',shell:'silver-shell',rx:.92,rz:.92,open:.14,beams:40,pattern:11},
  'camp-nou':{form:'oval',roof:'partial',shell:'tiered-open',rx:1.16,rz:1.16,open:.45,beams:12,pattern:12},
  allianz:{form:'rounded',roof:'full',shell:'diamond',rx:.95,rz:.95,open:.19,beams:32,pattern:13},
  etihad:{form:'oval',roof:'partial',shell:'mast-cable',rx:.9,rz:.9,open:.42,beams:18,pattern:14},
  'old-trafford':{form:'rounded',roof:'partial',shell:'classic-gables',rx:1,rz:1,open:.4,beams:14,pattern:15},
  'parc-des-princes':{form:'oval',roof:'full',shell:'concrete-ribbon',rx:.83,rz:.83,open:.16,beams:22,pattern:16},
  'allianz-torino':{form:'rounded',roof:'full',shell:'minimal-white',rx:.75,rz:.75,open:.1,beams:24,pattern:17},
  saitama:{form:'oval',roof:'partial',shell:'gable-east-west',rx:.98,rz:.98,open:.5,beams:18,pattern:18},
  'nissan-stadium':{form:'oval-track',roof:'partial',shell:'truss',rx:1.1,rz:1.1,open:.54,beams:16,pattern:19},
  ajinomoto:{form:'oval-track',roof:'partial',shell:'cable-ring',rx:.9,rz:.9,open:.54,beams:20,pattern:20},
  'asian-elite':{form:'rounded',roof:'full',shell:'compact-enclosed',rx:.62,rz:.62,open:.08,beams:20,pattern:21},
  'al-awwal-park':{form:'rounded',roof:'partial',shell:'asymmetric-crown',rx:.6,rz:.6,open:.26,beams:15,pattern:22},
  'king-abdullah':{form:'rounded',roof:'partial',shell:'national-bowl',rx:1,rz:1,open:.28,beams:22,pattern:23}
};
const colors = {
  maracana:'#c7cbd1','neo-quimica':'#20242a','allianz-parque':'#15803d',morumbis:'#dc2626',
  'arena-gremio':'#0284c7','beira-rio':'#dc2626','arena-mrv':'#111827',mineirao:'#0284c7',
  'nilton-santos':'#111827','fonte-nova':'#0284c7',bernabeu:'#d1d5db','camp-nou':'#1e3a8a',
  allianz:'#e2e8f0',etihad:'#38bdf8','old-trafford':'#dc2626','parc-des-princes':'#1e3a8a',
  'allianz-torino':'#111827',saitama:'#dc2626','nissan-stadium':'#0284c7',ajinomoto:'#1d4ed8',
  'kingdom-arena':'#1e3a8a','al-awwal-park':'#facc15','king-abdullah-sports-city':'#facc15'
};
const slug = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const rgba = h => { let s=String(h||'#64748b').replace('#',''); if(s.length===3)s=s.split('').map(c=>c+c).join(''); const n=parseInt(s,16)||0x64748b; return [(n>>16&255)/255,(n>>8&255)/255,(n&255)/255,1]; };

function exportGlb(profile) {
  const cfg=shape[profile.style]; if(!cfg)throw new Error(`No geometry spec for ${profile.style}`);
  const mats=[], matMap=new Map();
  const mat=(name,color,metal=0.08,rough=.82,emission=null)=>{const key=[name,color,metal,rough,emission].join('|');if(matMap.has(key))return matMap.get(key);const id=mats.length;mats.push({name,pbrMetallicRoughness:{baseColorFactor:rgba(color),metallicFactor:metal,roughnessFactor:rough},...(emission?{emissiveFactor:rgba(emission).slice(0,3)}:{}),doubleSided:true});matMap.set(key,id);return id;};
  const concrete=mat('Concrete','#64748b'),dark=mat('Steel and shade','#1e293b',.34),seat1=mat('Seat color',profile.secondary||colors[profile.style]||'#2563eb'),seat2=mat('Seat contrast',profile.primary||'#e2e8f0'),accent=mat('Profile accents',profile.accent||'#facc15',.38,.44,profile.accent||null),roofMat=mat('Roof shell',['silver-shell','minimal-white'].includes(cfg.shell)?'#dbe4eb':cfg.shell==='diamond'?'#dbeafe':'#94a3b8',.56,.44),glass=mat('Facade panels',cfg.shell==='dark-led'?'#111827':'#334155',.32,.3,cfg.shell==='dark-led'?profile.accent:null),grass=mat('Pitch','#176b37',.02,.96),stripe=mat('Pitch stripes','#218447',.02,.96),line=mat('Pitch lines','#f8fafc',.0,.7);
  const positions=[],normals=[],indices=[],triMat=[];
  function tri(a,b,c,m){const i=positions.length/3,ab=b.map((v,k)=>v-a[k]),ac=c.map((v,k)=>v-a[k]),cr=[ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0]],l=Math.hypot(...cr)||1,n=cr.map(v=>v/l);for(const p of [a,b,c]){positions.push(...p);normals.push(...n);}indices.push(i,i+1,i+2);triMat.push(m);}
  function quad(a,b,c,d,m){tri(a,b,c,m);tri(a,c,d,m);}
  function box(x,y,z,w,h,d,m){let x0=x-w/2,x1=x+w/2,y0=y-h/2,y1=y+h/2,z0=z-d/2,z1=z+d/2,p=[ [x0,y0,z0],[x0,y0,z1],[x0,y1,z0],[x0,y1,z1],[x1,y0,z0],[x1,y0,z1],[x1,y1,z0],[x1,y1,z1] ];const [a,b,c,e,f,g,h1,i]=p;quad(a,f,i,c,m);quad(b,e,h1,g,m);quad(a,b,g,f,m);quad(c,i,h1,e,m);quad(a,c,e,b,m);quad(f,g,h1,i,m);}
  function beam(a,b,r,m,n=5){const d=b.map((v,i)=>v-a[i]),l=Math.hypot(...d)||1,u=d.map(v=>v/l),ref=Math.abs(u[1])<.9?[0,1,0]:[1,0,0],cross=(x,y)=>[x[1]*y[2]-x[2]*y[1],x[2]*y[0]-x[0]*y[2],x[0]*y[1]-x[1]*y[0]],v0=cross(u,ref),vl=Math.hypot(...v0)||1,v=v0.map(q=>q/vl);const w=cross(u,v),ar=[],br=[];for(let i=0;i<n;i++){let t=i*Math.PI*2/n,o=v.map((q,k)=>r*(q*Math.cos(t)+w[k]*Math.sin(t)));ar.push(a.map((q,k)=>q+o[k]));br.push(b.map((q,k)=>q+o[k]));}for(let i=0;i<n;i++){quad(ar[i],ar[(i+1)%n],br[(i+1)%n],br[i],m);tri(a,ar[(i+1)%n],ar[i],m);tri(b,br[i],br[(i+1)%n],m);}}
  function xy(t,rx,rz){const p=cfg.form==='oval'||cfg.form==='oval-track'?2:cfg.form==='horseshoe'?2.8:2.5,x=Math.cos(t),z=Math.sin(t);let X=Math.sign(x)*Math.pow(Math.abs(x),2/p)*rx,Y=Math.sign(z)*Math.pow(Math.abs(z),2/p)*rz;if(cfg.form==='horseshoe'&&Y<0){X*=.82;Y*=.93;}return[X,Y];}
  // Field, line markings and goals.
  box(0,-.55,0,38,.5,58,dark); box(0,-.22,0,24,.12,39,grass);for(let i=0;i<12;i++)box(-11+i*2,-.145,0,2,.025,38,i%2?stripe:grass);
  box(0,-.115,-18.3,24,.025,.12,line);box(0,-.115,18.3,24,.025,.12,line);box(-11.9,-.115,0,.12,.025,36.6,line);box(11.9,-.115,0,.12,.025,36.6,line);box(0,-.112,0,.12,.025,36.4,line);box(0,-.108,-13.2,14,.025,.1,line);box(0,-.108,13.2,14,.025,.1,line);box(-7,-.108,-15.7,.1,.025,5,line);box(7,-.108,-15.7,.1,.025,5,line);box(-7,-.108,15.7,.1,.025,5,line);box(7,-.108,15.7,.1,.025,5,line);
  for(const z of [-19.8,19.8]){box(-2.1,.8,z,.12,1.8,.12,line);box(2.1,.8,z,.12,1.8,.12,line);box(0,1.7,z,4.2,.12,.12,line);}
  const levels=profile.capacity>=80000?4:profile.capacity>=55000?3:profile.capacity>=38000?3:2,irx=18,irz=28,orx=irx+8.5*cfg.rx,orz=irz+8.5*cfg.rz,segments=48+Math.round(cfg.rx*12);
  for(let tier=0;tier<levels;tier++){const y=tier*2.15+.1,rx=irx+tier*4.7,rz=irz+tier*4.7,ox=rx+4.2*cfg.rx,oz=rz+4.2*cfg.rz;for(let j=0;j<segments;j++){const a=j/segments*Math.PI*2,b=(j+1)/segments*Math.PI*2;if(cfg.form==='horseshoe'&&Math.sin((a+b)/2)<-cfg.open)continue;let [x0,z0]=xy(a,rx,rz),[x1,z1]=xy(b,rx,rz),[X0,Z0]=xy(a,ox,oz),[X1,Z1]=xy(b,ox,oz);quad([x0,y,z0],[x1,y,z1],[X1,y,Z1],[X0,y,Z0],tier%2?dark:concrete);quad([x0,y+1.2,z0],[x1,y+1.2,z1],[X1,y+2.0,Z1],[X0,y+2.0,Z0],tier%2?dark:concrete);quad([x0,y+1.28,z0],[x1,y+1.28,z1],[X1,y+1.31,Z1],[X0,y+1.31,Z0],j%3?seat1:seat2);if(j%(cfg.pattern%3+1)===0)box((x0+x1+X0+X1)/4,y+1.65,(z0+z1+Z0+Z1)/4,.7,.2,.7,j%2?seat1:accent);}}
  // Different outer façade rhythms by silhouette rather than a shared generic shell.
  for(let j=0;j<cfg.beams;j++){const a=j/cfg.beams*Math.PI*2;if(cfg.form==='horseshoe'&&Math.sin(a)<-cfg.open)continue;let [x,z]=xy(a,orx+3,orz+3),y=levels*2.15+3.8;beam([x,.4,z],[x*1.025,y,z*1.025],cfg.shell==='diamond'?.9:.5,(j%3===0)?accent:dark,4);if(['diamond','silver-shell','dark-led','compact-enclosed'].includes(cfg.shell)){const [x2,z2]=xy(a+Math.PI*2/cfg.beams,orx+4,orz+4);quad([x,2.3,z],[x2,2.3,z2],[x2,y-.2,z2],[x,y-.2,z],cfg.shell==='dark-led'?glass:(j%2?roofMat:seat1));}if(cfg.shell==='truss'&&j%2===0)beam([x,y-1,z],[x*1.06,y+2,z*1.06],.22,roofMat,4);if(cfg.shell==='leaf'&&j%2===0){const [x2,z2]=xy(a+Math.PI*2/cfg.beams,orx+4,orz+4);quad([x,y-2,z],[x2,y-1,z2],[x*1.04,y+.4,z*1.04],[x*.98,y+.2,z*.98],roofMat);}}
  const roofY=levels*2.15+5.4;
  if(cfg.roof==='full'||cfg.roof==='retractable'||cfg.roof==='ring'){for(let j=0;j<segments;j++){const a=j/segments*Math.PI*2,b=(j+1)/segments*Math.PI*2;if(cfg.form==='horseshoe'&&Math.sin((a+b)/2)<-cfg.open)continue;const p0=xy(a,orx+5,orz+5),p1=xy(b,orx+5,orz+5),q0=xy(a,irx+4,irz+4),q1=xy(b,irx+4,irz+4);if(cfg.roof==='ring'&&(j%5!==0))continue;quad([p0[0],roofY,p0[1]],[p1[0],roofY,p1[1]],[q1[0],roofY+.45,q1[1]],[q0[0],roofY+.45,q0[1]],cfg.roof==='retractable'&&j%3?roofMat:(j%4===0?accent:roofMat));}if(cfg.roof==='retractable'){for(const side of [-1,1]){box(0,roofY+.7,side*5,27,.42,13,roofMat);for(let i=-4;i<=4;i++)beam([i*5,roofY+.3,side*11],[i*5,roofY+2,side*1],.16,dark,4);}}}else{const centers=cfg.shell==='gable-east-west'?[0,Math.PI]:[Math.PI/2,Math.PI*1.5];for(const c of centers){for(let j=-5;j<=5;j++){const a=c+j*.055,p=xy(a,orx+5,orz+5),q=xy(a,irx+4,irz+4);beam([p[0],roofY,p[1]],[q[0],roofY+.55,q[1]],.28,roofMat,4);}const p=xy(c-.45,orx+5,orz+5),q=xy(c+.45,orx+5,orz+5),r=xy(c-.45,irx+4,irz+4),s=xy(c+.45,irx+4,irz+4);quad([p[0],roofY,p[1]],[q[0],roofY,q[1]],[s[0],roofY+.55,s[1]],[r[0],roofY+.55,r[1]],roofMat);}}
  if(cfg.form==='oval-track'){const track=mat('Athletics track',profile.accent||'#b91c1c');for(let j=0;j<segments;j++){const a=j/segments*Math.PI*2,b=(j+1)/segments*Math.PI*2,p=xy(a,orx+8,orz+8),q=xy(b,orx+8,orz+8),r=xy(a,orx+5,orz+5),s=xy(b,orx+5,orz+5);quad([p[0],-.1,p[1]],[q[0],-.1,q[1]],[s[0],-.1,s[1]],[r[0],-.1,r[1]],track);}}
  if(cfg.shell==='diamond'){for(let j=0;j<48;j++){const a=j/48*Math.PI*2,p=xy(a,orx+4,orz+4),q=xy(a+.045,orx+4,orz+4);beam([p[0],2.2,p[1]],[q[0],roofY-1,q[1]],.22,j%3===0?seat1:j%3===1?accent:roofMat,4);}}
  if(['classic-gables','gable-east-west'].includes(cfg.shell)){for(const z of [-orz-2,orz+2]){beam([-orx-2,roofY-2,z],[0,roofY+2.8,z],.42,roofMat,5);beam([0,roofY+2.8,z],[orx+2,roofY-2,z],.42,roofMat,5);}}
  for(const [x,z] of [[-orx-3,-orz-3],[orx+3,-orz-3],[-orx-3,orz+3],[orx+3,orz+3]]){if(cfg.roof==='full'&&!['truss','mast-cable'].includes(cfg.shell))continue;beam([x,0,z],[x,roofY+5,z],.25,dark,4);box(x,roofY+4.6,z,2.4,.45,.85,accent);}

  // Combine into one mesh primitive per material, allowing material-specific indices.
  const groups=new Map();for(let t=0;t<triMat.length;t++){let m=triMat[t];if(!groups.has(m))groups.set(m,[]);groups.get(m).push(indices[t*3],indices[t*3+1],indices[t*3+2]);}
  const chunks=[],views=[],accessors=[];let byteLen=0;
  function view(bytes,target){while(byteLen%4){chunks.push(Buffer.from([0]));byteLen++;}const offset=byteLen,b=Buffer.from(bytes);chunks.push(b);byteLen+=b.length;const v={buffer:0,byteOffset:offset,byteLength:b.length};if(target)v.target=target;views.push(v);return views.length-1;}
  function accessor(bufferView,componentType,count,type,min,max){const a={bufferView,componentType,count,type};if(min)a.min=min;if(max)a.max=max;accessors.push(a);return accessors.length-1;}
  const primitives=[];
  for(const [material,raw] of groups){const remap=new Map(),p=[],n=[],ix=[];let min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];for(const old of raw){const vals=[positions[old*3],positions[old*3+1],positions[old*3+2],normals[old*3],normals[old*3+1],normals[old*3+2]],key=vals.map(v=>v.toFixed(3)).join(',');if(!remap.has(key)){remap.set(key,remap.size);p.push(...vals.slice(0,3));n.push(...vals.slice(3));for(let k=0;k<3;k++){min[k]=Math.min(min[k],vals[k]);max[k]=Math.max(max[k],vals[k]);}}ix.push(remap.get(key));}const pv=view(new Float32Array(p).buffer,34962),nv=view(new Float32Array(n).buffer,34962),iv=view(new Uint32Array(ix).buffer,34963);const pa=accessor(pv,5126,p.length/3,'VEC3',min,max),na=accessor(nv,5126,n.length/3,'VEC3'),ia=accessor(iv,5125,ix.length,'SCALAR');primitives.push({attributes:{POSITION:pa,NORMAL:na},indices:ia,material,mode:4});}
  const fileSlug=slug(profile.id),gltf={asset:{version:'2.0',generator:'AFM Profile-Specific Low Poly GLB Generator'},scene:0,scenes:[{nodes:[0]}],nodes:[{name:profile.name,mesh:0,extras:{profileId:profile.id,style:profile.style,capacity:profile.capacity,roof:profile.roof,geometryStyle:cfg,colors:{primary:profile.primary,secondary:profile.secondary,accent:profile.accent}}}],meshes:[{name:`${profile.name} low-poly silhouette`,primitives}],materials:mats,accessors,bufferViews:views,buffers:[{byteLength:byteLen}]};
  const json=Buffer.from(JSON.stringify(gltf)),jsonPad=Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,0x20)]),bin=Buffer.concat(chunks),binPad=Buffer.concat([bin,Buffer.alloc((4-bin.length%4)%4)]),total=12+8+jsonPad.length+8+binPad.length;
  const header=Buffer.alloc(12);header.writeUInt32LE(0x46546c67,0);header.writeUInt32LE(2,4);header.writeUInt32LE(total,8);const jh=Buffer.alloc(8);jh.writeUInt32LE(jsonPad.length,0);jh.writeUInt32LE(0x4e4f534a,4);const bh=Buffer.alloc(8);bh.writeUInt32LE(binPad.length,0);bh.writeUInt32LE(0x004e4942,4);return Buffer.concat([header,jh,jsonPad,bh,binPad]);
}

const dirs=[path.join(root,'assets/stadiums/real'),path.join(root,'assets/stadios/real'),path.join(root,'public/assets/stadios/real')];dirs.forEach(d=>fs.mkdirSync(d,{recursive:true}));
const manifest=[];
for(const p of profiles){const cfg=shape[p.style],data=exportGlb(p),file=`${slug(p.id)}.glb`;for(const d of dirs)fs.writeFileSync(path.join(d,file),data);manifest.push({id:p.id,name:p.name,style:p.style,file,bytes:data.length,sha256:crypto.createHash('sha256').update(data).digest('hex'),roof:cfg.roof,shell:cfg.shell,capacity:p.capacity,colors:{primary:p.primary,secondary:p.secondary,accent:p.accent}});}
if(new Set(manifest.map(x=>x.sha256)).size!==23)throw new Error('Generated files are not all unique');
fs.writeFileSync(path.join(dirs[0],'manifest.json'),JSON.stringify({generator:'AFM Profile-Specific Low Poly GLB Generator',version:1,source:'js/core/real_football_engine.js (RealPitchRenderer3D.getStadiumProfile)',models:manifest},null,2));
console.log(`Generated ${manifest.length} exclusive stadium GLBs, ${new Set(manifest.map(x=>x.sha256)).size} distinct hashes; total ${manifest.reduce((s,x)=>s+x.bytes,0).toLocaleString('en-US')} bytes.`);
