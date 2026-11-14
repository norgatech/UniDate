'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAdminAuth } from '@/context/AuthContext';
import { recordAuditLog } from '@/lib/audit';
import { UniversityRecord, FacultyRecord, DepartmentRecord } from '@/types/admin';
import {
  GraduationCap,
  Plus,
  Search,
  Building,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  ChevronRight,
  BookOpen,
  Loader2,
  ExternalLink,
} from 'lucide-react';

export default function UniversitiesPage() {
  const { admin } = useAdminAuth();
  const supabase = createClient();

  const [universities, setUniversities] = useState<UniversityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Add/Edit modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUni, setEditingUni] = useState<UniversityRecord | null>(null);
  const [uniForm, setUniForm] = useState({
    name: '',
    short_name: '',
    country: 'Ghana',
    state_province: '',
    domain: '',
  });
  const [actionLoading, setActionLoading] = useState(false);

  // Faculty and Department drawer
  const [selectedUni, setSelectedUni] = useState<UniversityRecord | null>(null);
  const [faculties, setFaculties] = useState<FacultyRecord[]>([]);
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);
  const [newFacultyName, setNewFacultyName] = useState('');
  const [newDeptName, setNewDeptName] = useState('');
  const [selectedFacultyId, setSelectedFacultyId] = useState<string | null>(null);

  const fetchUniversities = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('universities')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching universities:', error);
      } else if (data) {
        setUniversities(data as UniversityRecord[]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniversities();
  }, []);

  const handleSaveUniversity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admin || !uniForm.name.trim()) return;
    setActionLoading(true);

    try {
      if (editingUni) {
        // Update
        const { error } = await supabase
          .from('universities')
          .update({
            name: uniForm.name.trim(),
            short_name: uniForm.short_name.trim() || null,
            country: uniForm.country.trim(),
            state_province: uniForm.state_province.trim() || null,
            domain: uniForm.domain.trim() || null,
          })
          .eq('id', editingUni.id);

        if (error) throw error;

        await recordAuditLog({
          adminId: admin.id,
          adminEmail: admin.email,
          action: 'UPDATE_UNIVERSITY',
          targetTable: 'universities',
          targetId: editingUni.id,
          details: uniForm,
        });

        setUniversities((prev) =>
          prev.map((u) => (u.id === editingUni.id ? { ...u, ...uniForm } : u))
        );
      } else {
        // Create
        const { data, error } = await supabase
          .from('universities')
          .insert([
            {
              name: uniForm.name.trim(),
              short_name: uniForm.short_name.trim() || null,
              country: uniForm.country.trim(),
              state_province: uniForm.state_province.trim() || null,
              domain: uniForm.domain.trim() || null,
              is_active: true,
            },
          ])
          .select()
          .single();

        if (error) throw error;

        await recordAuditLog({
          adminId: admin.id,
          adminEmail: admin.email,
          action: 'CREATE_UNIVERSITY',
          targetTable: 'universities',
          targetId: data?.id,
          details: uniForm,
        });

        if (data) setUniversities((prev) => [...prev, data]);
      }

      setShowAddModal(false);
      setEditingUni(null);
      setUniForm({ name: '', short_name: '', country: 'Ghana', state_province: '', domain: '' });
    } catch (err: any) {
      alert('Save failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLoadAcademicStructure = async (uni: UniversityRecord) => {
    setSelectedUni(uni);
    setSelectedFacultyId(null);
    try {
      const { data: facs } = await supabase
        .from('faculties')
        .select('*')
        .eq('university_id', uni.id)
        .order('name');
      if (facs) setFaculties(facs);

      const { data: depts } = await supabase
        .from('departments')
        .select('*')
        .order('name');
      if (depts) setDepartments(depts);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddFaculty = async () => {
    if (!selectedUni || !newFacultyName.trim() || !admin) return;
    try {
      const { data, error } = await supabase
        .from('faculties')
        .insert([
          {
            university_id: selectedUni.id,
            name: newFacultyName.trim(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      await recordAuditLog({
        adminId: admin.id,
        adminEmail: admin.email,
        action: 'ADD_FACULTY',
        targetTable: 'faculties',
        targetId: data?.id,
        details: { university_id: selectedUni.id, faculty_name: newFacultyName.trim() },
      });

      if (data) setFaculties((prev) => [...prev, data]);
      setNewFacultyName('');
    } catch (err: any) {
      alert('Error adding faculty: ' + err.message);
    }
  };

  const filteredUnis = universities.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.short_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">University Directory & Campuses</h2>
          <p className="text-sm text-slate-400">
            Configure partner universities, academic faculties, departments, and campus coverage.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingUni(null);
            setUniForm({ name: '', short_name: '', country: 'Ghana', state_province: '', domain: '' });
            setShowAddModal(true);
          }}
          className="flex items-center space-x-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add University</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by university name, acronym, or country..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-slate-800 bg-slate-900/60 py-2 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
        />
      </div>

      {/* Universities Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-500 mb-2" />
            Loading universities catalog...
          </div>
        ) : filteredUnis.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500">
            No universities found.
          </div>
        ) : (
          filteredUnis.map((uni) => (
            <div
              key={uni.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition-all hover:border-slate-700"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold">
                    {uni.short_name || uni.name.charAt(0)}
                  </div>
                  <button
                    onClick={() => {
                      setEditingUni(uni);
                      setUniForm({
                        name: uni.name,
                        short_name: uni.short_name || '',
                        country: uni.country,
                        state_province: uni.state_province || '',
                        domain: uni.domain || '',
                      });
                      setShowAddModal(true);
                    }}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </div>

                <h3 className="mt-4 text-base font-bold text-white line-clamp-1">{uni.name}</h3>
                <p className="text-xs text-slate-400">
                  {uni.country} {uni.state_province ? `• ${uni.state_province}` : ''}
                </p>

                {uni.domain && (
                  <p className="mt-2 text-xs font-mono text-indigo-400">{uni.domain}</p>
                )}
              </div>

              <div className="mt-5 border-t border-slate-800/80 pt-4 flex items-center justify-between">
                <button
                  onClick={() => handleLoadAcademicStructure(uni)}
                  className="flex items-center space-x-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Faculties & Courses</span>
                </button>
                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
                  Active Campus
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit University Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0E131F] p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white">
              {editingUni ? 'Edit University' : 'Add New University'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Configure institution information for student onboarding & matriculation.
            </p>

            <form onSubmit={handleSaveUniversity} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Full University Name
                </label>
                <input
                  type="text"
                  required
                  value={uniForm.name}
                  onChange={(e) => setUniForm({ ...uniForm, name: e.target.value })}
                  placeholder="e.g. University of Ghana"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Acronym / Short Name
                </label>
                <input
                  type="text"
                  value={uniForm.short_name}
                  onChange={(e) => setUniForm({ ...uniForm, short_name: e.target.value })}
                  placeholder="e.g. UG / Legon"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    required
                    value={uniForm.country}
                    onChange={(e) => setUniForm({ ...uniForm, country: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    State / Region
                  </label>
                  <input
                    type="text"
                    value={uniForm.state_province}
                    onChange={(e) => setUniForm({ ...uniForm, state_province: e.target.value })}
                    placeholder="e.g. Greater Accra"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Official Email Domain
                </label>
                <input
                  type="text"
                  value={uniForm.domain}
                  onChange={(e) => setUniForm({ ...uniForm, domain: e.target.value })}
                  placeholder="e.g. ug.edu.gh"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
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
                  <span>{editingUni ? 'Update Institution' : 'Add Institution'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Academic Structure Drawer */}
      {selectedUni && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="relative h-full w-full max-w-xl border-l border-slate-800 bg-[#0E131F] p-6 shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div>
                <h3 className="font-bold text-white text-lg">{selectedUni.name}</h3>
                <p className="text-xs text-slate-400">Academic Structure & Faculties</p>
              </div>
              <button
                onClick={() => setSelectedUni(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Add Faculty Input */}
            <div className="flex items-center space-x-2 mb-6">
              <input
                type="text"
                placeholder="New Faculty Name (e.g. Faculty of Engineering)"
                value={newFacultyName}
                onChange={(e) => setNewFacultyName(e.target.value)}
                className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                onClick={handleAddFaculty}
                disabled={!newFacultyName.trim()}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                Add
              </button>
            </div>

            {/* Faculties List */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase font-semibold tracking-wider text-slate-400">
                Registered Faculties ({faculties.length})
              </h4>
              {faculties.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">
                  No faculties registered yet for this university.
                </p>
              ) : (
                faculties.map((fac) => (
                  <div
                    key={fac.id}
                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 text-sm"
                  >
                    <div className="flex items-center space-x-2.5">
                      <BookOpen className="h-4 w-4 text-indigo-400" />
                      <span className="font-medium text-white">{fac.name}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

