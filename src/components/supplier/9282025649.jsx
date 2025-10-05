import React, { useEffect, useState, useRef } from "react";
import axios from "../../api/fetch";
import useNotification from "../../Hooks/useNotification";
import SearchableSelect from "./searchselectforediting";
import { set } from "date-fns";

/**
 * ShipmentsWithDetailsSection - Responsive + Modern "Add" UX
 * - Keeps existing table editing features
 * - Replaces the "Add new items" area with a modern, friendly inline form + queue
 * - Features:
 *    • compact inline form with live computed total
 *    • product autocomplete suggestions (from existing details if available)
 *    • queue of new items displayed as modern cards (editable before sending)
 *    • Add to queue / Add & Create (submit immediately) / Clear
 *
 * Requirements: Bootstrap 5 + Bootstrap Icons (CDN) in HTML + axios at ../../api/fetch
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
};

const initialFormState = {
  supplier_id: "",
  supplier_shipment_id: "",
  product_id: "",
  product_name: "",
  quantity: 1,
  unit_cost: 0,
  total_cost: 0,
  quantity_paid: 0,
  date_received: "",
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
  const [newdetails, setNewdetails] = useState([]); // queued new items

  // Inline new item form state
  const [showNewForm, setShowNewForm] = useState(false);
  const [newItemForm, setNewItemForm] = useState({ ...initialFormState });
  const [isMobile, setIsMobile] = useState(false);
  const [products, setProducts] = useState([]);
  const [currencies, setCurrencies] = useState([{ currency_iso: "USD" }]);


  const detailsRef = useRef(null);
  const today = new Date().toISOString().split("T")[0];

  // Responsive helpers
  useEffect(() => {
    function onResize() { setIsMobile(window.innerWidth < 768); }
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // modern CSS (kept concise)
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
    
    // ---------- Helper functions for add form ----------

    
    function computeNewItemTotal(form) {
    const q = Number(form.quantity || 0);
    const u = Number(form.unit_cost || 0);
    const t = Number(form.total_cost || 0);
    // if total_cost provided, use it, otherwise compute
    return t || (q * u) || 0;
  }

  function handleNewFieldChange(field, value) {
    setNewItemForm(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'quantity' || field === 'unit_cost') {
        next.total_cost = computeNewItemTotal(next);
      }
      return next;
    });
  }

  function pickSuggestion(s) {
    setNewItemForm(prev => ({ ...prev, product_name: s, product_id: s }));
  }

  // suggestions visibility

  function addToQueue() {
    // basic validation
    if (!newItemForm.product_name && !newItemForm.product_id) { showNotification('error','اختر منتج أو ادخله'); return; }
    if (!newItemForm.quantity || Number(newItemForm.quantity) <= 0) { showNotification('error','ادخل كمية صحيحة'); return; }

    const item = { ...newItemForm, id: `new-${Math.floor(Math.random()*10000)}` };
    console.log(item);
    setNewdetails(prev => [ ...prev,item]);
    setShowNewForm(false);
    setNewItemForm({ ...initialFormState, supplier_shipment_id: selectedShipment?.id || selectedShipment?.uuid || '', date_received: today });
    showNotification('success','تمت إضافة العنصر الى قائمة الإنشاء');
  }

  function editQueuedItem(id, field, value) {
    setNewdetails(prev => prev.map(it => it.id === id ? ({ ...it, [field]: value, total_cost: field === 'quantity' || field === 'unit_cost' ? (Number(it.unit_cost||0) * Number(it.quantity||0)) : it.total_cost }) : it));
  }

  function removeQueuedItem(id) { setNewdetails(prev => prev.filter(it => it.id !== id)); }

  async function submitQueue() {
    if (newdetails.length === 0) { showNotification('info','لا توجد عناصر في قائمة الإنشاء'); return; }
    setDetailsLoading(true);
    try {
      const payload = newdetails.map(d => { const c = { ...d }; if (typeof c.id === 'string' && c.id.startsWith('new-')) delete c.id; return c; });
      console.log(payload);
      const res = await axios.post('/supplier_shipment_detail/create/bulkCreateDetails', { details: payload });
      showNotification('success','✅ تم إنشاء العناصر');
      setNewdetails([]);
      setDirtyMap([]);
      await fetchShipmentDetails();
    } catch (err) {
        console.log(err);
      showNotification('error', err?.response?.data?.message || err.message || 'فشل إنشاء العناصر');
    } finally { setDetailsLoading(false); }
  }
  async function submitoneitem(id) {
    
    
  }
  // ---------- existing editing helpers (kept) ----------
  const addToUpdate = (item) => setDirtyMap(prev => (prev.find(d=>d.id===item.id)?prev:[...prev,{...item}]));
  const updateUpdate = (id, field, value) => setDirtyMap(prev => prev.map(item => item.id !== id ? item : { ...item, [field]: value }));
  const removeFromUpdate = (id) => setDirtyMap(prev => prev.filter(i => i.id !== id));

  const saveAll = async () => {
    if (dirtyMap.length === 0) { showNotification('info','ℹ️ No changes to save'); return; }
    setUpdateLoading(true);
    try {
      const res = await axios.patch('/supplier_shipment_detail/update/bulkUpdateDetails', { updates: dirtyMap });
      showNotification('success', `✅ تم حفظ ${res.data.updatedCount || res.data.updatedDetails?.length || dirtyMap.length}`);
      if (res.data.updatedDetails) setDetailsMap(prev => prev.map(d => (res.data.updatedDetails.find(u => u.id === d.id) ? { ...d, ...res.data.updatedDetails.find(u => u.id === d.id) } : d)));
      setDirtyMap([]);
      await fetchShipmentDetails();
    } catch (err) { showNotification('error', err?.response?.data?.message || err.message || 'Save failed'); }
    finally { setUpdateLoading(false); }
  };

  const saveOne = async (id) => {
    setUpdateLoading(true);
    try {
      const item = dirtyMap.find(d => d.id === id);
      if (!item) { showNotification('info','لا توجد تغييرات'); return; }
      console.log("saving one",item);
      const res = await axios.patch('/supplier_shipment_detail/update/update', item);
      showNotification('success','✅ تم الحفظ');
      if (res.data.detail) setDetailsMap(prev => prev.map(d => (d.id === id ? { ...d, ...res.data.detail } : d)));
      setDirtyMap(prev => prev.filter(d => d.id !== id));
    } catch (err) {console.error(err); showNotification('error', err?.response?.data?.message || err.message || 'Save failed'); }
    finally { setUpdateLoading(false); }
  };

  const deleteOne = async (id) => {
    setUpdateLoading(true);
    try {
      await axios.delete(`/supplier_shipment_detail/delete/delete?id=${id}`, );
      showNotification('success','✅ تم الحذف');
      await fetchShipmentDetails();
      onDelete && onDelete(id);
    } catch (err) {console.error(err); showNotification('error', err?.response?.data?.message || err.message || 'Delete failed'); }
    finally { setUpdateLoading(false); }
  };

  // fetching
  async function fetchShipment() { 
    console.log("fetchShipment",selectedShipment);
    if (!selectedShipment?.uuid && !shipmentId &&!selectedShipment.id) return;
     setShipmentLoading(true);
      try { const res = await axios.post('/supplier_shipment/getById', { id: selectedShipment.uuid ||selectedShipment.id|| shipmentId }); 
        const sh = res.data?.shipment || res.data; setSelectedShipment(sh || null);
        setPage(1);
        setTotalPages(0);
        setOrderBy('createdAt-desc');
        await fetchShipmentDetails(sh?.uuid || sh?.id || shipmentId); 
        } catch (err) {
         showNotification('error','Failed to load shipment');
        } finally { 
            setShipmentLoading(false); 
        } 
    }


  async function fetchShipmentDetails(overrideShipmentId) { 
    if (!selectedShipment && !overrideShipmentId) return; 
    setDetailsLoading(true); 
    try { const res = await axios.post('/supplier_shipment_detail/getDetailsByShipment', { page, limit, orderBy, shipment_id: overrideShipmentId || selectedShipment.uuid || selectedShipment.id });
     const data = res.data || {}; 
     setDetailsMap(data.details || data || []); 
     setPage(data.page || page);
     setTotalPages(data.totalPages || 0); 
     setDirtyMap([]); setNewdetails([]); 
    } catch (err) { 
        console.log(err);
        showNotification('error','Failed to load shipment details'); 
    } finally { 
        setDetailsLoading(false); 
    } 
}

  async function fetchProducts() { 
    try { const res = await axios.get('/product/justgetall'); 
        setProducts(res.data||res.data.products ||[]); 
    } catch (err) { 
        setProducts([]);
    } 
}
async function fetchcurrencies() {
    try {
        const curs = await axios.get('/currency/justgetall');
        setCurrencies(curs.data);
    } catch (error) {
        setCurrencies([{ currency_iso: "USD" }]);
    }
}

  const [expanded, setExpanded] = useState({}); // { [id]: true }

  const toggleExpand = (id) => {
    setExpanded((p) => ({ ...p, [id]: !p[id] }));
  };

  useEffect(() => { 
    if (shipment) { 
        setSelectedShipment(shipment); 
        setShipmentLoading(false); 
        fetchShipmentDetails(); 
    } else if (shipmentId) { 
        setSelectedShipment({ uuid: shipmentId }); 
        fetchShipment(); 
    } else { 
        setSelectedShipment(null); 
        setDetailsMap([]); 
        setDirtyMap([]); 
        setNewdetails([]); 
        setShipmentLoading(false); 
    } // eslint-disable-next-line
  }, [shipment, shipmentId]);

  useEffect(() => { if (selectedShipment ) fetchShipmentDetails(); 
    fetchProducts();
    fetchcurrencies();
    return () => {};
    // eslint-disable-next-line
  }, [page, limit, orderBy, selectedShipment]);

  function displayNumber(n) { 
    if (n === null || n === undefined) return '-'; 
    return Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }); 
}

  // ---------- Render ----------
  return (
    <div className="modern-card card p-0 mb-3">
      <style dangerouslySetInnerHTML={{ __html: modernCSS }} />

      <div className="modern-header d-flex justify-content-between align-items-start">
        <div>
          <h5 className="section-title mb-1">تفاصيل شحنة المورد</h5>
          <div className="text-muted">عرض وتحرير عناصر الشحنة — واجهة اضافة محسّنة</div>
        </div>

        <div className="d-flex gap-2 align-items-center">
          <select className="form-select form-select-sm" value={orderBy} onChange={(e) => setOrderBy(e.target.value)}>
            {Object.entries(orderLabelsArabic).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <div className="btn-group">
 
            <button className="btn btn-outline-danger btn-sm" onClick={() =>{ 
                setDirtyMap([]);
                setNewdetails([]);
                setShowNewForm(false);
                setSelectedShipment(null);
                setDetailsMap([]);
                setNewItemForm({ ...initialFormState, supplier_shipment_id: selectedShipment?.id || selectedShipment?.uuid || '', date_received: "" });
                onClose && onClose()}}>إغلاق</button>
          </div>
        </div>
      </div>

      <div className="card-body">
        <div className="row">
                      {/* RIGHT column: shipment info */}
          <div className="col-lg-4 col-md-12 mb-3">
            <div className={`shipment-info-card ${isMobile? '':'sticky'}`}>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="text-muted">المورّد</div>
                  <div className="fw-semibold">{selectedShipment?.Supplier.name||selectedShipment?.supplier_id||'-'}</div>
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
                <button className="btn btn-primary" onClick={()=>{ setShowNewForm(true); setNewItemForm({ ...initialFormState, supplier_shipment_id: selectedShipment?.id || selectedShipment?.uuid || '', date_received: today }); }}>إضافة سطر جديد</button>
                <button className="btn btn-outline-danger" onClick={()=>{  setDirtyMap([]); setNewdetails([]);showNotification("info","تم لإالغاء جميع التعديلات") }}>مسح التعديلات المحلية</button>
              </div>

              <div className="mt-3 d-flex gap-2">
                <button className="btn btn-sm btn-light" title="طباعة"><i className="bi bi-printer" /></button>
                <button className="btn btn-sm btn-light" title="تصدير"><i className="bi bi-download" /></button>
                <button className="btn btn-sm btn-light" title="مشاركة"><i className="bi bi-share" /></button>
              </div>
            </div>
          </div>
            {/* LEFT column: details list + add form */}
          <div className="col-lg-8 col-md-12 mb-3">

            {/* DETAILS (table or mobile cards) */}
    <div className="table-responsive modern-table mb-3">
  <table className="table align-middle">
    <thead className="table-light">
      <tr>
        <th>#</th>
        <th>المنتج</th>
        <th>الكمية</th>
        <th>تكلفة الوحدة</th>
        <th>التكلفة الإجمالية</th>
        <th>التكلفة الإجمالية(حسب العدد)</th>
        <th>المدفوع</th>
        <th>العملة</th>
        <th>تاريخ الاستلام</th>
        <th>المدفوع (للوحدة)</th>
        <th className="text-end">Action</th>
      </tr>
    </thead>

    <tbody>
      {detailsLoading ? (
        // show a single centered loading row spanning all columns
        <tr>
          <td colSpan={9} className="text-center py-4">
            <div className="d-flex flex-column align-items-center gap-2">
              <div className="spinner-border" role="status" />
              <div className="text-muted small">جارٍ التحميل...</div>
            </div>
          </td>
        </tr>
      ) : detailsMap.length === 0 ? (
        // no data
        <tr>
          <td colSpan={9} className="text-center text-muted py-4">
            لا توجد عناصر
          </td>
        </tr>
      ) : (
        // data rows
        detailsMap.map((d, idx) => {
          const dirty = dirtyMap.find(x => x.id === d.id);
          const isDirty = Boolean(dirty);
          if (isDirty) {
            return (  <tr key={d.id ?? idx} className="align-middle d-none d-md-table-row">
        <td>{idx + 1}</td>

        <td style={{ minWidth: 220 }}>
          <SearchableSelect
            options={products}
            value={dirty.product_id}
            onChange={(val) => updateUpdate(d.id, "product_id", val)}
            placeholder="اختر منتجاً"
            valueField="uuid"
            displayField="title"
          />
        </td>

        <td>
          <input
            className="form-control form-control-sm"
            type="number"
            min={0}
            value={dirty.quantity ?? ""}
            onChange={(e) => updateUpdate(d.id, "quantity", e.target.value)}
          />
        </td>

        <td>
          <input
            className="form-control form-control-sm"
            type="number"
            step="0.01"
            min={0}
            value={dirty.unit_cost ?? ""}
            onChange={(e) => updateUpdate(d.id, "unit_cost", e.target.value)}
          />
        </td>

        <td>
          <input
            className="form-control form-control-sm"
            type="number"
            step="0.0000001"
            min={0}
            value={dirty.total_cost ?? ""}
            onChange={(e) => updateUpdate(d.id, "total_cost", e.target.value)}
          />
        </td>

        <td>
          <input
            className="form-control form-control-sm"
            type="number"
            step="0.0000001"
            min={0}
            value={dirty.total ?? ""}
            onChange={(e) => updateUpdate(d.id, "total", e.target.value)}
          />
        </td>

        <td>
          <input
            className="form-control form-control-sm"
            type="number"
            step="0.0000001"
            min={0}
            value={dirty.paid ?? ""}
            onChange={(e) => updateUpdate(d.id, "paid", e.target.value)}
          />
        </td>

        <td>
          <input
            className="form-control form-control-sm"
            value={dirty.currency ?? ""}
            onChange={(e) => updateUpdate(d.id, "currency", e.target.value)}
          />
        </td>

        <td>
          <input
            className="form-control form-control-sm"
            type="date"
            value={dirty.date_received ?? ""}
            onChange={(e) => updateUpdate(d.id, "date_received", e.target.value)}
          />
        </td>

        <td>
          <input
            className="form-control form-control-sm"
            type="number"
            step="0.0000001"
            min={0}
            value={dirty.quantity_paid ?? ""}
            onChange={(e) => updateUpdate(d.id, "quantity_paid", e.target.value)}
          />
        </td>

        <td className="text-end">
          <div className="btn-group btn-group-sm" role="group" aria-label="actions">
            <button className="btn btn-success" onClick={() => saveOne(d.id)} title="حفظ">
              <i className="bi bi-save" />
            </button>
            <button className="btn btn-warning" onClick={() => removeFromUpdate(d.id)} title="إلغاء">
              <i className="bi bi-x" />
            </button>
            <button className="btn btn-outline-danger" onClick={() => deleteOne(d.id)} title="حذف">
              <i className="bi bi-trash" />
            </button>
          </div>
        </td>
      </tr>
            );
          } else {
            return (
              <tr key={d.id || idx}>
                <td>{idx + 1}</td>
                <td>
                <div className="d-flex align-items-center">
                    {d.Product && d.Product.Product_images[0] ? (
                    <img
                        src={d.Product.Product_images[0].filename}
                        alt={d.Product.title || d.product_id || 'product'}
                        style={{ width: 40, height: 40, objectFit: 'cover' }}
                        className="rounded"
                        loading="lazy"
                    />
                    ) : (
                    <div className="bg-light rounded d-inline-flex align-items-center justify-content-center"
                        style={{ width: 40, height: 40 }}>
                        <i className="bi bi-image text-muted" />
                    </div>
                    )}

                    <div className="ms-2">
                    <div className="fw-semibold">{d.Product?.title || d.product_id  || '-'}</div>
                    {/* إذا عندك وصف فرعي أو SKU تقدر تظهره هنا */}
                    </div>
                </div>
                </td>
                <td>{d.quantity ?? '-'}</td>
                <td>{d.unit_cost ?? '-'}</td>
                <td>{d.total_cost ?? '-'}</td>
                <td>{d.total ?? '-'}</td>
                <td>{d.paid ?? '-'}</td>
                <td>{d.currency ?? '-'}</td>
                <td>{d.date_received ?? '-'}</td>
                <td>{d.quantity_paid ?? '-'}</td>
                <td className="text-end">
                  <div className="btn-group btn-group-sm">
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => addToUpdate({ ...d })}
                      title="تعديل"
                    >
                      <i className="bi bi-pencil" />
                    </button>
                    <button className="btn btn-outline-danger" onClick={() => deleteOne(d.id)} title="حذف">
                      <i className="bi bi-trash" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          }
        })
      )}
    </tbody>
  </table>
</div>

            {/* bulk actions */}
            <div className="d-flex justify-content-between align-items-center mb-3">
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

            {/* ===== Modern add UX ===== */}
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0">إضافة عناصر جديدة</h6>
                <div className="btn-group">
                  <button className="btn btn-outline-success" onClick={()=>{ setShowNewForm(true); setNewItemForm({ ...initialFormState, supplier_shipment_id: selectedShipment?.id || selectedShipment?.uuid || '', date_received: today }); }}><i className="bi bi-plus-lg me-1" /> إضافة</button>
                  <button className="btn btn-primary" onClick={submitQueue} disabled={newdetails.length===0||detailsLoading}><i className="bi bi-cloud-upload me-1" /> إنشاء ({newdetails.length})</button>
                </div>
              </div>

              {/* inline form */}
              {showNewForm && (
                <div className="add-form mb-2 position-relative">
                  <div className="row g-2 align-items-end">
                    <div className="col-md-5 position-relative" >
                      <label className="form-label small mb-1">المنتج</label>
                 
                <SearchableSelect
                    options={products}
                    value={newItemForm.product_id}
                    onChange={(val) => {const product=products.find(x=>(x.uuid===val))||{uuid:"",title:""}; setNewItemForm((prev)=>({...prev, product_name:product.title,product_id:product.uuid}));}}
                    placeholder="اختر منتجاً"
                    valueField="uuid"
                    displayField="title"
                  />
                    </div>

                    <div className="col-md-2">
                      <label className="form-label small mb-1">الكمية</label>
                      <input className="form-control" type="number" min={1} value={newItemForm.quantity} onChange={(e)=>handleNewFieldChange('quantity', e.target.value)} />
                    </div>

                    <div className="col-md-2">
                      <label className="form-label small mb-1">تكلفة الوحدة</label>
                      <input className="form-control" type="number" step="0.01" min={0} value={newItemForm.unit_cost} onChange={(e)=>handleNewFieldChange('unit_cost', e.target.value)} />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label small mb-1">التكلفة الإجمالية</label>
                      <div className="d-flex gap-2">
                        <input className="form-control" type="number" step="0.0000001" min={0} value={newItemForm.total_cost} onChange={(e)=>handleNewFieldChange('total_cost', e.target.value)} />
                        <button className="btn btn-outline-secondary" onClick={()=>setNewItemForm(prev=>({ ...prev, total_cost: Number(prev.quantity||0) * Number(prev.unit_cost||0) }))} title="حساب"><i className="bi bi-calculator" /></button>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label small mb-1"> التكلفة الإجمالية (بحسب للوحدة)</label>
                        <input className="form-control" type="number" step="0.0000001" min={0} value={newItemForm.total} onChange={(e)=>handleNewFieldChange('total', e.target.value)} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label small mb-1"> المدفوع (بحسب للوحدة)</label>
                        <input className="form-control" type="number" step="0.0000001" min={0} value={newItemForm.quantity_paid} onChange={(e)=>handleNewFieldChange('quantity_paid', e.target.value)} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label small mb-1"> المدفوع</label>
                        <input className="form-control" type="number" step="0.000001" min={0} value={newItemForm.paid} onChange={(e)=>handleNewFieldChange('paid', e.target.value)} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label small mb-1"> العملة</label>
                   
                    <SearchableSelect
                    options={currencies}
                    value={newItemForm.currency}
                    onChange={(val) => setNewItemForm(prev=>({...prev, currency:val}))}
                    placeholder="اختر عملة"
                    valueField="currency_iso"
                    displayField="name"
                  />
                   </div>

                    <div className="col-12 d-flex gap-2 mt-2">
                      <button className="btn btn-success" onClick={addToQueue}><i className="bi bi-plus-lg me-1" /> أضف للقائمة</button>
                      <button className="btn btn-primary" onClick={async ()=>{ addToQueue(); await submitQueue(); }}><i className="bi bi-cloud-upload me-1" /> أضف وأنشئ فوراً</button>
                      <button className="btn btn-outline-secondary" onClick={()=>{ setShowNewForm(false); setNewItemForm({ ...initialFormState, supplier_shipment_id: selectedShipment?.id || selectedShipment?.uuid || '', date_received: today }); }}>إلغاء</button>
                    </div>
                  </div>
                </div>
              )}

              {/* queued items preview */}
              {/* {newdetails.length>0 && (
                <div className="add-queue mb-2">
                  {newdetails.map((q, i) => (
                    <div className="queue-card" key={q.id}>
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <div style={{minWidth:120}}>
                          <div className="small text-muted">المنتج</div>
                          <div className="fw-semibold">{q.product_name||q.product_id}</div>
                        </div>
                        <div className="text-end">
                          <button className="btn btn-sm btn-outline-secondary me-1" title="تعديل" onClick={()=>{ setShowNewForm(true); setNewItemForm({ ...q }); }}><i className="bi bi-pencil" /></button>
                          <button className="btn btn-sm btn-outline-danger" title="حذف" onClick={()=>removeQueuedItem(q.id)}><i className="bi bi-trash" /></button>
                        </div>
                      </div>

                      <div className="d-flex gap-3">
                        <div>
                          <div className="small text-muted">كمية</div>
                          <input className="form-control form-control-sm" type="number" value={q.quantity} onChange={(e)=>editQueuedItem(q.id,'quantity',e.target.value)} />
                        </div>
                        <div>
                          <div className="small text-muted">سعر الوحدة</div>
                          <input className="form-control form-control-sm" type="number" step="0.01" value={q.unit_cost} onChange={(e)=>editQueuedItem(q.id,'unit_cost',e.target.value)} />
                        </div>
                        <div>
                          <div className="small text-muted">الإجمالي</div>
                          <div className="fw-semibold" style={{minWidth:80}}>{displayNumber(Number(q.total_cost || (q.quantity * q.unit_cost) || 0))}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )} */}
{/* queued items preview (editable cards that match the new-item form) */}
{newdetails.length > 0 && (
    // 
    
    // 
  <div className="add-queue mb-2">
    {newdetails.map((q, i) => (
      <div className="queue-card" key={q.id}>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div style={{minWidth:120}}>
            <div className="small text-muted">المنتج</div>
            <div className="fw-semibold">{q.product_name }</div>
          </div>

          <div className="text-end">
            <button
              className="btn btn-sm btn-outline-secondary me-1"
              title="تعديل"
              onClick={() => {removeQueuedItem(q.id); setShowNewForm(true);setNewItemForm(q); }}
            >
              <i className="bi bi-pencil" />
            </button>

            <button
              className="btn btn-sm btn-outline-danger"
              title="حذف"
              onClick={() => removeQueuedItem(q.id)}
            >
              <i className="bi bi-trash" />
            </button>
          </div>
        </div>

        {/* Editable fields (same as new item form) */}
        <div className="row g-2">
          <div className="col-12 col-md-6">
            <label className="form-label small mb-1">المنتج</label>
            <SearchableSelect
              options={products}
              value={q.product_id}
              onChange={(val) => {
                // val should be the selected product object
                editQueuedItem(q.id, 'product_id', val.uuid ?? val.id ?? val.product_id ?? val);
                editQueuedItem(q.id, 'product_name', val.title ?? val.name ?? '');
                // optional: set product object if you store it
                editQueuedItem(q.id, 'product', val.product || val);
              }}
              placeholder="اختر منتجاً"
              valueField="uuid"
              displayField="title"
            />
          </div>

          <div className="col-4 col-md-2">
            <label className="form-label small mb-1">الكمية</label>
            <input
                disabled
              className="form-control form-control-sm"
              type="number"
              min={0}
              value={q.quantity}
              onChange={(e) => {
                editQueuedItem(q.id, 'quantity', e.target.value);
                // recompute total immediately (optional)
                const newTotal = (Number(e.target.value || 0) * Number(q.unit_cost || 0));
                editQueuedItem(q.id, 'total_cost', newTotal);
              }}
            />
          </div>

          {/* <div className="col-4 col-md-2">
            <label className="form-label small mb-1">تكلفة الوحدة</label>
            <input
              className="form-control form-control-sm"
              type="number"
              step="0.01"
              min={0}
              value={q.unit_cost}
              onChange={(e) => {
                editQueuedItem(q.id, 'unit_cost', e.target.value);
                const newTotal = (Number(q.quantity || 0) * Number(e.target.value || 0));
                editQueuedItem(q.id, 'total_cost', newTotal);
              }}
            />
          </div>

          <div className="col-4 col-md-2">
            <label className="form-label small mb-1">التكلفة الإجمالية</label>
            <div className="d-flex gap-2">
              <input
                className="form-control form-control-sm"
                type="number"
                step="0.01"
                min={0}
                value={q.total_cost}
                onChange={(e) => editQueuedItem(q.id, 'total_cost', e.target.value)}
              />
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => {
                  const computed = Number(q.quantity || 0) * Number(q.unit_cost || 0);
                  editQueuedItem(q.id, 'total_cost', computed);
                }}
                title="حساب"
              >
                <i className="bi bi-calculator" />
              </button>
            </div>
          </div>

          <div className="col-6 col-md-2">
            <label className="form-label small mb-1">المدفوع</label>
            <input
              className="form-control form-control-sm"
              type="number"
              step="0.01"
              min={0}
              value={q.paid}
              onChange={(e) => editQueuedItem(q.id, 'paid', e.target.value)}
            />
          </div>

          <div className="col-6 col-md-2">
            <label className="form-label small mb-1">العملة</label>
            <SearchableSelect
              options={currencies}
              value={q.currency}
              onChange={(val) => {
                editQueuedItem(q.id, 'currency', val.currency_iso ?? val.code ?? val);
              }}
              placeholder="اختر عملة"
              valueField="currency_iso"
              displayField="name"
            />
          </div> */}
                    <div className="col-md-2">
                      <label className="form-label small mb-1">تكلفة الوحدة</label>
                      <input disabled className="form-control" type="number" step="0.01" min={0} value={q.unit_cost} onChange={(e)=>editQueuedItem(q.id,'unit_cost', e.target.value)} />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label small mb-1">التكلفة الإجمالية</label>
                      <div className="d-flex gap-2">
                        <input disabled className="form-control" type="number" step="0.0000001" min={0} value={q.total_cost} onChange={(e)=>editQueuedItem(q.id,'total_cost', e.target.value)} />
                        <button className="btn btn-outline-secondary" onClick={()=>setNewItemForm(prev=>({ ...prev, total_cost: Number(prev.quantity||0) * Number(prev.unit_cost||0) }))} title="حساب"><i className="bi bi-calculator" /></button>
                      </div>
                    </div>
                    <div className="col-4">
                      <label className="form-label small mb-1"> التكلفة الإجمالية (بحسب للوحدة)</label>
                        <input disabled className="form-control" type="number" step="0.0000001" min={0} value={q.total} onChange={(e)=>editQueuedItem(q.id,'total', e.target.value)} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label small mb-1"> المدفوع (بحسب للوحدة)</label>
                        <input disabled className="form-control" type="number" step="0.0000001" min={0} value={q.quantity_paid} onChange={(e)=>editQueuedItem(q.id,'quantity_paid', e.target.value)} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label small mb-1"> المدفوع</label>
                        <input disabled className="form-control" type="number" step="0.000001" min={0} value={q.paid} onChange={(e)=>editQueuedItem(q.id,'paid', e.target.value)} />
                    </div>
                    <div className="col-6 col-md-2">
                      <label className="form-label small mb-1"> العملة</label>
                   
                    <SearchableSelect
                    options={currencies}
                    value={q.currency}
                    onChange={(val) => editQueuedItem(q.id,'currency',val?? val.currency_iso ?? val.code  )}
                    placeholder="اختر عملة"
                    valueField="currency_iso"
                    displayField="name"
                  />
                   </div>
        </div>

        {/* preview footer: computed total */}
        <div className="mt-2 d-flex justify-content-between align-items-center">
          <div>
            <div className="small text-muted">إجمالي عنصر</div>
            <div className="fw-semibold">{displayNumber(Number(q.total_cost || (q.quantity * q.unit_cost) || 0))}</div>
          </div>

          <div>
            <button className="btn btn-sm btn-primary me-2" onClick={() => {
              removeQueuedItem(q.id);
              setShowNewForm(true);
              setNewItemForm( q);
            }}>
              تعديل في الفورم
            </button>

            <button className="btn btn-sm btn-success" onClick={() => {
              // quick add this single queued item (send to create endpoint)
              // you can implement a function to send single item if desired
              // for now we'll open form and let the user press add-and-create
              setShowNewForm(true);
              setNewItemForm({...q});
            }}>
              أضف & إنشاء
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
  
)}


            </div>

          </div>



        </div>
      </div>
    </div>
  );
}
