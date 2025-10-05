import React, { useEffect, useState } from "react";
import axios  from "../../api/fetch";
import { useLocation } from "react-router-dom";
import useNotification from "../../Hooks/useNotification";
import SupplierShipmentAdd from "./SupplierShipmentAdd";
import ShipmentsWithDetailsSection from "./9282025649";
import SupplierShipmentEdit from "./shipmentUpdate";

/**
 * SupplierMasterDetail.jsx
 * - left: suppliers list (search + simple pagination)
 * - middle: shipments table for selected supplier (server-side pagination)
 * - right: offcanvas with shipment details (editable cells)
 *
 * NOTE: uses bootstrap offcanvas; make sure bootstrap JS is loaded in index.html
 */


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

export default function SupplierMasterDetail() {
  const location=useLocation();
  const [navinfos,Setnavinfos]=useState({})
  // suppliers
  const [showEditModal, setShowEditModal] = useState(false);
  const[showAddModal,setShowAddModal]=useState(false);
  const [showDeleteModal,setShowDeleteModal]=useState(false);

  const [suppliers, setSuppliers] = useState([]);
  const [suppliersPage, setSuppliersPage] = useState(1);
  const [suppliersTotalPages, setSuppliersTotalPages] = useState(0);
  const [supplierQuery, setSupplierQuery] = useState("");
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [suppliersLimit,setSuppliersLimit]=useState(5);
  const [suppliersOrderby,setSuppliersOrderby]=useState(null);
  const [searchsupplier1,setSearchsupplier1]=useState(null);
  
  const [selectedsupplier,setSelectedsupplier]=useState(null);
  // selection
  const [selectedSupplier, setSelectedSupplier] = useState("all");

  // shipments
  const [shipments, setShipments] = useState([]);
  const [shipmentsPage, setShipmentsPage] = useState(1);
  const [shipmentsTotalPages, setShipmentsTotalPages] = useState(1);
  const [loadingShipments, setLoadingShipments] = useState(false);
  const [shipmentsOrderBy, setShipmentsOrderBy] = useState("date_received-desc");
  const [shipmentsLimit,setShipmentlimit]=useState(8);
  // details
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [details, setDetails] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const{showNotification}=useNotification();
  const handlesearchchanger=(event)=>{
    setSuppliersPage(1);
    setSuppliersTotalPages(0);
    setSearchsupplier1(event.target.value);
    return ;
  }
  async function fetchsuppliers() {
    try {
      setLoadingSuppliers(true);
      let body={};
      if(searchsupplier1!==null &&searchsupplier1!==undefined&&searchsupplier1!=="")body.name=searchsupplier1;
      const suppliers=await axios.post('/supplier/searchsuppliers',{page:suppliersPage,limit:suppliersLimit,orderBy:suppliersOrderby,...body});
      setSuppliers(suppliers.data.suppliers);
      setSuppliersPage(suppliers.data.currentPage);
      setSuppliersTotalPages(suppliers.data.totalPages);
    } catch (error) {
      showNotification("error", error.data.message||error.message || "فشل تحميل الموردين");
    } finally{
      setLoadingSuppliers(false);
    } 
  }
  async function fetchshipments() {
    try {
      setLoadingShipments(true);
      let body={};
      if(selectedSupplier!==null&&selectedSupplier!==undefined&&selectedSupplier!==""&&selectedSupplier!=="all")body.supplier_id=selectedSupplier.uuid;
      const shipments=await axios.post('/supplier_shipment/searchinshipments',{page:shipmentsPage,limit:shipmentsLimit,orderBy:shipmentsOrderBy,...body});
      setShipments(shipments.data.shipments)
      setShipmentsPage(shipments.data.currentPage);
      setShipmentsTotalPages(shipments.data.totalPages);
      showNotification("success","تم ايجاد الشحنات بنجاح");

    } catch (error) {
      showNotification("error",error.response.data.error ||error.response.data.message || error.data.message||error.message || "فشل تحميل الشحنات");
    }finally{
      setLoadingShipments(false);
    }
  }
  // fetch suppliers (server-side)
  
  
  useEffect(() => {
    fetchsuppliers();

  }, [suppliersPage,searchsupplier1,suppliersLimit,suppliersOrderby]);


  
  useEffect(() => {
    if (!selectedSupplier) {
      setShipments([]);
      return;
    }
    fetchshipments();
    // eslint-disable-next-line
  }, [selectedSupplier, shipmentsPage, shipmentsOrderBy,shipmentsLimit]);
  

  

// //////////////////////////////////////////////////
  // inline save for a detail (optimistic-ish)

  // //////////////////////////////////////////////////
  
// //////////////////////////////////////////////////
  // quick supplier search (client-side hint; but we can call search endpoint if needed)
  async function onSupplierSearch(e) {
    e.preventDefault();
    setSuppliersPage(1);
    setSuppliersTotalPages(0);
    fetchsuppliers();    
    // for now just re-run loadSuppliers (you can wire to searchsuppliers endpoint)
  }
// //////////////////////////////////////////////////
// Pure Bootstrap placeholders (no custom CSS, no inline styles)
const renderPlaceholders = () => (
  <div className="list-group">
    {Array.from({ length: 4 }).map((_, i) => (
      <button
        key={i}
        type="button"
        className="list-group-item list-group-item-action d-flex justify-content-between align-items-start"
        disabled
        aria-hidden="true"
      >
        <div className="d-flex align-items-center w-100">
          {/* left: text placeholders (varying widths) */}
          <div className="flex-grow-1 me-3">
            <div className="placeholder-glow mb-2">
              {/* title-ish placeholder (vary widths to feel dynamic) */}
              <span className={`placeholder col-${[7,6,5,6,7,5][i % 6]}`}></span>
            </div>
            <div className="placeholder-glow">
              {/* meta placeholder */}
              <span className={`placeholder col-${[4,5,3,4,5,4][i % 6]}`}></span>
            </div>
          </div>

          {/* right: rounded-pill placeholder (uses Bootstrap rounded-pill) */}
          <div className="d-flex align-items-center">
            <span className="placeholder rounded-pill placeholder-glow col-1" />
          </div>
        </div>
      </button>
    ))}
  </div>
);


// //////////////////////////////////////////////////
  // open offcanvas helper
  function openOffcanvas() {
    const el = document.getElementById("shipmentDetailsOffcanvas");
    if (!el) return;
    const off = new window.bootstrap.Offcanvas(el);
    off.show();
  }


  function onSelectSupplier(s) {
    setSelectedSupplier(s);
    setShipmentsPage(1);
  }

  function onSelectShipment(s) {
    setSelectedShipment(s);
    // open offcanvas after setting
  }
  function closedetails(){
    setSelectedShipment(null);
  }
  
const hanedeladdclick=()=>{
  setShowAddModal(true);
};
const handleEditClick = (item) => {
  setShowEditModal(true);
};

const handeldeleteshipment = async (id) => {
  try {
    
    await axios.delete(`/supplier_shipment/delete/delete?id=${id}`,{id:id});
    showNotification("success","تم حذف الشحنة بنجاح");
    handleCloseModals();
    fetchshipments();


  } catch (error) {
    
    showNotification("error",error.response.data.error ||error.response.data.message || error.data.message||error.message || "فشل حذف الشحنة");
  }
};
const handleCloseModals = () => {
  setShowEditModal(false);
  setShowAddModal(false);
  setShowDeleteModal(false);
};

  return (
    <div className="container-fluid">
      <div className="row g-3">
        {/* LEFT: Suppliers list */}
        {/*  */}

        {/*  */}
            <div className="col-12 col-md-3">
      <div className="card shadow-sm">
        <div className="card-body">
          {/* Search */}
          <form className="d-flex mb-2" onSubmit={onSupplierSearch}>
            <div className="input-group input-group-sm">
              <input
                className="form-control"
                placeholder="Search suppliers..."
                value={searchsupplier1}
                onChange={handlesearchchanger}
                aria-label="Search suppliers"
              />
              <button className="btn btn-primary" type="submit" aria-label="Search">
                <i className="bi bi-search"></i>
              </button>
            </div>
          </form>

          {/* Optional small spinner while loading (above the list) */}
          {loadingSuppliers && (
            <div className="d-flex align-items-center mb-2">
              <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
              <small className="text-muted">Loading suppliers…</small>
            </div>
          )}

          {/* List area */}
          <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
            {loadingSuppliers ? (
              renderPlaceholders()
            ) : suppliers.length === 0 ? (
              <div className="text-center text-muted py-4">No suppliers found</div>
            ) : (
              <div className="list-group">
                {suppliers.map((s) => {
                  const active = selectedSupplier?.uuid === s.uuid;
                  return (
                    <button
                      key={s.uuid}
                      type="button"
                      className={`list-group-item list-group-item-action d-flex justify-content-between align-items-start ${active ? "active" : ""}`}
                      onClick={() => onSelectSupplier(s)}
                      aria-pressed={active ? "true" : "false"}
                    >
                      <div style={{ overflow: "hidden" }}>
                        <div className="fw-bold text-truncate">{s.name}</div>
                        <div className="small text-muted text-truncate" style={{ maxWidth: 160 }}>
                          {s.phone_number || ""} · {s.address || ""}
                        </div>
                      </div>

                      <span className="badge bg-secondary rounded-pill">
                        <i className="bi bi-arrow-right-short" style={{ fontSize: 20 }}></i>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <small className="text-muted">Page {suppliersPage} / {suppliersTotalPages}</small>
            <div>
              <button
                className="btn btn-sm btn-outline-secondary me-1"
                onClick={() => setSuppliersPage((p) => Math.max(1, p - 1))}
                disabled={suppliersPage <= 1}
              >
                Prev
              </button>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setSuppliersPage((p) => Math.min(suppliersTotalPages, p + 1))}
                disabled={suppliersPage >= suppliersTotalPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
        {/*  */}

    {/*  */}
        {/* <div className="col-12 col-md-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <form className="d-flex mb-2" onSubmit={onSupplierSearch}>
                <input
                  className="form-control form-control-sm me-2"
                  placeholder="Search suppliers..."
                  value={supplierQuery}
                  onChange={(e) => setSupplierQuery(e.target.value)}
                />
                <button className="btn btn-sm btn-primary">Search</button>
              </form>

              <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
                {loadingSuppliers ? (
                  <div className="text-center py-4">Loading...</div>
                ) : suppliers.length === 0 ? (
                  <div className="text-center text-muted py-4">No suppliers</div>
                ) : (
                  <div className="list-group">
                    {suppliers.map((s) => (
                      <button
                        key={s.uuid}
                        type="button"
                        className={`list-group-item list-group-item-action d-flex justify-content-between align-items-start ${
                          selectedSupplier?.uuid === s.uuid ? "active" : ""
                        }`}
                        onClick={() => onSelectSupplier(s)}
                      >
                        <div>
                          <div className="fw-bold">{s.name}</div>
                          <div className="small text-nowrap text-truncate" style={{ maxWidth: 160 }}>
                            {s.phone_number || ""} · {s.address || ""}
                          </div>
                        </div>
                        <small className="badge bg-secondary rounded-pill">→</small>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="d-flex justify-content-between align-items-center mt-2">
                <small className="text-muted">Page {suppliersPage}</small>
                <div>
                  <button
                    className="btn btn-sm btn-outline-secondary me-1"
                    onClick={() => setSuppliersPage((p) => Math.max(1, p - 1))}
                  >
                    Prev
                  </button>
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => setSuppliersPage((p) => p + 1)}>
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div> */}

        {/* MIDDLE: Shipments table */}
        <div className="col-12 col-md-6">
          {/* <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <h6 className="mb-0">Shipments {selectedSupplier ? `— ${selectedSupplier.name}` : ""}</h6>
                  <small className="text-muted">Click a row to view details</small>
                </div>
                <div className="d-flex align-items-center">
                  <select
                    className="form-select form-select-sm me-2"
                    style={{ width: 180 }}
                    value={shipmentsOrderBy}
                    onChange={(e) => setShipmentsOrderBy(e.target.value)}
                  >
                    <option value="date_received-desc">Date (new → old)</option>
                    <option value="date_received-asc">Date (old → new)</option>
                    <option value="total_cost-desc">Total (high → low)</option>
                    <option value="total_cost-asc">Total (low → high)</option>
                  </select>
                  <small className="text-muted ms-2">Page {shipmentsPage}</small>
                </div>
              </div>

              <div style={{ maxHeight: "62vh", overflowY: "auto" }}>
                {loadingShipments ? (
                  <div className="text-center py-4">Loading shipments...</div>
                ) : shipments.length === 0 ? (
                  <div className="text-center text-muted py-4">No shipments</div>
                ) : (
                  <table className="table table-hover table-sm mb-0">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Date</th>
                        <th>Total</th>
                        <th>Paid</th>
                        <th>Currency</th>
                        <th>Supplier</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shipments.map((sh) => (
                        <tr key={sh.id} style={{ cursor: "pointer" }} onClick={() => onSelectShipment(sh)}>
                          <td>{sh.id}</td>
                          <td>{sh.date_received || "-"}</td>
                          <td>{sh.total_cost}</td>
                          <td>{sh.paid}</td>
                          <td>{sh.currency}</td>
                          <td>{sh["Supplier.name"] || sh["Supplier?.name"] || (sh.Supplier && sh.Supplier.name) || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="d-flex justify-content-between align-items-center mt-2">
                <div />
                <div>
                  <button
                    className="btn btn-sm btn-outline-secondary me-1"
                    onClick={() => setShipmentsPage((p) => Math.max(1, p - 1))}
                  >
                    Prev
                  </button>
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => setShipmentsPage((p) => p + 1)}>
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div> */}
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
            OrderBy: {orderOptions[shipmentsOrderBy]}
          </button>
          <ul className="dropdown-menu">
            {Object.entries(orderOptions).map(([val,label])=>(
              <li key={val}><button className="dropdown-item" onClick={()=>{setShipmentsOrderBy(val);setShipmentsPage(1);}}>{label}</button></li>
            ))}
          </ul>
        </div>
              </div>

              <div style={{ maxHeight: "62vh", overflowY: "auto" }} className="table-responsive">
          {/* LOADING */}
          {loadingShipments === true ? (
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
          ) : /* EMPTY */ shipments.length === 0 ? (
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
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {shipments.map((sh) => {
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
                      onClick={() => onSelectShipment(sh)}
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
                      <td className="   ">
                        <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={(e) => {
                            setSelectedShipment(sh);
                            handleEditClick(sh);
                          }}
                        >
                          تعديل
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={(e) => {
                            setSelectedShipment(sh);
                            setShowDeleteModal(true);
                          }}
                        >
                          حذف
                        </button>
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
                  {shipmentsPage} من  {shipmentsTotalPages}
                </div>
                <div>
                  <button
                    className="btn btn-sm btn-outline-secondary me-1"
                    onClick={() => setShipmentsPage((p) => Math.max(1, p - 1))}
                  disabled={shipmentsPage<=1}>
                    Prev
                  </button>
                  <button disabled={shipmentsPage>=shipmentsTotalPages} className="btn btn-sm btn-outline-secondary"    onClick={() => setShipmentsPage((p) => Math.min(shipmentsTotalPages, p + 1))}>
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        </div>

        {/* RIGHT: helper / quick summary */}
        <div className="col-12 col-md-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <h6>Quick actions</h6>
              <div className="d-grid gap-2">
                <button className="btn btn-primary" onClick={() => hanedeladdclick()}>
                  + New Shipment
                </button>
                <button
                  className="btn btn-outline-secondary"
                  onClick={()=>{setSelectedSupplier("all")}}
                >
                  Fetch recent shipments (quick)
                </button>
                <hr />
                <h6 className="mb-1">Selected</h6>
                <div className="small text-muted mb-2">
                  Supplier: {selectedSupplier ? selectedSupplier.name : "-"}
                  <br />
                  Shipment: {selectedShipment ? `#${selectedShipment.id}` : "-"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedShipment&&
      <div className="container-fluid my-4">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-12">
            <div className="card shadow-sm rounded-3 p-3 bg-white">
              <ShipmentsWithDetailsSection onClose={closedetails} shipment={selectedShipment} shipmentId={ ""}  />
            </div>
          </div>
        </div>
      </div>
      }
      {/* Offcanvas: Shipment details */}

      <div className={`modal ${showAddModal ? "show d-block" : ""}`} tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add shipment</h5>
              <button type="button" className="btn-close" onClick={()=>{handleCloseModals()}}></button>
            </div>
            <div className="modal-body">
              <SupplierShipmentAdd  onClose={handleCloseModals} onUpdated={handleCloseModals} supplier_id={selectedSupplier.uuid}></SupplierShipmentAdd>
            </div>
          </div>
        </div>
      </div>

            {/* Edit Modal */}
      <div className={`modal ${showEditModal ? "show d-block" : ""}`} tabIndex="-1">
  <div className="modal-dialog">
    <div className="modal-content">
      <div className="modal-header">
        <h5 className="modal-title">Edit shipment</h5>
        <button type="button" className="btn-close" onClick={()=>{handleCloseModals()}}></button>
      </div>
      <div className="modal-body">
        <SupplierShipmentEdit shipmentId={selectedShipment?.id} onClose={handleCloseModals} onUpdated={fetchshipments}></SupplierShipmentEdit>
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
              <button type="button" className="btn-close" onClick={()=>{setShowDeleteModal(false); setSelectedShipment(null);}}></button>
            </div>
            <div className="modal-body">
              {selectedShipment && <p>هل أنت متأكد من حذف <strong>{selectedShipment.name || selectedShipment.uuid||selectedShipment.id}</strong> ؟</p>}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={()=>{setShowDeleteModal(false); setSelectedShipment(null);}}>Cancel</button>
              <button className="btn btn-danger" onClick={()=>handeldeleteshipment(selectedShipment.id)}>Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


// modern placeholders (Bootstrap-only + minimal inline sizing)
const renderModernPlaceholders = () => (
  <div className="list-group">
    {Array.from({ length: 6 }).map((_, i) => (
      <button
        key={i}
        type="button"
        className="list-group-item list-group-item-action d-flex justify-content-between align-items-start"
        disabled
        aria-hidden="true"
      >
        {/* left: avatar + text */}
        <div className="d-flex align-items-center" style={{ overflow: "hidden" }}>
          {/* avatar placeholder (circle) */}
          <span
            className="placeholder rounded-circle me-3 placeholder-glow"
            style={{ width: 44, height: 44, display: "inline-block" }}
          >
            <span className="placeholder col-12" />
          </span>

          {/* text placeholders */}
          <div style={{ minWidth: 0 }}>
            <div className="placeholder-glow mb-2">
              {/* title: different widths to look realistic */}
              <span className="placeholder col-6"></span>
            </div>
            <div className="placeholder-glow">
              {/* meta: shorter line */}
              <span className="placeholder col-5"></span>
            </div>
          </div>
        </div>

        {/* right: rounded badge placeholder */}
        <div className="d-flex align-items-center">
          <span
            className="placeholder rounded-pill placeholder-glow"
            style={{ width: 36, height: 36, display: "inline-block" }}
          >
            <span className="placeholder col-12" />
          </span>
        </div>
      </button>
    ))}

  </div>
);
