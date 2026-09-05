import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import { UserCheck, UserPlus, ShieldAlert, Mail, Eye, EyeOff, Shield, CheckCircle, Trash2, AlertTriangle } from 'lucide-react';

export default function Users() {
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Delete User Modal
  const [userToDelete, setUserToDelete] = useState(null);

  // Create User Modal
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'EMPLOYEE',
    employeeId: '',
    personalEmail: '',
  });

  const generateRandomPassword = () => {
    const rand = Math.floor(100000 + Math.random() * 900000);
    const pwd = `Pass2026#${rand}`;
    setFormData((prev) => ({ ...prev, password: pwd }));
  };

  // Assign Role Modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [roleForm, setRoleForm] = useState({
    role: 'EMPLOYEE',
    employeeId: '',
    status: 'ACTIVE',
  });

  useEffect(() => {
    fetchUsers();
    fetchEmployees();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get('/auth/users');
      if (res.data.success) setUsers(res.data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await API.get('/employees');
      if (res.data.success) setEmployees(res.data.employees);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/users', formData);
      if (res.data.success) {
        addToast(res.data.message || `User account created & credentials mailed to ${res.data.mailedTo}!`, 'success');
        setShowCreateModal(false);
        setFormData({
          email: '',
          password: '',
          role: 'EMPLOYEE',
          employeeId: '',
          personalEmail: '',
        });
        fetchUsers();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create user', 'error');
    }
  };


  const openAssignModal = (u) => {
    setSelectedUser(u);
    setRoleForm({
      role: u.role === 'UNASSIGNED' ? 'EMPLOYEE' : u.role,
      employeeId: u.employee?._id || '',
      status: u.status === 'PENDING_APPROVAL' ? 'ACTIVE' : u.status,
    });
  };

  const handleAssignRole = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      const res = await API.put(`/auth/users/${selectedUser._id}/role`, roleForm);
      if (res.data.success) {
        addToast(`Role assigned & account approved for ${selectedUser.email}!`, 'success');
        setSelectedUser(null);
        fetchUsers();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to assign role', 'error');
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      const res = await API.delete(`/auth/users/${userToDelete._id}`);
      if (res.data.success) {
        addToast(`User ${userToDelete.email} deleted successfully!`, 'success');
        setUserToDelete(null);
        fetchUsers();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete user', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-indigo-400" /> User & Role Control Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">Review unassigned registrations, approve accounts, assign system roles, and link employee profiles.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-indigo-600/20"
        >
          <UserPlus className="w-4 h-4" /> Create System User
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Email Account</th>
                <th className="p-4">Assigned Role</th>
                <th className="p-4">Linked Employee Profile</th>
                <th className="p-4">Account Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-800/40 transition">
                  <td className="p-4 font-bold text-white">{u.email}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                        u.role === 'ADMIN'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : u.role === 'HR_MANAGER'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : u.role === 'PAYROLL_USER'
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          : u.role === 'EMPLOYEE'
                          ? 'bg-slate-800 text-slate-300 border border-slate-700'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                      }`}
                    >
                      {u.role === 'UNASSIGNED' ? 'UNASSIGNED (PENDING)' : u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    {u.employee ? (
                      <span className="font-semibold text-slate-200">
                        {u.employee.firstName} {u.employee.lastName} ({u.employee.employeeId})
                      </span>
                    ) : (
                      <span className="text-slate-500 italic">No Employee Profile Linked</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        u.status === 'ACTIVE'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : u.status === 'PENDING_APPROVAL'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="p-4 text-right flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => openAssignModal(u)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition inline-flex items-center gap-1.5 ${
                        u.role === 'UNASSIGNED'
                          ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/20 font-bold'
                          : 'bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30'
                      }`}
                    >
                      <Shield className="w-3.5 h-3.5" />
                      {u.role === 'UNASSIGNED' ? 'Assign Role' : 'Role'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserToDelete(u)}
                      className="p-1.5 bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white rounded-xl border border-rose-500/20 transition"
                      title="Delete User Account"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


      {/* Assign Role & Link Employee Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-400" /> Assign Role & Approve Access
              </h3>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
              <div>Email: <span className="font-bold text-white">{selectedUser.email}</span></div>
              <div>Current Role: <span className="font-mono text-amber-400 font-bold">{selectedUser.role}</span></div>
            </div>

            <form onSubmit={handleAssignRole} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Assign Official System Role *</label>
                <select
                  required
                  value={roleForm.role}
                  onChange={(e) => setRoleForm({ ...roleForm, role: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold"
                >
                  <option value="EMPLOYEE">EMPLOYEE (Self-Service Profile)</option>
                  <option value="HR_MANAGER">HR_MANAGER (People Operations & Approvals)</option>
                  <option value="PAYROLL_USER">PAYROLL_USER (Payruns & Dispatches)</option>
                  <option value="ADMIN">ADMIN (Full System Management)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Link Employee Profile (Optional)</label>
                <select
                  value={roleForm.employeeId}
                  onChange={(e) => setRoleForm({ ...roleForm, employeeId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                >
                  <option value="">No Employee Link</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Account Approval Status</label>
                <select
                  value={roleForm.status}
                  onChange={(e) => setRoleForm({ ...roleForm, status: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                >
                  <option value="ACTIVE">ACTIVE (Full Portal Access)</option>
                  <option value="INACTIVE">INACTIVE (Disabled Access)</option>
                  <option value="PENDING_APPROVAL">PENDING_APPROVAL (Restricted Access)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> Approve & Assign Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-400" /> Create Account & Mail Credentials
            </h3>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Work Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="john.doe@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-slate-400 font-semibold">Password *</label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold underline"
                  >
                    ⚡ Auto-Generate Password
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 pr-10 text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 transition focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 text-indigo-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Employee Personal Email (For Credential Dispatch) *</label>
                <input
                  type="email"
                  required
                  placeholder="employee.personal@gmail.com"
                  value={formData.personalEmail}
                  onChange={(e) => setFormData({ ...formData, personalEmail: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
                <p className="text-[10px] text-slate-500 mt-1">Credentials will be sent to this personal address.</p>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">System Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold"
                >
                  <option value="EMPLOYEE">EMPLOYEE (Self-Service)</option>
                  <option value="HR_MANAGER">HR_MANAGER (Operations & Approvals)</option>
                  <option value="PAYROLL_USER">PAYROLL_USER (Payroll & Payruns)</option>
                  <option value="ADMIN">ADMIN (Full Control)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Link Employee Profile (Optional)</label>
                <select
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                >
                  <option value="">No Employee Profile Link</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-indigo-950/40 border border-indigo-800/40 rounded-xl p-2.5 text-[11px] text-indigo-300">
                <span>📧 <strong>Credential Dispatch:</strong> Account login details will be instantly emailed to the personal mail and logged in Email Outbox.</span>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5">
                  <Mail className="w-4 h-4" /> Create & Mail Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete User Account</h3>
                <p className="text-xs text-slate-400">This action cannot be undone.</p>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
              <div>Account Email: <span className="font-bold text-white">{userToDelete.email}</span></div>
              <div>Current Role: <span className="font-mono text-indigo-300">{userToDelete.role}</span></div>
              {userToDelete.employee && (
                <div>Linked Employee: <span className="font-bold text-slate-200">{userToDelete.employee.firstName} {userToDelete.employee.lastName}</span></div>
              )}
            </div>

            <p className="text-xs text-slate-400">
              Are you sure you want to permanently delete this user account? The user will no longer be able to log in.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

