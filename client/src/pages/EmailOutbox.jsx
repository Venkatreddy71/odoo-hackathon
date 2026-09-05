import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import { TableSkeleton } from '../components/common/Skeleton';
import { Mail, Send, CheckCircle2, Clock, AlertCircle, FileText, RefreshCw } from 'lucide-react';

export default function EmailOutbox() {
  const { addToast } = useToast();
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOutbox();
  }, []);

  const fetchOutbox = async () => {
    setLoading(true);
    try {
      const res = await API.get('/email-outbox');
      if (res.data.success) {
        setEmails(res.data.emails || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDispatchSingle = async (id) => {
    try {
      const res = await API.post(`/email-outbox/${id}/dispatch`);
      if (res.data.success) {
        addToast('Email dispatched to recipient successfully!', 'success');
        fetchOutbox();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Dispatch failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Mail className="w-6 h-6 text-indigo-400" /> Email Outbox & Delivery Dispatch
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tracks generated payslip statements and email delivery statuses across employees.
          </p>
        </div>
        <button
          onClick={fetchOutbox}
          className="flex items-center gap-2 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold rounded-xl transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Outbox
        </button>
      </div>

      {/* Outbox Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : emails.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Email Outbox is Empty</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              When you click "Send Payslips" on a finalized payrun, delivery records will be logged here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-4">Recipient</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Attachment</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Sent Time</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {emails.map((mail) => (
                  <tr key={mail._id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4 font-semibold text-white">
                      <div>{mail.recipientName}</div>
                      <div className="text-[11px] font-mono text-indigo-400 font-normal">{mail.recipientEmail}</div>
                    </td>
                    <td className="p-4 text-slate-200 font-medium">{mail.subject}</td>
                    <td className="p-4 font-mono text-slate-400 flex items-center gap-1.5 mt-2">
                      <FileText className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{mail.attachmentName || 'payslip.pdf'}</span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          mail.status === 'Dispatched' || mail.status === 'SENT'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : mail.status === 'Failed'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                        }`}
                      >
                        {mail.status}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-slate-400">
                      {mail.sentTime ? new Date(mail.sentTime).toLocaleString('en-IN') : 'Pending Dispatch'}
                    </td>
                    <td className="p-4 text-right">
                      {mail.status === 'Pending' ? (
                        <button
                          onClick={() => handleDispatchSingle(mail._id)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition"
                        >
                          Dispatch Now
                        </button>
                      ) : (
                        <span className="text-[11px] font-mono text-emerald-400 font-semibold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Dispatched
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
