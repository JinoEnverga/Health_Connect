import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppointments } from '../context/AppointmentContext';
import { useAuth } from '../context/AuthContext';
import { initialChatMessages, doctors } from '../data/mockData';
import {
  MdVideoCall, MdVideocamOff, MdMic, MdMicOff, MdCallEnd,
  MdSend, MdChat, MdPerson, MdSchedule, MdCalendarMonth,
  MdScreenShare, MdMoreVert, MdArrowBack, MdVerified,
} from 'react-icons/md';

export default function Teleconsultation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { upcomingAppointments } = useAppointments();
  const { user } = useAuth();

  const appt = location.state?.appointment || upcomingAppointments[0];
  const doctor = doctors.find(d => d.id === appt?.doctorId) || doctors[0];

  const [messages, setMessages] = useState(initialChatMessages);
  const [input, setInput] = useState('');
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [callActive, setCallActive] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const chatEndRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (callActive) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [callActive]);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const sendMessage = () => {
    if (!input.trim()) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(m => [...m, { id: Date.now(), sender: 'patient', text: input.trim(), time: timeStr }]);
    setInput('');
    // Simulate doctor typing reply
    setTimeout(() => {
      setMessages(m => [...m, {
        id: Date.now() + 1,
        sender: 'doctor',
        text: "Thank you for sharing that. I'll take note of your symptoms and we'll discuss this further during our consultation.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1500);
  };

  const endCall = () => {
    setCallActive(false);
    setElapsed(0);
    navigate('/appointments');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
          <MdArrowBack className="text-2xl text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-800">Teleconsultation</h1>
          <p className="text-slate-500 text-sm">Video consultation session</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 lg:h-[calc(100vh-220px)]">
        {/* LEFT: Video + Controls */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Video area */}
          <div className="flex-1 bg-slate-900 rounded-3xl overflow-hidden relative min-h-72">
            {callActive ? (
              <>
                {/* Main video feed - Doctor */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className={`w-28 h-28 ${doctor?.avatarColor || 'bg-primary-600'} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                      <span className="text-white text-3xl font-bold">{doctor?.avatar}</span>
                    </div>
                    <p className="text-white font-semibold text-lg">{doctor?.name}</p>
                    <p className="text-slate-400 text-sm">{doctor?.specialization}</p>
                    <div className="flex items-center justify-center gap-1.5 mt-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-green-400 text-xs font-medium">Live</span>
                    </div>
                  </div>
                </div>
                {/* Timer */}
                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl text-sm font-mono font-semibold flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  {formatTime(elapsed)}
                </div>
                {/* Self-view */}
                {camOn && (
                  <div className="absolute bottom-4 right-4 w-24 h-20 bg-slate-700 rounded-xl flex items-center justify-center border-2 border-white/20 shadow-lg">
                    <div className="text-center">
                      <div className={`w-10 h-10 ${user?.avatarColor || 'bg-primary-600'} rounded-full flex items-center justify-center mx-auto`}>
                        <span className="text-white text-sm font-bold">{user?.avatar}</span>
                      </div>
                      <p className="text-white text-xs mt-1">You</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className={`w-24 h-24 ${doctor?.avatarColor || 'bg-primary-600'} rounded-full flex items-center justify-center shadow-xl`}>
                  <span className="text-white text-2xl font-bold">{doctor?.avatar}</span>
                </div>
                <div className="text-center">
                  <p className="text-white font-semibold text-xl">{doctor?.name}</p>
                  <p className="text-slate-400">{doctor?.specialization}</p>
                </div>
                <button onClick={() => setCallActive(true)}
                  className="bg-green-500 hover:bg-green-400 text-white font-semibold px-8 py-3 rounded-2xl flex items-center gap-2 transition-colors shadow-lg mt-2">
                  <MdVideoCall className="text-2xl" /> Start Call
                </button>
              </div>
            )}
          </div>

          {/* Controls bar */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => setMicOn(!micOn)}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${micOn ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-red-100 text-red-600'}`}>
                {micOn ? <MdMic className="text-xl" /> : <MdMicOff className="text-xl" />}
              </button>
              <button onClick={() => setCamOn(!camOn)}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${camOn ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-red-100 text-red-600'}`}>
                {camOn ? <MdVideoCall className="text-xl" /> : <MdVideocamOff className="text-xl" />}
              </button>
              <button className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">
                <MdScreenShare className="text-xl" />
              </button>
            </div>
            {callActive && (
              <button onClick={endCall}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition-colors">
                <MdCallEnd className="text-xl" /> End Consultation
              </button>
            )}
            <button className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">
              <MdMoreVert className="text-xl" />
            </button>
          </div>

          {/* Appointment Info */}
          {appt && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Appointment Details</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex items-center gap-2">
                  <MdPerson className="text-primary-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400">Doctor</p>
                    <p className="text-sm font-semibold text-slate-700 truncate">{appt.doctorName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MdCalendarMonth className="text-primary-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400">Date</p>
                    <p className="text-sm font-semibold text-slate-700">{appt.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MdSchedule className="text-primary-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400">Time</p>
                    <p className="text-sm font-semibold text-slate-700">{appt.time}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Chat */}
        <div className="flex flex-col bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden lg:h-full h-96">
          {/* Chat header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className={`w-9 h-9 ${doctor?.avatarColor || 'bg-primary-600'} rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
              {doctor?.avatar}
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm flex items-center gap-1">
                {doctor?.name} <MdVerified className="text-primary-500 text-xs" />
              </p>
              <p className="text-xs text-teal-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-teal-500 rounded-full inline-block" /> Online
              </p>
            </div>
            <MdChat className="ml-auto text-slate-400 text-xl" />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'patient' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[82%] rounded-2xl px-4 py-2.5 ${
                  msg.sender === 'patient'
                    ? 'bg-primary-600 text-white rounded-br-md'
                    : 'bg-slate-100 text-slate-800 rounded-bl-md'
                }`}>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  <p className={`text-xs mt-1 ${msg.sender === 'patient' ? 'text-primary-200' : 'text-slate-400'}`}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-4 border-t border-slate-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message…"
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100"
              />
              <button onClick={sendMessage} disabled={!input.trim()}
                className="w-10 h-10 bg-primary-600 hover:bg-primary-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0">
                <MdSend className="text-base" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
