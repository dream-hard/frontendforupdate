import React, { useEffect, useState, useRef } from "react";
import axios from '../../api/fetch';
import useNotification from "../../Hooks/useNotification";
import ExchangeRateDetailModern from "./Exchange_rateDetailModern";
import EditExchangeRate from "./finalexchange_rateupdate";

import { NavLink } from "react-router-dom";

const orderOptions = {
  "": "بدون",
  "dateofstart-desc": "تاريخ البداية (تنازلي)",
  "dateofstart-asc": "تاريخ البداية (تصاعدي)",
  "exchange_rate-desc": "سعر الصرف (تنازلي)",
  "exchange_rate-asc": "سعر الصرف (تصاعدي)",
  "createdAt-desc": "تاريخ الإنشاء (تنازلي)",
  "createdAt-asc": "تاريخ الإنشاء (تصاعدي)",
};

const initialFilters = {
  base:'', base_enabled:false,
  target:'', target_enabled:false,
  min_rate:'', min_rate_enabled:false,
  max_rate:'', max_rate_enabled:false,
  dateofstart:'', dateofstart_enabled:false
};

export default function ExchangeRates(){
  const { showNotification } = useNotification();

  const [rates, setRates] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsNumber, setItemsNumber] = useState(0);
  const [orderby, setOrderby] = useState("dateofstart-desc");
  const [filters, setFilters] = useState(initialFilters);
  const [body, setBody] = useState({});
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const [selectedRate, setSelectedRate] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [masterEnabled, setMasterEnabled] = useState(false);

  // Drawer refs
  const drawerRef = useRef(null);
  const drawerInstanceRef = useRef(null);

  // robust helper to normalize list responses (supports different names returned by your controller)
  const normalizeListResponse = (res) => {
    if (!res || !res.data) return { rows: [], total: 0, currentPage: page, totalPages: 1 };

    const d = res.data;
    const rows = d.rates || d.exchangerates || d.suppliers || d.rows || [];
    const total = d.total ?? (Array.isArray(d.count) ? d.count.length : (d.count ?? rows.length));
    const currentPage = d.currentPage ?? d.current_page ?? page;
    const totalPages = d.totalPages ? d.totalPages : 1;
    return { rows, total, currentPage, totalPages };
  };

  const fetchRates = async () => {
    setStatus("loading");
    try {
      const payload = { page, limit, orderby, ...body };
      // prefer the search endpoint (it supports filters + pagination in your controllers)
      let res;
      try {
        res = await axios.post("/exch_rate/seachrates", payload);
      } catch (err) {
        // fallback to getall if search endpoint not available
        res = await axios.post("/exch_rate/getall", { page, limit, orderby });
      }
      const n = normalizeListResponse(res);
      setRates(n.rows);
      setItemsNumber(n.total);
      setPage(n.currentPage);
      setTotalPages(n.totalPages);
      setStatus("success");
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || err.message || "فشل تحميل الأسعار");
      setStatus("error");
      showNotification("error", errorMsg || "فشل تحميل الأسعار");
    }
  };

  useEffect(() => {
    fetchRates();
    // eslint-disable-next-line
  }, [page, limit, orderby]);

  // fetch single item robustly: try POST /exch_rate/getbyid then fallback to GET with query
  const fetchSelectedRate = async ({ base, target, dateofstart }) => {
    try {
      let res;
      try {
        res = await axios.post("/exch_rate/getbyid", { base, target, dateofstart });
      } catch (err) {
        // fallback: try GET with query params (some routers use get)
        res = await axios.get("/exch_rate/getbyid", { params: { base, target, dateofstart } });
      }
      // some controllers return the object directly, some wrap it
      const rate = res.data.rate || res.data || res.data.exchangerate || null;
      setSelectedRate(rate);
      return rate;
    } catch (err) {
      showNotification("error", (err?.response?.data?.message || err.message || "فشل جلب التفاصيل"));
      return null;
    }
  };

  const openDrawer = async (item) => {
    await fetchSelectedRate(item);
    if (!drawerInstanceRef.current && window.bootstrap?.Offcanvas) {
      drawerInstanceRef.current = new window.bootstrap.Offcanvas(drawerRef.current);
    }
    drawerInstanceRef.current?.show();
  };

  const handleEditClick = async (item) => {
    await fetchSelectedRate(item);
    setShowEditModal(true);
  };

  const handleDeleteClick = async (item) => {
    await fetchSelectedRate(item);
    setShowDeleteModal(true);
  };

  const handleDeleteRate = async () => {
    if (!selectedRate) return;
    try {
      // axios.delete with body: use { data: {...} }
      await axios.delete(`/exch_rate/delete/delete?base=${selectedRate.base_currency_id ||selectedRate.base}&target=${selectedRate.target_currency_id || selectedRate.target}&dateofstart=${selectedRate.dateofstart}`

     );
      showNotification("success", "تم الحذف");
      fetchRates();
      setShowDeleteModal(false);
      setSelectedRate(null);
    } catch (err) {
      showNotification("error", err?.response?.data?.message || err.message || "فشل الحذف");
    }
  };

  const handleChangeFilter = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => {
      if (type === "checkbox") return { ...prev, [name]: checked };
      if (type === "number") return { ...prev, [name]: value === "" ? "" : Number(value) };
      return { ...prev, [name]: value };
    });
  };

  const handleApplyFilters = (e) => {
    e && e.preventDefault && e.preventDefault();
    const b = {};
    Object.keys(filters).forEach(key => {
      if (key.endsWith("_enabled") && filters[key]) {
        const real = key.replace("_enabled", "");
        b[real] = filters[real];
      }
    });
    setBody(b);
    setPage(1);
    fetchRates();
  };

  const handleReset = () => {
    setFilters(initialFilters);
    setBody({});
    setPage(1);
    fetchRates();
  };

  return (
    <div className="container-fluid py-4">
      <form onSubmit={handleApplyFilters} className="mb-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4>تصفية أسعار الصرف</h4>
          <div className="d-flex gap-2">
            <button type="button" className={`btn ${masterEnabled ? "btn-primary":"btn-secondary"}`} onClick={()=>setMasterEnabled(!masterEnabled)}>
              {masterEnabled ? "البحث مفعل" : "تفعيل البحث"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleReset}>Reset</button>
            <button
              type="submit"
              className="btn btn-md d-flex align-items-center"
              style={{
                backgroundColor: Object.keys(body).length > 0 ? "green" : "red",
                borderColor: Object.keys(body).length > 0 ? "green" : "red",
                color: "white",
              }}
            >
              Apply Filters
              <span
                className="ms-2 rounded-circle"
                style={{
                  display: "inline-block",
                  width: "8px",
                  height: "8px",
                  backgroundColor: "white",
                }}
                title={Object.keys(body).length > 0 ? "Filters active" : "No filters"}
              ></span>
            </button>          </div>
        </div>

        {masterEnabled && (
          <div className="row g-3 mb-3">
            <div className="col-md-3">
              <div className="form-check mb-2">
                <input className="form-check-input" name="base_enabled" type="checkbox" checked={filters.base_enabled} onChange={handleChangeFilter} id="enable-base" />
                <label className="form-check-label" htmlFor="enable-base">Enable base</label>
              </div>
              <input className="form-control" name="base" value={filters.base} onChange={handleChangeFilter} disabled={!filters.base_enabled} placeholder="Base ISO" />
            </div>
            <div className="col-md-3">
              <div className="form-check mb-2">
                <input className="form-check-input" name="target_enabled" type="checkbox" checked={filters.target_enabled} onChange={handleChangeFilter} id="enable-target" />
                <label className="form-check-label" htmlFor="enable-target">Enable target</label>
              </div>
              <input className="form-control" name="target" value={filters.target} onChange={handleChangeFilter} disabled={!filters.target_enabled} placeholder="Target ISO" />
            </div>
            <div className="col-md-3">
              <div className="form-check mb-2">
                <input className="form-check-input" name="min_rate_enabled" type="checkbox" checked={filters.min_rate_enabled} onChange={handleChangeFilter} id="enable-min-rate" />
                <label className="form-check-label" htmlFor="enable-min-rate">Enable min rate</label>
              </div>
              <input className="form-control" name="min_rate" value={filters.min_rate} onChange={handleChangeFilter} disabled={!filters.min_rate_enabled} placeholder="Min rate" type="number" step="0.0000000001" />
            </div>
            <div className="col-md-3">
              <div className="form-check mb-2">
                <input className="form-check-input" name="dateofstart_enabled" type="checkbox" checked={filters.dateofstart_enabled} onChange={handleChangeFilter} id="enable-date" />
                <label className="form-check-label" htmlFor="enable-date">Enable date</label>
              </div>
              <input className="form-control" name="dateofstart" value={filters.dateofstart} onChange={handleChangeFilter} disabled={!filters.dateofstart_enabled} type="date" />
            </div>
          </div>
        )}
      </form>

      <div className="d-flex gap-3 mb-3 flex-wrap">
        <div className="dropdown">
          <button className="btn btn-outline-primary dropdown-toggle" data-bs-toggle="dropdown">Limit: {limit}</button>
          <ul className="dropdown-menu">
            {[5,10,15,20,25,50].map(v=>(
              <li key={v}><button className="dropdown-item" onClick={()=>{setLimit(v); setPage(1);}}> {v} </button></li>
            ))}
          </ul>
        </div>

        <div className="dropdown">
          <button className="btn btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
            OrderBy: {orderOptions[orderby]}
          </button>
          <ul className="dropdown-menu">
            {Object.entries(orderOptions).map(([val,label])=>(
              <li key={val}><button className="dropdown-item" onClick={()=>{setOrderby(val); setPage(1);}}>{label}</button></li>
            ))}
          </ul>
        </div>

        <NavLink to="/dashboard/exchange_rate_add" className="btn btn-success">
          <i className="bi bi-plus-circle me-2" /> إضافة سعر جديد
        </NavLink>

        <button className="btn btn-info text-white" onClick={()=>fetchRates()}>Refresh</button>
      </div>

      <div className="table-responsive shadow rounded" style={{minHeight:"30vh"}}>
        <table className="table table-hover align-middle text-center mb-0">
          <thead className="table-dark">
            <tr>
              <th>Actions</th>
              <th>من - إالى</th>
              <th>Base</th>
              <th>Target</th>
              <th>Rate</th>
              <th>Start Date</th>
            </tr>
          </thead>
          <tbody>
            {status==="idle" && <tr><td colSpan={6} className="text-center py-3 text-muted">Waiting...</td></tr>}
            {status==="loading" && <tr><td colSpan={6} className="text-center py-3">Loading...</td></tr>}
            {status==="error" && <tr><td colSpan={6} className="text-center py-3 text-danger">{errorMsg}</td></tr>}
            {status==="success" && rates.length===0 && <tr><td colSpan={6} className="text-center py-3">No rates</td></tr>}
            {status==="success" && rates.map(item=>(
              <tr key={`${item.base_currency_id || item.base}_${item.target_currency_id || item.target}_${item.dateofstart || item.date}`}>
                <td>
                  <div className="d-flex gap-2 justify-content-center">
                    <button className="btn btn-sm btn-outline-primary" onClick={()=>handleEditClick({
                      base: item.base_currency_id || item.base,
                      target: item.target_currency_id || item.target,
                      dateofstart: item.dateofstart || item.date
                    })}>Edit</button>

                    <button className="btn btn-sm btn-outline-danger" onClick={()=>handleDeleteClick({
                      base: item.base_currency_id || item.base,
                      target: item.target_currency_id || item.target,
                      dateofstart: item.dateofstart || item.date
                    })}>Delete</button>

                    <button className="btn btn-sm btn-secondary" onClick={()=>openDrawer({
                      base: item.base_currency_id || item.base,
                      target: item.target_currency_id || item.target,
                      dateofstart: item.dateofstart || item.date
                    })}>View</button>
                  </div>
                </td>
                <td className="text-primary" style={{cursor:"pointer"}} onClick={()=>openDrawer({ base: item.base_currency_id || item.base, target: item.target_currency_id || item.target, dateofstart: item.dateofstart || item.date })}> {item.baseCurrency.name} --{'>'} {item.targetCurrency.name}</td>
                <td className="text-primary" style={{cursor:"pointer"}} onClick={()=>openDrawer({ base: item.base_currency_id || item.base, target: item.target_currency_id || item.target, dateofstart: item.dateofstart || item.date })}>
                  {item.base_currency_id || item.base}
                </td>
                <td  >{item.target_currency_id || item.target}</td>
                <td>{item.exchange_rate}</td>
                <td>{item.dateofstart || item.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-center gap-2 mt-3 flex-wrap">
        <button className="btn btn-outline-primary" disabled={page===1} onClick={()=>setPage(p=>p-1)}>&lt; Prev</button>
        {Array.from({length: totalPages}, (_, i) => (
          <button key={i+1} className={`btn ${page===i+1 ? "btn-primary":"btn-outline-primary"}`} onClick={()=>setPage(i+1)}>{i+1}</button>
        ))}
        <button className="btn btn-outline-primary" disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}>Next &gt;</button>
      </div>

      {/* Drawer */}
      <div ref={drawerRef} className="offcanvas offcanvas-end offcanvas-wide" tabIndex="-1">
        <div className="offcanvas-header bg-dark text-white">
          <h5 className="offcanvas-title">تفاصيل</h5>
          <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>
        </div>
        <div className="offcanvas-body">
          <ExchangeRateDetailModern rate={selectedRate} />
        </div>
      </div>

      {/* Edit Modal */}
      <div className={`modal ${showEditModal ? "show d-block" : ""}`} tabIndex="-1">
        <div className="modal-dialog modal-xl modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Rate</h5>
              <button type="button" className="btn-close" onClick={()=>{setShowEditModal(false); setSelectedRate(null);}}></button>
            </div>
            <div className="modal-body">
              <EditExchangeRate rate={selectedRate} onClose={()=>{setShowEditModal(false); setSelectedRate(null);}} onUpdated={() => { fetchRates(); }} />
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <div className={`modal ${showDeleteModal ? "show d-block" : ""}`} tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">حذف</h5>
              <button type="button" className="btn-close" onClick={()=>{setShowDeleteModal(false); setSelectedRate(null);}}></button>
            </div>
            <div className="modal-body">
              {selectedRate && <p>هل أنت متأكد من حذف <strong>{selectedRate.base_currency_id || selectedRate.base} → {selectedRate.target_currency_id || selectedRate.target}</strong> ؟</p>}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={()=>{setShowDeleteModal(false); setSelectedRate(null);}}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDeleteRate}>Delete</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
