'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAdminAuth } from '@/context/AuthContext';
import { recordAuditLog } from '@/lib/audit';
import { InterestRecord } from '@/types/admin';
import {
  Heart,
  Plus,
  Search,
  Tag,
  Edit2,
  Trash2,
  CheckCircle,
  Archive,
  Loader2,
  Sparkles,
} from 'lucide-react';

const CATEGORIES = [
  'All Categories',
  'Academic & Career',
  'Arts & Culture',
  'Sports & Fitness',
  'Music & Concerts',
  'Entertainment & Gaming',
  'Food & Culinary',
  'Campus Life',
  'Lifestyle & Travel',
];

export default function InterestsPage() {
  const { admin } = useAdminAuth();
  const supabase = createClient();

  const [interests, setInterests] = useState<InterestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');

  // Add/Edit modal state
  const [showModal, setShowModal] = useState(false);
  const [editingInterest, setEditingInterest] = useState<InterestRecord | null>(null);
  const [form, setForm] = useState({
    name: '',
    category: 'Campus Life',
    icon: '✨',
  });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchInterests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('interests')
        .select('*')
        .order('category', { ascending: true });

      if (error) {
        console.error('Error fetching interests:', error);
      } else if (data) {
        setInterests(data as InterestRecord[]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterests();
  }, []);

  const handleSaveInterest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admin || !form.name.trim()) return;
    setActionLoading(true);

    try {
      if (editingInterest) {
        const { error } = await supabase
          .from('interests')
          .update({
            name: form.name.trim(),
            category: form.category,
            icon: form.icon.trim() || null,
          })
          .eq('id', editingInterest.id);

        if (error) throw error;

        await recordAuditLog({
          adminId: admin.id,
          adminEmail: admin.email,
          action: 'UPDATE_INTEREST',
          targetTable: 'interests',
          targetId: editingInterest.id,
          details: form,
        });

        setInterests((prev) =>
          prev.map((i) => (i.id === editingInterest.id ? { ...i, ...form } : i))
        );
      } else {
        const { data, error } = await supabase
          .from('interests')
          .insert([
            {
              name: form.name.trim(),
              category: form.category,
              icon: form.icon.trim() || null,
              is_active: true,
            },
          ])
          .select()
          .single();

        if (error) throw error;

        await recordAuditLog({
          adminId: admin.id,
          adminEmail: admin.email,
          action: 'CREATE_INTEREST',
          targetTable: 'interests',
          targetId: data?.id,
          details: form,
        });

        if (data) setInterests((prev) => [...prev, data]);
      }

      setShowModal(false);
      setEditingInterest(null);
      setForm({ name: '', category: 'Campus Life', icon: '✨' });
    } catch (err: any) {
      alert('Save failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (interest: InterestRecord) => {
    if (!admin) return;
    const nextState = !interest.is_active;

    try {
      const { error } = await supabase
        .from('interests')
        .update({ is_active: nextState })
        .eq('id', interest.id);

      if (error) throw error;

      await recordAuditLog({
        adminId: admin.id,
        adminEmail: admin.email,
        action: nextState ? 'ACTIVATE_INTEREST' : 'ARCHIVE_INTEREST',
        targetTable: 'interests',
        targetId: interest.id,
        details: { name: interest.name, is_active: nextState },
      });

      setInterests((prev) =>
        prev.map((i) => (i.id === interest.id ? { ...i, is_active: nextState } : i))
      );
    } catch (err: any) {
      alert('Toggle failed: ' + err.message);
    }
  };

  const filteredInterests = interests.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === 'All Categories' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Student Interests Catalog</h2>
          <p className="text-sm text-slate-400">
            Curate passion tags, hobbies, and social discovery filters across campus profiles.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingInterest(null);
            setForm({ name: '', category: 'Campus Life', icon: '✨' });
            setShowModal(true);
          }}
          className="flex items-center space-x-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Interest Tag</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search interest tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-700/80 bg-slate-950 py-2 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-xl border border-slate-700/80 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Interests Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-500 mb-2" />
            Loading interests catalog...
          </div>
        ) : filteredInterests.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500">
            No interests match your criteria.
          </div>
        ) : (
          filteredInterests.map((interest) => (
            <div
              key={interest.id}
              className={`flex flex-col justify-between rounded-xl border p-4 transition-all ${
                interest.is_active
                  ? 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                  : 'border-slate-800/40 bg-slate-950/40 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{interest.icon || '🏷️'}</span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        setEditingInterest(interest);
                        setForm({
                          name: interest.name,
                          category: interest.category,
                          icon: interest.icon || '✨',
                        });
                        setShowModal(true);
                      }}
                      className="rounded p-1 text-slate-400 hover:text-white"
                      title="Edit"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(interest)}
                      className={`rounded p-1 ${
                        interest.is_active
                          ? 'text-slate-400 hover:text-amber-400'
                          : 'text-emerald-400 hover:text-emerald-300'
                      }`}
                      title={interest.is_active ? 'Archive' : 'Activate'}
                    >
                      {interest.is_active ? (
                        <Archive className="h-3.5 w-3.5" />
                      ) : (
                        <CheckCircle className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <p className="font-semibold text-white text-sm line-clamp-1">{interest.name}</p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{interest.category}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                <span>{interest.is_active ? 'Active' : 'Archived'}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Interest Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-[#0E131F] p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white">
              {editingInterest ? 'Edit Interest Tag' : 'Create Interest Tag'}
            </h3>

            <form onSubmit={handleSaveInterest} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Tag Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Afrobeat, Photography"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Emoji Icon
                </label>
                <input
                  type="text"
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  placeholder="e.g. 🎧, ⚽, 💻"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  {CATEGORIES.filter((c) => c !== 'All Categories').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 flex items-center space-x-1.5"
                >
                  {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>Save Tag</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

