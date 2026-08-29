import http from 'node:http';
import fs from 'node:fs';
import Database from 'better-sqlite3';

const port = Number(process.env.PORT || 80);
const dataDir = process.env.DATA_DIR || '/app/data';
fs.mkdirSync(dataDir, { recursive: true });
const db = new Database(`${dataDir}/food.db`);
db.pragma('journal_mode = WAL');
db.exec(`CREATE TABLE IF NOT EXISTS places (id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,tag TEXT NOT NULL,emoji TEXT NOT NULL,color TEXT NOT NULL,created_at INTEGER NOT NULL); CREATE TABLE IF NOT EXISTS picks (place_id INTEGER PRIMARY KEY,updated_at INTEGER NOT NULL)`);
const headers = {'content-type':'application/json; charset=utf-8','access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,PUT,DELETE,OPTIONS','access-control-allow-headers':'content-type'};
const send=(res,status,data)=>{res.writeHead(status,headers);res.end(JSON.stringify(data));};
const body=req=>new Promise((resolve,reject)=>{let s='';req.on('data',c=>s+=c);req.on('end',()=>{try{resolve(s?JSON.parse(s):{})}catch(e){reject(e)}})});
const read=()=>db.prepare('SELECT p.id,p.name,p.tag,p.emoji,p.color,CASE WHEN k.place_id IS NULL THEN 0 ELSE 1 END selected FROM places p LEFT JOIN picks k ON k.place_id=p.id ORDER BY p.created_at,p.id').all();
const server=http.createServer(async(req,res)=>{if(req.method==='OPTIONS'){res.writeHead(204,headers);return res.end()}if(req.url==='/health'){return send(res,200,{ok:true})}try{const u=new URL(req.url,`http://${req.headers.host}`);if(u.pathname==='/api/places'&&req.method==='GET')return send(res,200,read());if(u.pathname==='/api/places'&&req.method==='POST'){const b=await body(req),name=String(b.name||'').trim();if(!name)return send(res,400,{error:'name is required'});const info=db.prepare('INSERT INTO places(name,tag,emoji,color,created_at) VALUES(?,?,?,?,?)').run(name,String(b.tag||'未分类'),String(b.emoji||'✨'),String(b.color||'blue'),Date.now());return send(res,201,{id:Number(info.lastInsertRowid),name,tag:String(b.tag||'未分类'),emoji:String(b.emoji||'✨'),color:String(b.color||'blue')})}const m=u.pathname.match(/^\/api\/places\/(\d+)$/);if(m&&req.method==='DELETE'){const tx=db.transaction(id=>{db.prepare('DELETE FROM picks WHERE place_id=?').run(id);db.prepare('DELETE FROM places WHERE id=?').run(id)});tx(Number(m[1]));return send(res,200,{ok:true})}if(u.pathname==='/api/picks'&&req.method==='PUT'){const b=await body(req),ids=Array.isArray(b.placeIds)?b.placeIds.filter(Number.isInteger):[];const tx=db.transaction(()=>{db.prepare('DELETE FROM picks').run();const q=db.prepare('INSERT OR IGNORE INTO picks(place_id,updated_at) SELECT id,? FROM places WHERE id=?');for(const id of ids)q.run(Date.now(),id)});tx();return send(res,200,{placeIds:ids})}return send(res,404,{error:'Not found'})}catch(e){console.error(e);return send(res,500,{error:'Internal server error'})}});
server.listen(port,'0.0.0.0',()=>console.log(`food API listening on ${port}`));
