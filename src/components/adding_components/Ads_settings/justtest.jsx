import React, { useEffect, useState, useRef } from 'react';
import axios from '../../../api/fetch';
import useNotification from '../../../Hooks/useNotification';
import './css.css'
  const booleanFields = [
    { name: "isvalid", label: "Valid" },
  ];
const orderMapAdsArray = [
  { label: "ترتيب-الرقم-تصاعدي", value: "id-asc" },
  { label: "ترتيب-الرقم-تنازلي", value: "id-desc" },

  { label: "ترتيب-الاسم-تصاعدي", value: "name-asc" },
  { label: "ترتيب-الاسم-تنازلي", value: "name-desc" },

  { label: "ترتيب-العنوان-تصاعدي", value: "title-asc" },
  { label: "ترتيب-العنوان-تنازلي", value: "title-desc" },

  { label: "ترتيب-الصلاحية-تصاعدي", value: "isvalid-asc" },
  { label: "ترتيب-الصلاحية-تنازلي", value: "isvalid-desc" },

  { label: "ترتيب-تاريخ-الإنشاء-تصاعدي", value: "created-asc" },
  { label: "ترتيب-تاريخ-الإنشاء-تنازلي", value: "created-desc" },

  { label: "ترتيب-آخر-تحديث-تصاعدي", value: "updated-asc" },
  { label: "ترتيب-آخر-تحديث-تنازلي", value: "updated-desc" },
];

const limitOptions = [10,15, 20,30, 50, 100];


export default function AdsModalAdmin() {
  const { showNotification } = useNotification();

  const [ads, setAds] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [orderBy, setOrderBy] = useState(orderMapAdsArray[9]);
  const [search, setSearch] = useState('');

  // modal states
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);

  // form state
  const emptyForm = { softdelete:false,name: '', title: '', link_path: '/', isvalid: false, photo_path: '', disk_filename: '' };
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const dropRef = useRef(null);

  useEffect(() => { fetchAds(); }, [page, limit, orderBy]);

  useEffect(() => {
    if (!file) return setPreview(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

    const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));

  };
  const fetchAds = async (opts = {}) => {
    console.log(orderBy)
    setLoading(true);
    try {
      const params = { page, limit, order: orderBy, ...opts };
      let res;
      if (search && search.trim()) {
        res = await axios.get('/banners/searchinAds', { params: { page, limit, name: search } });
      } else {
        res = await axios.get('/banners/getAds', { params });
      }
      const data = res.data;
      setAds(data.ads || data.rows || []);
      setTotal(data.total || (Array.isArray(data.ads) ? data.ads.length : 0));
      setPage(data.currentPage || page);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error(err);
      showNotification('error', err?.response?.data?.error || err?.message || 'Failed to fetch ads');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setForm(emptyForm); setFile(null); setSelectedAd(null); setShowAdd(true);
  };
  const openEdit = (ad) => {
    setSelectedAd(ad);
    setForm({ name: ad.name || '', title: ad.title || '', link_path: ad.link_path || '/', isvalid: !!ad.isvalid,softdelete:!!ad.softdelete ,photo_path: ad.photo_path || '', disk_filename: ad.disk_filename || '' });
    setPreview(ad.photo_path || null);
    setFile(null);
    setShowEdit(true);
  };

  // drag & drop handlers for modal
  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;

    const onDragOver = (e) => { e.preventDefault(); el.classList.add('drag-over'); };
    const onDragLeave = () => { el.classList.remove('drag-over'); };
    const onDrop = (e) => {
      e.preventDefault(); el.classList.remove('drag-over');
      const f = e.dataTransfer.files && e.dataTransfer.files[0];
      if (f) setFile(f);
    };

    el.addEventListener('dragover', onDragOver);
    el.addEventListener('dragleave', onDragLeave);
    el.addEventListener('drop', onDrop);

    return () => {
      el.removeEventListener('dragover', onDragOver);
      el.removeEventListener('dragleave', onDragLeave);
      el.removeEventListener('drop', onDrop);
    };
  }, [dropRef]);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0] ?? null;
    if (f) setFile(f);
  };

  const submitAdd = async (e) => {
    e && e.preventDefault();
    try {
     
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('title', form.title);
      fd.append('link_path', form.link_path || '/');
      fd.append('isvalid', form.isvalid ? '1' : '0');
      if (file) fd.append('files', file);
      else if (form.photo_path && form.disk_filename) {
        fd.append('photo_path', form.photo_path);
        fd.append('disk_filename', form.disk_filename);
      } else {
        return showNotification('error', 'Image is required (or provide photo_path + disk_filename)');
      }

      const res = await axios.post('/banners/create/addad', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      showNotification('success', 'Ad created');
      setShowAdd(false);
      fetchAds();
    } catch (err) {
      console.error(err);
      showNotification('error', err?.response?.data?.error || err?.message || 'Create failed');
    }
  };

  const submitEdit = async (e) => {
    e && e.preventDefault();
    try {


      if (!selectedAd) return;
      const fd = new FormData();
      fd.append('id', selectedAd.id);
      fd.append('name', form.name);
      fd.append('title', form.title);
      fd.append('link_path', form.link_path || '/');
      fd.append('isvalid', form.isvalid ? 1 : 0);
      if (file) fd.append('files', file);
      else if (form.photo_path && form.disk_filename) {
        fd.append('photo_path', form.photo_path);
        fd.append('disk_filename', form.disk_filename);
      }

      const res = await axios.patch('/banners/update/adupdate', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      showNotification('success', 'Ad updated');
      setShowEdit(false);
      fetchAds();
    } catch (err) {
      console.error(err);
      showNotification('error', err?.response?.data?.error || err?.message || 'Update failed');
    }
  };

  const confirmDelete = async (ad) => {
    if (!window.confirm(`Delete banner ${ad.name} ? This cannot be undone.`)) return;
    try {
      await axios.delete('/banners/delete/deleteAd', { data: { id: ad.id } });
      showNotification('success', 'Deleted');
      fetchAds();
    } catch (err) {
      console.error(err);
      showNotification('error', err?.response?.data?.error || err?.message || 'Delete failed');
    }
  };

 

  const toggleValid = async (ad) => {
    try {
      await axios.post(`/banners/toggle-valid/${ad.id}`);
      showNotification('success', 'Toggled');
      fetchAds();
    } catch (err) {
      console.error(err);
      showNotification('error', err?.response?.data?.error || err?.message || 'Toggle failed');
    }
  };

  const openEditModalFromId = async (id) => {
    try {
      // your backend getonead is listed as GET but controller expects body.id in previous code samples.
      // Many of your existing frontends used POST /banners/getonead with body { id } — we'll use POST for compatibility.
      const res = await axios.post('/banners/getonead', { id });
      const ad = res.data.ads || res.data.ad || res.data;
      openEdit(ad);
    } catch (err) {
      console.error(err);
      showNotification('error', 'Failed to fetch ad');
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Banners / Ads</h3>
        <div className="d-flex gap-2">
          <input className="form-control" placeholder="Search by name..." value={search} onChange={e=>setSearch(e.target.value)} style={{width:240}} />
          <button className="btn btn-primary" onClick={()=>fetchAds()}>Search</button>
          <button className="btn btn-success" onClick={openAdd}>Add Banner</button>
          <div className="dropdown">
          <button className="btn btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
          OrderBy: {orderMapAdsArray.find(i => i.value === orderBy)?.label || "اختر الترتيب"}          </button>
          <ul className="dropdown-menu">
            {orderMapAdsArray.map((item,i) => (
              <li key={i}>
                <button className="dropdown-item" onClick={() => { setOrderBy(item.value); setPage(1); }}>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
         <div className="dropdown">
      <button
        className="btn btn-outline-secondary dropdown-toggle"
        type="button"
        data-bs-toggle="dropdown"
      >
        Limit: {limit}
      </button>

      <ul className="dropdown-menu">
        {limitOptions.map((n, i) => (
          <li key={i}>
            <button
              className="dropdown-item"
              onClick={() => setLimit(n)}
            >
              {n}
            </button>
          </li>
        ))}
      </ul>
    </div>
        </div>
      </div>

      <div className="table-responsive shadow rounded">
        <table className="table table-hover align-middle text-center mb-0">
          <thead className="table-dark">
            <tr>
              <th>Preview</th>
              <th>Name</th>
              <th>Title</th>
              <th>Link</th>
              <th>Valid</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} className="py-3 text-center"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></td></tr>
            )}
            {!loading && ads.length===0 && (
              <tr><td colSpan={7} className="py-3">No banners found</td></tr>
            )}
            {!loading && ads.map(ad=> (


                <tr className={`${ad.isvalid?"table-success":"table-danger"}`} key={ad.id}>
                  <td style={{width:320}}>
                    {ad.photo_path ? <img src={ad.photo_path} alt={ad.name} style={{width:300,height:100,objectFit:'cover'}}/> : <span className="text-muted">No image</span>}
                  </td>
                  <td>{ad.name}</td>
                  <td>{ad.title}</td>
                  <td style={{maxWidth:180,overflow:'hidden',textOverflow:'ellipsis'}}>{ad.link_path}</td>
                  <td>{ad.isvalid ? <span className="badge bg-success">Valid</span> : <span className="badge bg-secondary">Not valid</span>}</td>
                  <td>{new Date(ad.createdAt).toLocaleString()}</td>
                  <td>
                    <div className="d-flex gap-2 justify-content-center">
                      <button className="btn btn-sm btn-outline-primary" onClick={()=>openEditModalFromId(ad.id)}>Edit</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={()=>confirmDelete(ad)}>Delete</button>
                      <button className={`btn btn-sm ${ad.isvalid?"btn-danger":"btn-success"}`} onClick={()=>toggleValid(ad)}>{ad.isvalid ? 'Unpublish' : 'Publish'}</button>
                    </div>
                  </td>
                </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-center gap-2 mt-3">
        <button className="btn btn-outline-primary" disabled={page<=1} onClick={()=>{setPage(p=>Math.max(1,p-1));fetchAds();}}>&lt; Prev</button>
        {Array.from({length: totalPages},(_,i)=> (
          <button key={i} className={`btn ${page===i+1 ? 'btn-primary' : 'btn-outline-primary'}`} onClick={()=>{setPage(i+1);fetchAds();}}>{i+1}</button>
        ))}
        <button className="btn btn-outline-primary" disabled={page>=totalPages} onClick={()=>{setPage(p=>Math.min(totalPages,p+1));fetchAds();}}>Next &gt;</button>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog modal-lg">
            <form className="modal-content" onSubmit={submitAdd}>
              <div className="modal-header">
                <h5 className="modal-title">Add Banner</h5>
                <button type="button" className="btn-close" onClick={()=>setShowAdd(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-2">
                  <div className="col-md-6">
                    <label className="form-label">Name</label>
                    <input className="form-control" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}  />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Title</label>
                    <input className="form-control" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Link Path</label>
                    <input className="form-control" value={form.link_path} onChange={e=>setForm({...form,link_path:e.target.value})} />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Image (drag & drop or click)</label>
                    <div ref={dropRef} className="border rounded p-3 text-center" style={{minHeight:160,position:'relative'}}>
                      <input type="file" accept="image/*" onChange={handleFileChange} style={{position:'absolute',inset:0,opacity:0,cursor:'pointer'}} />
                      <div className="d-flex flex-column align-items-center justify-content-center h-100">
                        <i className="bi bi-cloud-arrow-up" style={{fontSize:28}}></i>
                        <div className="mt-2 text-muted">Drop image here or click to select</div>
                        <div className="mt-2 small text-muted">Large preview: 300 x 120 recommended</div>
                      </div>
                      {preview && <div style={{position:'absolute',right:12,top:12}}><img src={preview} alt="preview" style={{width:300,height:120,objectFit:'cover',borderRadius:4,boxShadow:'0 2px 6px rgba(0,0,0,0.15)'}} /></div>}
                    </div>
                  </div>

         
                  <div className="mb-3 d-flex flex-wrap gap-3">
                  {booleanFields.map(f => (
                    <div key={f.name} className="card p-3 checkbox-card" style={{ minWidth: "150px", flex: "1 1 150px", cursor: "pointer" }} onClick={() => handleChange({ target: { name: f.name, type: "checkbox", checked: !form[f.name] } })}>
                      <span className="fw-bold mb-2 d-block">{f.label}</span>
                      <div className="form-switch-custom">
                        <input type="checkbox" id={f.name} name={f.name} checked={form[f.name]} onChange={handleChange} className="form-switch-input" />
                        <label htmlFor={f.name} className="form-switch-label"><span className="form-switch-button"></span></label>
                     </div>
                      <small className="text-muted mt-1">{form[f.name] ? "Enabled" : "Disabled"}</small>
                    </div>
                ))}
              </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={()=>setShowAdd(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog modal-lg">
            <form className="modal-content" onSubmit={submitEdit}>
              <div className="modal-header">
                <h5 className="modal-title">Edit Banner</h5>
                <button type="button" className="btn-close" onClick={()=>setShowEdit(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-2">
                  <div className="col-md-6">
                    <label className="form-label">Name</label>
                    <input className="form-control" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}  />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Title</label>
                    <input className="form-control" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Link Path</label>
                    <input className="form-control" value={form.link_path} onChange={e=>setForm({...form,link_path:e.target.value})} />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Image (drag & drop or click)</label>
                    <div ref={dropRef} className="border rounded p-3 text-center" style={{minHeight:160,position:'relative'}}>
                      <input type="file" accept="image/*" onChange={handleFileChange} style={{position:'absolute',inset:0,opacity:0,cursor:'pointer'}} />
                      <div className="d-flex flex-column align-items-center justify-content-center h-100">
                        <i className="bi bi-cloud-arrow-up" style={{fontSize:28}}></i>
                        <div className="mt-2 text-muted">Drop image here or click to replace</div>
                        <div className="mt-2 small text-muted">Large preview: 300 x 120 recommended</div>
                      </div>
                      {preview ? <div style={{position:'absolute',right:12,top:12}}><img src={preview} alt="preview" style={{width:300,height:120,objectFit:'cover',borderRadius:4,boxShadow:'0 2px 6px rgba(0,0,0,0.15)'}} /></div>
                               : form.photo_path && <div style={{position:'absolute',right:12,top:12}}><img src={form.photo_path} alt="preview" style={{width:300,height:120,objectFit:'cover',borderRadius:4,boxShadow:'0 2px 6px rgba(0,0,0,0.15)'}} /></div>}
                    </div>
                  </div>



              <div className="mb-3 d-flex flex-wrap gap-3">
                {booleanFields.map(f => (
                  <div key={f.name} className="card p-3 checkbox-card" style={{ minWidth: "150px", flex: "1 1 150px", cursor: "pointer" }} onClick={() => handleChange({ target: { name: f.name, type: "checkbox", checked: !form[f.name] } })}>
                    <span className="fw-bold mb-2 d-block">{f.label}</span>
                    <div className="form-switch-custom">
                      <input type="checkbox" id={f.name} name={f.name} checked={form[f.name]} onChange={handleChange} className="form-switch-input" />
                      <label htmlFor={f.name} className="form-switch-label"><span className="form-switch-button"></span></label>
                    </div>
                    <small className="text-muted mt-1">{form[f.name] ? "Enabled" : "Disabled"}</small>
                  </div>
                ))}
              </div>

                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={()=>setShowEdit(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
