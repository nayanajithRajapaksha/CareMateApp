import React, { useState, useEffect, useMemo } from 'react';
import { Users, Edit2, Check, X, Search, Building2, Phone, Baby, Clock } from 'lucide-react';
import { phmService } from '../services/phmService';
import { staffService } from '../services/staffService';

import { appointmentService } from '../services/appointmentService';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';


type PHMTab = 'children' | 'parents' | 'appointments';

interface ParentUser {
  profile_id: string;
  email: string;
  full_name: string;
  contact_number?: string;
  created_at?: string;
  children_count?: number;
  children_list?: { id: number, name: string, dob: string }[];
}

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatSlotEnd = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + 30;
  return `${String(Math.floor(totalMinutes / 60) % 24).padStart(2, '0')}:${String(totalMinutes % 60).padStart(2, '0')}`;
};

const SRI_LANKA_HOLIDAYS: Record<string, string> = {
  '2026-01-14': 'Thai Pongal',
  '2026-02-04': 'Independence Day',
  '2026-03-20': 'Ramazan Festival',
  '2026-04-13': 'Sinhala & Tamil New Year Eve',
  '2026-04-14': 'Sinhala & Tamil New Year',
  '2026-05-01': 'May Day',
  '2026-05-27': 'Hajj Festival',
  '2026-09-26': 'Binara Poya Day',
  '2026-10-26': 'Vap Poya Day',
  '2026-11-08': 'Deepavali',
  '2026-11-24': 'Il Poya Day',
  '2026-12-23': 'Unduvap Poya Day',
  '2026-12-25': 'Christmas Day',
};

const getSriLankaHoliday = (date: Date) => {
  const fixedHoliday = SRI_LANKA_HOLIDAYS[formatDate(date)];
  if (fixedHoliday) return fixedHoliday;
  if (date.getMonth() === 1 && date.getDate() === 4) return 'Independence Day';
  if (date.getMonth() === 4 && date.getDate() === 1) return 'May Day';
  if (date.getMonth() === 11 && date.getDate() === 25) return 'Christmas Day';
  return '';
};

const getHolidayWatermark = (holiday: string) => {
  if (holiday.includes('Poya')) return { icon: '☸', color: '#DC4C4C', borderColor: '#EAB308', background: 'rgba(250, 204, 21, 0.28)', label: 'Poya day' };
  if (holiday.includes('Christmas')) return { icon: '✝', color: '#DB2777', borderColor: '#DB2777', background: 'rgba(219, 39, 119, 0.12)', label: 'Christmas' };
  if (holiday.match(/Ramazan|Hajj|Prophet|Eid|Meelad/i)) return { icon: '☪', color: '#9333EA', borderColor: '#9333EA', background: 'rgba(147, 51, 234, 0.12)', label: holiday };
  if (holiday.match(/Deepavali|Pongal|Hindu/i)) return { icon: '🕉', color: '#2563EB', borderColor: '#2563EB', background: 'rgba(37, 99, 235, 0.12)', label: holiday };
  if (holiday.includes('New Year')) return { icon: '☀', color: '#B77900', borderColor: '#B77900', background: 'rgba(250, 204, 21, 0.18)', label: 'New Year' };
  if (holiday.includes('Independence')) return { icon: <img src="https://flagcdn.com/lk.svg" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Sri Lanka Flag" />, color: '#0F766E', borderColor: '#0F766E', background: 'rgba(15, 118, 110, 0.14)', label: 'National day', fullTile: true };
  return { icon: '✦', color: '#B77900', borderColor: '#B77900', background: 'rgba(250, 204, 21, 0.14)', label: 'Public holiday' };
};

export const PHMDashboard: React.FC = () => {
  const { user, activeHospital } = useAuth();
  const location = useLocation();
  const isChildrenSection = location.pathname.startsWith('/phm/children');

  const [activeTab, setActiveTab] = useState<PHMTab>(isChildrenSection ? 'children' : 'appointments');
  const [children, setChildren] = useState<any[]>([]);
  const [parents, setParents] = useState<ParentUser[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Editing Midwife's Own Hospital
  const midwifeHospital = user?.hospital || '';
  const permissionedHospitals = useMemo(() => {
    if (!midwifeHospital) return [];
    return midwifeHospital.split(',').map(h => h.trim()).filter(Boolean);
  }, [midwifeHospital]);

  // Edit Child State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [childSearch, setChildSearch] = useState('');

  // Parent Assignment State
  const [parentSearch, setParentSearch] = useState('');
  const [availabilityDates, setAvailabilityDates] = useState<Record<string, { start_time: string; end_time: string; max_bookings: number; active: boolean }>>({});
  const [selectedAvailabilityDate, setSelectedAvailabilityDate] = useState(formatDate(new Date()));
  const [availabilityForm, setAvailabilityForm] = useState({ start_time: '09:00', end_time: '15:00', max_bookings: 1, active: false });
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(formatDate(new Date()).slice(0, 7));
  const calendarDates = useMemo(() => {
    const [year, month] = calendarMonth.split('-').map(Number);
    const firstOfMonth = new Date(year, month - 1, 1);
    const mondayOffset = (firstOfMonth.getDay() + 6) % 7;
    const firstVisibleDate = new Date(year, month - 1, 1 - mondayOffset);
    return Array.from({ length: 35 }, (_, index) => {
      const date = new Date(firstVisibleDate);
      date.setDate(firstVisibleDate.getDate() + index);
      return date;
    });
  }, [calendarMonth]);
  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, monthIndex) => {
      const date = new Date(calendarYear, monthIndex, 1);
      return { value: String(monthIndex + 1).padStart(2, '0'), label: date.toLocaleDateString(undefined, { month: 'long' }) };
    });
  }, [calendarYear]);
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, index) => currentYear + index);
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [childrenData, parentsData] = await Promise.all([
        phmService.getAllChildren(),
        staffService.getParents()
      ]);

      setChildren(childrenData.children || []);
      setParents(parentsData.parents || []);
      const [availabilityData, bookingsData] = await Promise.all([
        appointmentService.getMyAvailability(activeHospital || undefined),
        appointmentService.getStaffBookings(activeHospital || undefined),
      ]);
      const dateMap: Record<string, { start_time: string; end_time: string; max_bookings: number; active: boolean }> = {};
      (availabilityData.availability?.dates || []).forEach((item: any) => {
        const date = String(item.availability_date).slice(0, 10);
        dateMap[date] = { start_time: String(item.start_time).slice(0, 5), end_time: String(item.end_time).slice(0, 5), max_bookings: Number(item.max_bookings), active: item.active };
      });
      setAvailabilityDates(dateMap);
      if (dateMap[selectedAvailabilityDate]) {
        setAvailabilityForm(dateMap[selectedAvailabilityDate]);
      } else {
        setAvailabilityForm({ start_time: '09:00', end_time: '15:00', max_bookings: 1, active: false });
      }
      setBookings(bookingsData.appointments || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch midwife dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && activeHospital) fetchDashboardData();
  }, [user, activeHospital]);

  useEffect(() => {
    setActiveTab(isChildrenSection ? 'children' : 'appointments');
  }, [isChildrenSection]);

  const handleSaveAvailability = async () => {
    setSavingAvailability(true);
    try {
      await appointmentService.updateMyAvailability({ 
        availability_date: selectedAvailabilityDate, 
        ...availabilityForm,
        hospital: activeHospital || undefined
      });
      setAvailabilityDates({ ...availabilityDates, [selectedAvailabilityDate]: availabilityForm });
      alert(`${new Date(`${selectedAvailabilityDate}T00:00:00`).toLocaleDateString()} availability updated.`);
    } catch (err: any) {
      alert(err.message || 'Failed to update availability.');
    } finally {
      setSavingAvailability(false);
    }
  };

  const selectAvailabilityDate = (date: string) => {
    setSelectedAvailabilityDate(date);
    setAvailabilityForm(availabilityDates[date] || { start_time: '09:00', end_time: '15:00', max_bookings: 1, active: false });
  };

  const childAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    if (today.getDate() < birthDate.getDate()) months -= 1;
    if (months < 0) { years -= 1; months += 12; }
    return years > 0 ? `${years}y ${months}m` : `${months}m`;
  };



  // Edit Child handlers
  const handleEditClick = (child: any) => {
    setEditingId(child.id);
    setEditForm({
      blood_group: child.blood_group || '',
      birth_weight_kg: child.birth_weight_kg || '',
      allergies: child.allergies || '',
      existing_conditions: child.existing_conditions || '',
      primary_clinic: child.primary_clinic || ''
    });
  };

  const handleSaveChild = async (childId: string) => {
    try {
      const child = children.find(c => c.id === childId);
      if (!child) throw new Error('Child not found in state.');

      await phmService.updateChild(childId, {
        full_name: child.full_name,
        dob: child.dob,
        gender: child.gender,
        relationship: child.relationship,
        birth_cert_number: child.birth_cert_number,
        blood_group: editForm.blood_group,
        birth_weight_kg: parseFloat(editForm.birth_weight_kg) || undefined,
        allergies: editForm.allergies,
        existing_conditions: editForm.existing_conditions,
        primary_clinic: editForm.primary_clinic
      });
      alert('Child medical profile updated!');
      setEditingId(null);
      fetchDashboardData();
    } catch (err: any) {
      alert(err.message || 'Failed to update child.');
    }
  };

  const filteredChildren = children.filter(c => 
    c.full_name.toLowerCase().includes(childSearch.toLowerCase()) || 
    (c.birth_cert_number && c.birth_cert_number.toLowerCase().includes(childSearch.toLowerCase()))
  );

  const filteredParents = parents.filter(p =>
    (p.full_name?.toLowerCase() || '').includes(parentSearch.toLowerCase()) ||
    (p.email?.toLowerCase() || '').includes(parentSearch.toLowerCase()) ||
    (p.contact_number?.toLowerCase() || '').includes(parentSearch.toLowerCase())
  );

  const selectedDateBookings = bookings.filter(booking => String(booking.appointment_date).slice(0, 10) === selectedAvailabilityDate);
  const bookingsByTime = selectedDateBookings.reduce<Record<string, any[]>>((groups, booking) => {
    const time = String(booking.start_time).slice(0, 5);
    groups[time] = groups[time] || [];
    groups[time].push(booking);
    return groups;
  }, {});
  const bookingTimes = Object.keys(bookingsByTime).sort();

  return (
    <div className={`midwife-page ${isChildrenSection ? 'children-section-page' : ''}`}>
      <div className="midwife-workspace">
        <div className="midwife-workspace-left">


      <div className="card midwife-calendar-card" style={{ marginBottom: 24, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h4 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Booking calendar</h4>
            <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: 12 }}>Choose a day in the next 30 days, then publish its 30-minute slots.</p>
          </div>
          <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--color-text-muted)' }}>
            <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: 'var(--color-primary)', marginRight: 5 }} />Available</span>
            <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: 'var(--color-border)', marginRight: 5 }} />Not available</span>
            <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#D97706', marginRight: 5 }} />Public holiday</span>
          </div>
        </div>
        <div style={{ marginTop: 12, width: '100%' }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <label style={{ display: 'block', width: 120, fontSize: 12, color: 'var(--color-text-muted)' }}>Year
              <select className="input-field" value={calendarYear} onChange={e => { const year = Number(e.target.value); setCalendarYear(year); setCalendarMonth(`${year}-${calendarMonth.slice(5)}`); }} style={{ display: 'block', width: '100%', marginTop: 4, padding: '8px 10px' }}>
                {yearOptions.map(year => <option key={year} value={year}>{year}</option>)}
              </select>
            </label>
            <label style={{ display: 'block', width: 150, fontSize: 12, color: 'var(--color-text-muted)' }}>Month
              <select className="input-field" value={calendarMonth.slice(5)} onChange={e => setCalendarMonth(`${calendarYear}-${e.target.value}`)} style={{ display: 'block', width: '100%', marginTop: 4, padding: '8px 10px' }}>
                {monthOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
          </div>
        </div>
        <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(7, minmax(36px, 1fr))', gap: 6, marginTop: 10, marginBottom: 4 }}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => <div key={day} style={{ textAlign: 'center', fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 700 }}>{day}</div>)}
        </div>
        <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(7, minmax(36px, 1fr))', gridAutoRows: 48, gap: 6 }}>
          {calendarDates.map(date => {
            const dateKey = formatDate(date);
            const configured = availabilityDates[dateKey];
            const selected = dateKey === selectedAvailabilityDate;
            const todayKey = formatDate(new Date());
            const isToday = dateKey === todayKey;
            const dateValue = new Date(`${dateKey}T00:00:00`);
            const todayValue = new Date(`${todayKey}T00:00:00`);
            const maxDateValue = new Date(todayValue);
            maxDateValue.setDate(maxDateValue.getDate() + 30);
            const editable = dateValue >= todayValue && dateValue <= maxDateValue;
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const holiday = getSriLankaHoliday(date);
            const holidayWatermark = holiday ? getHolidayWatermark(holiday) : null;
            const statusColor = configured?.active ? '#16805B' : holiday ? (holidayWatermark?.color || '#D97706') : isWeekend ? '#94A3B8' : '#DC4C4C';
            const statusBackground = configured?.active ? 'rgba(22,128,91,0.13)' : holiday ? (holidayWatermark?.background || 'rgba(217,119,6,0.14)') : isWeekend ? '#EEF1F3' : 'rgba(220,76,76,0.10)';
            const borderColor = holiday ? (holidayWatermark?.borderColor || statusColor) : statusColor;
            return <button key={dateKey} type="button" disabled={!editable} title={holiday || (editable ? undefined : 'Outside the editable 30-day window')} onClick={() => selectAvailabilityDate(dateKey)} style={{ position: 'relative', height: '100%', minWidth: 0, boxSizing: 'border-box', cursor: editable ? 'pointer' : 'default', opacity: editable ? 1 : 0.45, borderRadius: 10, border: isToday ? '2px solid #2563EB' : selected ? `2px solid ${borderColor}` : `1px solid ${borderColor}`, background: statusBackground, color: 'var(--color-text)', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              {holidayWatermark && <span aria-hidden="true" style={holidayWatermark.fullTile ? { position: 'absolute', inset: 0, opacity: 0.15, pointerEvents: 'none', display: 'flex' } : { position: 'absolute', right: 2, bottom: -2, fontSize: 42, lineHeight: 1, fontFamily: 'Georgia, serif', fontWeight: 700, color: holidayWatermark.color, opacity: 0.24, pointerEvents: 'none' }}>{holidayWatermark.icon}</span>}
              {(() => {
                const dateBookingsCount = bookings.filter(b => String(b.appointment_date).slice(0, 10) === dateKey).length;
                const statusLabel = dateBookingsCount > 0 
                  ? `${dateBookingsCount} booked` 
                  : (holidayWatermark?.label || (configured?.active ? 'Open' : isWeekend ? 'Weekend' : 'Closed'));
                return (
                  <>
                    <strong style={{ position: 'relative', display: 'block', fontSize: 20, lineHeight: 1, margin: '2px 0 4px', color: holiday ? (holidayWatermark?.color || statusColor) : undefined, zIndex: 1 }}>{date.getDate()}</strong>
                    <span style={{ position: 'relative', display: 'block', fontSize: 9, lineHeight: 1, color: holidayWatermark?.color || statusColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', zIndex: 1, width: '100%', padding: '0 2px', boxSizing: 'border-box', textAlign: 'center', fontWeight: dateBookingsCount > 0 ? 700 : 'normal' }}>
                      {statusLabel}
                    </span>
                  </>
                );
              })()}
            </button>;
          })}
        </div>
        <div className="calendar-inline-editor" style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'flex-end', flexWrap: 'wrap', gap: 24 }}>
          <div style={{ minWidth: 200, flexShrink: 0 }}>
            <strong style={{ fontSize: 16 }}>{new Date(`${selectedAvailabilityDate}T00:00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</strong>
            <div style={{ color: 'var(--color-text-muted)', fontSize: 13, marginTop: 3 }}>{availabilityForm.active ? 'Parents can book this date' : 'Bookings are closed for this date'}</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap', flexGrow: 1 }}>
            <label style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 2 }}>From<input type="time" className="input-field" value={availabilityForm.start_time} onChange={e => setAvailabilityForm({ ...availabilityForm, start_time: e.target.value })} disabled={!availabilityForm.active} style={{ display: 'block', marginTop: 4, padding: '8px 10px', width: 120 }} /></label>
            <label style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 2 }}>Until<input type="time" className="input-field" value={availabilityForm.end_time} onChange={e => setAvailabilityForm({ ...availabilityForm, end_time: e.target.value })} disabled={!availabilityForm.active} style={{ display: 'block', marginTop: 4, padding: '8px 10px', width: 120 }} /></label>
            <label style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 2 }}>Max / 30 min<input type="number" min="1" className="input-field" value={availabilityForm.max_bookings} onChange={e => setAvailabilityForm({ ...availabilityForm, max_bookings: Number(e.target.value) })} disabled={!availabilityForm.active} style={{ display: 'block', marginTop: 4, padding: '8px 10px', width: 100 }} /></label>
          </div>

          <div style={{ display: 'flex', gap: 8, paddingBottom: 2 }}>
            <button className="btn btn-secondary" onClick={() => setAvailabilityForm({ ...availabilityForm, active: !availabilityForm.active })} disabled={!midwifeHospital} style={{ padding: '9px 14px', whiteSpace: 'nowrap', height: 40 }}>{availabilityForm.active ? 'Mark closed' : 'Mark available'}</button>
            <button className="btn btn-primary" onClick={handleSaveAvailability} disabled={savingAvailability || !midwifeHospital} style={{ padding: '9px 14px', whiteSpace: 'nowrap', height: 40 }}>{savingAvailability ? 'Saving...' : 'Save day'}</button>
          </div>
        </div>
        {!midwifeHospital && <p style={{ color: 'var(--color-warning)', marginBottom: 0, fontSize: 13 }}>A hospital assignment from your MOH Supervisor is required before publishing availability.</p>}
      </div>
        </div>

        <div className="midwife-workspace-right">
          <div className="card midwife-side-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 12 }}>
              <div>
                <h4 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Selected date</h4>
                <p style={{ margin: '6px 0 0', color: 'var(--color-text-muted)', fontSize: 13 }}>{new Date(`${selectedAvailabilityDate}T00:00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
              <Clock color="var(--color-primary)" size={22} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 18, padding: '10px 12px', borderRadius: 10, background: availabilityForm.active ? 'rgba(22,128,91,0.10)' : 'rgba(220,76,76,0.10)', color: availabilityForm.active ? '#16805B' : '#DC4C4C', fontWeight: 600, fontSize: 13 }}>
              <Building2 size={16} /> {availabilityForm.active ? `${availabilityForm.start_time} - ${availabilityForm.end_time}` : 'Closed for bookings'}
            </div>
          </div>

          <div className="card midwife-side-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h4 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Hospital bookings</h4>
              <span style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>{selectedDateBookings.length} booked</span>
            </div>
            {bookingTimes.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: 14, margin: 0 }}>No bookings for this date.</p>
            ) : bookingTimes.map(time => (
              <div key={time} style={{ borderTop: '1px solid var(--color-border)', padding: '12px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <strong style={{ color: 'var(--color-primary)' }}>{time} - {formatSlotEnd(time)}</strong>
                  <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{bookingsByTime[time].length} booking(s)</span>
                </div>
                {bookingsByTime[time].map(booking => <div key={booking.id} style={{ background: 'var(--color-bg)', borderRadius: 8, padding: '9px 10px', marginTop: 6 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{booking.child_name} <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>({childAge(booking.child_dob)})</span></div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 3 }}>Parent: {booking.parent_name} {booking.parent_contact ? `• ${booking.parent_contact}` : ''}</div>
                </div>)}
              </div>
            ))}
          </div>

          {isChildrenSection && <div className="card midwife-side-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h4 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Children records</h4>
              <span style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>{children.length} total</span>
            </div>
            {children.slice(0, 5).map(child => <div key={child.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', padding: '10px 0' }}>
              <div><div style={{ fontWeight: 600, fontSize: 13 }}>{child.full_name}</div><div style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>{child.gender || '—'} • {childAge(child.dob)}</div></div>
              <span style={{ color: 'var(--color-primary)', fontSize: 12 }}>{child.primary_clinic || 'No clinic'}</span>
            </div>)}
            {children.length > 5 && <button className="btn btn-secondary" onClick={() => setActiveTab('children')} style={{ width: '100%', marginTop: 8, padding: '8px 12px' }}>View all children</button>}
          </div>}
        </div>
      </div>

      {isChildrenSection && (<>
      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid var(--color-border)', paddingBottom: 12 }}>
        <button
          className={`btn ${activeTab === 'children' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 20px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}
          onClick={() => setActiveTab('children')}
        >
          <Baby size={18} /> Children Directory ({children.length})
        </button>

        <button
          className={`btn ${activeTab === 'parents' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 20px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}
          onClick={() => setActiveTab('parents')}
        >
          <Users size={18} /> Parent & Clinic Directory ({parents.length})
        </button>
        <button
          className={`btn ${activeTab === 'appointments' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 20px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}
          onClick={() => setActiveTab('appointments')}
        >
          <Clock size={18} /> Appointments ({bookings.length})
        </button>
      </div>

      {/* Tab 1: Children Directory */}
      {activeTab === 'children' ? (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h4 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Children Records</h4>
            <div style={{ position: 'relative', width: 320 }}>
              <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input 
                type="text" 
                className="input-field" 
                placeholder="Search by child name or birth cert..." 
                value={childSearch}
                onChange={e => setChildSearch(e.target.value)}
                style={{ paddingLeft: 38 }}
              />
            </div>
          </div>
          
          {loading ? (
            <p>Loading children records...</p>
          ) : error ? (
            <p style={{ color: 'var(--color-error)' }}>{error}</p>
          ) : filteredChildren.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)' }}>No children found matching criteria.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left', backgroundColor: 'var(--color-bg)' }}>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Child Profile</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>DOB & Gender</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Birth Weight (kg)</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Blood Group</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Primary Clinic</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredChildren.map(child => {
                    const isEditing = editingId === child.id;

                    return (
                      <tr key={child.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 600 }}>{child.full_name}</div>
                          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Cert: {child.birth_cert_number || 'N/A'}</div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div>{new Date(child.dob).toLocaleDateString()}</div>
                          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>{child.gender}</div>
                        </td>
                        
                        <td style={{ padding: '14px 16px' }}>
                          {isEditing ? (
                            <input 
                              type="number" 
                              className="input-field" 
                              step="0.1"
                              style={{ padding: '6px 8px', width: 90 }}
                              value={editForm.birth_weight_kg}
                              onChange={e => setEditForm({ ...editForm, birth_weight_kg: e.target.value })}
                            />
                          ) : (
                            child.birth_weight_kg
                          )}
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          {isEditing ? (
                            <input 
                              type="text" 
                              className="input-field" 
                              style={{ padding: '6px 8px', width: 80 }}
                              value={editForm.blood_group}
                              onChange={e => setEditForm({ ...editForm, blood_group: e.target.value })}
                            />
                          ) : (
                            child.blood_group
                          )}
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          {isEditing ? (
                            <select
                              className="input-field"
                              style={{ padding: '6px 8px', fontSize: 13 }}
                              value={editForm.primary_clinic}
                              onChange={e => setEditForm({ ...editForm, primary_clinic: e.target.value })}
                            >
                              <option value="">Select Clinic...</option>
                              {permissionedHospitals.map(h => (
                                <option key={h} value={h}>{h}</option>
                              ))}
                            </select>
                          ) : (
                            child.primary_clinic ? (
                              <span style={{ fontWeight: 500, color: 'var(--color-primary)' }}>{child.primary_clinic}</span>
                            ) : (
                              <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                            )
                          )}
                        </td>

                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          {isEditing ? (
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                              <button onClick={() => handleSaveChild(child.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-success)' }} title="Save">
                                <Check size={20} />
                              </button>
                              <button onClick={() => setEditingId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)' }} title="Cancel">
                                <X size={20} />
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => handleEditClick(child)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)' }} title="Edit Record">
                              <Edit2 size={18} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : activeTab === 'parents' ? (
        /* Tab 2: Parent & Clinic Directory */
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h4 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Registered Parents & Family Clinic Assignments</h4>
            <div style={{ position: 'relative', width: 320 }}>
              <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input 
                type="text" 
                className="input-field" 
                placeholder="Search parent by name, email, or phone..." 
                value={parentSearch}
                onChange={e => setParentSearch(e.target.value)}
                style={{ paddingLeft: 38 }}
              />
            </div>
          </div>

          {loading ? (
            <p>Loading parent profiles...</p>
          ) : filteredParents.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)' }}>No parent profiles found.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left', backgroundColor: 'var(--color-bg)' }}>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Parent Profile</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Contact Info</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Registered Children (Age)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParents.map((p) => (
                    <tr key={p.profile_id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 600 }}>{p.full_name || 'N/A'}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{p.email}</div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {p.contact_number ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Phone size={14} color="var(--color-text-muted)" /> {p.contact_number}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {p.children_list && p.children_list.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {p.children_list.map((child: any) => (
                              <div key={child.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Baby size={16} color="var(--color-primary)" />
                                <span style={{ fontWeight: 600 }}>{child.name}</span>
                                <span style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>({childAge(child.dob)})</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)' }}>No children registered</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h4 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Booked appointments</h4>
              <p style={{ margin: '6px 0 0', color: 'var(--color-text-muted)', fontSize: 13 }}>Parents and children booked into your published 30-minute slots.</p>
            </div>
            <Clock color="var(--color-primary)" size={22} />
          </div>
          {bookings.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)' }}>No bookings yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead><tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left', backgroundColor: 'var(--color-bg)' }}>
                  <th style={{ padding: '12px 16px' }}>Date & time</th><th style={{ padding: '12px 16px' }}>Parent</th><th style={{ padding: '12px 16px' }}>Child</th><th style={{ padding: '12px 16px' }}>Age</th><th style={{ padding: '12px 16px' }}>Contact</th>
                </tr></thead>
                <tbody>{bookings.map(booking => <tr key={booking.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 600 }}>{new Date(booking.appointment_date).toLocaleDateString()}<div style={{ color: 'var(--color-primary)', fontWeight: 500 }}>{String(booking.start_time).slice(0, 5)} - {String(booking.end_time).slice(0, 5)}</div></td>
                  <td style={{ padding: '14px 16px' }}>{booking.parent_name}</td>
                  <td style={{ padding: '14px 16px' }}>{booking.child_name}</td>
                  <td style={{ padding: '14px 16px' }}>{childAge(booking.child_dob)}</td>
                  <td style={{ padding: '14px 16px' }}>{booking.parent_contact || '—'}</td>
                </tr>)}</tbody>
              </table>
            </div>
          )}
        </div>
      )}
      </>)}
    </div>
  );
};
