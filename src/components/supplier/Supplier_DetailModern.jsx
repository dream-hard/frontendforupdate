
// export default ExchangeRateDetailModern;

import React, { useEffect, useRef, useState } from "react";
import useNotification from "../../Hooks/useNotification";
import axios from "../../api/fetch";
import { Link, useNavigate } from "react-router-dom";

    const orderOptions = {
      "date_received-asc":"زمن الوصول (تصاعدي)",
      "date_received-desc":"زمن الوصول (تنازلي)",
      "paid-asc":"المبلغ المدفوع (تصاعدي)",
      "paid-desc":"المبلغ المدفوع (تنازلي)",
      "total_cost-asc":"التكلفة (تصاعدي)",
      "total_cost-desc":"التكلفة (تنازلي)",
      "currency-asc":"العملة (تصاعدي)",
      "currency-desc":"العملة (تنازلي)",
      "supplier_id-asc":"المورد (تصاعدي)",
      "supplier_id-desc":"المورد (تنازلي)",
      "createdAt-asc":"تاريخ الانشاء (تصاعدي)",
      "createdAt-desc":"تاريخ الانشاء (تنازلي)",
      "updatedAt-asc":"تاريخ اخر تعديل (تصاعدي)",
      "updatedAt-desc":"تاريخ اخر تعديل (تنازلي)"
    };
const SupplierDetailModern = ({ supplier }) => {
    const {showNotification}=useNotification();
  // helper to pick base/target even if property names vary
  const getVal = (r, keys) => keys.map(k => r?.[k]).find(v => v !== undefined);
    const [loadingShipments,setLoadingShipments]=useState(null);
  const navigate = useNavigate();

    const [shipment_page,setShipments_page]=useState(1);
    const [shipment_totalpages,setShipments_totalpages]=useState(0);
    const [shipment_limit,setShipment_limit]=useState(10);
    const [shipment_orderby,setShipment_orderby]=useState(null);
  
  async function fetchshipments() {
    try {
      if(loadingShipments !==null ){
        setLoadingShipments(null);
      }else{
        const shipments=await axios.post('/supplier_shipment/searchinshipments',{
          page:shipment_page,
          limit:shipment_limit,
          orderby:shipment_orderby,

        });
        setLoadingShipments(shipments.data.shipments);
        setShipments_page(shipments.data.shipments);
        setShipments_totalpages(shipments.data.totalPages);
        setShipments_page(shipments.data.currentPage);
      }
    
    } catch (error) {
          showNotification("error", error?.response?.data?.message || error.message || "فشل تحميل الشحنات");
          setLoadingShipments(null);
    }

  }

  const onSelectShipment=(shipment)=>{
    
  }
  useEffect(() => {
    // fetchshipments();
    
  return () => {
  };
}, [supplier,shipment_page,shipment_limit,shipment_orderby]);

  if (!supplier) return <div>لا يوجد مورد بهذا الاسم</div>;


  return (
    <div className="container py-3">
      <h4 className="mb-3 text-primary">{supplier.name}</h4>

      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <label className="form-label">ID </label>
          <input className="form-control" value={supplier.uuid} disabled />
        </div>
        <div className="col-md-6">
          <label className="form-label">الاسم</label>
          <input className="form-control" value={supplier.name} disabled />
        </div>
        <div className="col-md-6">
          <label className="form-label">Phone Number / رقم الهاتف </label>
          <input className="form-control" value={supplier.phone_number} disabled />
        </div>
        <div className="col-md-6">
          <label className="form-label">address / العنوان </label>
          <textarea  className="form-control" value={supplier.address} disabled />
        </div>
        <div className="col-md-6">
          <label className="form-label">Created At</label>
          <input className="form-control" value={supplier.CreatedAt || ''} disabled />
        </div>
        <div className="col-md-6">
          <label className="form-label">Updated At</label>
          <input className="form-control" value={supplier.UpdatedAt || ''} disabled />
        </div>
      </div>

        {supplier.metadata && (
        <div className="mb-3">
            <h4 className="mb-3">Metadata / المعلومات الاضافية</h4>
            <div className="metadata-display d-flex flex-wrap gap-2">
            {Object.entries(JSON.parse(supplier.metadata)).map(([key, value]) => (
                <div
                key={key}
                className="p-2 border rounded bg-light d-flex flex-column align-items-start"
                style={{ minWidth: "120px", flex: "1 1 120px" }}
                >
                <span className="fw-bold text-primary">{key}</span>
                <span className="text-dark">{value}</span>
                </div>
            ))}
            </div>
        </div>
        )}

                {/* MIDDLE: Shipments table */}
    <div className="card shadow-sm border-0 mx-auto mt-5" >
      <div className="card-body text-center">
        <h4 className="card-title mb-3">الشحنات</h4>
        <p className="card-text text-muted">
          اضغط على الزر لإظهار الشحنات المتعلقة ب <span className="text-primary">{supplier.name}</span>
        </p>
        <button onClick={()=>{fetchshipments()}} className={`btn ${loadingShipments===null||loadingShipments===undefined ? "btn-primary":"btn-danger"} rounded-pill px-4 py-2 shadow-sm`}>
          {!loadingShipments ? (<>إظهار </>):(<>إخفاء</>)}
        </button>
      </div>
    </div>
      
        <div className="col-12 ">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  {/* <h6 className="mb-0">Shipments {selectedSupplier ? `— ${selectedSupplier.name}` : ""}</h6> */}
                  <small className="text-muted">اضغط على الشحنة لاظهار التفاصيل</small>
                </div>
               <div className="dropdown">
          <button className="btn btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
            OrderBy: {orderOptions[shipment_orderby]}
          </button>
          <ul className="dropdown-menu">
            {Object.entries(orderOptions).map(([val,label])=>(
              <li key={val}><button className="dropdown-item" onClick={()=>{setShipment_orderby(val); setShipments_page(1);}}>{label}</button></li>
            ))}
          </ul>
        </div>
              </div>

              <div style={{ maxHeight: "62vh", overflowY: "auto" }} className="table-responsive">
          {/* LOADING */}
          {loadingShipments === null ? (
            <table className="table table-borderless mb-0">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>#</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Currency</th>
                  <th>Supplier</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(6)].map((_, i) => (
                  <tr key={i}>
                    <td>
                      <span className="placeholder col-6 placeholder-wave"></span>
                    </td>
                    <td>
                      <span className="placeholder col-7 placeholder-wave"></span>
                    </td>
                    <td>
                      <span className="placeholder col-6 placeholder-wave"></span>
                    </td>
                    <td>
                      <span className="placeholder col-5 placeholder-wave"></span>
                    </td>
                    <td>
                      <span className="placeholder col-4 placeholder-wave"></span>
                    </td>
                    <td>
                      <span className="placeholder col-8 placeholder-wave"></span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : /* EMPTY */ loadingShipments.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <div className="mb-3" style={{ fontSize: 40 }}>📦</div>
              <h6 className="mb-1">No shipments yet</h6>
            </div>
          ) : (

 
            /* TABLE WITH DATA */
            <table className="table table-hover table-sm mb-0 align-middle">
              <thead style={{ position: "sticky", top: 0, background: "white", zIndex: 2 }}>
                <tr>
                  <th style={{ width: 60 }}>#</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Currency</th>
                  <th>Supplier</th>
                </tr>
              </thead>
              <tbody>
                {loadingShipments.map((sh) => {
                  const formatDate = (d) => {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return d;
  }
};
const formatCurrency = (amount, currency) => {
  if (amount == null) return "-";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 2,
  }).format(amount);
};
const initials = (name = "") =>
  name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
                  const avatarColor = (str) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 360;
  return `hsl(${h} 60% 65%)`;
};
                  const supplierName = sh?.Supplier?.name || sh["Supplier.name"] || "-";
                  const paidPct =
                    sh.total_cost && sh.paid != null ? Math.min(100, Math.round((sh.paid / sh.total_cost) * 100)) : 0;
                  const isPaid = sh.total_cost && sh.paid >= sh.total_cost;
                  return (
                    <tr
                      key={sh.id}
                      style={{ cursor: "pointer" }}
                      onClick={() => navigate("/shipments_details", { state: { shipment_id: sh.id } })}
                      title={`Open shipment ${sh.id}`}
                    >
                      <td style={{ width: 70 }}>
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="rounded-circle d-inline-flex justify-content-center align-items-center"
                            style={{
                              width: 36,
                              height: 36,
                              fontWeight: 600,
                              color: "white",
                              background: avatarColor(supplierName),
                              flexShrink: 0,
                            }}
                            aria-hidden
                          >
                            {initials(supplierName || String(sh.id))}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div className="fw-bold">{sh.id}</div>
                          </div>
                        </div>
                      </td>

                      <td style={{ width: 140 }}>{formatDate(sh.date_received)}</td>

                      <td>{formatCurrency(sh.total_cost, sh.currency)}</td>

                      <td style={{ width: 150 }}>
                        <div className="d-flex flex-column">
                          <div className="d-flex justify-content-between">
                            <small className="text-muted">{formatCurrency(sh.paid, sh.currency)}</small>
                            <small className="text-muted">{paidPct}%</small>
                          </div>
                          <div className="progress" style={{ height: 6 }}>
                            <div
                              className={`progress-bar ${isPaid ? "bg-success" : "bg-warning"}`}
                              role="progressbar"
                              style={{ width: `${paidPct}%` }}
                              aria-valuenow={paidPct}
                              aria-valuemin="0"
                              aria-valuemax="100"
                            />
                          </div>
                        </div>
                      </td>

                      <td style={{ width: 90 }}>
                        <span className="badge bg-light text-dark">{sh.currency || "—"}</span>
                      </td>

                      <td style={{ minWidth: 180 }}>
                        <div className="d-flex flex-column">
                          <strong className="text-truncate">{supplierName}</strong>
                          <small className="text-muted text-truncate">{sh.notes || "—"}</small>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          
          )}
        </div>

              <div className="d-flex justify-content-between align-items-center mt-2">
                <div >
                  {shipment_page} من  {shipment_totalpages}
                </div>
                <div>
                  <button
                    className="btn btn-sm btn-outline-secondary me-1"
                    onClick={() => setShipments_page((p) => Math.max(1, p - 1))}
                  >
                    Prev
                  </button>
                  <button className="btn btn-sm btn-outline-secondary"    onClick={() => setShipments_page((p) => p + 1)}>
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>





    </div>
  );
};

export default SupplierDetailModern;
