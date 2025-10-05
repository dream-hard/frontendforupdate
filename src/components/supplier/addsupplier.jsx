import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from '../../api/fetch';
import useNotification from '../../Hooks/useNotification';

// AddSupplier.jsx
// Simple page to create a Supplier matching your Sequelize model:
// fields: name, phone_number, address, metadata (JSON)

export default function AddSupplier() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [form, setForm] = useState({
    name: '',
    phone_number: '',
    address: '',
  });

  const [metadataObj, setMetadataObj] = useState({});
  const [metaKey, setMetaKey] = useState('');
  const [metaValue, setMetaValue] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // phone validation regex (same as your model)
  const phoneRegex = /^\+?[0-9\s()\-]{7,20}$/;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddMetadata = () => {
    if (!metaKey.trim() || !metaValue.trim()) return;
    setMetadataObj(prev => ({ ...prev, [metaKey.trim()]: metaValue }));
    setMetaKey('');
    setMetaValue('');
  };

  const handleRemoveMetadata = (k) => {
    const copy = { ...metadataObj };
    delete copy[k];
    setMetadataObj(copy);
  };

  const validate = () => {
    const e = {};
    if (!form.name || !form.name.trim()) e.name = 'Name is required';
    if (!form.phone_number || !form.phone_number.trim()) e.phone_number = 'Phone is required';
    else if (!phoneRegex.test(form.phone_number.trim())) e.phone_number = 'Invalid phone format';
    // address is optional per your model but you can enforce min length if you want
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const eobj = validate();
    if (Object.keys(eobj).length > 0) {
      setErrors(eobj);
      showNotification('error', Object.values(eobj).join(' - '));
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        phone_number: form.phone_number.trim(),
        address: form.address?.trim() || '',
        metadata: JSON.stringify(metadataObj || {}),
      };

      // adjust endpoint if your backend is different
      const res = await axios.post('/supplier/create/createsupplier', payload);
      showNotification('success', 'تمت إضافة المورد بنجاح');
      navigate(-1);
    } catch (err) {
      console.log(err)
      const msg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'فشل العملية';
      showNotification('error', msg);
      // if backend returns validation errors, show them
      if (err?.response?.data?.errors) setErrors(err.response.data.errors);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container my-5">
      <div className="d-flex justify-content-start align-items-center  py-3 mb-1 shadow-sm rounded">
        <NavLink 
          to="/dashboard/supplier" 
          className="btn btn-outline-danger d-flex align-items-center gap-2"
        >
          Back
          <i className="bi bi-arrow-right"></i>
        </NavLink>
      </div>

      <h2>إضافة مورد جديد</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">الاسم</label>
          <input
            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">رقم الهاتف</label>
          <input
            className={`form-control ${errors.phone_number ? 'is-invalid' : ''}`}
            name="phone_number"
            value={form.phone_number}
            onChange={handleChange}
            placeholder="مثال: +96170123456 or 070123456"
            required
          />
          {errors.phone_number && <div className="invalid-feedback">{errors.phone_number}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">العنوان</label>
          <textarea
            className="form-control"
            name="address"
            rows={2}
            value={form.address}
            onChange={handleChange}
          />
        </div>

        {/* Metadata */}
        <div className="mb-3">
          <label className="form-label">Metadata</label>
          <div className="d-flex flex-wrap gap-2 mb-2">
            {Object.entries(metadataObj).map(([k, v]) => (
              <div key={k} className="p-2 border rounded bg-light d-flex align-items-center" style={{ minWidth: 140 }}>
                <div className="me-2">
                  <div className="fw-bold text-primary" style={{ fontSize: 12 }}>{k}</div>
                  <div style={{ fontSize: 12 }}>{String(v)}</div>
                </div>
                <button type="button" className="btn-close ms-auto" onClick={() => handleRemoveMetadata(k)}></button>
              </div>
            ))}
          </div>

          <div className="input-group">
            <input className="form-control" placeholder="Key" value={metaKey} onChange={e => setMetaKey(e.target.value)} />
            <input className="form-control" placeholder="Value" value={metaValue} onChange={e => setMetaValue(e.target.value)} />
            <button type="button" className="btn btn-outline-primary" onClick={handleAddMetadata}>Add</button>
          </div>
        </div>

        <div className="d-flex gap-2 justify-content-end">
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)} disabled={submitting}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving...' : 'Add Supplier'}</button>
        </div>
      </form>
    </div>
  );
}
