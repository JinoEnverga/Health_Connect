// src/pages/MyAppointments.jsx  ← REPLACE your existing file
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppointments } from '../context/AppointmentContext';
import {
  MdVideoCall, MdCalendarMonth, MdSchedule, MdCancel,
  MdAdd, MdRefresh,
} from 'react-icons/md';

const tabs = ['All', 'Upcoming', 'Completed', 'Cancelled'];

export default function MyAppointments() {
  const { appointments, cancelAppointment, fetchAppointments, isLoading } = useAppointments();
  const navigate    = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [cancelId, setCancelId]   = useState(null);

  const filtered = appointments.filter(a => {
    if (activeTab === 'All') return true;
    return a.status === activeTab.toLowerCase();
  });

  const counts = {
    All:       appointments.length,
    Upcoming:  appointments.filter(a => a.status === 'upcoming').length,
    Completed: appointments.filter(a => a.status === 'completed').length,
    Cancelled: appointments.filter(a => a.status === 'cancelled').length,
  };

  const handleCancel = async (id) => {
    await cancelAppointment(id);
    setCancelId(null);
  };

  const StatusBadge = ({ status }) => {
    const map    = { upcoming: 'status-upcoming', completed: 'status-completed', cancelled: 'status-cancelled' };
    const labels = { upcoming: 'Upcoming',        completed: 'Completed',        cancelled: 'Cancelled' };
    return <span className={map[status]}>{labels[status]}</span>;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-800">My Appointments</h1>
          <p className="text-slate-500 mt-1">Track and manage your scheduled consultations</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={fetchAppointments}
            className="btn-secondary flex items-center gap-2">
            <MdRefresh className={`text-xl ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => navigate('/book-appointment')} className="btn-primary flex items-center gap-2">
            <MdAdd className="text-xl" /> Book New
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-1.5 flex gap-1">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all duration-150 flex items-center justify-center gap-1.5 ${
              activeTab === tab
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}>
            {tab}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
              activeTab === tab ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
            }`}>{counts[tab]}</span>
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="card animate-pulse flex gap-4">
              <div className="w-12 h-12 bg-slate-200 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-slate-200 rounded w-1/2" />
                <div className="h-3 bg-slate-200 rounded w-1/3" />
                <div className="h-3 bg-slate-200 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <MdCalendarMonth className="text-5xl text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium text-lg">No {activeTab.toLowerCase()} appointments</p>
          {activeTab !== 'Cancelled' && (
            <button onClick={() => navigate('/book-appointment')} className="btn-primary mt-4 inline-flex">
              Book an Appointment
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(appt => (
            <div key={appt.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  appt.status === 'upcoming'  ? 'bg-primary-100' :
                  appt.status === 'completed' ? 'bg-teal-100'    : 'bg-slate-100'
                }`}>
                  <MdVideoCall className={`text-2xl ${
                    appt.status === 'upcoming'  ? 'text-primary-600' :
                    appt.status === 'completed' ? 'text-teal-600'    : 'text-slate-400'
                  }`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p className="font-semibold text-slate-800 text-base">{appt.doctor_name}</p>
                      <p className="text-sm text-primary-600 font-medium">{appt.specialization}</p>
                    </div>
                    <StatusBadge status={appt.status} />
                  </div>

                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-sm text-slate-500">
                      <MdCalendarMonth className="text-slate-400" />
                      {appt.date}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-slate-500">
                      <MdSchedule className="text-slate-400" />
                      {appt.time}
                    </div>
                  </div>

                  {appt.notes && (
                    <p className="text-sm text-slate-500 mt-2 line-clamp-2 bg-slate-50 rounded-lg px-3 py-2">
                      📋 {appt.notes}
                    </p>
                  )}

                  {appt.status === 'upcoming' && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => navigate('/teleconsultation', { state: { appointment: appt } })}
                        className="btn-primary py-2 px-4 text-sm flex items-center gap-1.5"
                      >
                        <MdVideoCall /> Join Consultation
                      </button>
                      <button
                        onClick={() => setCancelId(appt.id)}
                        className="btn-danger flex items-center gap-1.5"
                      >
                        <MdCancel /> Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MdCancel className="text-red-500 text-3xl" />
            </div>
            <h3 className="text-xl font-display font-bold text-slate-800 text-center mb-2">Cancel Appointment?</h3>
            <p className="text-slate-500 text-sm text-center mb-6">
              This action cannot be undone. Are you sure you want to cancel this appointment?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setCancelId(null)} className="btn-secondary flex-1">Keep It</button>
              <button onClick={() => handleCancel(cancelId)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors">
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
