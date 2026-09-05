import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import { Sliders, Plus, Code, Layers, Percent, DollarSign } from 'lucide-react';

export default function SalaryRules() {
  const { addToast } = useToast();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: 'ALLOWANCE',
    sequence: 1,
    type: 'FIXED',
    amount: 0,
    percentage: 0,
    percentageBaseCode: 'BASIC',
    formula: '',
  });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const res = await API.get('/payroll/rules');
      if (res.data.success) {
        setRules(res.data.rules);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/payroll/rules', formData);
      if (res.data.success) {
        addToast('Salary Rule created successfully!', 'success');
        setShowModal(false);
        fetchRules();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create rule', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sliders className="w-6 h-6 text-indigo-400" /> Sequential Salary Rule Engine
          </h1>
          <p className="text-sm text-slate-400 mt-1">Configure sequential rules (Fixed, Percentage, Formula) evaluated during payroll execution.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" /> Create Rule
        </button>
      </div>

      {/* Rules Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Seq #</th>
                <th className="p-4">Rule Name</th>
                <th className="p-4">Code</th>
                <th className="p-4">Category</th>
                <th className="p-4">Calculation Type</th>
                <th className="p-4">Rule Logic / Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {rules.map((rule) => (
                <tr key={rule._id} className="hover:bg-slate-800/40 transition">
                  <td className="p-4 font-mono font-bold text-indigo-400 text-base">#{rule.sequence}</td>
                  <td className="p-4 font-bold text-white">{rule.name}</td>
                  <td className="p-4 font-mono text-xs text-indigo-300">{rule.code}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        rule.category === 'BASIC'
                          ? 'bg-blue-500/20 text-blue-400'
                          : rule.category === 'ALLOWANCE'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : rule.category === 'DEDUCTION'
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-purple-500/20 text-purple-400'
                      }`}
                    >
                      {rule.category}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-xs font-semibold text-slate-300">{rule.type}</td>
                  <td className="p-4 font-mono text-xs">
                    {rule.type === 'FIXED' && <span className="text-emerald-400 font-bold">₹{rule.amount}</span>}
                    {rule.type === 'PERCENTAGE' && (
                      <span className="text-indigo-300">{rule.percentage}% of {rule.percentageBaseCode}</span>
                    )}
                    {rule.type === 'FORMULA' && <span className="text-purple-300 bg-purple-950/60 px-2 py-1 rounded border border-purple-800/40">{rule.formula}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">Create Salary Rule</h3>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Sequence Number (1..N) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.sequence}
                    onChange={(e) => setFormData({ ...formData, sequence: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Rule Code (e.g. HRA) *</label>
                  <input
                    type="text"
                    required
                    placeholder="HRA"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Rule Name *</label>
                <input
                  type="text"
                  required
                  placeholder="House Rent Allowance"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    <option value="BASIC">BASIC</option>
                    <option value="ALLOWANCE">ALLOWANCE</option>
                    <option value="DEDUCTION">DEDUCTION</option>
                    <option value="GROSS">GROSS</option>
                    <option value="NET">NET</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Rule Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    <option value="FIXED">FIXED</option>
                    <option value="PERCENTAGE">PERCENTAGE</option>
                    <option value="FORMULA">FORMULA</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Value Fields */}
              {formData.type === 'FIXED' && (
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Fixed Amount (₹)</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
              )}

              {formData.type === 'PERCENTAGE' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Percentage (%)</label>
                    <input
                      type="number"
                      value={formData.percentage}
                      onChange={(e) => setFormData({ ...formData, percentage: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Base Component Code</label>
                    <input
                      type="text"
                      placeholder="BASIC"
                      value={formData.percentageBaseCode}
                      onChange={(e) => setFormData({ ...formData, percentageBaseCode: e.target.value.toUpperCase() })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono uppercase"
                    />
                  </div>
                </div>
              )}

              {formData.type === 'FORMULA' && (
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Mathematical Formula Expression</label>
                  <input
                    type="text"
                    placeholder="BASIC + HRA + MEAL_ALLOWANCE"
                    value={formData.formula}
                    onChange={(e) => setFormData({ ...formData, formula: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Available variables: BASIC, WAGE, HRA, GROSS, WORKED_DAYS, UNPAID_DAYS</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold">
                  Create Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
