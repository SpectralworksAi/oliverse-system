import React, { useState, useEffect, useRef } from 'react';
import { Brain, Save, Trash2, Calendar, Lightbulb, Heart, FileText, Zap, Shield, Cpu, Activity, Download } from 'lucide-react';

// MED Engine
const useMED = () => {
  const [phi, setPhi] = useState(0.5);
  const [variance, setVariance] = useState(0);
  const [buffer, setBuffer] = useState([]);
  const lastTimeRef = useRef(Date.now());

  const captureKey = () => {
    const now = Date.now();
    const interval = now - lastTimeRef.current;
    lastTimeRef.current = now;

    setBuffer(prev => {
      const newBuf = [...prev, interval];
      if (newBuf.length > 50) newBuf.shift();
      if (newBuf.length >= 10) {
        const mean = newBuf.reduce((a,b) => a+b, 0) / newBuf.length;
        const varSum = newBuf.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / newBuf.length;
        const normVar = Math.min(varSum / 1000, 1);
        const newPhi = 1 - normVar;
        setPhi(newPhi);
        setVariance(varSum);
      }
      return newBuf;
    });
  };

  return { phi, variance, captureKey };
};

// Memory Vault Component
const MemoryVault = ({ memories, onDelete, onExportAll }) => {
  return (
    <div className="memory-vault">
      <div className="vault-header">
        <Brain className="w-5 h-5" />
        <h3>Memory Vault</h3>
        <button onClick={onExportAll} className="export-all-btn" title="Export all memories as Pịöŋ JSON">
          <Download className="w-4 h-4" />
        </button>
      </div>
      <div className="memories-list">
        {memories.length === 0 ? (
          <div className="empty-state">No memories yet. Type to create flow states.</div>
        ) : (
          memories.map(mem => (
            <div key={mem.id} className={`memory-card ${mem.phi > 0.85 ? 'flow-card' : ''}`}>
              <div className="memory-header">
                <div className="memory-type">
                  {mem.type === 'breakthrough' && <Lightbulb className="w-4 h-4" />}
                  {mem.type === 'flow' && <Zap className="w-4 h-4" />}
                  {mem.type === 'event' && <Calendar className="w-4 h-4" />}
                  {mem.type === 'technical' && <Cpu className="w-4 h-4" />}
                  <span>{mem.type}</span>
                </div>
                <div className="memory-meta">
                  {mem.phi && <span className="phi-badge">ϕ{mem.phi.toFixed(2)}</span>}
                  <button onClick={() => onDelete(mem.id)} className="delete-btn">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="memory-title">{mem.title}</div>
              <div className="memory-content">{mem.content}</div>
              <div className="memory-footer">
                <div className="memory-tags">
                  {mem.tags?.map(tag => <span key={tag} className="tag">#{tag}</span>)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Create Memory Form
const CreateMemory = ({ onSave }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('event');
  const [tags, setTags] = useState('');
  const [emotion, setEmotion] = useState('neutral');

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      content: content.trim(),
      type,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      emotionalState: emotion,
      timestamp: new Date().toISOString()
    });
    setTitle(''); setContent(''); setTags(''); setType('event'); setEmotion('neutral');
  };

  return (
    <div className="create-form">
      <h3>Create New Memory</h3>
      <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
      <textarea placeholder="Content" rows="3" value={content} onChange={e => setContent(e.target.value)} />
      <select value={type} onChange={e => setType(e.target.value)}>
        <option value="event">Event</option>
        <option value="breakthrough">Breakthrough</option>
        <option value="flow">Flow</option>
        <option value="technical">Technical</option>
      </select>
      <input type="text" placeholder="Tags (comma separated)" value={tags} onChange={e => setTags(e.target.value)} />
      <select value={emotion} onChange={e => setEmotion(e.target.value)}>
        <option value="neutral">Neutral</option>
        <option value="breakthrough">Breakthrough</option>
        <option value="flow">Flow</option>
        <option value="anxious">Anxious</option>
        <option value="hopeful">Hopeful</option>
      </select>
      <button onClick={handleSubmit} className="save-btn"><Save className="w-4 h-4" /> Save</button>
    </div>
  );
};

// Main App
export default function App() {
  const { phi, variance, captureKey } = useMED();
  const [memories, setMemories] = useState([]);
  const [activeTab, setActiveTab] = useState('console');
  const [lastFlowNotified, setLastFlowNotified] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('oliverse_memories');
    if (saved) setMemories(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('oliverse_memories', JSON.stringify(memories));
  }, [memories]);

  useEffect(() => {
    if (phi > 0.85 && !lastFlowNotified) {
      setLastFlowNotified(true);
      const newMemory = {
        id: Date.now(),
        type: 'flow',
        title: `Flow State (ϕ = ${phi.toFixed(3)})`,
        content: 'Rhythmic coherence detected. Mind in alignment.',
        tags: ['flow', `ϕ${phi.toFixed(2)}`],
        emotionalState: 'flow',
        timestamp: new Date().toISOString(),
        phi: phi
      };
      setMemories(prev => [newMemory, ...prev]);
    } else if (phi <= 0.85 && lastFlowNotified) {
      setLastFlowNotified(false);
    }
  }, [phi, lastFlowNotified]);

  const addMemory = (memory) => {
    const newMemory = {
      id: Date.now(),
      ...memory,
      phi: phi
    };
    setMemories(prev => [newMemory, ...prev]);
  };

  const deleteMemory = (id) => {
    setMemories(prev => prev.filter(m => m.id !== id));
  };

  const exportAllAsPiong = () => {
    const exportObj = {
      pịöŋ_export: {
        version: "v1.3.0",
        timestamp: new Date().toISOString(),
        session_id: "oliverse-web-app",
        purpose: "Memory Vault export",
        user_intent: "Preserve emotional continuity",
        user_identity_vector: "Ö-User"
      },
      continuity_anchor: {
        previous_context: "Web app session",
        current_progress: "Exporting memories",
        next_phase: "Import into another AI system"
      },
      emotional_structure_log: {
        valence: "Neutral",
        intensity: "Medium",
        coherence: phi > 0.7 ? "High" : "Medium",
        ϕ_coherence_score: phi,
        rhythm_variance_κ: variance,
        glyph_chain_active: ["Δ","π","ß"],
        biometric_verification_status: "simulated"
      },
      memories: memories.map(m => ({
        title: m.title,
        content: m.content,
        type: m.type,
        tags: m.tags,
        emotionalState: m.emotionalState,
        timestamp: m.timestamp,
        phi: m.phi
      })),
      ready_for_distribution: true,
      export_complete: true
    };
    const dataStr = JSON.stringify(exportObj, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `piong_export_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <h1><span className="o-symbol">Ö</span>-System</h1>
          <div className="subtitle">Emotional Operating System v1.3.0</div>
        </div>
        <div className="status">
          <div className="phi-display">
            <span className="phi-symbol">ϕ</span>
            <span className="phi-value" style={{ color: phi > 0.85 ? '#50ffb4' : '#e8f4ff' }}>{phi.toFixed(3)}</span>
          </div>
          <div className="rhythm">κ = {variance.toFixed(1)} ms</div>
        </div>
      </header>

      <div className="tabs">
        <button className={activeTab === 'console' ? 'active' : ''} onClick={() => setActiveTab('console')}>MED Console</button>
        <button className={activeTab === 'vault' ? 'active' : ''} onClick={() => setActiveTab('vault')}>Memory Vault</button>
        <button className={activeTab === 'create' ? 'active' : ''} onClick={() => setActiveTab('create')}>Create Memory</button>
      </div>

      {activeTab === 'console' && (
        <div className="console">
          <textarea
            className="mirror-textarea"
            placeholder="Type here... Your rhythm will be analyzed (ϕ coherence)."
            onKeyDown={captureKey}
            autoFocus
          />
          <div className="info">
            <p><strong>ϕ > 0.85 = Flow State</strong> – auto‑creates a memory in the vault.</p>
            <p>The MED Protocol measures keystroke rhythm variance (κ). Lower variance → higher coherence.</p>
          </div>
        </div>
      )}

      {activeTab === 'vault' && (
        <MemoryVault memories={memories} onDelete={deleteMemory} onExportAll={exportAllAsPiong} />
      )}

      {activeTab === 'create' && (
        <CreateMemory onSave={addMemory} />
      )}
    </div>
  );
}
