import React, { useState } from 'react';
import { User, Phone, Mail, Lock, Shield, CheckCircle, Save } from 'lucide-react';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.js';
import toast from 'react-hot-toast';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);

    try {
      const res = await api.put('/auth/profile', { name, phone });
      if (res.data?.success && res.data?.user) {
        updateUser(res.data.user);
        toast.success('Profile updated successfully!');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    setSavingPassword(true);

    try {
      const res = await api.put('/auth/password', { currentPassword, newPassword });
      if (res.data?.success) {
        toast.success('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b0f] text-neutral-100 py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-neutral-800 pb-4">
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
          <User className="w-6 h-6 text-[#e50914]" />
          Account Profile & Security
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Manage your personal details, cinema contact number, and login credentials
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Personal Details Form */}
        <div className="bg-[#16161d] rounded-2xl p-6 border border-neutral-800 space-y-5">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <h3 className="font-bold text-base text-white">Personal Information</h3>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-900">
              {user?.role}
            </span>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 pl-10 bg-neutral-900 text-sm text-neutral-200 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#e50914]"
                />
                <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Email Address (Account ID)
              </label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-4 py-2.5 pl-10 bg-neutral-950 text-sm text-neutral-500 rounded-xl border border-neutral-800 cursor-not-allowed"
                />
                <Mail className="w-4 h-4 text-neutral-600 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Mobile Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 pl-10 bg-neutral-900 text-sm text-neutral-200 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#e50914]"
                />
                <Phone className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="w-full py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-neutral-700"
            >
              {savingProfile ? 'Saving...' : (
                <>
                  <Save className="w-4 h-4" /> Save Profile Details
                </>
              )}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-[#16161d] rounded-2xl p-6 border border-neutral-800 space-y-5">
          <div className="border-b border-neutral-800 pb-3">
            <h3 className="font-bold text-base text-white">Security & Password</h3>
            <p className="text-[11px] text-neutral-400">Update your secret credentials</p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pl-10 bg-neutral-900 text-sm text-neutral-200 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#e50914]"
                />
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                New Password (min 6 characters)
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pl-10 bg-neutral-900 text-sm text-neutral-200 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#e50914]"
                />
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pl-10 bg-neutral-900 text-sm text-neutral-200 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#e50914]"
                />
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingPassword}
              className="w-full py-3 rounded-xl bg-[#e50914] hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-900/30 flex items-center justify-center gap-2"
            >
              {savingPassword ? 'Updating...' : (
                <>
                  <Lock className="w-4 h-4" /> Update Password
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
