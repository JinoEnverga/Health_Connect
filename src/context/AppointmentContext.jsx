// src/context/AppointmentContext.jsx  ← REPLACE your existing file
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { useAuth } from './AuthContext';

const AppointmentContext = createContext(null);

export function AppointmentProvider({ children }) {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load appointments for the logged-in user
  const fetchAppointments = useCallback(async () => {
    if (!user) { setAppointments([]); return; }
    setIsLoading(true);
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', user.id)
      .order('date', { ascending: false });
    if (!error) setAppointments(data || []);
    setIsLoading(false);
  }, [user]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  // BOOK a new appointment
  const bookAppointment = async (appt) => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        patient_id:    user.id,
        doctor_id:     appt.doctorId,
        doctor_name:   appt.doctorName,
        specialization: appt.specialization,
        date:          appt.date,
        time:          appt.time,
        notes:         appt.notes || '',
        status:        'upcoming',
        type:          'teleconsultation',
      })
      .select()
      .single();
    if (!error && data) {
      setAppointments(prev => [data, ...prev]);
      return data;
    }
    return null;
  };

  // CANCEL an appointment
  const cancelAppointment = async (id) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', id);
    if (!error) {
      setAppointments(prev =>
        prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a)
      );
    }
  };

  const upcomingAppointments = appointments.filter(a => a.status === 'upcoming');

  return (
    <AppointmentContext.Provider value={{
      appointments,
      upcomingAppointments,
      bookAppointment,
      cancelAppointment,
      fetchAppointments,
      isLoading,
    }}>
      {children}
    </AppointmentContext.Provider>
  );
}

export const useAppointments = () => useContext(AppointmentContext);
