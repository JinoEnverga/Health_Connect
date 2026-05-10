// src/pages/Dashboard.jsx  ← REPLACE your existing file
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppointments } from '../context/AppointmentContext';
import {
  MdSearch, MdCalendarMonth, MdVideoCall, MdFavorite,
  MdArrowForward, MdSchedule, MdCheckCircle, MdLocalHospital,
  MdHealthAndSafety, MdTrendingUp,
} from 'react-icons/md';

const QuickAction = ({ icon: Icon, label, desc, color, onClick }) => (
  <button onClick={onClick}
    className="card hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left group cursor-pointer">
    <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-3 shadow-sm group-hover:scale-105 transition-transform`}>
      <Icon className="text-white text-2xl" />
    </div>
    <p className="font-semibold text-slate-800 text-base">{label}</p>
    <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
  </button>
);

const StatCard = ({ icon: Icon, label, value, color, subtext }) => (
  <div className="card flex items-center gap-4">
    <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
      <Icon className="text-white text-xl" />
    </div>
    <div>
      <p className="text-2xl font-display font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
      {subtext && <p className="text-xs text-teal-600 font-medium mt-0.5">{subtext}</p>}
    </div>
  </div>
);

export default function Dashboard() {
  const { user, profile } = useAuth();
  const { appointments, upcomingAppointments } = useAppointments();
  const navigate = useNavigate();

  const completed = appointments.filter(a => a.status === 'completed').length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Get the display name: from profile table, or from Supabase auth metadata, or fallback
  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Patient';

  const nextAppt = upcomingAppointments[0];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-3xl p-6 lg:p-8 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-full opacity-10">
          <MdLocalHospital className="absolute right-4 top-4 text-9xl" />
          <MdFavorite className="absolute right-20 bottom-4 text-6xl" />
        </div>
        <div className="relative">
          <p className="text-primary-200 text-sm font-medium mb-1">{greeting} 👋</p>
          <h1 className="text-2xl lg:text-3xl font-display font-bold mb-2">{displayName}</h1>
          <p className="text-primary-100 text-sm max-w-md">
            Your health is our priority. Stay on top of your appointments and consultations.
          </p>
          {nextAppt && (
            <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 inline-flex items-center gap-3 border border-white/20">
              <MdSchedule className="text-primary-200 text-xl flex-shrink-0" />
              <div>
                <p className="text-xs text-primary-200">Next appointment</p>
                <p className="text-sm font-semibold text-white">
                  {nextAppt.doctor_name} — {nextAppt.date} at {nextAppt.time}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={MdCalendarMonth} label="Upcoming"   value={upcomingAppointments.length} color="bg-primary-500" />
        <StatCard icon={MdCheckCircle}   label="Completed"  value={completed}                    color="bg-teal-500"    subtext="All time" />
        <StatCard icon={MdLocalHospital} label="Doctors"    value="8"                            color="bg-purple-500"  subtext="Available now" />
        <StatCard icon={MdHealthAndSafety} label="Health Score" value="87"                       color="bg-green-500"   subtext="Good" />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-display font-bold text-slate-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction icon={MdSearch}        label="Find a Doctor"    desc="Search specialists"  color="bg-primary-500" onClick={() => navigate('/find-doctors')} />
          <QuickAction icon={MdCalendarMonth} label="Book Appointment" desc="Schedule a visit"    color="bg-teal-500"    onClick={() => navigate('/book-appointment')} />
          <QuickAction icon={MdVideoCall}     label="Start Teleconsult" desc="Video consultation" color="bg-purple-500"  onClick={() => navigate('/teleconsultation')} />
          <QuickAction icon={MdTrendingUp}    label="My Records"       desc="Health history"      color="bg-amber-500"   onClick={() => navigate('/profile')} />
        </div>
      </div>

      {/* Upcoming appointments list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display font-bold text-slate-800">Upcoming Appointments</h2>
          <button onClick={() => navigate('/appointments')}
            className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-semibold">
            View all <MdArrowForward />
          </button>
        </div>

        {upcomingAppointments.length === 0 ? (
          <div className="card text-center py-12">
            <MdCalendarMonth className="text-5xl text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No upcoming appointments</p>
            <button onClick={() => navigate('/book-appointment')} className="btn-primary mt-4 inline-flex">
              Book an Appointment
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingAppointments.slice(0, 3).map(appt => (
              <div key={appt.id} className="card flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MdVideoCall className="text-primary-600 text-2xl" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800">{appt.doctor_name}</p>
                  <p className="text-sm text-slate-500">{appt.specialization}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-slate-700">{appt.date}</p>
                  <p className="text-xs text-slate-500">{appt.time}</p>
                </div>
                <span className="status-upcoming">Upcoming</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Health tip */}
      <div className="bg-gradient-to-r from-teal-50 to-teal-100 border border-teal-200 rounded-2xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <MdFavorite className="text-white text-lg" />
        </div>
        <div>
          <p className="font-semibold text-teal-800 text-sm">Daily Health Tip</p>
          <p className="text-teal-700 text-sm mt-0.5">
            Staying hydrated improves cardiovascular function. Aim for 8 glasses of water daily
            and maintain regular check-ups with your cardiologist.
          </p>
        </div>
      </div>
    </div>
  );
}
