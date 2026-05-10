// src/components/Layout.jsx  ← REPLACE your existing file
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  MdDashboard, MdSearch, MdCalendarMonth, MdVideoCall,
  MdPerson, MdLogout, MdMenu, MdClose, MdLocalHospital,
  MdNotifications, MdAutoAwesome,
} from 'react-icons/md';
import { useAppointments } from '../context/AppointmentContext';

const navItems = [
  { to: '/dashboard',        icon: MdDashboard,    label: 'Dashboard' },
  { to: '/find-doctors',     icon: MdSearch,       label: 'Find Doctors' },
  { to: '/appointments',     icon: MdCalendarMonth,label: 'My Appointments' },
  { to: '/teleconsultation', icon: MdVideoCall,    label: 'Teleconsultation' },
  { to: '/ai-scanner',       icon: MdAutoAwesome,  label: 'AI Scanner',  isNew: true },  // ← NEW
  { to: '/profile',          icon: MdPerson,       label: 'My Profile' },
];

export default function Layout({ children }) {
  const { user, profile, logout } = useAuth();
  const { upcomingAppointments }  = useAppointments();
  const navigate     = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  // Display name from profile or auth metadata
  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Patient';

  const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-sm">
            <MdLocalHospital className="text-white text-xl" />
          </div>
          <div>
            <p className="font-display font-bold text-slate-800 text-lg leading-none">Health</p>
            <p className="font-display font-bold text-primary-600 text-lg leading-none">Connect</p>
          </div>
        </div>
      </div>

      {/* User card */}
      <div className="px-4 py-4 mx-4 mt-4 bg-primary-50 rounded-2xl border border-primary-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {initials || 'P'}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 text-sm truncate">{displayName}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-3">Menu</p>
        {navItems.map(({ to, icon: Icon, label, isNew }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150 group text-sm font-medium ${
                isActive
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`text-xl flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <span className="flex-1">{label}</span>

                {/* Appointment count badge */}
                {label === 'My Appointments' && upcomingAppointments.length > 0 && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-white text-primary-600' : 'bg-primary-100 text-primary-700'}`}>
                    {upcomingAppointments.length}
                  </span>
                )}

                {/* NEW badge for AI Scanner */}
                {isNew && (
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${isActive ? 'bg-white/20 text-white' : 'bg-teal-100 text-teal-700'}`}>
                    AI
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-6">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-150 text-sm font-medium group"
        >
          <MdLogout className="text-xl text-slate-400 group-hover:text-red-500" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-100 fixed top-0 left-0 h-full z-30 shadow-sm">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-72 bg-white h-full shadow-2xl flex flex-col z-10">
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 p-2 rounded-xl hover:bg-slate-100 z-10">
              <MdClose className="text-2xl text-slate-600" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-100 px-4 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <MdMenu className="text-2xl text-slate-600" />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors">
              <MdNotifications className="text-2xl text-slate-500" />
              {upcomingAppointments.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full" />
              )}
            </button>
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
              {initials || 'P'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 page-enter">
          {children}
        </main>
      </div>
    </div>
  );
}
