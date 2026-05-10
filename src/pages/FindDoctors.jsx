// src/pages/FindDoctors.jsx  ← REPLACE your existing file
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import {
  MdSearch, MdStar, MdWorkHistory, MdVerified,
  MdCalendarMonth, MdFilterList,
} from 'react-icons/md';

const DoctorCard = ({ doctor, onBook }) => (
  <div className="card hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-4">
    <div className="flex items-start gap-4">
      <div className={`w-14 h-14 ${doctor.avatar_color} rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-sm`}>
        {doctor.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold text-slate-800 text-base">{doctor.name}</h3>
          <MdVerified className="text-primary-500 text-base flex-shrink-0" title="Verified Doctor" />
        </div>
        <p className="text-sm text-primary-600 font-medium">{doctor.specialization}</p>
        <p className="text-xs text-slate-500 truncate">{doctor.hospital}</p>
      </div>
      <div className="flex-shrink-0 text-right">
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
          doctor.online ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${doctor.online ? 'bg-green-500' : 'bg-slate-400'}`} />
          {doctor.online ? 'Online' : 'Offline'}
        </span>
      </div>
    </div>

    <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{doctor.bio}</p>

    <div className="flex items-center gap-4 text-sm">
      <div className="flex items-center gap-1.5">
        <MdStar className="text-amber-400" />
        <span className="font-semibold text-slate-700">{doctor.rating}</span>
        <span className="text-slate-400">({doctor.reviews})</span>
      </div>
      <div className="flex items-center gap-1.5 text-slate-500">
        <MdWorkHistory className="text-slate-400" />
        <span>{doctor.experience}</span>
      </div>
      <div className="ml-auto font-semibold text-teal-600">{doctor.fee}</div>
    </div>

    <div>
      <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Available</p>
      <div className="flex gap-1.5 flex-wrap">
        {(doctor.availability || []).map(day => (
          <span key={day} className="text-xs bg-primary-50 text-primary-700 border border-primary-100 px-2 py-0.5 rounded-lg font-medium">
            {day}
          </span>
        ))}
      </div>
    </div>

    <button
      onClick={() => onBook(doctor)}
      className="btn-primary w-full flex items-center justify-center gap-2"
    >
      <MdCalendarMonth />
      Book Appointment
    </button>
  </div>
);

export default function FindDoctors() {
  const [doctors, setDoctors]           = useState([]);
  const [specializations, setSpecializations] = useState(['All Specializations']);
  const [search, setSearch]             = useState('');
  const [spec, setSpec]                 = useState('All Specializations');
  const [loading, setLoading]           = useState(true);
  const navigate = useNavigate();

  // Load doctors from Supabase
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      const { data } = await supabase.from('doctors').select('*').order('name');
      if (data) {
        setDoctors(data);
        const unique = ['All Specializations', ...new Set(data.map(d => d.specialization))];
        setSpecializations(unique);
      }
      setLoading(false);
    };
    fetchDoctors();
  }, []);

  const filtered = doctors.filter(d => {
    const matchSpec   = spec === 'All Specializations' || d.specialization === spec;
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialization.toLowerCase().includes(search.toLowerCase()) ||
      (d.hospital || '').toLowerCase().includes(search.toLowerCase());
    return matchSpec && matchSearch;
  });

  const handleBook = (doctor) => navigate('/book-appointment', { state: { doctor } });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-slate-800">Find Doctors</h1>
        <p className="text-slate-500 mt-1">Browse and book from our verified healthcare specialists</p>
      </div>

      {/* Search & Filter bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search doctor name, specialization, or hospital…"
            className="input-field pl-11"
          />
        </div>
        <div className="relative sm:w-56">
          <MdFilterList className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
          <select
            value={spec}
            onChange={e => setSpec(e.target.value)}
            className="input-field pl-11 appearance-none cursor-pointer"
          >
            {specializations.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-slate-500 font-medium">
          {filtered.length} doctor{filtered.length !== 1 ? 's' : ''} found
          {spec !== 'All Specializations' && ` · ${spec}`}
        </p>
      )}

      {/* Loading skeleton */}
      {loading ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="card animate-pulse space-y-3">
              <div className="flex gap-3">
                <div className="w-14 h-14 bg-slate-200 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
              <div className="h-3 bg-slate-200 rounded" />
              <div className="h-3 bg-slate-200 rounded w-4/5" />
              <div className="h-10 bg-slate-200 rounded-xl" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <MdSearch className="text-6xl text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium text-lg">No doctors found</p>
          <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filter</p>
          <button onClick={() => { setSearch(''); setSpec('All Specializations'); }}
            className="btn-secondary mt-4 inline-flex">Clear Filters</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(doc => <DoctorCard key={doc.id} doctor={doc} onBook={handleBook} />)}
        </div>
      )}
    </div>
  );
}
