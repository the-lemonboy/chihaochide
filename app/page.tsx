"use client";

import { useEffect, useMemo, useState } from "react";

type Place = { id: number; name: string; tag: string; emoji: string; color: string };
export default function Home() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<Place | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    fetch("/api/places").then((r) => r.ok ? r.json() : Promise.reject()).then((data: unknown) => {
      const rows = Array.isArray(data) ? data as (Place & { selected?: number })[] : [];
      setPlaces(rows); setSelected(rows.filter((p) => p.selected).map((p) => p.id));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);
  const savePicks = (next: number[]) => { setSelected(next); void fetch("/api/picks", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ placeIds: next }) }); };
  const selectedPlaces = useMemo(() => places.filter((p) => selected.includes(p.id)), [places, selected]);
  const toggle = (id: number) => savePicks(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  const draw = () => { if (!selectedPlaces.length) return; setResult(selectedPlaces[Math.floor(Math.random() * selectedPlaces.length)]); };
  const addPlace = () => { if (!newName.trim()) return; const p = { id: Date.now(), name: newName.trim(), tag: newTag.trim() || "新收藏", emoji: "✨", color: "blue" }; setPlaces((x) => [...x, p]); setSelected((x) => [...x, p.id]); setNewName(""); setNewTag(""); setShowAdd(false); };

  if (loading) return <main className="shell"><header className="topbar"><div className="skeleton skeleton-brand" /><div className="skeleton skeleton-circle" /></header><section className="hero"><div className="skeleton skeleton-eyebrow" /><div className="skeleton skeleton-title" /><div className="skeleton skeleton-sub" /></section><section className="card picker skeleton-card"><div className="skeleton skeleton-line" /><div className="skeleton skeleton-line short" /><div className="skeleton skeleton-place" /><div className="skeleton skeleton-place" /><div className="skeleton skeleton-place" /></section></main>;

  return <main className="shell">
    <header className="topbar"><div className="brand"><span className="brand-mark">🥢</span><span>小林小郑吃好吃的</span></div><nav><a href="/list">看看收藏</a><button className="round-btn" onClick={()=>setShowAdd(true)}>＋</button></nav></header>
    <section className="hero"><div className="sparkle">✦</div><p className="eyebrow">FOOD MOOD · 01</p><h1>今天，<span>吃啥好吃的呢</span></h1></section>
    <section className="picker card"><div className="section-head"><div><h2>想吃什么</h2></div><span className="count">{selectedPlaces.length} 家</span></div>
      <div className="places">{places.map((p) => <button key={p.id} className={`place ${p.color} ${selected.includes(p.id) ? "chosen" : ""}`} onClick={() => toggle(p.id)}><span className="food">{p.emoji}</span><span className="place-copy"><strong>{p.name}</strong><small>{p.tag}</small></span><span className="check">{selected.includes(p.id) ? "✓" : ""}</span></button>)}</div>
      {!selectedPlaces.length && <div className="empty-state"><span>🍽️</span><p>候选席位空着，等你点名</p><a href="/list">去收藏里挑几家 →</a></div>}
    </section>
    <section className="draw-area"><div className="ticket"><span>已选好 {selected.length} 家店</span><i>·</i><span>剩下的交给骰子</span></div><button className="draw-btn" onClick={draw} disabled={!selected.length}><span className="dice">🎲</span> 随便挑一家</button><p className="hint">点一下，看看今天的胃口有什么主意</p></section>
    {result && <div className="result-backdrop" onClick={() => setResult(null)}><div className="result-modal" onClick={(e) => e.stopPropagation()}><div className="confetti">✦　✧　✦</div><p className="eyebrow">TODAY'S PICK</p><div className={`result-food ${result.color}`}>{result.emoji}</div><p className="result-label">抽到的是</p><h2>{result.name}</h2><p className="result-tag">{result.tag}</p><button className="again" onClick={draw}>再来一次吧</button><button className="close" onClick={() => setResult(null)}>行，就它了</button></div></div>}
    {showAdd && <div className="result-backdrop" onClick={() => setShowAdd(false)}><div className="add-modal picker-modal" onClick={(e) => e.stopPropagation()}><div className="section-head"><div><h2>挑几家候选</h2><p>先选美味8️⃣</p></div><button className="modal-x" onClick={()=>setShowAdd(false)}>×</button></div><div className="places">{places.map(p=><button key={p.id} className={`place ${p.color} ${selected.includes(p.id)?"chosen":""}`} onClick={()=>toggle(p.id)}><span className="food">{p.emoji}</span><span className="place-copy"><strong>{p.name}</strong><small>{p.tag}</small></span><span className="check">{selected.includes(p.id)?"✓":""}</span></button>)}</div><button className="draw-btn done-btn" onClick={()=>setShowAdd(false)}>就这些了（{selected.length} 家）</button><a className="new-food-link" href="/list">再去收藏点新东西 →</a></div></div>}
  </main>;
}
