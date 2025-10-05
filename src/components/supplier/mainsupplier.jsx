import React, { useEffect, useState, useRef } from "react";
import axios from '../../api/fetch';
import useNotification from "../../Hooks/useNotification";

import { NavLink } from "react-router-dom";
import EditSupplier from "./Supplier_Edit";
import SupplierDetailModern from "./Supplier_DetailModern";


const orderOptions = {
  "": "بدون",
  "uuid-asc":"id (تصاعدي)",
  'uuid-desc':"id (تنازلي)",
  "name-desc": "الاسم (تنازلي)",
  "name-asc": "الاسم  (تصاعدي)",
  "phone-asc":"رقم الهاتف (تصاعدي)",
  'phone-desc':"رقم الهاتف (تنازلي)",
  "address-asc":"العنوان (تصاعدي)",
  "address-desc":"العنوان (تنازلي)",
  "date-desc": "تاريخ الإنشاء (تنازلي)",
  "date-asc": "تاريخ الإنشاء (تصاعدي)",
};

const initialFilters = {
  id:'', id_enabled:false,
  name:'', name_enabled:false,
  phoneNumber:'', phoneNumber_enabled:false,
  address:'', address_enabled:false,
};
  const sections = {
    "General": ["id","name","phoneNumber","address"] 
    };

export default function ExchangeRates(){
  const { showNotification } = useNotification();

  const [suppliers, setSuppliers] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsNumber, setItemsNumber] = useState(0);
  const [orderby, setOrderby] = useState("date-desc");
  const [filters, setFilters] = useState(initialFilters);
  const [body, setBody] = useState({});
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const [selectedsupplier, setSeletedsupplier] = useState(null);
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
    const rows = d.suppliers || d.supplier || d.rows || [];
    const total = d.total ?? (Array.isArray(d.count) ? d.count.length : (d.count ?? rows.length));
    const currentPage = d.currentPage ?? d.current_page ?? page;
    const totalPages = d.totalPages ? d.totalPages : 1;
    return { rows, total, currentPage, totalPages };
  };

  const fetchSuppliers = async () => {
    setStatus("loading");
    console.log(body)
    try {
      const payload = { page, limit, orderby, ...body };
      // prefer the search endpoint (it supports filters + pagination in your controllers)
      let res;
      try {
        res = await axios.post("/supplier/searchsuppliers", payload);
  
      } catch (err) {
        // fallback to getall if search endpoint not available
        res = await axios.post("/supplier/getAll", { page, limit, orderby });
      }
      const n = normalizeListResponse(res);
      setSuppliers(n.rows);
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
    fetchSuppliers();
    // eslint-disable-next-line
  }, [page, limit, orderby]);

  // fetch single item robustly: try POST /exch_rate/getbyid then fallback to GET with query
  const fetchSelectedSupplier = async ( id ) => {
    try {
      
      let res;
      try {
        res = await axios.post("/supplier/getsupplier",  id);
      } catch (err) {
        // fallback: try GET with query params (some routers use get)
        res = await axios.post("/supplier/getbyid", { id:id });
      }
      // some controllers return the object directly, some wrap it
      console.log(res)
      const supplier= res.data.supplier || res.data  || null;
      setSeletedsupplier(supplier);
      return supplier;
    } catch (err) {
      console.log(err)
      showNotification("error", (err?.response?.data?.message || err.message || "فشل جلب التفاصيل"));
      return null;
    }
  };
const handleCloseModals = () => {
  setShowEditModal(false);
  setShowDeleteModal(false);
  setSeletedsupplier(null);
};


  const openDrawer = async (item) => {
    await fetchSelectedSupplier(item);
    if (!drawerInstanceRef.current && window.bootstrap?.Offcanvas) {
      drawerInstanceRef.current = new window.bootstrap.Offcanvas(drawerRef.current);
    }
    drawerInstanceRef.current?.show();
  };

  const handleEditClick = async (id) => {
    await fetchSelectedSupplier(id);
    setShowEditModal(true);
  };

  const handleDeleteClick = async (item) => {
    await fetchSelectedSupplier(item);
    setShowDeleteModal(true);
  };

  const handleDeleteRate = async () => {
    if (!selectedsupplier) return;
    try {
      // axios.delete with body: use { data: {...} }
      await axios.delete(`/supplier/delete/delete?id=${selectedsupplier.uuid}`

     );
      showNotification("success", "تم الحذف");
      fetchSuppliers();
      setShowDeleteModal(false);
      setSeletedsupplier(null);
    } catch (err) {
      console.log(err)
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
    fetchSuppliers();
  };

  const handleReset = () => {
    setFilters(initialFilters);
    setBody({});
    setPage(1);
    fetchSuppliers();
  };

  const renderInput = (key) => {
    const enabledKey = `${key}_enabled`;
    const isEnabled = filters[enabledKey];
    const value = filters[key];

    let inputElement;

    if (typeof value === "boolean") {
      inputElement = (
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            id={key}
            name={key}
            checked={value}
            onChange={handleChangeFilter}
            disabled={!isEnabled}
          />
          <label className="form-check-label" htmlFor={key}>{key}</label>
        </div>
      );
    } else if (typeof value === "number" || typeof value === "string") {
      inputElement = (
        <div className="input-group">
          <input
            type={typeof value === "number" ? "number" : "text"}
            className="form-control"
            name={key}
            value={value}
            onChange={handleChangeFilter}
            disabled={!isEnabled}
          />
        <span class="input-group-text">{key}</span>
        </div>
      );
    } else if (Array.isArray(value)) {
      inputElement = (
        <input
          type="text"
          className="form-control"
          name={key}
          value={value.join(",")}
          onChange={(e) =>
            setFilters(prev => ({ ...prev, [key]: e.target.value.split(",").map(v => v.trim()) }))
          }
          disabled={!isEnabled}
          placeholder="Comma separated values"
        />
      );
    }

    return (
      <div className="mb-3" key={key}>
        <div className="form-check mb-2">
          <input
            className="form-check-input"
            type="checkbox"
            name={enabledKey}
            checked={isEnabled}
            onChange={handleChangeFilter}
            id={`enable-${key}`}
          />
          <label className="form-check-label fw-bold" htmlFor={`enable-${key}`}>
            Enable {key}
          </label>
        </div>
        {inputElement}
      </div>
    );
  };
  return (
    <div className="container-fluid py-4">
      <form onSubmit={handleApplyFilters} className="mb-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4>تصفية الموردين</h4>
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

        {masterEnabled && Object.entries(sections).map(([sectionName, keys], index) => (
        <div className="card mb-3" key={index}>
          <div className="card-header">
            <button
              className="btn btn-link text-decoration-none"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target={`#collapse${index}`}
            >
              {sectionName}
            </button>
          </div>
          <div className="collapse show" id={`collapse${index}`}>
            <div className="card-body">
              <div className="row">
                {keys.map(key => (
                  <div className="col-md-6" key={key}>
                    {renderInput(key)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}

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

        <NavLink to="/dashboard/addsupplier" className="btn btn-success">
          <i className="bi bi-plus-circle me-2" /> إضافة سعر جديد
        </NavLink>

        <button className="btn btn-info text-white" onClick={()=>fetchSuppliers()}>Refresh</button>
      </div>

      <div className="table-responsive shadow rounded" style={{minHeight:"30vh"}}>
        <table className="table table-hover align-middle text-center mb-0">
          <thead className="table-dark">
            <tr>
              <th>Actions</th>
              <th>الاسم </th>
              <th>رقم الهاتف </th>
              <th>العنوان </th>
              <th>ID</th>
            </tr>
          </thead>
          <tbody>
            {status==="idle" && <tr><td colSpan={6} className="text-center py-3 text-muted">Waiting...</td></tr>}
            {status==="loading" && <tr><td colSpan={6} className="text-center py-3">Loading...</td></tr>}
            {status==="error" && <tr><td colSpan={6} className="text-center py-3 text-danger">{errorMsg}</td></tr>}
            {status==="success" && suppliers.length===0 && <tr><td colSpan={6} className="text-center py-3">No rates</td></tr>}
            {status==="success" && suppliers.map(item=>(
              <tr key={`${item.uuid || item.id}`}>
                <td>
                  <div className="d-flex gap-2 justify-content-center">
                    <button className="btn btn-sm btn-outline-primary" onClick={()=>handleEditClick({
                    id: item.uuid
                    })}>Edit</button>

                    <button className="btn btn-sm btn-outline-danger" onClick={()=>handleDeleteClick({
                    id: item.uuid

                    })}>Delete</button>

                    <button className="btn btn-sm btn-secondary" onClick={()=>openDrawer({
                    id: item.uuid

                    })}>View</button>
                  </div>
                </td>
                <td className="text-primary" style={{cursor:"pointer"}} onClick={()=>openDrawer({ id: item.uuid})}>
                  {item.name}
                </td>
                <td  >{item.phone_number}</td>
                <td>{item.address}</td>
                <td>{item.uuid}</td>
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
          {/* <ExchangeRateDetailModern supplier={selectedsupplier} /> */}
          <SupplierDetailModern supplier={selectedsupplier}></SupplierDetailModern>
        </div>
      </div>

      {/* Edit Modal */}
      {selectedsupplier && (<div className={`modal ${showEditModal ? "show d-block" : ""}`} tabIndex="-1">
  <div className="modal-dialog">
    <div className="modal-content">
      <div className="modal-header">
        <h5 className="modal-title">Edit Product</h5>
        <button type="button" className="btn-close" onClick={handleCloseModals}></button>
      </div>
      <div className="modal-body">
        <EditSupplier supplier={selectedsupplier} onClose={handleCloseModals} onUpdated={fetchSuppliers}></EditSupplier>
      </div>
      <div className="modal-footer">
        <button className="btn btn-secondary" onClick={handleCloseModals}>Cancel</button>
        <button className="btn btn-primary">Save Changes</button>
      </div>
    </div>
  </div>
</div>
)}

      {/* Delete Modal */}
      <div className={`modal ${showDeleteModal ? "show d-block" : ""}`} tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">حذف</h5>
              <button type="button" className="btn-close" onClick={()=>{setShowDeleteModal(false); setSeletedsupplier(null);}}></button>
            </div>
            <div className="modal-body">
              {selectedsupplier && <p>هل أنت متأكد من حذف <strong>{selectedsupplier.name || selectedsupplier.uuid}</strong> ؟</p>}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={()=>{setShowDeleteModal(false); setSeletedsupplier(null);}}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDeleteRate}>Delete</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
