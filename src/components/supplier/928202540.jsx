import React, { useEffect, useState, useRef } from "react";
import axios from "../../api/fetch";
import useNotification from "../../Hooks/useNotification";

/**
 * ShipmentsWithDetailsSection - Responsive version
 * - Desktop/tablet: left = wide details table, right = sticky shipment info card
 * - Mobile (width < 768px): switches to a stacked card list for details (better UX on narrow screens)
 * - Table remains horizontally scrollable on small devices if needed
 * - Actions collapse into a compact dropdown on small screens
 *
 * Requirements:
 * - Bootstrap 5 & Bootstrap Icons via CDN in your HTML
 * - axios configured at ../../api/fetch
 * - useNotification hook returning { showNotification }
 */

const orderLabelsArabic = {
  "date_received-asc": "تاريخ الاستلام - تصاعدي",
  "date_received-desc": "تاريخ الاستلام - تنازلي",
  "paid-asc": "مدفوع - تصاعدي",
  "paid-desc": "مدفوع - تنازلي",
  "total_cost-asc": "التكلفة الإجمالية - تصاعدي",
  "total_cost-desc": "التكلفة الإجمالية - تنازلي",
  "createdAt-asc": "تاريخ الإنشاء - تصاعدي",
  "createdAt-desc": "تاريخ الإنشاء - تنازلي",
  "updatedAt-asc": "تاريخ التحديث - تصاعدي",
  "updatedAt-desc": "تاريخ التحديث - تنازلي",
  "supplier_shipment_id-asc": "معرّف شحنة المورد - تصاعدي",
  "supplier_shipment_id-desc": "معرّف شحنة المورد - تنازلي",
  "product_id-asc": "معرّف المنتج - تصاعدي",
  "product_id-desc": "معرّف المنتج - تنازلي",
  "quantity-asc": "الكمية - تصاعدي",
  "quantity-desc": "الكمية - تناقلي",
  "currency-asc": "العملة - تصاعدي",
  "currency-desc": "العملة - تنازلي",
};

const initialFormState = {
  supplier_id: "",
  supplier_shipment_id: "",
  product_id: "",
  quantity: 0,
  unit_cost: 0,
  total: 0,
  quantity_paid: 0,
  date_received: "",
  total_cost: 0,
  paid: 0,
  currency: "USD",
};

export default function ShipmentsWithDetailsSection({ shipment, shipmentId = null, onClose, onUpdated, onDelete, autoLoad = true }) {
  const { showNotification } = useNotification();

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [limit, setLimit] = useState(100);
  const [orderBy, setOrderBy] = useState("createdAt-desc");
  const [detailsLoading, setDetailsLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);

  const [selectedShipment, setSelectedShipment] = useState(null);
  const [shipmentLoading, setShipmentLoading] = useState(true);

  const [detailsMap, setDetailsMap] = useState([]);
  const [dirtyMap, setDirtyMap] = useState([]);
  const [newdetails, setNewdetails] = useState([]);

  const detailsRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  // Responsive helpers
  useEffect(() => {
    function onResize() {
      setIsMobile(window.innerWidth < 768);
    }
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // CSS: responsive tweaks, stack card layout on mobile
  const modernCSS = `
    .modern-card{ border:0; border-radius:12px; box-shadow:0 10px 30px rgba(34,41,47,0.06); background:linear-gradient(#ffffff,#fbfdff); }
    .modern-header{ padding:16px 20px; border-bottom:1px solid rgba(15,23,42,0.04); }
    .section-title{ font-weight:600; }
    .muted-chip{ padding:8px 10px; border-radius:10px; background:rgba(15,23,42,0.03); }
    .modern-table input{ border:0; background:transparent; padding:6px 8px; border-radius:8px; min-width:60px; }
    .modern-table input:focus{ outline:2px solid rgba(79,70,229,0.12); box-shadow:0 2px 8px rgba(79,70,229,0.06); }
    .shipment-info-card{ border-radius:10px; padding:14px; background:#fff; box-shadow:0 6px 18px rgba(2,6,23,0.04); }
    .shipment-info-card.sticky{ position:sticky; top:20px; }

    /* New add UX */
    .add-form { background: linear-gradient(180deg,#fbfcff,#fff); border:1px solid rgba(15,23,42,0.03); padding:12px; border-radius:10px; }
    .add-queue { display:flex; gap:10px; flex-wrap:wrap; }
    .queue-card{ background:#fff; border:1px solid rgba(15,23,42,0.04); border-radius:10px; padding:10px 12px; min-width:220px; box-shadow:0 6px 16px rgba(2,6,23,0.03); }
    .suggestions { position:absolute; z-index:50; background:#fff; border:1px solid rgba(0,0,0,0.06); border-radius:8px; max-height:160px; overflow:auto; width:100%; }
    .suggest-item{ padding:8px 10px; cursor:pointer; }
    .suggest-item:hover{ background:rgba(79,70,229,0.03); }

    @media (max-width:767px){
      .add-form { padding:10px; }
      .queue-card{ min-width:100%; }
      .modern-table table{ min-width:700px; }
    }
  `;

  // ---------- editing helpers (same logic kept) ----------
  const addToUpdate = (item) => setDirtyMap((prev) => (prev.find((d) => d.id === item.id) ? prev : [...prev, { ...item }]));
  const updateUpdate = (id, field, value) => setDirtyMap((prev) => prev.map((item) => (item.id !== id ? item : { ...item, [field]: value })));
  const removeFromUpdate = (id) => setDirtyMap((prev) => prev.filter((i) => i.id !== id));

  const saveAll = async () => {
    if (dirtyMap.length === 0) { showNotification("info", "ℹ️ No changes to save"); return; }
    setUpdateLoading(true);
    try {
      const res = await axios.post('/supplier_shipment_detail/bulk_update', { updates: dirtyMap });
      showNotification("success", `✅ saved ${res.data.updatedCount || res.data.updatedDetails?.length || dirtyMap.length}`);
      if (res.data.updatedDetails) setDetailsMap((prev) => prev.map((d) => (res.data.updatedDetails.find((u) => u.id === d.id) ? { ...d, ...res.data.updatedDetails.find((u) => u.id === d.id) } : d)));
      setDirtyMap([]);
    } catch (err) { showNotification('error', err?.response?.data?.message || err.message || 'Save failed'); }
    finally { setUpdateLoading(false); }
  };

  const saveOne = async (id) => {
    setUpdateLoading(true);
    try {
      const item = dirtyMap.find((d) => d.id === id);
      if (!item) { showNotification('info', 'No changes'); return; }
      const res = await axios.post('/supplier_shipment_detail/update', item);
      showNotification('success', '✅ saved');
      if (res.data.detail) setDetailsMap((prev) => prev.map((d) => (d.id === id ? { ...d, ...res.data.detail } : d)));
      setDirtyMap((prev) => prev.filter((d) => d.id !== id));
    } catch (err) { showNotification('error', err?.response?.data?.message || err.message || 'Save failed'); }
    finally { setUpdateLoading(false); }
  };

  const deleteOne = async (id) => {
    if (!window.confirm('هل أنت متأكد؟')) return;
    setUpdateLoading(true);
    try {
      await axios.post('/supplier_shipment_detail/delete/delete', { id });
      showNotification('success', '✅ deleted');
      await fetchShipmentDetails();
      onDelete && onDelete(id);
    } catch (err) { showNotification('error', err?.response?.data?.message || err.message || 'Delete failed'); }
    finally { setUpdateLoading(false); }
  };

  // new items
  const addDirtyItem = () => setNewdetails((prev) => ([...prev, { ...initialFormState, supplier_shipment_id: selectedShipment?.id || selectedShipment?.uuid || '', id: `new-${Date.now()}`, date_received: today }]));
  const updateDirtyItem = (id, field, value) => setNewdetails((prev) => prev.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
  const deleteDirtyItem = (id) => setNewdetails((prev) => prev.filter((it) => it.id !== id));
  const createDirtyItem = async () => { if (newdetails.length === 0) { showNotification('info','No new items'); return; } setDetailsLoading(true); try { const payload = newdetails.map(d => { const c = {...d}; if (typeof c.id === 'string' && c.id.startsWith('new-')) delete c.id; return c; }); await axios.post('/supplier_shipment_detail/create', { details: payload }); showNotification('success','✅ created'); setNewdetails([]); await fetchShipmentDetails(); } catch (err) { showNotification('error', err?.response?.data?.message || err.message || 'Create failed'); } finally { setDetailsLoading(false); } };

  // fetching
  async function fetchShipment() { if (!selectedShipment?.uuid && !shipmentId) return; setShipmentLoading(true); try { const res = await axios.post('/supplier_shipment/getById', { id: selectedShipment.uuid || shipmentId }); const sh = res.data?.shipment || res.data; setSelectedShipment(sh || null); setPage(1); setTotalPages(0); setOrderBy('createdAt-desc'); await fetchShipmentDetails(sh?.uuid || sh?.id || shipmentId); } catch (err) { showNotification('error','Failed to load shipment'); } finally { setShipmentLoading(false); } }

  async function fetchShipmentDetails(overrideShipmentId) { if (!selectedShipment && !overrideShipmentId) return; setDetailsLoading(true); try { const res = await axios.post('/supplier_shipment_detail/getByShipmentId', { page, limit, orderBy, shipment_id: overrideShipmentId || selectedShipment.uuid || selectedShipment.id }); const data = res.data || {}; setDetailsMap(data.details || data || []); setPage(data.page || page); setTotalPages(data.totalPages || 0); setDirtyMap([]); setNewdetails([]); } catch (err) { showNotification('error','Failed to load shipment details'); } finally { setDetailsLoading(false); } }

  useEffect(() => { if (shipment) { setSelectedShipment(shipment); setShipmentLoading(false); fetchShipmentDetails(); } else if (shipmentId) { setSelectedShipment({ uuid: shipmentId }); fetchShipment(); } else { setSelectedShipment(null); setDetailsMap([]); setDirtyMap([]); setNewdetails([]); setShipmentLoading(false); } // eslint-disable-next-line
  }, [shipment, shipmentId]);

  useEffect(() => { if (selectedShipment && autoLoad) fetchShipmentDetails(); // eslint-disable-next-line
  }, [page, limit, orderBy, selectedShipment]);

  // helpers
  function displayNumber(n) { if (n === null || n === undefined) return '-'; return Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

  // render list item for mobile
  function MobileDetailCard({ d, idx }) {
    const isDirty = dirtyMap.find(x => x.id === d.id);
    return (
      <div className="details-card" key={d.id || idx}>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <div className="label">المنتج</div>
            <div className="value">{d.product_name || d.product_id || '-'}</div>
          </div>
          <div className="text-end">
            <small className="text-muted">#{idx + 1}</small>
            <div className="mt-1">
              <div className="btn-group">
                <button className="btn btn-sm btn-outline-secondary" onClick={() => { if (!isDirty) addToUpdate({ ...d }); updateUpdate(d.id, 'quantity', (isDirty ? (dirtyMap.find(x=>x.id===d.id)?.quantity||d.quantity) : d.quantity) ); }} title="Edit">
                  <i className="bi bi-pencil" />
                </button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => deleteOne(d.id)} title="Delete"><i className="bi bi-trash" /></button>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-2">
          <div className="col-6">
            <div className="label">الكمية</div>
            <div className="value">{d.quantity || '-'}</div>
          </div>
          <div className="col-6">
            <div className="label">تكلفة الوحدة</div>
            <div className="value">{d.unit_cost ? displayNumber(d.unit_cost) : '-'}</div>
          </div>
          <div className="col-6 mt-2">
            <div className="label">التكلفة الإجمالية</div>
            <div className="value">{d.total_cost ? displayNumber(d.total_cost) : '-'}</div>
          </div>
          <div className="col-6 mt-2">
            <div className="label">المدفوع</div>
            <div className="value">{d.paid ? displayNumber(d.paid) : '-'}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-card card p-0 mb-3">
      <style dangerouslySetInnerHTML={{ __html: modernCSS }} />
      <div className="modern-header d-flex justify-content-between align-items-start">
        <div>
          <h5 className="section-title mb-1">تفاصيل شحنة المورد</h5>
          <div className="text-muted">عرض وتحرير عناصر الشحنة بشكل مباشر — responsive</div>
        </div>

        <div className="d-flex gap-2 align-items-center">
          <select className="form-select form-select-sm" value={orderBy} onChange={(e) => setOrderBy(e.target.value)}>
            {Object.entries(orderLabelsArabic).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <div className="btn-group">
            <button className="btn btn-outline-primary btn-sm" onClick={() => fetchShipmentDetails()} title="Reload"><i className="bi bi-arrow-clockwise me-1" /> تحديث</button>
            <button className="btn btn-light btn-sm" onClick={() => onClose && onClose()}>إغلاق</button>
          </div>
        </div>
      </div>

      <div className="card-body">
        <div className="row">
                     {/* RIGHT column */}
          <div className="col-lg-4 col-md-12 mb-3">
            <div className={`shipment-info-card ${isMobile? '':'sticky'}`}>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="text-muted">المورّد</div>
                  <div className="fw-semibold">{selectedShipment?.supplier_name||selectedShipment?.supplier_id||'-'}</div>
                </div>
                <div>
                  <button className="btn btn-sm btn-outline-secondary" onClick={()=>fetchShipmentDetails()}><i className="bi bi-arrow-clockwise" /></button>
                </div>
              </div>

              <div className="mb-2"><div className="text-muted">شحنة</div><div className="fw-semibold">{selectedShipment?.uuid||selectedShipment?.id||'-'}</div></div>
              <div className="mb-2"><div className="text-muted">تاريخ الاستلام</div><div className="fw-semibold">{selectedShipment?.date_received||'-'}</div></div>

              <hr />

              <div className="mb-2"><div className="text-muted">إجمالي التكلفة (محسوب)</div><div className="fw-semibold">{detailsMap && detailsMap.length ? displayNumber(detailsMap.reduce((s,r)=>s + (Number(r.total_cost || r.quantity * r.unit_cost || 0)),0)) : '-'}</div></div>
              <div className="mb-2"><div className="text-muted">المبلغ المدفوع (محسوب)</div><div className="fw-semibold">{detailsMap && detailsMap.length ? displayNumber(detailsMap.reduce((s,r)=>s + Number(r.paid || 0),0)) : '-'}</div></div>

              <div className="d-grid gap-2 mt-3">
                <button className="btn btn-primary" onClick={addDirtyItem}>إضافة سطر جديد</button>
                <button className="btn btn-outline-danger" onClick={()=>{ if(window.confirm('هل تريد حذف كل العناصر المحلية غير المحفوظة؟')){ setDirtyMap([]); setNewdetails([]); } }}>مسح التعديلات المحلية</button>
              </div>

              <div className="mt-3 d-flex gap-2">
                <button className="btn btn-sm btn-light" title="طباعة"><i className="bi bi-printer" /></button>
                <button className="btn btn-sm btn-light" title="تصدير"><i className="bi bi-download" /></button>
                <button className="btn btn-sm btn-light" title="مشاركة"><i className="bi bi-share" /></button>
              </div>
            </div>
          </div>

          <div className="col-lg-8 col-md-12 mb-3">
            {/* Desktop/tablet: table; Mobile: stacked cards */}
            {detailsLoading ? (
              <div className="p-4 text-center"><div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div></div>
            ) : (
              isMobile ? (
                <div>
                  {detailsMap.length === 0 ? <div className="text-center text-muted py-3">لا توجد عناصر</div> : detailsMap.map((d, idx) => <MobileDetailCard d={d} idx={idx} key={d.id||idx} />)}
                </div>
              ) : (
                <div className="table-responsive modern-table">
                  <table className="table align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>المنتج</th>
                        <th>الكمية</th>
                        <th>تكلفة الوحدة</th>
                        <th>التكلفة الإجمالية</th>
                        <th>المدفوع</th>
                        <th>العملة</th>
                        <th>تاريخ الاستلام</th>
                        <th className="text-end">أفعال</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailsMap.length === 0 ? (
                        <tr><td colSpan={9} className="text-center text-muted py-4">لا توجد عناصر</td></tr>
                      ) : (
                        detailsMap.map((d, idx) => {
                          const isDirty = dirtyMap.find(x => x.id === d.id);
                          return (
                            <tr key={d.id||idx} className={isDirty? 'table-warning':''}>
                              <td>{idx+1}</td>
                              <td>{d.product_name||d.product_id||'-'}</td>
                              <td><input className="form-control form-control-sm" type="number" min={0} value={isDirty? (dirtyMap.find(x=>x.id===d.id)?.quantity||'') : d.quantity||''} onChange={(e)=>{ if(!isDirty) addToUpdate({...d}); updateUpdate(d.id,'quantity',e.target.value); }} /></td>
                              <td><input className="form-control form-control-sm" type="number" step="0.01" min={0} value={isDirty? (dirtyMap.find(x=>x.id===d.id)?.unit_cost||'') : d.unit_cost||''} onChange={(e)=>{ if(!isDirty) addToUpdate({...d}); updateUpdate(d.id,'unit_cost',e.target.value); }} /></td>
                              <td><input className="form-control form-control-sm" type="number" step="0.01" min={0} value={isDirty? (dirtyMap.find(x=>x.id===d.id)?.total_cost||'') : d.total_cost||''} onChange={(e)=>{ if(!isDirty) addToUpdate({...d}); updateUpdate(d.id,'total_cost',e.target.value); }} /></td>
                              <td><input className="form-control form-control-sm" type="number" step="0.01" min={0} value={isDirty? (dirtyMap.find(x=>x.id===d.id)?.paid||'') : d.paid||''} onChange={(e)=>{ if(!isDirty) addToUpdate({...d}); updateUpdate(d.id,'paid',e.target.value); }} /></td>
                              <td><input className="form-control form-control-sm" value={isDirty? (dirtyMap.find(x=>x.id===d.id)?.currency||'') : d.currency||''} onChange={(e)=>{ if(!isDirty) addToUpdate({...d}); updateUpdate(d.id,'currency',e.target.value); }} /></td>
                              <td><input className="form-control form-control-sm" type="date" value={isDirty? (dirtyMap.find(x=>x.id===d.id)?.date_received||'') : d.date_received||''} onChange={(e)=>{ if(!isDirty) addToUpdate({...d}); updateUpdate(d.id,'date_received',e.target.value); }} /></td>
                              <td className="text-end">
                                <div className="btn-group btn-group-sm">
                                  <button className="btn btn-success" onClick={()=>saveOne(d.id)} disabled={!isDirty||updateLoading}><i className="bi bi-save" /></button>
                                  <button className={`btn ${isDirty? 'btn-warning':'btn-outline-secondary'}`} onClick={()=> isDirty? removeFromUpdate(d.id): addToUpdate({...d}) }><i className={isDirty? 'bi bi-x':'bi bi-pencil'} /></button>
                                  <button className="btn btn-outline-danger" onClick={()=>deleteOne(d.id)}><i className="bi bi-trash" /></button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {/* bulk actions */}
            <div className="d-flex justify-content-between align-items-center mt-3 mb-3">
              <div className="d-flex gap-2">
                <button className="btn btn-primary" onClick={saveAll} disabled={dirtyMap.length===0||updateLoading}>حفظ كل التغييرات</button>
                <button className="btn btn-outline-secondary" onClick={()=>{ setDirtyMap([]); showNotification('info','تم إلغاء جميع التعديلات'); }}>إلغاء التعديلات</button>
              </div>

              <div className="d-flex gap-2 align-items-center">
                <div className="text-muted">صفحة</div>
                <input type="number" className="form-control form-control-sm" style={{width:80}} value={page} onChange={(e)=>setPage(Number(e.target.value||1))} />
                <div className="text-muted">/ {totalPages||1}</div>
              </div>
            </div>

            <hr />

            {/* new items editor (keeps simple table style even on mobile for brevity) */}
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0">إضافة عناصر جديدة</h6>
                <div className="btn-group">
                  <button className="btn btn-outline-success" onClick={addDirtyItem}><i className="bi bi-plus-lg me-1" /> إضافة سطر</button>
                  <button className="btn btn-primary" onClick={createDirtyItem} disabled={newdetails.length===0||detailsLoading}>إنشاء العناصر</button>
                </div>
              </div>

              {newdetails.length===0 ? <div className="text-muted p-2">اضغط "إضافة سطر" لبدء</div> : (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead className="table-light"><tr><th>#</th><th>منتج</th><th>كمية</th><th>سعر</th><th>تكلفة</th><th>مدفوع</th><th>حذف</th></tr></thead>
                    <tbody>
                      {newdetails.map((d,i)=>(
                        <tr key={d.id||i}>
                          <td>{i+1}</td>
                          <td><input className="form-control form-control-sm" value={d.product_id||''} onChange={(e)=>updateDirtyItem(d.id,'product_id',e.target.value)} /></td>
                          <td><input className="form-control form-control-sm" type="number" min={0} value={d.quantity||''} onChange={(e)=>updateDirtyItem(d.id,'quantity',e.target.value)} /></td>
                          <td><input className="form-control form-control-sm" type="number" step="0.01" value={d.unit_cost||''} onChange={(e)=>updateDirtyItem(d.id,'unit_cost',e.target.value)} /></td>
                          <td><input className="form-control form-control-sm" type="number" step="0.01" value={d.total_cost||''} onChange={(e)=>updateDirtyItem(d.id,'total_cost',e.target.value)} /></td>
                          <td><input className="form-control form-control-sm" type="number" step="0.01" value={d.paid||''} onChange={(e)=>updateDirtyItem(d.id,'paid',e.target.value)} /></td>
                          <td><button className="btn btn-sm btn-outline-danger" onClick={()=>deleteDirtyItem(d.id)}><i className="bi bi-trash" /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

 

        </div>
      </div>
    </div>
  );
}
