import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import { Building2, Plus, Sliders, CheckCircle2 } from 'lucide-react';

export default function SalaryStructures() {
  const { addToast } = useToast();
  const [structures, setStructures] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    selectedRules: [],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const structRes = await API.get('/payroll/structures');
      const ruleRes = await API.get('/payroll/rules');
      if (structRes.data.success) setStructures(structRes.data.structures);
      if (ruleRes.data.success) setRules(ruleRes.data.rules);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRule = (ruleId) => {
    setFormData((prev) => {
      const exists = prev.selectedRules.includes(ruleId);
      if (exists) {
        return { ...prev, selectedRules: prev.selectedRules.filter((r) => r !== ruleId) };
      } else {
        return { ...prev, selectedRules: [...prev.selectedRules, ruleId] };
      }
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/payroll/structures', {
        ...formData,
        rules: formData.selectedRules,
      });
      if (res.data.success) {
        addToast('Salary Structure created successfully!', 'success');
        setShowModal(false);
        fetchData();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create structure', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-indigo-400" /> Salary Structures Configurator
          </h1>
          <p className="text-sm text-slate-400 mt-1">Group and sequence salary computation rules assigned to employee contracts.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" /> Create Structure
        </button>
      </div>

      {/* Structures Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {structures.map((struct) => (
          <div key={struct._id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">{struct.name}</h3>
                <span className="font-mono text-xs text-indigo-400">{struct.code}</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {struct.status}
              </span>
            </div>

            <p className="text-xs text-slate-400">{struct.description || 'No description provided.'}</p>

            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" /> Configured Rule Sequence ({struct.rules?.length || 0})
              </h4>
              <div className="space-y-1.5">
                {struct.rules?.map((rule) => (
                  <div key={rule._id} className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-indigo-950 text-indigo-300 font-mono font-bold flex items-center justify-center text-[10px]">
                        {rule.sequence}
                      </span>
                      <span className="font-semibold text-white">{rule.name}</span>
                      <span className="font-mono text-[10px] text-slate-400">({rule.code})</span>
                    </div>
                    <span
                      className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                        rule.type === 'FIXED'
                          ? 'bg-slate-800 text-slate-300'
                          : rule.type === 'PERCENTAGE'
                          ? 'bg-indigo-950 text-indigo-300'
                          : 'bg-purple-950 text-purple-300'
                      }`}
                    >
                      {rule.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">Create Salary Structure</h3>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Structure Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Regular Executive Salary Structure"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Structure Code *</label>
                <input
                  type="text"
                  required
                  placeholder="REG_SAL_2026"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono uppercase"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1 font-semibold">Select Rules to Include</label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {rules.map((rule) => {
                    const isSelected = formData.selectedRules.includes(rule._id);
                    return (
                      <div
                        key={rule._id}
                        onClick={() => handleToggleRule(rule._id)}
                        className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between transition ${
                          isSelected ? 'bg-indigo-950/60 border-indigo-500/50 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-indigo-400">#{rule.sequence}</span>
                          <span className="font-semibold">{rule.name}</span>
                          <span className="font-mono text-[10px]">({rule.code})</span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold">
                  Create Structure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
