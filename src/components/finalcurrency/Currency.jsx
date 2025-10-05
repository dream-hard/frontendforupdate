import React, { useEffect, useState, useRef } from "react";
import axios from '../../api/fetch';
import useNotification from "../../Hooks/useNotification";
import CurrencyDetailModern from "./CurrencyDetailModern";
import EditCurrency from "./finalcurrencyupdate";
import { NavLink } from "react-router-dom";

const currencyOrderOptions = {
    "":'بدون',
  "currency_currency_iso-asc": "رمز العملة (تصاعدي)",
  "currency_currency_iso-desc": "رمز العملة (تنازلي)",
  "name-asc": "الاسم (تصاعدي)",
  "name-desc": "الاسم (تنازلي)",
  "symbol-asc": "الرمز (تصاعدي)",
  "symbol-desc": "الرمز (تنازلي)",
  "createdAt-asc": "تاريخ الإنشاء (تصاعدي)",
  "createdAt-desc": "تاريخ الإنشاء (تنازلي)",
  "updatedAt-asc": "تاريخ التحديث (تصاعدي)",
  "updatedAt-desc": "تاريخ التحديث (تنازلي)",
};


const initialFilters ={
    iso:'',iso_enabled:false,
    name:"",name_enabled:false,
    symbol:"",symbol_enabled:false,
}

  const sections = {
    "General": ["iso","name","symbol"] 
    };


export default function Currency(){
const { showNotification } = useNotification();


  // --- currencies ---
    const [currencies, setCurrencies] = useState([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(15);
    const [itemsnumber,setItemsnumber]=useState(0);
    const [orderby, setOrderby] = useState("createdAt-desc");
    const [filters, setFilters] = useState(initialFilters);
    const [totalPages, setTotalPages] = useState(1);
    const [body,setBody]=useState({})
    const [selectedCurrency,setSelectedCurrency]=useState({});
    const [currenciesStatus,setCurrenciesStatus]=useState('idle');
    const [currency_error,setCurrency_error]=useState("");

  // --- rates ---
//   const [rates, setRates] = useState([]);
//   const [ratePage, setRatePage] = useState(1);
//   const [rateLimit, setRateLimit] = useState(10);
//   const [rateTotalPages, setRateTotalPages] = useState(1);
//   const [rateOrderby, setRateOrderby] = useState('date-desc');
//   const [rateFilters, setRateFilters] = useState({ base: '', target: '', rate: '' });
//   const [rateLoading, setRateLoading] = useState(false);
//   const [showRateModal, setShowRateModal] = useState(false);

  // chart refs
  const [masterEnabled,setMasterEnabled]=useState(false)

const [showEditModal, setShowEditModal] = useState(false);
const [showDeleteModal, setShowDeleteModal] = useState(false);


const handleEditClick = (item) => {
  fetchSelectedCurrency(item)
  setSelectedCurrency(selectedCurrency);
  setShowEditModal(true);
};
const handleDeleteClick = (item) => {
    fetchSelectedCurrency(item)

  setSelectedCurrency(selectedCurrency);
  setShowDeleteModal(true);
};
const handleCloseModals = () => {
  setShowEditModal(false);
  setShowDeleteModal(false);
  setSelectedCurrency(null);
};


  // ---------------- Currencies ----------------
  const  fetchCurrencies=async ()=> {
    setCurrenciesStatus('loading');
    try {
      const res = await axios.post('/currency/searchcurrency', {
            page:page,
            limit:limit,
            orderby:orderby,
            ...body,
        });

      setCurrencies(res.data.currencies || []);
      setPage(res.data.currentPage || page);
      setTotalPages(res.data.totalPages || 1);
      setItemsnumber(res.data.total);
      setCurrenciesStatus("success")
      showNotification('success','Currencies loaded');
    } catch (err) {
      setCurrency_error(err.message || err.response.data || err.response.data.message || err.response.data.error|| "لا يوجد اي منتج")
      setCurrenciesStatus('error');
      showNotification('error', 'فشل في ايجاد المنتجات');
    } finally {  }
  }

////////// fetch selected product 
const fetchSelectedCurrency = async (id) => {
  try {
    const res = await axios.post(`/currency/getCurrencyByIso`,{iso:id});
    setSelectedCurrency(res.data.currency);
  } catch (err) {
    showNotification("error",(err.message || "Failed to fetch product"))
      }
};


const handleMasterButtonToggle = () => {
  const newEnabled = !masterEnabled;
  setMasterEnabled(newEnabled);

};
const handelsearch= ()=>{
  fetchCurrencies();
}
const handleDeleteCurrnecy = async () => {
  if (!selectedCurrency?.currency_iso) return;

  try {
    // call your backend API to delete the product
    await axios.delete(`/currency/delete/deleteCurrency?iso=${selectedCurrency.currency_iso}`);
    showNotification("success","تم حذف المنتج بنجاح")
    fetchCurrencies();
    // close modal
    handleCloseModals();
  } catch (err) {
    showNotification("error","فشل المحاولة من حذف المنتج " + (err?.response?.data?.message || err.message))
    
  }
};
const handleChange = (e) => {
  const { name, value, type, checked } = e.target;
  setFilters(prev => {
    if (type === "checkbox" && !name.endsWith("_enabled")) {
      return { ...prev, [name]: checked };
    }
    if (type === "checkbox") {
      return { ...prev, [name]: checked };
    }
    if (type === "number") {
      return { ...prev, [name]: value === "" ? "" : Number(value) };
    }
    return { ...prev, [name]: value };
  });
};
const handleReset = () => setFilters(initialFilters);
const handlechangebody = async (e) => {
    e.preventDefault();
    let body = {};
    Object.keys(filters).forEach(key => {
      if (key.endsWith("_enabled") && filters[key]) {
        const realKey = key.replace("_enabled", "");
        body[realKey] = filters[realKey];
      }
    });
    setBody(body);
  };


  const drawerRef = useRef(null);
  const drawerInstanceRef = useRef(null);
  const openDrawer = (item) => {
    fetchSelectedCurrency(item)
    setSelectedCurrency(selectedCurrency);
    if (!drawerInstanceRef.current && window.bootstrap?.Offcanvas) {
      drawerInstanceRef.current = new window.bootstrap.Offcanvas(drawerRef.current);
    }
    drawerInstanceRef.current?.show();
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
            onChange={handleChange}
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
            onChange={handleChange}
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
            onChange={handleChange}
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

useEffect(() => { fetchCurrencies(); }, [page, limit, orderby]);

    return (<>
    <div className="container-fluid py-5 m-0 ">
              <div className="m-0 p-0 row">
           <form onSubmit={handlechangebody} className="container-fluid  py-4 " >
      <h2 className="mb-2">تصفية العملات</h2>

      {/* Master toggle + Reset */}
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <button
          type="button"
          className={`btn ${masterEnabled ? "btn-primary" : "btn-secondary"} btn-md`}
          onClick={handleMasterButtonToggle}
        >
          {masterEnabled ? "البحث مفعل" : "تفعيل البحث "}
          <span
            className={`ms-2 rounded-circle ${masterEnabled ? "bg-white" : "bg-dark"}`}
            style={{ display: "inline-block", width: "10px", height: "10px" }}
          ></span>
        </button>

                
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-secondary btn-md"
              onClick={handleReset}
            >
              Reset Filters
            </button>

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
            </button>
          </div>

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
    </div>
    <div className="m-0 p-0 container-fluid  gap-3" style={{}}>
        <div className="m-0 p-0 responsive" style={{overflow:"auto"}}>
<h2 className="mb-4 d-flex align-items-center gap-2">

  العملات
</h2>
      {/* Controls */}
      <div className="d-flex gap-3 mb-3 flex-wrap">
        <div className="dropdown">
          <button className="btn btn-outline-primary dropdown-toggle" data-bs-toggle="dropdown">
            Limit: {limit}
          </button>
          <ul className="dropdown-menu">
            {[5, 10, 15, 20, 25,35,50,80,100,200].map((val) => (
              <li key={val}>
                <button className="dropdown-item" onClick={() => { setLimit(val); setPage(1); }}>
                  {val}
                </button>
              </li>
            ))}
          </ul>
        </div>

<div className="dropdown">
  <button className="btn btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
    OrderBy :{currencyOrderOptions[orderby]}
  </button>
  <ul className="dropdown-menu">

    {Object.entries(currencyOrderOptions).map(([value, label]) => (
      <li key={value}>
        <button
          className="dropdown-item"
          onClick={() => { setOrderby(value); setPage(1); }}
        >
          {label}
        </button>
      </li>
    ))}
  </ul>
</div>

  
      <button
        type="button"
        className="btn btn-info btn-sm text-white "
        onClick={() => handelsearch() }
      >
        <i className="bi bi-search"></i> Search
      </button>

      <NavLink
        to="/dashboard/currency_add"
        className="btn btn-success"
      >
        <i className="bi bi-plus-circle me-2"></i> Add New 
      </NavLink>
      </div>


      <div className="table-responsive shadow rounded" style={{minHeight:"30vh"}}>
        <table className="table table-hover align-middle text-center mb-0">
          <thead className="table-dark"  >
            <tr  >
              <th>Actions</th>
              <th>currency_iso / الرمز</th>
              <th>name / الاسم</th>
              <th>symbol / الشكل</th>
            </tr>
          </thead>
          <tbody>
  {currenciesStatus === "idle" && (
    <tr>
      <td colSpan={21} className="text-center py-3 text-muted">
        Waiting for action...
      </td>
    </tr>
  )}

{currenciesStatus === "loading" && (
  <tr>
    <td colSpan={21} className="text-center py-3">
      <div className="d-flex justify-content-center align-items-center gap-2">
        <div className="spinner-border text-primary" role="status" style={{ width: "1.5rem", height: "1.5rem" }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <span className="text-primary">...Loading Currencies</span>
      </div>
    </td>
  </tr>
)}


  {currenciesStatus === "error" && (
    <tr>
      <td colSpan={21} className="text-center py-3 text-danger">
        {currency_error}
      </td>
    </tr>
  )}

  {currenciesStatus === "success" && currencies.length === 0 && (
    <tr>
      <td colSpan={21} className="text-center py-3">
        No Currencies found
      </td>
    </tr>
  )}

  {currenciesStatus === "success" &&
    currencies.map((item) => (
      <tr key={item.currency_iso}>
        <td>
          <div className="d-flex gap-2 justify-content-center">
            <button className="btn btn-sm btn-outline-primary" onClick={() => handleEditClick(item.currency_iso)}>Edit</button>
            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteClick(item.currency_iso)}>Delete</button>
            <button className="btn btn-sm btn-secondary" onClick={() => openDrawer(item.currency_iso)}>View</button>
          </div>
        </td>
        <td className="text-primary" style={{ cursor: "pointer" }} onClick={() => openDrawer(item.currency_iso)}>
          {item.currency_iso}
        </td>
        <td>{item.name}</td>
        <td>{item.symbol}</td>
      </tr>
    ))}
</tbody>

        </table>
      </div>
      </div>
      </div>
      <div className="d-flex justify-content-center align-items-center gap-2 mt-3 flex-wrap">
        <button className="btn btn-outline-primary" disabled={page===1} onClick={()=>setPage(page-1)}>
          &lt; Previous
        </button>
        {Array.from({length: totalPages}, (_, i)=>
          <button key={i+1} className={`btn ${page===i+1?"btn-primary":"btn-outline-primary"}`} onClick={()=>setPage(i+1)}>
            {i+1}
          </button>
        )}
        <button className="btn btn-outline-primary" disabled={page===totalPages} onClick={()=>setPage(page+1)}>
          Next &gt;
        </button>
    </div>

          {/* Drawer */}
      <div ref={drawerRef} className="offcanvas offcanvas-end offcanvas-wide" tabIndex="-1">
        <div className="offcanvas-header bg-dark text-white">
          <h5 className="offcanvas-title">Currency Details</h5>
          <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>
        </div>
        <div className="offcanvas-body">
            <div>
                <CurrencyDetailModern currency={selectedCurrency}></CurrencyDetailModern>
            </div>
        </div>
      </div>

      {/* Edit Modal */}
<div className={`modal ${showEditModal ? "show d-block" : ""}`} tabIndex="-1">
  <div className="modal-dialog">
    <div className="modal-content">
      <div className="modal-header">
        <h5 className="modal-title">Edit Product</h5>
        <button type="button" className="btn-close" onClick={handleCloseModals}></button>
      </div>
      <div className="modal-body">
        <EditCurrency currency={selectedCurrency} onClose={handleCloseModals} onUpdated={fetchCurrencies}></EditCurrency>
      </div>
      <div className="modal-footer">
        <button className="btn btn-secondary" onClick={handleCloseModals}>Cancel</button>
        <button className="btn btn-primary">Save Changes</button>
      </div>
    </div>
  </div>
</div>

{/* Delete Modal */}
<div className={`modal ${showDeleteModal ? "show d-block" : ""}`} tabIndex="-1">
  <div className="modal-dialog">
    <div className="modal-content">
      <div className="modal-header">
        <h5 className="modal-title">Delete Product</h5>
        <button type="button" className="btn-close" onClick={handleCloseModals}></button>
      </div>
      <div className="modal-body">
        {selectedCurrency && <p>هل انت متأكد انك تريد حذف  <strong>{selectedCurrency.name} (نهائيا) </strong>؟</p>}
      </div>
      <div className="modal-footer">
        <button className="btn btn-secondary" onClick={handleCloseModals}>Cancel</button>
        <button className="btn btn-danger" onClick={handleDeleteCurrnecy}>Delete</button>
      </div>
    </div>
  </div>
</div>

    </div>
    
    </>);
}