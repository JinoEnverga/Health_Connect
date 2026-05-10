// src/pages/AIScanner.jsx  ← REPLACE your existing AIScanner.jsx
// Skin Analyzer → calls your trained Flask API (HAM10000 model)
// All other tabs

import React, { useState, useRef, useCallback } from 'react';
import {
  MdAutoAwesome, MdUpload, MdClose, MdWarning,
  MdCheckCircle, MdInfo, MdRefresh, MdScience,
  MdHealthAndSafety, MdContentCopy,
} from 'react-icons/md';

const FLASK_API = 'https://healthconnect-ai-api.onrender.com'; // change when deployed

const SCANNERS = [
  {
    id: 'skin', icon: '🔬', label: 'Skin Analyzer',
    color: 'from-rose-500 to-pink-600', bg: 'bg-rose-50',
    border: 'border-rose-200', text: 'text-rose-700', badge: 'bg-rose-100 text-rose-700',
    desc: 'Upload a skin photo — analyzed by our trained HAM10000 EfficientNetB3 model.',
    useRealModel: true,
  },
  {
    id: 'prescription', icon: '💊', label: 'Prescription Scanner',
    color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50',
    border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700',
    desc: 'Photo of a prescription or medicine label — AI extracts medicine names, dosage, and instructions.',
    prompt: `You are a medical AI. Analyze this prescription/medicine label:
1. **Patient Information**: Name, age (if visible)
2. **Medicines**: Name, brand, dosage, frequency, duration, purpose
3. **Special Instructions**: Food restrictions, timing, storage
4. **Doctor/Clinic**: Name and contact
5. **Drug Interactions Warning**: Between listed medicines
6. Note any unclear or unreadable text`,
  },
  {
    id: 'wound', icon: '🩹', label: 'Wound Analyzer',
    color: 'from-amber-500 to-orange-600', bg: 'bg-amber-50',
    border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700',
    desc: 'Photo of a wound or injury — AI gives severity assessment and first-aid steps.',
    prompt: `You are a medical AI. Analyze this wound/injury:
1. **Wound Description**: Type, size, depth, color
2. **Severity**: Mild / Moderate / Severe — explain why
3. **Warning Signs**: Infection, deep tissue damage
4. **First Aid Steps**: Numbered step-by-step
5. **When to go to ER**: Clear conditions
6. **Disclaimer**: Not a substitute for medical evaluation`,
  },
  {
    id: 'pill', icon: '💉', label: 'Pill Identifier',
    color: 'from-teal-500 to-emerald-600', bg: 'bg-teal-50',
    border: 'border-teal-200', text: 'text-teal-700', badge: 'bg-teal-100 text-teal-700',
    desc: 'Clear photo of a pill — identify shape, color, imprint, and likely medication.',
    prompt: `You are a pharmacist AI. Analyze this pill/tablet:
1. **Physical Description**: Shape, color, size, imprint, coating
2. **Possible Identifications**: 2-3 medications with generic name, brand, use, dosage
3. **Safety Warnings**: Side effects, who should not take it, storage
4. **Important**: Consult a pharmacist before taking any unidentified medication`,
  },
  {
    id: 'lab', icon: '🧪', label: 'Lab Result Reader',
    color: 'from-purple-500 to-violet-600', bg: 'bg-purple-50',
    border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-700',
    desc: 'Photo of lab results — plain-language explanation of each value.',
    prompt: `You are a medical AI. Analyze this lab result document:
1. **Test Summary**: All tests, values, reference ranges
2. **Interpretation**: ✅ Normal  ⚠️ Slightly abnormal  🚨 Significantly abnormal
3. **Key Findings**: 3 most important things the patient should know
4. **Next Steps**: Follow-up tests, specialist, lifestyle changes
5. **Questions to Ask Your Doctor**: 3-5 important questions
6. **Disclaimer**: Must be interpreted by a qualified physician`,
  },
];

export default function AIScanner() {
  const [activeId, setActiveId] = useState('skin');
  const [image, setImage]       = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [rawFile, setRawFile]   = useState(null);
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [copied, setCopied]     = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();
  const active  = SCANNERS.find(s => s.id === activeId);

  const switchScanner = (id) => {
    setActiveId(id); setImage(null); setImageFile(null);
    setRawFile(null); setResult(null); setError('');
  };

  const toBase64 = (file) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(',')[1]);
    r.onerror = () => rej('Read failed');
    r.readAsDataURL(file);
  });

  const handleFile = useCallback(async (file) => {
    if (!file?.type.startsWith('image/')) { setError('Please upload a valid image.'); return; }
    if (file.size > 10 * 1024 * 1024)     { setError('Image must be under 10MB.'); return; }
    setError(''); setResult(null);
    setRawFile(file);
    setImageFile(URL.createObjectURL(file));
    setImage(await toBase64(file));
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragOver(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const analyze = async () => {
    if (!image) { setError('Please upload an image first.'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      if (active.useRealModel) {
        // Call Flask API with the real trained model
        const form = new FormData();
        form.append('image', rawFile);
        const resp = await fetch(`${FLASK_API}/predict`, { method: 'POST', body: form });
        if (!resp.ok) { const e = await resp.json(); throw new Error(e.error || 'Flask error'); }
        setResult({ type: 'model', data: await resp.json() });
      } else {
        // Call Claude Vision API
        const resp = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514', max_tokens: 1000,
            messages: [{ role: 'user', content: [
              { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: image } },
              { type: 'text',  text: active.prompt },
            ]}],
          }),
        });
        const data = await resp.json();
        if (!data?.content?.[0]?.text) throw new Error('No response from AI');
        setResult({ type: 'text', text: data.content[0].text });
      }
    } catch (e) {
      setError(e.message || 'Analysis failed. Please try again.');
    }
    setLoading(false);
  };

  const copyResult = () => {
    navigator.clipboard.writeText(
      result?.type === 'model' ? JSON.stringify(result.data, null, 2) : result?.text || ''
    );
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  // Real model result card
  const RealModelResult = ({ data }) => {
    const p = data.prediction;
    return (
      <div className="p-5 space-y-4">
        <div className="bg-white rounded-2xl border border-rose-100 p-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
               style={{ background: p.risk_color + '22' }}>🔬</div>
          <div className="flex-1">
            <p className="text-xs text-slate-400 font-semibold uppercase mb-0.5">Top Prediction</p>
            <h3 className="text-lg font-display font-bold text-slate-800">{p.label}</h3>
            <p className="text-sm text-slate-500">{p.confidence}% confidence</p>
          </div>
          <span className="text-xs font-bold px-3 py-1.5 rounded-full text-white flex-shrink-0"
                style={{ background: p.risk_color }}>{p.risk_level} RISK</span>
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Confidence</span><span className="font-semibold">{p.confidence}%</span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${p.confidence}%`, background: p.risk_color }} />
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">All Probabilities</p>
          <div className="space-y-1.5">
            {data.all_scores.map(s => (
              <div key={s.code}>
                <div className="flex justify-between text-xs text-slate-600 mb-0.5">
                  <span>{s.label}</span><span className="font-semibold">{s.confidence}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-400 rounded-full" style={{ width: `${s.confidence}%`, opacity: s.confidence < 3 ? 0.2 : 1 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-amber-700 mb-1">💡 What to do next</p>
          <p className="text-sm text-amber-800">{p.advice}</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">🧠 {data.model_info.architecture}</span>
          <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">📊 {data.model_info.dataset}</span>
        </div>

        <div className="flex items-start gap-2 bg-white/60 rounded-xl px-4 py-3 border border-rose-100">
          <MdInfo className="text-slate-400 flex-shrink-0 mt-0.5 text-sm" />
          <p className="text-xs text-slate-500">{data.disclaimer}</p>
        </div>
      </div>
    );
  };

  const renderText = (text) =>
    text.split('\n').map((line, i) => {
      if (/^\*\*(.+)\*\*$/.test(line)) return <h3 key={i} className="font-bold text-slate-800 mt-4 mb-1 text-base">{line.replace(/\*\*/g,'')}</h3>;
      if (/^\d+\.\s\*\*/.test(line))   return <h3 key={i} className="font-bold text-slate-800 mt-4 mb-1 text-base">{line.replace(/^\d+\.\s/,'').replace(/\*\*/g,'')}</h3>;
      if (/^[-•]\s/.test(line))         return <li key={i} className="ml-4 text-slate-600 text-sm mb-1 list-disc">{line.replace(/^[-•]\s/,'')}</li>;
      if (!line.trim())                 return <div key={i} className="h-1" />;
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return <p key={i} className="text-slate-600 text-sm mb-1 leading-relaxed">{parts.map((p,j) => j%2===1 ? <strong key={j} className="text-slate-800">{p}</strong> : p)}</p>;
    });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0">
          <MdAutoAwesome className="text-white text-2xl" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-800">AI Health Scanner</h1>
          <p className="text-slate-500 mt-1">Skin — HAM10000 EfficientNetB3 model · Others — Vision AI</p>
        </div>
      </div>

      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
        <MdWarning className="text-amber-500 text-xl flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800"><strong>Medical Disclaimer:</strong> For informational purposes only. Always consult a qualified healthcare provider.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {SCANNERS.map(s => (
          <button key={s.id} onClick={() => switchScanner(s.id)}
            className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all text-center ${activeId === s.id ? `${s.bg} ${s.border} shadow-sm scale-[1.02]` : 'bg-white border-slate-100 hover:border-slate-200'}`}>
            <span className="text-2xl">{s.icon}</span>
            <span className={`text-xs font-semibold leading-tight ${activeId === s.id ? s.text : 'text-slate-600'}`}>{s.label}</span>
            {s.useRealModel && <span className="text-[10px] bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded font-bold">Real Model</span>}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className={`rounded-2xl border-2 ${active.border} ${active.bg} p-4`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{active.icon}</span>
              <h2 className={`font-display font-bold text-lg ${active.text}`}>{active.label}</h2>
              {active.useRealModel && <span className="text-xs bg-teal-500 text-white px-2 py-0.5 rounded-full font-semibold">HAM10000</span>}
            </div>
            <p className="text-sm text-slate-600">{active.desc}</p>
          </div>

          <div onDragOver={e=>{e.preventDefault();setDragOver(true);}} onDragLeave={()=>setDragOver(false)} onDrop={handleDrop}
            onClick={()=>fileRef.current.click()}
            className={`relative border-2 border-dashed rounded-2xl transition-all cursor-pointer overflow-hidden ${dragOver?'border-primary-400 bg-primary-50':imageFile?'border-teal-300 bg-teal-50':'border-slate-300 bg-white hover:border-primary-300'}`}
            style={{ minHeight: imageFile ? 'auto' : '200px' }}>
            {imageFile ? (
              <div className="relative">
                <img src={imageFile} alt="Uploaded" className="w-full max-h-72 object-contain rounded-2xl" />
                <button onClick={e=>{e.stopPropagation();setImage(null);setImageFile(null);setRawFile(null);setResult(null);setError('');}}
                  className="absolute top-3 right-3 w-8 h-8 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center">
                  <MdClose className="text-white text-base" />
                </button>
                <div className="absolute bottom-3 left-3"><span className="text-xs bg-black/60 text-white px-3 py-1 rounded-full">✅ Ready</span></div>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6">
                <div className={`w-16 h-16 bg-gradient-to-br ${active.color} rounded-2xl flex items-center justify-center shadow-sm`}>
                  <MdUpload className="text-white text-3xl" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-slate-700">Drag & drop or click</p>
                  <p className="text-sm text-slate-400 mt-0.5">JPG, PNG, WEBP · Max 10MB</p>
                </div>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e=>e.target.files[0]&&handleFile(e.target.files[0])} />

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <MdWarning className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <button onClick={analyze} disabled={!image||loading}
            className={`w-full py-4 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 bg-gradient-to-r ${active.color} shadow-sm hover:shadow-md hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 transition-all`}>
            {loading ? (<><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>{active.useRealModel?'Running AI Model…':'Analyzing with AI…'}</>) : (<><MdAutoAwesome className="text-xl" />Analyze with AI</>)}
          </button>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-slate-700 text-lg flex items-center gap-2">
              <MdScience className="text-primary-500" /> AI Analysis Result
            </h2>
            {result && (
              <div className="flex gap-2">
                <button onClick={copyResult} className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg">
                  {copied?<MdCheckCircle className="text-green-500"/>:<MdContentCopy/>} {copied?'Copied!':'Copy'}
                </button>
                <button onClick={()=>{setResult(null);setImage(null);setImageFile(null);setRawFile(null);}} className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg">
                  <MdRefresh/> Reset
                </button>
              </div>
            )}
          </div>

          <div className={`flex-1 rounded-2xl border-2 overflow-y-auto transition-all ${result?`${active.border} ${active.bg}`:'border-slate-100 bg-slate-50'}`} style={{minHeight:'420px',maxHeight:'580px'}}>
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center gap-4 p-8">
                <div className={`w-16 h-16 bg-gradient-to-br ${active.color} rounded-2xl flex items-center justify-center animate-pulse`}>
                  <span className="text-3xl">{active.icon}</span>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-slate-700">{active.useRealModel?'Running HAM10000 model…':'AI analyzing…'}</p>
                  <p className="text-sm text-slate-400 mt-1">This takes a few seconds</p>
                </div>
                <div className="flex gap-1.5">{[0,1,2].map(i=><div key={i} className={`w-2 h-2 rounded-full bg-gradient-to-br ${active.color} animate-bounce`} style={{animationDelay:`${i*.15}s`}}/>)}</div>
              </div>
            ) : result ? (
              result.type==='model' ? <RealModelResult data={result.data}/> : (
                <div className="p-5">
                  <div className={`inline-flex items-center gap-1.5 ${active.badge} text-xs font-semibold px-3 py-1.5 rounded-full mb-4`}>
                    <MdCheckCircle className="text-sm"/> {active.label} — Complete
                  </div>
                  {renderText(result.text)}
                  <div className="mt-4 flex items-start gap-2 bg-white/60 rounded-xl px-4 py-3 border border-white">
                    <MdInfo className="text-slate-400 flex-shrink-0 mt-0.5"/>
                    <p className="text-xs text-slate-500">AI-generated analysis. Consult a qualified healthcare provider for proper diagnosis.</p>
                  </div>
                </div>
              )
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-3 p-8 text-center">
                <div className="text-5xl opacity-20">{active.icon}</div>
                <p className="text-slate-400 font-medium">Your analysis will appear here</p>
                <p className="text-xs text-slate-400">Upload an image and click Analyze</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-display font-bold text-slate-700 mb-4 flex items-center gap-2">
          <MdHealthAndSafety className="text-teal-500"/> All Scanners
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SCANNERS.map(s=>(
            <button key={s.id} onClick={()=>switchScanner(s.id)}
              className={`text-left p-4 rounded-2xl border-2 transition-all hover:-translate-y-0.5 hover:shadow-md ${activeId===s.id?`${s.bg} ${s.border}`:'bg-white border-slate-100 hover:border-slate-200'}`}>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-2xl">{s.icon}</span>
                <span className="font-semibold text-slate-800 text-sm">{s.label}</span>
                {s.useRealModel&&<span className="text-[10px] bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded font-bold ml-auto">Real AI</span>}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
