// src/pages/Profile.jsx  ← REPLACE your existing file
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';
import {
  MdPerson, MdEdit, MdSave, MdClose, MdFavorite,
  MdLocalHospital, MdWarning, MdMedication, MdPhone,
  MdEmail, MdCake, MdLocationOn, MdBloodtype, MdHeight,
  MdMonitorWeight, MdCheckCircle, MdAdd, MdDelete,
} from 'react-icons/md';

const InfoRow = ({ icon: Icon, label, value, color = 'text-primary-500' }) => (
  <div className="flex items-start gap-3">
    <Icon className={`${color} text-xl flex-shrink-0 mt-0.5`} />
    <div>
      <p className="text-xs text-slate-400 font-medium">{label}</p>
      <p className="text-sm text-slate-800 font-medium">{value || '—'}</p>
    </div>
  </div>
);

export default function Profile() {
  const { user, profile, updateProfile } = useAuth();

  const [editing, setEditing] = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [saving,  setSaving]  = useState(false);

  // Editable personal fields
  const [form, setForm] = useState({
    full_name:         '',
    phone:             '',
    address:           '',
    emergency_contact: '',
    birth_date:        '',
    gender:            '',
    blood_type:        '',
    weight:            '',
    height:            '',
    bmi:               '',
  });

  // Medical history loaded separately
  const [medHistory, setMedHistory] = useState([]);
  const [allergies,  setAllergies]  = useState([]);
  const [medications, setMedications] = useState([]);

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      setForm({
        full_name:         profile.full_name         || '',
        phone:             profile.phone             || '',
        address:           profile.address           || '',
        emergency_contact: profile.emergency_contact || '',
        birth_date:        profile.birth_date        || '',
        gender:            profile.gender            || '',
        blood_type:        profile.blood_type        || '',
        weight:            profile.weight            || '',
        height:            profile.height            || '',
        bmi:               profile.bmi               || '',
      });
      setAllergies(profile.allergies    || []);
      setMedications(profile.medications || []);
    }
  }, [profile]);

  // Load medical history
  useEffect(() => {
    if (!user) return;
    supabase.from('medical_history')
      .select('*')
      .eq('patient_id', user.id)
      .order('diagnosed_date', { ascending: false })
      .then(({ data }) => { if (data) setMedHistory(data); });
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    await updateProfile({ ...form, allergies, medications });
    setSaving(false);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const displayName = form.full_name || user?.email?.split('@')[0] || 'Patient';
  const initials    = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  // ── Calculate age from birth_date ─────────────────────────
  const calcAge = (dateStr) => {
    if (!dateStr) return null;
    const diff = Date.now() - new Date(dateStr).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };
  const age = calcAge(form.birth_date);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-800">My Profile</h1>
          <p className="text-slate-500 mt-1">Manage your personal information and medical history</p>
        </div>
        {!editing ? (
          <button onClick={() => setEditing(true)} className="btn-secondary flex items-center gap-2">
            <MdEdit /> Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setEditing(false)} className="btn-danger flex items-center gap-2">
              <MdClose /> Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="btn-primary flex items-center gap-2 disabled:opacity-70">
              {saving ? (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              ) : <MdSave />}
              Save Changes
            </button>
          </div>
        )}
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-2xl px-5 py-3 flex items-center gap-2">
          <MdCheckCircle className="text-green-500 text-xl" />
          <span className="font-medium text-sm">Profile updated successfully!</span>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN */}
        <div className="space-y-5">
          {/* Avatar card */}
          <div className="card text-center">
            <div className="w-24 h-24 bg-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-4 text-white text-3xl font-display font-bold shadow-sm">
              {initials || <MdPerson className="text-4xl" />}
            </div>
            <h2 className="text-xl font-display font-bold text-slate-800">{displayName}</h2>
            <p className="text-primary-600 font-medium text-sm mt-0.5">Patient</p>
            <p className="text-slate-500 text-sm mt-0.5">{user?.email}</p>
            <div className="mt-4 flex justify-center gap-3">
              {age && (
                <>
                  <div className="text-center">
                    <p className="text-lg font-display font-bold text-slate-800">{age}</p>
                    <p className="text-xs text-slate-400">Age</p>
                  </div>
                  <div className="w-px bg-slate-200" />
                </>
              )}
              {form.blood_type && (
                <>
                  <div className="text-center">
                    <p className="text-lg font-display font-bold text-slate-800">{form.blood_type}</p>
                    <p className="text-xs text-slate-400">Blood Type</p>
                  </div>
                  <div className="w-px bg-slate-200" />
                </>
              )}
              {form.bmi && (
                <div className="text-center">
                  <p className="text-lg font-display font-bold text-slate-800">{form.bmi}</p>
                  <p className="text-xs text-slate-400">BMI</p>
                </div>
              )}
            </div>
          </div>

          {/* Vital stats */}
          <div className="card space-y-4">
            <h3 className="font-display font-semibold text-slate-700 flex items-center gap-2 text-sm">
              <MdFavorite className="text-rose-500" /> Vital Stats
            </h3>
            {editing ? (
              <div className="space-y-3">
                {[['height','Height','text-teal-500'], ['weight','Weight','text-teal-500'], ['bmi','BMI','text-primary-500'], ['blood_type','Blood Type','text-rose-500'], ['gender','Gender','text-primary-500']].map(([key, label]) => (
                  <div key={key}>
                    <label className="label">{label}</label>
                    <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      className="input-field" placeholder={label} />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <InfoRow icon={MdHeight}        label="Height"     value={form.height}     color="text-teal-500" />
                <InfoRow icon={MdMonitorWeight} label="Weight"     value={form.weight}     color="text-teal-500" />
                <InfoRow icon={MdBloodtype}     label="Blood Type" value={form.blood_type} color="text-rose-500" />
                <InfoRow icon={MdPerson}        label="Gender"     value={form.gender} />
              </>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-2 space-y-5">
          {/* Personal info */}
          <div className="card">
            <h3 className="font-display font-semibold text-slate-700 mb-5 flex items-center gap-2">
              <MdPerson className="text-primary-500 text-xl" /> Personal Information
            </h3>
            {editing ? (
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Full Name</label>
                    <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                      className="input-field" />
                  </div>
                  <div>
                    <label className="label">Phone Number</label>
                    <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      className="input-field" placeholder="+63 9XX XXX XXXX" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Date of Birth</label>
                    <input type="date" value={form.birth_date} onChange={e => setForm(f => ({ ...f, birth_date: e.target.value }))}
                      className="input-field" />
                  </div>
                  <div>
                    <label className="label">Gender</label>
                    <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                      className="input-field">
                      <option value="">— Select —</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                      <option>Prefer not to say</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">Home Address</label>
                  <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                    className="input-field" />
                </div>
                <div>
                  <label className="label">Emergency Contact</label>
                  <input value={form.emergency_contact} onChange={e => setForm(f => ({ ...f, emergency_contact: e.target.value }))}
                    className="input-field" placeholder="Name — +63 9XX XXX XXXX" />
                </div>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-5">
                <InfoRow icon={MdPerson}     label="Full Name"         value={form.full_name} />
                <InfoRow icon={MdEmail}      label="Email Address"     value={user?.email} />
                <InfoRow icon={MdPhone}      label="Phone Number"      value={form.phone} />
                <InfoRow icon={MdCake}       label="Date of Birth"     value={form.birth_date} />
                <InfoRow icon={MdLocationOn} label="Address"           value={form.address}           color="text-teal-500" />
                <InfoRow icon={MdPhone}      label="Emergency Contact" value={form.emergency_contact} color="text-rose-500" />
              </div>
            )}
          </div>

          {/* Medical history */}
          <div className="card">
            <h3 className="font-display font-semibold text-slate-700 mb-5 flex items-center gap-2">
              <MdLocalHospital className="text-primary-500 text-xl" /> Medical History
            </h3>
            {medHistory.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-4">No medical history recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {medHistory.map(item => (
                  <div key={item.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-800">{item.condition}</p>
                        <p className="text-xs text-slate-400 mt-0.5">Diagnosed: {item.diagnosed_date || '—'}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
                        item.status === 'Managed'  ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        item.status === 'Resolved' ? 'bg-green-50 text-green-700 border border-green-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>{item.status}</span>
                    </div>
                    {item.notes && (
                      <p className="text-sm text-slate-500 mt-2 leading-relaxed">{item.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Allergies & Medications */}
          <div className="grid sm:grid-cols-2 gap-5">
            {/* Allergies */}
            <div className="card">
              <h3 className="font-display font-semibold text-slate-700 mb-4 flex items-center gap-2 text-sm">
                <MdWarning className="text-amber-500 text-xl" /> Allergies
              </h3>
              <div className="space-y-2">
                {allergies.map((a, i) => (
                  <div key={i} className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                    <MdWarning className="text-amber-500 text-sm flex-shrink-0" />
                    <span className="text-sm text-amber-800 font-medium flex-1">{a}</span>
                    {editing && (
                      <button onClick={() => setAllergies(prev => prev.filter((_, idx) => idx !== i))}
                        className="text-red-400 hover:text-red-600 text-sm">
                        <MdDelete />
                      </button>
                    )}
                  </div>
                ))}
                {editing && (
                  <button onClick={() => {
                    const val = prompt('Enter allergy:');
                    if (val) setAllergies(prev => [...prev, val]);
                  }} className="w-full flex items-center justify-center gap-1 text-xs text-amber-600 border border-dashed border-amber-300 rounded-xl py-2 hover:bg-amber-50">
                    <MdAdd /> Add Allergy
                  </button>
                )}
                {allergies.length === 0 && !editing && (
                  <p className="text-slate-400 text-xs text-center py-2">No allergies recorded.</p>
                )}
              </div>
            </div>

            {/* Medications */}
            <div className="card">
              <h3 className="font-display font-semibold text-slate-700 mb-4 flex items-center gap-2 text-sm">
                <MdMedication className="text-teal-500 text-xl" /> Current Medications
              </h3>
              <div className="space-y-2">
                {medications.map((m, i) => (
                  <div key={i} className="flex items-start gap-2 bg-teal-50 border border-teal-100 rounded-xl px-3 py-2">
                    <MdMedication className="text-teal-500 text-sm flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-teal-800 font-medium leading-snug flex-1">{m}</span>
                    {editing && (
                      <button onClick={() => setMedications(prev => prev.filter((_, idx) => idx !== i))}
                        className="text-red-400 hover:text-red-600 text-sm">
                        <MdDelete />
                      </button>
                    )}
                  </div>
                ))}
                {editing && (
                  <button onClick={() => {
                    const val = prompt('Enter medication (e.g. Amlodipine 5mg — once daily):');
                    if (val) setMedications(prev => [...prev, val]);
                  }} className="w-full flex items-center justify-center gap-1 text-xs text-teal-600 border border-dashed border-teal-300 rounded-xl py-2 hover:bg-teal-50">
                    <MdAdd /> Add Medication
                  </button>
                )}
                {medications.length === 0 && !editing && (
                  <p className="text-slate-400 text-xs text-center py-2">No medications recorded.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
