// src/pages/BookAppointment.jsx  ← REPLACE your existing file
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAppointments } from '../context/AppointmentContext';
import {
  MdCalendarMonth, MdSchedule, MdPerson, MdNotes,
  MdCheckCircle, MdArrowBack, MdStar, MdVerified,
} from 'react-icons/md';

export default function BookAppointment() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { bookAppointment } = useAppointments();
  const preselected = location.state?.doctor;

  const [doctors, setDoctors]     = useState([]);
  const [form, setForm]           = useState({
    doctorId: preselected?.id || '',
    date:     '',
    time:     '',
    notes:    '',
  });
  const [errors, setErrors]       = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [bookedAppt, setBookedAppt] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load doctors for the dropdown
  useEffect(() => {
    supabase.from('doctors').select('*').order('name').then(({ data }) => {
      if (data) setDoctors(data);
    });
  }, []);

  const selectedDoctor =
    doctors.find(d => d.id === Number(form.doctorId)) || preselected;

  const today = new Date().toISOString().split('T')[0];

  const validate = () => {
    const e = {};
    if (!form.doctorId) e.doctorId = 'Please select a doctor.';
    if (!form.date)     e.date     = 'Please select a date.';
    if (!form.time)     e.time     = 'Please select a time.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setIsLoading(true);
    const doc  = selectedDoctor;
    const appt = await bookAppointment({
      doctorId:      doc.id,
      doctorName:    doc.name,
      specialization: doc.specialization,
      date:          form.date,
      time:          form.time,
      notes:         form.notes,
    });
    setIsLoading(false);
    if (appt) {
      setBookedAppt(appt);
      setSubmitted(true);
    }
  };

  const set = (field) => (e) => {
    const val = e.target.value;
    setForm(f => ({ ...f, [field]: val, ...(field === 'doctorId' ? { time: '' } : {}) }));
    setErrors(er => ({ ...er, [field]: '' }));
  };

  // ── Success screen ─────────────────────────────────────────
  if (submitted && bookedAppt) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="card text-center py-12 px-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MdCheckCircle className="text-green-500 text-5xl" />
          </div>
          <h2 className="text-2xl font-display font-bold text-slate-800 mb-2">Appointment Booked!</h2>
          <p className="text-slate-500 mb-6">Your appointment has been successfully scheduled.</p>
          <div className="bg-slate-50 rounded-2xl p-5 text-left space-y-3 mb-8">
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Doctor</span>
              <span className="text-sm font-semibold text-slate-800">{bookedAppt.doctor_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Specialization</span>
              <span className="text-sm font-semibold text-slate-800">{bookedAppt.specialization}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Date</span>
              <span className="text-sm font-semibold text-slate-800">{bookedAppt.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Time</span>
              <span className="text-sm font-semibold text-slate-800">{bookedAppt.time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Type</span>
              <span className="text-sm font-semibold text-teal-600">Teleconsultation</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/appointments')} className="btn-primary flex-1">
              View Appointments
            </button>
            <button onClick={() => {
              setSubmitted(false);
              setForm({ doctorId: '', date: '', time: '', notes: '' });
              setBookedAppt(null);
            }} className="btn-secondary flex-1">
              Book Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Booking form ───────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
          <MdArrowBack className="text-2xl text-slate-600" />
        </button>
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-800">Book Appointment</h1>
          <p className="text-slate-500 text-sm">Schedule a teleconsultation with your doctor</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Doctor Selection */}
        <div className="card space-y-4">
          <h2 className="font-display font-semibold text-slate-700 flex items-center gap-2">
            <MdPerson className="text-primary-500 text-xl" /> Select Doctor
          </h2>
          <div>
            <label className="label">Doctor</label>
            <select value={form.doctorId} onChange={set('doctorId')}
              className={`input-field ${errors.doctorId ? 'border-red-400' : ''}`}>
              <option value="">— Choose a doctor —</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>{d.name} — {d.specialization}</option>
              ))}
            </select>
            {errors.doctorId && <p className="text-red-500 text-xs mt-1">{errors.doctorId}</p>}
          </div>

          {selectedDoctor && (
            <div className="bg-primary-50 border border-primary-100 rounded-2xl p-4 flex items-center gap-4">
              <div className={`w-12 h-12 ${selectedDoctor.avatar_color || selectedDoctor.avatarColor} rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0`}>
                {selectedDoctor.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <p className="font-semibold text-slate-800">{selectedDoctor.name}</p>
                  <MdVerified className="text-primary-500 text-sm" />
                </div>
                <p className="text-sm text-primary-600">{selectedDoctor.specialization}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <MdStar className="text-amber-400 text-sm" />
                  <span className="text-xs text-slate-600 font-medium">
                    {selectedDoctor.rating} · {selectedDoctor.fee} per session
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Date & Time */}
        <div className="card space-y-4">
          <h2 className="font-display font-semibold text-slate-700 flex items-center gap-2">
            <MdCalendarMonth className="text-primary-500 text-xl" /> Select Date & Time
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Date</label>
              <input type="date" value={form.date} min={today}
                onChange={set('date')}
                className={`input-field ${errors.date ? 'border-red-400' : ''}`} />
              {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
            </div>
            <div>
              <label className="label">Time Slot</label>
              <select value={form.time} onChange={set('time')}
                className={`input-field ${errors.time ? 'border-red-400' : ''}`}
                disabled={!selectedDoctor}>
                <option value="">— Select time —</option>
                {(selectedDoctor?.available_slots || selectedDoctor?.availableSlots || []).map(t => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time}</p>}
            </div>
          </div>
          {form.date && form.time && (
            <div className="flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-xl px-4 py-2.5">
              <MdSchedule className="text-teal-600" />
              <span className="text-sm text-teal-700 font-medium">
                Scheduled: {form.date} at {form.time}
              </span>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="card space-y-4">
          <h2 className="font-display font-semibold text-slate-700 flex items-center gap-2">
            <MdNotes className="text-primary-500 text-xl" /> Appointment Notes
          </h2>
          <div>
            <label className="label">Describe your concern <span className="text-slate-400 font-normal">(optional)</span></label>
            <textarea value={form.notes} onChange={set('notes')} rows={3}
              placeholder="e.g., Persistent headache for the past 3 days, mild fever…"
              className="input-field resize-none" />
            <p className="text-xs text-slate-400 mt-1">{form.notes.length}/500 characters</p>
          </div>
        </div>

        <button type="submit" disabled={isLoading}
          className="btn-primary w-full flex items-center justify-center gap-2 text-lg py-4 disabled:opacity-70 disabled:cursor-not-allowed">
          {isLoading ? (
            <>
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Booking…
            </>
          ) : (
            <><MdCheckCircle className="text-xl" /> Confirm Appointment</>
          )}
        </button>
      </form>
    </div>
  );
}
