import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin, Plus, Pencil, Trash2, X, Check, Search,
  Building2, Clock, CheckCircle2, AlertCircle, ChevronDown,
  Navigation, Loader2
} from 'lucide-react';
import { clinicService } from '../services/clinicService';

// ─── Types ────────────────────────────────────────────────────────────────────
export type ClinicType =
  | "Children's Hospital"
  | "Women's Hospital"
  | "Maternity Hospital"
  | "MCH Clinic"
  | "Child Health Clinic"
  | "Vaccination Center"
  | "Primary Care"
  | "General Hospital";

export interface Clinic {
  id: number;
  name: string;
  address: string;
  type: ClinicType;
  lat: number;
  lng: number;
  open: boolean;
  phone?: string;
  hours?: string;
}

const CLINIC_TYPES: ClinicType[] = [
  "Children's Hospital", "Women's Hospital", "Maternity Hospital",
  "MCH Clinic", "Child Health Clinic", "Vaccination Center",
  "Primary Care", "General Hospital",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const makeMarkerHtml = (open: boolean, selected: boolean, isMOH: boolean) => `
  <div style="display:flex;flex-direction:column;align-items:center;">
    ${isMOH ? `
    <div style="
      background:${selected ? '#0D635D' : open ? '#167979' : '#94A3B8'};
      color:#fff;font-size:9px;font-weight:800;
      padding:2px 7px;border-radius:4px;margin-bottom:4px;
      white-space:nowrap;letter-spacing:.5px;
      box-shadow:0 2px 8px rgba(0,0,0,0.2);
    ">MOH ${open ? '✓' : '· CLOSED'}</div>
    ` : ''}
    <div style="
      width:${selected ? 46 : 38}px;height:${selected ? 46 : 38}px;border-radius:50%;
      background:${selected ? 'rgba(13,99,93,0.2)' : open ? 'rgba(22,121,121,0.18)' : 'rgba(148,163,184,0.2)'};
      display:flex;align-items:center;justify-content:center;
      transition:all .2s;
    ">
      <div style="
        width:${selected ? 28 : 22}px;height:${selected ? 28 : 22}px;border-radius:50%;
        background:${selected ? '#0D635D' : open ? '#167979' : '#94A3B8'};
        border:2.5px solid #fff;
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 2px 8px rgba(0,0,0,.25);
        position:relative;
      ">
        <div style="width:10px;height:10px;position:relative;">
          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:2px;height:10px;background:#fff;border-radius:2px;"></div>
          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:10px;height:2px;background:#fff;border-radius:2px;"></div>
        </div>
      </div>
    </div>
  </div>
`;

const makeAddMarkerHtml = () => `
  <div style="display:flex;flex-direction:column;align-items:center;">
    <div style="
      background:#F59E0B;color:#fff;font-size:9px;font-weight:800;
      padding:2px 7px;border-radius:4px;margin-bottom:4px;white-space:nowrap;
      box-shadow:0 2px 8px rgba(0,0,0,0.2);
    ">NEW CLINIC</div>
    <div style="width:42px;height:42px;border-radius:50%;background:rgba(245,158,11,0.2);display:flex;align-items:center;justify-content:center;">
      <div style="width:26px;height:26px;border-radius:50%;background:#F59E0B;border:2.5px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.25);">
        <span style="color:#fff;font-size:16px;font-weight:700;line-height:1;">+</span>
      </div>
    </div>
  </div>
`;

const divIcon = (html: string, size = 46) =>
  L.divIcon({ html, className: '', iconAnchor: [size / 2, size + 20], iconSize: [size, size + 28] });

// ─── Component ────────────────────────────────────────────────────────────────
const BLANK_FORM: Omit<Clinic, 'id'> = {
  name: '', address: '', type: 'MCH Clinic', lat: 0, lng: 0, open: true, phone: '', hours: '',
};

export const ClinicManager: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<number, L.Marker>>(new Map());
  const newPinRef = useRef<L.Marker | null>(null);

  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loadingClinics, setLoadingClinics] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');
  const [mode, setMode] = useState<'view' | 'add' | 'edit'>('view');
  const [form, setForm] = useState<Omit<Clinic, 'id'>>(BLANK_FORM);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof Clinic, string>>>({});
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // ─── Refs ───────────────────────────────────────────────────────────────────
  const formRef = useRef(form);
  const modeRef = useRef(mode);
  const selectedIdRef = useRef(selectedId);
  formRef.current = form;
  modeRef.current = mode;
  selectedIdRef.current = selectedId;

  // ── Load clinics from DB on mount ─────────────────────────────────────
  useEffect(() => {
    clinicService.getAll()
      .then(data => setClinics(data))
      .catch(() => showToast('Failed to load clinics from database', 'error'))
      .finally(() => setLoadingClinics(false));
  }, []);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Map init ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return;
    const map = L.map(mapRef.current, { zoomControl: true, attributionControl: false })
      .setView([6.9271, 79.8612], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

    // Click on map to place a new clinic pin
    map.on('click', (e: L.LeafletMouseEvent) => {
      setMode(prev => {
        if (prev === 'add') {
          setForm(f => ({ ...f, lat: parseFloat(e.latlng.lat.toFixed(6)), lng: parseFloat(e.latlng.lng.toFixed(6)) }));
          // Show/move the amber "new pin"
          if (newPinRef.current) {
            newPinRef.current.setLatLng(e.latlng);
          } else {
            newPinRef.current = L.marker(e.latlng, {
              icon: divIcon(makeAddMarkerHtml(), 42),
              draggable: true,
            })
              .addTo(map)
              .on('dragend', (ev: any) => {
                const ll = ev.target.getLatLng();
                setForm(f => ({ ...f, lat: parseFloat(ll.lat.toFixed(6)), lng: parseFloat(ll.lng.toFixed(6)) }));
              });
          }
        }
        return prev;
      });
    });

    leafletRef.current = map;
    return () => {
      // BUG FIX: clear markersRef on destroy so StrictMode double-mount
      // doesn't leave stale marker objects from the old map in the registry.
      markersRef.current.clear();
      newPinRef.current = null;
      map.remove();
      leafletRef.current = null;
    };
  }, []);

  // ── Sync clinic markers to map ────────────────────────────────────────────
  useEffect(() => {
    const map = leafletRef.current;
    if (!map) return;

    // Remove stale markers
    markersRef.current.forEach((m, id) => {
      if (!clinics.find(c => c.id === id)) { map.removeLayer(m); markersRef.current.delete(id); }
    });

    // Add / update markers
    clinics.forEach(clinic => {
      const selected = clinic.id === selectedId;
      const isMOH = clinic.name.toLowerCase().includes('moh') || clinic.type.toLowerCase().includes('moh');
      const icon = divIcon(makeMarkerHtml(clinic.open, selected, isMOH), selected ? 46 : 38);
      const existing = markersRef.current.get(clinic.id);
      if (existing) {
        existing.setLatLng([clinic.lat, clinic.lng]).setIcon(icon);
      } else {
        const m = L.marker([clinic.lat, clinic.lng], { icon })
          .addTo(map)
          .bindTooltip(clinic.name, { permanent: false, direction: 'top', offset: [0, -30] })
          .on('click', () => {
            setSelectedId(clinic.id);
            setMode('view');
          });
        markersRef.current.set(clinic.id, m);
      }
    });
  }, [clinics, selectedId]);

  // ── Fly to selected clinic ────────────────────────────────────────────────
  useEffect(() => {
    const clinic = clinics.find(c => c.id === selectedId);
    if (clinic && leafletRef.current) {
      leafletRef.current.flyTo([clinic.lat, clinic.lng], 16, { duration: 0.8 });
    }
  }, [selectedId]);

  // ── Clear new-pin when exiting add mode ──────────────────────────────────
  useEffect(() => {
    if (mode !== 'add' && newPinRef.current && leafletRef.current) {
      leafletRef.current.removeLayer(newPinRef.current);
      newPinRef.current = null;
    }
  }, [mode]);

  // ── Filtered list ─────────────────────────────────────────────────────────
  const displayed = clinics.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.address.toLowerCase().includes(q) || c.type.toLowerCase().includes(q);
    const matchFilter = filter === 'all' || (filter === 'open' ? c.open : !c.open);
    return matchSearch && matchFilter;
  });

  // ── Form validation ───────────────────────────────────────────────────────
  const validate = () => {
    const errs: typeof formErrors = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.address.trim()) errs.address = 'Address is required';
    if (!form.lat || !form.lng) errs.lat = 'Click a location on the map';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── CRUD handlers ─────────────────────────────────────────────────────────
  const handleAddStart = () => {
    setForm(BLANK_FORM);
    setFormErrors({});
    setSelectedId(null);
    setMode('add');
  };

  const handleEditStart = (clinic: Clinic) => {
    setForm({ name: clinic.name, address: clinic.address, type: clinic.type, lat: clinic.lat, lng: clinic.lng, open: clinic.open, phone: clinic.phone || '', hours: clinic.hours || '' });
    setFormErrors({});
    setSelectedId(clinic.id);
    setMode('edit');
    // Fly to clinic
    leafletRef.current?.flyTo([clinic.lat, clinic.lng], 16, { duration: 0.8 });
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    const currentMode = modeRef.current;
    const currentForm = formRef.current;
    const currentSelectedId = selectedIdRef.current;
    try {
      if (currentMode === 'add') {
        const saved = await clinicService.create(currentForm);
        setClinics(prev => [...prev, saved]);
        setSelectedId(saved.id);
        showToast(`"${saved.name}" added successfully`);
      } else if (currentMode === 'edit' && currentSelectedId != null) {
        const saved = await clinicService.update(currentSelectedId, currentForm);
        setClinics(prev => prev.map(c => c.id === currentSelectedId ? saved : c));
        showToast(`"${saved.name}" updated successfully`);
      }
      setMode('view');
    } catch (err: any) {
      showToast(err.message || 'Failed to save clinic', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    const clinic = clinics.find(c => c.id === id);
    setSaving(true);
    try {
      await clinicService.delete(id);
      const marker = markersRef.current.get(id);
      if (marker && leafletRef.current) { leafletRef.current.removeLayer(marker); markersRef.current.delete(id); }
      setClinics(prev => prev.filter(c => c.id !== id));
      if (selectedIdRef.current === id) { setSelectedId(null); setMode('view'); }
      setDeleteConfirm(null);
      showToast(`"${clinic?.name}" removed`, 'error');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete clinic', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => { setMode('view'); setFormErrors({}); };

  const selectedClinic = clinics.find(c => c.id === selectedId) ?? null;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 27px)', gap: 0 }}>

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(22,121,121,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 color="var(--color-primary)" size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--color-text-dark)' }}>Clinic Manager</div>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{clinics.length} Verified Clinics/Hospitals</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {/* Stats pills */}
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={statPill('#E6F4F1', '#167979')}><Building2 size={12} />{clinics.filter(c => c.name.toLowerCase().includes('moh') || c.type.toLowerCase().includes('moh')).length} MOH</span>
            <span style={statPill('#E6F4F1', '#167979')}><CheckCircle2 size={12} />{clinics.filter(c => c.open).length} Open</span>
            <span style={statPill('#FEF2F2', '#EF4444')}><AlertCircle size={12} />{clinics.filter(c => !c.open).length} Closed</span>
          </div>
          <button className="btn btn-primary" onClick={handleAddStart} style={{ gap: 6 }}>
            <Plus size={16} /> Add Clinic
          </button>
        </div>
      </div>

      {/* ── Main 2-panel layout ──────────────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* LEFT: Clinic list panel */}
        <div style={{ width: 360, display: 'flex', flexDirection: 'column', background: 'var(--color-bg)', borderRight: '1px solid var(--color-border)', overflow: 'hidden' }}>

          {/* Search + filter */}
          <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
            <div style={{ position: 'relative', marginBottom: 10 }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                className="input-field"
                placeholder="Search clinics..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: 36, paddingTop: 9, paddingBottom: 9, fontSize: 14, width: '100%' }}
              />
              {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><X size={14} /></button>}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['all', 'open', 'closed'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{ flex: 1, padding: '6px 0', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid', transition: 'all .15s', background: filter === f ? 'var(--color-primary)' : 'transparent', color: filter === f ? '#fff' : 'var(--color-text-muted)', borderColor: filter === f ? 'var(--color-primary)' : 'var(--color-border)' }}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Clinic list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
            {loadingClinics ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, gap: 12, color: 'var(--color-text-muted)' }}>
                <Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} color="var(--color-primary)" />
                <span style={{ fontSize: 14 }}>Loading clinics from database…</span>
                <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
              </div>
            ) : displayed.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--color-text-muted)' }}>
                <MapPin size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                <p style={{ fontSize: 14 }}>No clinics match your search.</p>
              </div>
            ) : displayed.map(clinic => {
              const isMOH = clinic.name.toLowerCase().includes('moh') || clinic.type.toLowerCase().includes('moh');
              return (
                <div
                  key={clinic.id}
                  onClick={() => { setSelectedId(clinic.id); setMode('view'); }}
                  style={{
                    padding: 14, borderRadius: 12, marginBottom: 8, cursor: 'pointer',
                    border: `1px solid ${selectedId === clinic.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    background: selectedId === clinic.id ? 'rgba(22,121,121,0.06)' : 'var(--color-surface)',
                    transition: 'all .15s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text-dark)' }}>{clinic.name}</div>
                      {isMOH && (
                        <span style={{ background: 'rgba(22,121,121,0.1)', color: 'var(--color-primary)', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6 }}>MOH</span>
                      )}
                    </div>
                    <span style={{ ...badgeStyle(clinic.open), marginLeft: 8 }}>{clinic.open ? 'Open' : 'Closed'}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 4 }}>{clinic.type}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--color-text-muted)' }}>
                    <MapPin size={11} />{clinic.address}
                  </div>
                  {selectedId === clinic.id && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      <button className="btn btn-secondary" style={{ flex: 1, padding: '6px 0', fontSize: 12, gap: 4 }} onClick={e => { e.stopPropagation(); handleEditStart(clinic); }}>
                        <Pencil size={12} /> Edit
                      </button>
                      <button style={{ flex: 1, padding: '6px 0', fontSize: 12, gap: 4, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, fontWeight: 600, border: '1px solid #FCA5A5', background: '#FEF2F2', color: '#EF4444', cursor: 'pointer' }} onClick={e => { e.stopPropagation(); setDeleteConfirm(clinic.id); }}>
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Map + form overlay */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', margin: '24px', borderRadius: '16px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>

          {/* Leaflet map */}
          <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

          {/* "Add mode" hint */}
          {mode === 'add' && !form.lat && (
            <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', background: '#F59E0B', color: '#fff', padding: '10px 20px', borderRadius: 24, fontSize: 14, fontWeight: 600, pointerEvents: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.2)', zIndex: 900 }}>
              📍 Click on the map to set the clinic location
            </div>
          )}

          {/* CRUD form panel (slides in from right) */}
          {(mode === 'add' || mode === 'edit') && (
            <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 380, background: 'var(--color-surface)', borderLeft: '1px solid var(--color-border)', overflowY: 'auto', zIndex: 800, boxShadow: '-4px 0 24px rgba(0,0,0,0.10)' }}>
              <div style={{ padding: 24 }}>

                {/* Form header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 18 }}>{mode === 'add' ? '🏥 Add New Clinic' : '✏️ Edit Clinic'}</div>
                    <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>
                      {mode === 'add' ? 'Click the map to set location, then fill the form.' : 'Update the clinic details below.'}
                    </div>
                  </div>
                  <button onClick={handleCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><X size={20} color="var(--color-text-muted)" /></button>
                </div>

                {/* Location pin display */}
                <div style={{ padding: '10px 14px', borderRadius: 10, background: form.lat ? 'rgba(22,121,121,0.06)' : '#FFFBEB', border: `1px solid ${form.lat ? 'var(--color-primary)' : '#FDE68A'}`, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Navigation size={16} color={form.lat ? 'var(--color-primary)' : '#F59E0B'} />
                  {form.lat
                    ? <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-primary)' }}>Location set: {form.lat.toFixed(5)}, {form.lng.toFixed(5)}</span>
                    : <span style={{ fontSize: 13, color: '#92400E' }}>No location — click on the map to pin it</span>
                  }
                </div>
                {formErrors.lat && <p style={errStyle}>{formErrors.lat}</p>}

                {/* Name */}
                <div className="input-group">
                  <label className="input-label">Clinic Name *</label>
                  <input className="input-field" placeholder="e.g. Kandy Clinic" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  {formErrors.name && <p style={errStyle}>{formErrors.name}</p>}
                </div>

                {/* Type */}
                <div className="input-group">
                  <label className="input-label">Clinic Type *</label>
                  <div style={{ position: 'relative' }}>
                    <select className="input-field" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as ClinicType }))} style={{ appearance: 'none', paddingRight: 36, width: '100%' }}>
                      {CLINIC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <ChevronDown size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--color-text-muted)' }} />
                  </div>
                </div>

                {/* Address */}
                <div className="input-group">
                  <label className="input-label">Address *</label>
                  <input className="input-field" placeholder="Street, City" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
                  {formErrors.address && <p style={errStyle}>{formErrors.address}</p>}
                </div>

                {/* Phone */}
                <div className="input-group">
                  <label className="input-label">Phone Number</label>
                  <input className="input-field" placeholder="011-XXXXXXX" value={form.phone || ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>

                {/* Hours */}
                <div className="input-group">
                  <label className="input-label">Opening Hours</label>
                  <input className="input-field" placeholder="08:00 – 17:00" value={form.hours || ''} onChange={e => setForm(f => ({ ...f, hours: e.target.value }))} />
                </div>

                {/* Open/Closed toggle */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, padding: '12px 16px', borderRadius: 10, background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Clock size={16} color="var(--color-text-muted)" />
                    <span style={{ fontSize: 14, fontWeight: 500 }}>Currently Open</span>
                  </div>
                  <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24 }}>
                    <input type="checkbox" checked={form.open} onChange={e => setForm(f => ({ ...f, open: e.target.checked }))} style={{ opacity: 0, width: 0, height: 0 }} />
                    <span style={{ position: 'absolute', cursor: 'pointer', inset: 0, background: form.open ? 'var(--color-primary)' : '#CBD5E1', borderRadius: 24, transition: 'all .2s' }}>
                      <span style={{ position: 'absolute', content: '""', height: 18, width: 18, left: form.open ? 22 : 3, bottom: 3, background: '#fff', borderRadius: '50%', transition: 'all .2s' }} />
                    </span>
                  </label>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="btn btn-secondary" style={{ flex: 1 }} onClick={handleCancel} disabled={saving}>Cancel</button>
                  <button className="btn btn-primary" style={{ flex: 1, opacity: saving ? 0.7 : 1 }} onClick={handleSave} disabled={saving}>
                    {saving ? '⏳ Saving...' : <><Check size={16} /> {mode === 'add' ? 'Add Clinic' : 'Save Changes'}</>}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Selected clinic info card (view mode) */}
          {mode === 'view' && selectedClinic && (() => {
            const isMOH = selectedClinic.name.toLowerCase().includes('moh') || selectedClinic.type.toLowerCase().includes('moh');
            return (
              <div style={{ position: 'absolute', bottom: 24, right: 24, width: 320, background: 'var(--color-surface)', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.14)', border: '1px solid var(--color-border)', zIndex: 800, overflow: 'hidden' }}>
                <div style={{ padding: '14px 16px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={badgeStyle(selectedClinic.open)}>{selectedClinic.open ? 'Open' : 'Closed'}</span>
                      {isMOH && (
                        <span style={{ background: 'rgba(22,121,121,0.1)', color: 'var(--color-primary)', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6 }}>MOH</span>
                      )}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--color-text-dark)', marginBottom: 2 }}>{selectedClinic.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 500, marginBottom: 4 }}>{selectedClinic.type}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={11} />{selectedClinic.address}</div>
                    {selectedClinic.phone && <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>📞 {selectedClinic.phone}</div>}
                    {selectedClinic.hours && <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>🕐 {selectedClinic.hours}</div>}
                  </div>
                  <button onClick={() => setSelectedId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, marginLeft: 8 }}><X size={16} color="var(--color-text-muted)" /></button>
                </div>
                <div style={{ display: 'flex', borderTop: '1px solid var(--color-border)' }}>
                  <button style={infoActionBtn} onClick={() => handleEditStart(selectedClinic)}><Pencil size={14} /> Edit</button>
                  <button style={{ ...infoActionBtn, color: '#EF4444' }} onClick={() => setDeleteConfirm(selectedClinic.id)}><Trash2 size={14} /> Delete</button>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* ── Delete confirm modal ─────────────────────────────────────────── */}
      {deleteConfirm != null && (
        <div style={modalOverlay}>
          <div style={modalCard}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Trash2 color="#EF4444" size={24} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>Delete Clinic?</h3>
            <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', fontSize: 14, marginBottom: 24 }}>
              <strong>{clinics.find(c => c.id === deleteConfirm)?.name}</strong> will be permanently removed from the registry.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button style={{ flex: 1, padding: '10px 20px', borderRadius: 12, fontWeight: 600, fontSize: 14, cursor: 'pointer', border: 'none', background: '#EF4444', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: saving ? 0.7 : 1 }} onClick={() => handleDelete(deleteConfirm)} disabled={saving}>
                <Trash2 size={14} /> {saving ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast notification ───────────────────────────────────────────── */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: toast.type === 'success' ? '#167979' : '#EF4444', color: '#fff', padding: '12px 24px', borderRadius: 50, fontSize: 14, fontWeight: 600, zIndex: 9999, boxShadow: '0 4px 20px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: 8 }}>
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
};

// ─── Style helpers ────────────────────────────────────────────────────────────
const statPill = (bg: string, color: string): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', gap: 5,
  background: bg, color, fontSize: 12, fontWeight: 600,
  padding: '4px 10px', borderRadius: 20,
});
const badgeStyle = (open: boolean): React.CSSProperties => ({
  fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
  background: open ? '#E6F4F1' : '#F1F5F9',
  color: open ? '#167979' : '#94A3B8',
});
const errStyle: React.CSSProperties = { fontSize: 12, color: '#EF4444', marginTop: -8, marginBottom: 4 };
const infoActionBtn: React.CSSProperties = {
  flex: 1, padding: '10px 0', background: 'none', border: 'none',
  cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--color-text-muted)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  transition: 'background .15s',
};
const modalOverlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9000,
};
const modalCard: React.CSSProperties = {
  background: 'var(--color-surface)', borderRadius: 20, padding: 32,
  maxWidth: 400, width: '90%', boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
};
