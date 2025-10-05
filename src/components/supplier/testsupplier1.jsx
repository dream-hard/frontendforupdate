import React, { useEffect, useState, useRef } from "react";

/**
 * ShipmentsWithDetailsSection.jsx
 *
 * - Top: shipments table
 * - Bottom: modern section showing details of the selected shipment
 * - No offcanvas; details always render in a card under the table
 *
 * Replace the mock functions fetchShipmentsMock / fetchDetailsMock / saveDetailMock / bulkSaveMock
 * with your API helpers (getShipmentsBySupplier, getDetailsByShipment, updateShipmentDetail, bulkUpdateDetails).
 */

/* -------------------------
   MOCK API (replace with real API)
   ------------------------- */
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchShipmentsMock() {
  await wait(120);
  return [
    { id: 101, date_received: "2025-09-10", total_cost: 4963.75, paid: 1956.25, currency: "USD", supplier_name: "Mega Supplies" },
    { id: 102, date_received: "2025-09-15", total_cost: 1200.0, paid: 300.0, currency: "USD", supplier_name: "Mega Supplies" },
    { id: 103, date_received: "2025-08-28", total_cost: 885.5, paid: 885.5, currency: "USD", supplier_name: "Mega Supplies" },
  ];
}

async function fetchDetailsMock(shipmentId) {
  await wait(180);
  if (shipmentId === 101) {
    return [
      { id: 1, product_id: "a111-b222", product_title: 'Samsung 24" Monitor', sku: "SM24-001", img: null, quantity: 10, unit_cost: 150.75, total_cost: 1507.5, paid: 500, currency: "USD" },
      { id: 2, product_id: "c333-d444", product_title: "Logitech Wireless Mouse", sku: "LM-220", img: null, quantity: 25, unit_cost: 18.25, total_cost: 456.25, paid: 456.25, currency: "USD" },
      { id: 3, product_id: "x555-y666", product_title: 'HP Laptop 15"', sku: "HP15-700", img: null, quantity: 5, unit_cost: 600.0, total_cost: 3000, paid: 1000, currency: "USD" },
    ];
  }
  if (shipmentId === 102) {
    return [
      { id: 4, product_id: "z777-z888", product_title: "USB-C Cable", sku: "UC-001", img: null, quantity: 100, unit_cost: 2.5, total_cost: 250, paid: 0, currency: "USD" },
      { id: 5, product_id: "p999-q000", product_title: "Portable SSD 1TB", sku: "SSD1T", img: null, quantity: 10, unit_cost: 95.0, total_cost: 950, paid: 300, currency: "USD" },
    ];
  }
  return [];
}

async function saveDetailMock(id, payload) {
  console.log("saveDetailMock", id, payload);
  await wait(200);
  // fail if negative
  if (payload.unit_cost !== undefined && payload.unit_cost < 0) return { succes: false, error: "unit_cost negative" };
  return { succes: true, detail: { id, ...payload } };
}

async function bulkSaveMock(updates) {
  console.log("bulkSaveMock", updates);
  await wait(300);
  return { succes: true, updatedDetails: updates };
}

/* -------------------------
   Component
   ------------------------- */

export default function ShipmentsWithDetailsSection({ shipmentId, onClose, onUpdated ,autoLoad = true }) {
  const [shipments, setShipments] = useState([]);
  const [shipLoading, setShipLoading] = useState(false);

  const [selectedShipmentId, setSelectedShipmentId] = useState(null);

  const [detailsMap, setDetailsMap] = useState({}); // { shipmentId: null | [] }
  const [detailsLoadingFor, setDetailsLoadingFor] = useState(null);

  const [dirtyMap, setDirtyMap] = useState({}); // { detailId: true }
  const [savingRow, setSavingRow] = useState(null);
  const [savingBulk, setSavingBulk] = useState(null);

  const [toast, setToast] = useState(null); // { type, message }
  const detailsRef = useRef(null);

  useEffect(() => {
    if (autoLoad) loadShipments();
    // eslint-disable-next-line
  }, []);

  async function loadShipments() {
    setShipLoading(true);
    try {
      const res = await fetchShipmentsMock(); // replace with API
      setShipments(res);
    } catch (err) {
      console.error(err);
      setToast({ type: "error", message: "Failed to load shipments" });
    } finally {
      setShipLoading(false);
    }
  }

  async function selectShipment(id) {
    setSelectedShipmentId(id);
    // scroll to details card smoothly after a short wait (so panel renders)
    setTimeout(() => detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 160);

    // load details if not cached
    if (!detailsMap[id]) {
      setDetailsLoadingFor(id);
      setDetailsMap((m) => ({ ...m, [id]: null })); // null => loading skeleton
      try {
        const data = await fetchDetailsMock(id); // replace with API
        const normalized = data.map((r) => ({
          ...r,
          quantity: Number(r.quantity || 0),
          unit_cost: r.unit_cost === null ? null : Number(r.unit_cost || 0),
          paid: Number(r.paid || 0),
          total_cost: r.total_cost === null ? null : Number(r.total_cost || 0),
          raw: { ...r },
        }));
        setDetailsMap((m) => ({ ...m, [id]: normalized }));
        // clear dirty flags for these ids
        setDirtyMap((dm) => {
          const newDm = { ...dm };
          normalized.forEach((d) => delete newDm[d.id]);
          return newDm;
        });
      } catch (err) {
        console.error(err);
        setToast({ type: "error", message: "Failed to load shipment details" });
      } finally {
        setDetailsLoadingFor(null);
      }
    }
  }

  function handleDetailChange(shipmentId, detailId, field, value) {
    setDetailsMap((m) => {
      const arr = (m[shipmentId] || []).map((d) => (d.id === detailId ? { ...d, [field]: value } : d));
      return { ...m, [shipmentId]: arr };
    });
    setDirtyMap((dm) => ({ ...dm, [detailId]: true }));
  }

  async function saveRow(shipmentId, detail) {
    setSavingRow(detail.id);
    const prev = (detailsMap[shipmentId] || []).find((d) => d.id === detail.id);
    const payload = {
      quantity: Number(detail.quantity),
      unit_cost: detail.unit_cost === null ? undefined : Number(detail.unit_cost),
      paid: Number(detail.paid),
      total_cost: detail.total_cost === null ? undefined : Number(detail.total_cost),
    };
    try {
      const res = await saveDetailMock(detail.id, payload); // replace with API
      if (!res || !res.succes) {
        // rollback
        setDetailsMap((m) => ({ ...m, [shipmentId]: (m[shipmentId] || []).map((d) => (d.id === detail.id ? prev : d)) }));
        setToast({ type: "error", message: res?.error || "Save failed" });
      } else {
        // merge server result
        if (res.detail) {
          setDetailsMap((m) => ({ ...m, [shipmentId]: (m[shipmentId] || []).map((d) => (d.id === detail.id ? { ...d, ...res.detail } : d)) }));
        }
        setDirtyMap((dm) => {
          const c = { ...dm };
          delete c[detail.id];
          return c;
        });
        setToast({ type: "success", message: "Saved" });
      }
    } catch (err) {
      console.error(err);
      setToast({ type: "error", message: "Server error" });
    } finally {
      setSavingRow(null);
    }
  }

  async function saveAll(shipmentId) {
    const rows = detailsMap[shipmentId] || [];
    const dirty = rows.filter((r) => dirtyMap[r.id]);
    if (dirty.length === 0) {
      setToast({ type: "info", message: "No changes to save" });
      return;
    }
    setSavingBulk(shipmentId);
    const updates = dirty.map((d) => ({
      id: d.id,
      quantity: Number(d.quantity),
      unit_cost: d.unit_cost === null ? undefined : Number(d.unit_cost),
      paid: Number(d.paid),
      total_cost: d.total_cost === null ? undefined : Number(d.total_cost),
    }));
    try {
      const res = await bulkSaveMock(updates); // replace with API
      if (res && res.succes) {
        if (res.updatedDetails && Array.isArray(res.updatedDetails)) {
          setDetailsMap((m) => {
            const arr = (m[shipmentId] || []).map((d) => {
              const updated = res.updatedDetails.find((u) => u.id === d.id);
              return updated ? { ...d, ...updated, raw: { ...updated } } : d;
            });
            return { ...m, [shipmentId]: arr };
          });
        }
        setDirtyMap((dm) => {
          const c = { ...dm };
          updates.forEach((u) => delete c[u.id]);
          return c;
        });
        setToast({ type: "success", message: `Saved ${updates.length} item(s)` });
      } else {
        setToast({ type: "error", message: "Bulk save failed" });
      }
    } catch (err) {
      console.error(err);
      setToast({ type: "error", message: "Server error" });
    } finally {
      setSavingBulk(null);
    }
  }

  function undoRow(shipmentId, detailId) {
    const orig = (detailsMap[shipmentId] || []).find((d) => d.id === detailId)?.raw;
    if (!orig) return;
    setDetailsMap((m) => ({ ...m, [shipmentId]: (m[shipmentId] || []).map((d) => (d.id === detailId ? { ...orig, raw: { ...orig } } : d)) }));
    setDirtyMap((dm) => {
      const c = { ...dm };
      delete c[detailId];
      return c;
    });
    setToast({ type: "info", message: "Reverted" });
  }

  // helpers
  function displayNumber(n) {
    if (n === null || n === undefined) return "-";
    return Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function computeRowTotal(d) {
    if (d.total_cost !== null && d.total_cost !== undefined) return displayNumber(d.total_cost);
    if (d.quantity !== undefined && d.unit_cost !== null && d.unit_cost !== undefined) return displayNumber(Number(d.quantity) * Number(d.unit_cost));
    return "-";
  }

  // small skeleton for details
  const DetailsSkeleton = () => (
    <div className="p-3">
      <div className="d-flex gap-3 mb-3">
        <div className="placeholder-glow" style={{ flex: 1 }}>
          <span className="placeholder col-6"></span><br />
          <span className="placeholder col-4 mt-2"></span>
        </div>
        <div className="placeholder-glow" style={{ width: 140 }}>
          <span className="placeholder col-12"></span>
        </div>
      </div>
      <div className="row g-3">
        <div className="col-12"><div className="placeholder col-12 placeholder-lg"></div></div>
        <div className="col-12"><div className="placeholder col-12 placeholder-lg"></div></div>
      </div>
    </div>
  );

  return (
    <div className="container-fluid py-3">
      <style>{`
        .card-modern { border-radius: 12px; box-shadow: 0 6px 20px rgba(16,24,40,0.06); }
        .product-tile { border-radius: 10px; background: linear-gradient(180deg,#fff,#fbfdff); border: 1px solid #eef3ff; padding: 12px; }
        .muted-sm { font-size: .85rem; color: #6c757d; }
      `}</style>

      <div className="card card-modern mb-3 border-0">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div>
              <h5 className="mb-0">Shipments</h5>
              <div className="muted-sm">Click a shipment to show details below</div>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-outline-secondary" onClick={loadShipments}><i className="bi bi-arrow-clockwise"></i> Refresh</button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="text-muted small">
                <tr>
                  <th style={{ width: 70 }}>#</th>
                  <th>Date</th>
                  <th className="text-end">Total</th>
                  <th className="text-end">Paid</th>
                  <th>Currency</th>
                  <th style={{ width: 180 }}>Supplier</th>
                </tr>
              </thead>
              <tbody>
                {shipLoading ? (
                  <tr><td colSpan={6} className="py-4 text-center">Loading...</td></tr>
                ) : shipments.length === 0 ? (
                  <tr><td colSpan={6} className="py-4 text-center muted-sm">No shipments</td></tr>
                ) : shipments.map((s) => (
                  <tr key={s.id} style={{ cursor: "pointer" }} onClick={() => selectShipment(s.id)} className={selectedShipmentId === s.id ? "table-active" : ""}>
                    <td><strong>{s.id}</strong></td>
                    <td>{s.date_received}</td>
                    <td className="text-end">{displayNumber(s.total_cost)}</td>
                    <td className="text-end">{displayNumber(s.paid)}</td>
                    <td>{s.currency}</td>
                    <td>{s.supplier_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* DETAILS SECTION (always under the table) */}
      <div ref={detailsRef} className="card card-modern border-0">
        <div className="card-body">
          {!selectedShipmentId ? (
            <div className="text-center py-5">
              <h6 className="mb-2">Select a shipment to view details</h6>
              <div className="muted-sm">The details panel appears here when you click a shipment above.</div>
            </div>
          ) : detailsLoadingFor === selectedShipmentId || detailsMap[selectedShipmentId] === null ? (
            <DetailsSkeleton />
          ) : (
            <>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h5 className="mb-1">Shipment #{selectedShipmentId} • Items</h5>
                  <div className="muted-sm">Edit quantities, unit cost, and paid amounts inline. Press Enter to save a row.</div>
                </div>
                <div className="d-flex gap-2 align-items-center">
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => {
                    // refresh details
                    setDetailsMap((m)=>{ const c={...m}; delete c[selectedShipmentId]; return c; });
                    selectShipment(selectedShipmentId);
                  }}>
                    <i className="bi bi-arrow-repeat"></i> Reload
                  </button>
                  <button className="btn btn-sm btn-primary" onClick={() => saveAll(selectedShipmentId)} disabled={savingBulk === selectedShipmentId}>
                    {savingBulk === selectedShipmentId ? <><span className="spinner-border spinner-border-sm me-1"></span>Saving...</> : <><i className="bi bi-save2 me-1"></i> Save All</>}
                  </button>
                </div>
              </div>

              <div className="row g-3 mt-3">
                {/* Left: financial summary */}
                <div className="col-12 col-md-4">
                  <div className="p-3 product-tile">
                    <h6 className="mb-2">Financial summary</h6>
                    <div className="d-flex justify-content-between">
                      <div className="muted-sm">Shipment total</div>
                      <div><strong>{displayNumber(shipments.find(s=>s.id===selectedShipmentId)?.total_cost)}</strong></div>
                    </div>
                    <div className="d-flex justify-content-between mt-2">
                      <div className="muted-sm">Total paid</div>
                      <div><strong>{displayNumber(shipments.find(s=>s.id===selectedShipmentId)?.paid)}</strong></div>
                    </div>
                    <hr />
                    <div className="muted-sm">Currency</div>
                    <div className="mb-2"><strong>{shipments.find(s=>s.id===selectedShipmentId)?.currency}</strong></div>
                    <div className="muted-sm">Actions</div>
                    <div className="d-flex gap-2 mt-2">
                      <button className="btn btn-sm btn-outline-primary">Print</button>
                      <button className="btn btn-sm btn-outline-secondary">Export CSV</button>
                    </div>
                  </div>
                </div>

                {/* Right: product grid + editable table */}
                <div className="col-12 col-md-8">
                  <div className="row row-cols-1 g-3">
                    {/* product tiles */}
                    {(detailsMap[selectedShipmentId] || []).map((d) => (
                      <div className="col" key={d.id}>
                        <div className="d-flex align-items-center gap-3 p-3 product-tile">
                          <div style={{ width: 84, height: 64, background: "#f7fafc", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>
                            {/* mock thumbnail */}
                            <div className="text-muted">{d.sku || d.product_id}</div>
                          </div>

                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <div className="fw-bold">{d.product_title}</div>
                                <div className="muted-sm">{d.product_id}</div>
                              </div>

                              <div className="text-end muted-sm">{d.currency}</div>
                            </div>

                            <div className="d-flex gap-2 align-items-center mt-2">
                              <div style={{ width: 110 }}>
                                <label className="form-label small mb-1">Qty</label>
                                <input type="number" className="form-control form-control-sm" value={d.quantity} onChange={(e)=>handleDetailChange(selectedShipmentId,d.id,"quantity",Number(e.target.value))} onKeyDown={(e)=>{ if(e.key==="Enter"){ saveRow(selectedShipmentId,d); }}} />
                              </div>

                              <div style={{ width: 140 }}>
                                <label className="form-label small mb-1">Unit</label>
                                <input type="number" step="0.01" className="form-control form-control-sm" value={d.unit_cost===null?"":d.unit_cost} onChange={(e)=>handleDetailChange(selectedShipmentId,d.id,"unit_cost", e.target.value===""?null:Number(e.target.value))} onKeyDown={(e)=>{ if(e.key==="Enter"){ saveRow(selectedShipmentId,d); }}} />
                              </div>

                              <div style={{ width: 120 }} className="text-end">
                                <label className="form-label small mb-1">Total</label>
                                <div className="fw-bold">{computeRowTotal(d)}</div>
                              </div>

                              <div style={{ width: 140 }}>
                                <label className="form-label small mb-1">Paid</label>
                                <input type="number" step="0.01" className="form-control form-control-sm" value={d.paid} onChange={(e)=>handleDetailChange(selectedShipmentId,d.id,"paid",Number(e.target.value))} onKeyDown={(e)=>{ if(e.key==="Enter"){ saveRow(selectedShipmentId,d); }}} />
                              </div>

                              <div>
                                <div className="d-flex gap-2">
                                  <button className="btn btn-sm btn-outline-success" onClick={()=>saveRow(selectedShipmentId,d)} disabled={savingRow===d.id}>
                                    {savingRow===d.id ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-check-lg"></i>}
                                  </button>
                                  <button className="btn btn-sm btn-outline-secondary" onClick={()=>undoRow(selectedShipmentId,d.id)}><i className="bi bi-arrow-counterclockwise"></i></button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {Array.isArray(detailsMap[selectedShipmentId]) && detailsMap[selectedShipmentId].length === 0 && (
                      <div className="col">
                        <div className="p-3 text-center muted-sm">No items in this shipment</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Toast */}
      <div style={{ position: "fixed", right: 16, bottom: 16, zIndex: 1060 }}>
        {toast && (
          <div className={`toast show align-items-center text-bg-${toast.type==="error"?"danger":toast.type==="success"?"success":"secondary"}`} role="alert" aria-live="assertive" aria-atomic="true">
            <div className="d-flex">
              <div className="toast-body">{toast.message}</div>
              <button type="button" className="btn-close btn-close-white me-2 m-auto" aria-label="Close" onClick={()=>setToast(null)}></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
