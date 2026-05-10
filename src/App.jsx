// src/App.jsx  ← REPLACE your existing file
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider }        from './context/AuthContext';
import { AppointmentProvider } from './context/AppointmentContext';
import ProtectedRoute          from './components/ProtectedRoute';
import Layout                  from './components/Layout';

import Login           from './pages/Login';
import Register        from './pages/Register';
import Dashboard       from './pages/Dashboard';
import FindDoctors     from './pages/FindDoctors';
import BookAppointment from './pages/BookAppointment';
import MyAppointments  from './pages/MyAppointments';
import Teleconsultation from './pages/Teleconsultation';
import Profile         from './pages/Profile';
import AIScanner       from './pages/AIScanner';   // ← NEW

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>
      } />
      <Route path="/find-doctors" element={
        <ProtectedRoute><Layout><FindDoctors /></Layout></ProtectedRoute>
      } />
      <Route path="/book-appointment" element={
        <ProtectedRoute><Layout><BookAppointment /></Layout></ProtectedRoute>
      } />
      <Route path="/appointments" element={
        <ProtectedRoute><Layout><MyAppointments /></Layout></ProtectedRoute>
      } />
      <Route path="/teleconsultation" element={
        <ProtectedRoute><Layout><Teleconsultation /></Layout></ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>
      } />

      {/* ── NEW: AI Health Scanner ─────────────────────── */}
      <Route path="/ai-scanner" element={
        <ProtectedRoute><Layout><AIScanner /></Layout></ProtectedRoute>
      } />

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppointmentProvider>
          <AppRoutes />
        </AppointmentProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
