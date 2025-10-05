// src/components/Shipments/ShipmentsModernInline.jsx
import React, { useEffect, useState, useRef } from "react";

/**
 * ShipmentsModernInline.jsx
 *
 * Modern inline shipments + details view (single-file).
 *
 * Usage:
 *  <ShipmentsModernInline supplierUuid="supplier-1" />
 *
 * NOTE: This file uses mocked API functions at the top. Replace them with your API helpers:
 *  - fetchShipments(supplierUuid)
 *  - fetchDetails(shipmentId)
 *  - saveDetail(id, payload)
 *  - bulkSave(updates)
 *
 * Accessibility: inputs have aria-labels and the expanded detail receives focus for keyboard users.
 */

/* ===========================
   Mock API (replace with your real API calls)
   =========================== */
const MOCK_DELAY = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchShipmentsMock(supplierUuid) {
  await MOCK_DELAY(120);
  return [
    { id: 101, date_received: "2025-09-10", total_cost: 4963.75, paid: 1956.25, currency: "USD", supplier_name: "Mega Supplies" },
    { id: 102, date_received: "2025-09-15", total_cost: 1200.0, paid: 300.0, currency: "USD", supplier_name: "Mega Supplies" },
    { id: 103, date_received: "2025-08-28", total_cost: 885.5, paid: 885.5, currency: "USD", supplier_name: "Mega Supplies" },
  ];
}

async function fetchDetailsMock(shipmentId) {
  await MOCK_DELAY(180);
  if (shipmentId === 101) {
    return [
      { id: 1, product_id: "a111-b222", product_title: 'Samsung 24" Monitor', quantity: 10, unit_cost: 150.75, total_cost: 1507.5, paid: 500, currency: "USD" },
      { id: 2, product_id: "c333-d444", product_title: "Logitech Wireless Mouse", quantity: 25, unit_cost: 18.25, total_cost: 456.25, paid: 456.25, currency: "USD" },
      { id: 3, product_id: "x555-y666", product_title: 'HP Laptop 15"', quantity: 5, unit_cost: 600.0, total_cost: 3000, paid: 1000, currency: "USD" },
    ];
  } else if (shipmentId === 102) {
    return [
      { id: 4, product_id: "z777-z888", product_title: "USB-C Cable", quantity: 100, unit_cost: 2.5, total_cost: 250, paid: 0, currency: "USD" },
      { id: 5, product_id: "p999-q000", product_title: "Portable SSD 1TB", quantity: 10, unit_cost: 95.0, total_cost: 950, paid: 300, currency: "USD" },
    ];
  } else {
    return [];
  }
}

async function saveDetailMock(id, payload) {
  console.info("Mock save detail", id, payload);
  await MOCK_DELAY(200);
  // simple validation: unit_cost cannot be negative
  if (payload.unit_cost !== undefined && payload.unit_cost < 0) return { succes: false, error: "unit_cost negative" };
  return { succes: true, detail: { id, ...payload } };
}

async function bulkSaveMock(updates) {
  console.info("Mock bulk save", updates);
  await MOCK_DELAY(300);
  return { succes: true, updatedDetails: updates };
}

/* ===========================
   Component
   =========================== */

export default function ShipmentsModernInline({ supplierUuid = "supplier-1" }) {
  const [shipments, setShipments] = useState([]);
  const [loadingShipments, setLoadingShipments] = useState(true);
  const [error, setError] = useState(null);

  // which shipment is expanded: shipmentId or null
  const [expandedId, setExpandedId] = useState(null);

  // details cache: { [shipmentId]: detailsArray }
  const [detailsMap, setDetailsMap] = useState({});

  // per-detail dirty flags and saving state
  const [dirtyMap, setDirtyMap] = useState({}); // {detailId: true}
  const [savingRow, setSavingRow] = useState(null);
  const [savingBulk, setSavingBulk] = useState(null);

  // toast state
  const [toast, setToast] = useState(null); // {type: 'success'|'error', message}

  // keyboard focus ref for the expanded details panel
  const expandedPanelRef = useRef(null);

  useEffect(() => {
    loadShipments();
    // eslint-disable-next-line
  }, [supplierUuid]);

  async function loadShipments() {
    setLoadingShipments(true);
    setError(null);
    try {
      // replace fetchShipmentsMock with your API call
      const res = await fetchShipmentsMock(supplierUuid);
      setShipments(res);
    } catch (err) {
      console.error(err);
      setError("Failed to load shipments");
    } finally {
      setLoadingShipments(false);
    }
  }

  async function toggleExpand(shipmentId) {
    if (expandedId === shipmentId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(shipmentId);

    // focus panel after render
    setTimeout(() => {
      expandedPanelRef.current?.focus?.();
    }, 200);

    // load details if not cached
    if (!detailsMap[shipmentId]) {
      try {
        // show skeleton by setting empty array first (so UI shows loader)
        setDetailsMap((m) => ({ ...m, [shipmentId]: null }));
        const rows = await fetchDetailsMock(shipmentId); // replace with your API
        // normalize numeric fields
        const normalized = rows.map((r) => ({
          ...r,
          quantity: Number(r.quantity || 0),
          unit_cost: r.unit_cost === null ? null : Number(r.unit_cost || 0),
          total_cost: r.total_cost === null ? null : Number(r.total_cost || 0),
          paid: Number(r.paid || 0),
          raw: { ...r },
        }));
        setDetailsMap((m) => ({ ...m, [shipmentId]: normalized }));
        setDirtyMap((dm) => {
          // clear any stale dirty items for these ids
          const newDm = { ...dm };
          normalized.forEach((d) => delete newDm[d.id]);
          return newDm;
        });
      } catch (err) {
        console.error(err);
        setToast({ type: "error", message: "Failed to load details" });
      }
    }
  }

  // handle individual field change
  function handleDetailChange(shipmentId, detailId, field, value) {
    setDetailsMap((m) => {
      const arr = (m[shipmentId] || []).map((d) => (d.id === detailId ? { ...d, [field]: value } : d));
      return { ...m, [shipmentId]: arr };
    });
    setDirtyMap((dm) => ({ ...dm, [detailId]: true }));
  }

  // optimistic save for single row (saves relevant fields)
  async function saveRow(shipmentId, detail) {
    setSavingRow(detail.id);
    const prev = detailsMap[shipmentId].find((d) => d.id === detail.id);
    const payload = {
      quantity: Number(detail.quantity),
      unit_cost: detail.unit_cost === null ? undefined : Number(detail.unit_cost),
      paid: Number(detail.paid),
      total_cost: detail.total_cost === null ? undefined : Number(detail.total_cost),
    };

    // optimistic: apply result immediately in UI (already applied)
    try {
      const res = await saveDetailMock(detail.id, payload); // replace with updateShipmentDetail API
      if (!res || !res.succes) {
        // rollback
        setDetailsMap((m) => ({ ...m, [shipmentId]: m[shipmentId].map((d) => (d.id === detail.id ? prev : d)) }));
        setToast({ type: "error", message: res?.error || "Save failed" });
      } else {
        // merge server response if available
        if (res.detail) {
          setDetailsMap((m) => ({ ...m, [shipmentId]: m[shipmentId].map((d) => (d.id === detail.id ? { ...d, ...res.detail } : d)) }));
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
      setDetailsMap((m) => ({ ...m, [shipmentId]: m[shipmentId].map((d) => (d.id === detail.id ? prev : d)) }));
      setToast({ type: "error", message: "Server error" });
    } finally {
      setSavingRow(null);
    }
  }

  // bulk save all dirty rows for a shipment
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
      const res = await bulkSaveMock(updates); // replace with API bulkUpdateDetails
      if (res && res.succes) {
        // apply updated details if returned
        if (res.updatedDetails && Array.isArray(res.updatedDetails)) {
          setDetailsMap((m) => {
            const arr = (m[shipmentId] || []).map((d) => {
              const updated = res.updatedDetails.find((u) => u.id === d.id);
              return updated ? { ...d, ...updated, raw: { ...updated } } : d;
            });
            return { ...m, [shipmentId]: arr };
          });
        }
        // clear dirty flags for saved ids
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

  // undo changes on a single row: revert to raw
  function undoRow(shipmentId, detailId) {
    setDetailsMap((m) => {
      const arr = (m[shipmentId] || []).map((d) => (d.id === detailId ? { ...d.raw, raw: { ...d.raw } } : d));
      return { ...m, [shipmentId]: arr };
    });
    setDirtyMap((dm) => {
      const c = { ...dm };
      delete c[detailId];
      return c;
    });
    setToast({ type: "info", message: "Reverted" });
  }

  // small helper to compute displayed total when unit_cost changed
  function computeRowTotal(d) {
    if (d.total_cost !== null && d.total_cost !== undefined) return d.total_cost;
    if (d.quantity !== undefined && d.unit_cost !== null && d.unit_cost !== undefined) {
      return (Number(d.quantity) * Number(d.unit_cost)).toFixed(2);
    }
    return "-";
  }

  // keyboard: Enter on an input saves that row
  function handleKeyDown(e, shipmentId, d) {
    if (e.key === "Enter") {
      e.preventDefault();
      saveRow(shipmentId, d);
    }
  }

  // small presentational components inside file:
  const SkeletonRow = () => (
    <tr>
      <td colSpan={6}>
        <div className="p-3">
          <div className="placeholder-glow">
            <span className="placeholder col-6"></span>
            <span className="placeholder col-4 ms-3"></span>
            <div className="mt-2">
              <span className="placeholder col-12"></span>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="container-fluid py-2">
      <style>{`
        /* small style tweaks for modern look */
        .card-modern { border-radius: 12px; box-shadow: 0 6px 20px rgba(16,24,40,0.06); }
        .shipment-row { transition: background 160ms ease, transform 120ms ease; }
        .shipment-row:hover { background: rgba(13,110,253,0.03); transform: translateY(-1px); }
        .inline-panel { animation: slideDown 220ms ease both; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        .small-muted { font-size: .85rem; color: #6c757d; }
      `}</style>

      <div className="card card-modern border-0">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h5 className="mb-0">Shipments</h5>
              <div className="small-muted">Click any row to expand and edit its items inline</div>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary btn-sm" onClick={loadShipments} aria-label="Refresh shipments">
                <i className="bi bi-arrow-clockwise"></i> Refresh
              </button>
            </div>
          </div>

          {/* error */}
          {error && <div className="alert alert-danger py-2">{error}</div>}

          {/* shipments table */}
          <div className="table-responsive">
            <table className="table table-borderless align-middle mb-0">
              <thead>
                <tr className="text-muted small">
                  <th style={{ width: 70 }}>#</th>
                  <th>Date</th>
                  <th className="text-end">Total</th>
                  <th className="text-end">Paid</th>
                  <th>Currency</th>
                  <th style={{ width: 160 }}></th>
                </tr>
              </thead>
              <tbody>
                {loadingShipments ? (
                  <>
                    <tr><td colSpan={6}><div className="p-3"><div className="placeholder-glow"><span className="placeholder col-12"></span></div></div></td></tr>
                    <tr><td colSpan={6}><div className="p-3"><div className="placeholder-glow"><span className="placeholder col-12"></span></div></div></td></tr>
                  </>
                ) : shipments.length === 0 ? (
                  <tr><td colSpan={6} className="text-center text-muted py-4">No shipments</td></tr>
                ) : (
                  shipments.map((s) => (
                    <React.Fragment key={s.id}>
                      <tr className={`shipment-row ${expandedId === s.id ? "table-active" : ""}`} onClick={() => toggleExpand(s.id)} style={{ cursor: "pointer" }}>
                        <td><strong>{s.id}</strong></td>
                        <td>{s.date_received || "-"}</td>
                        <td className="text-end">{s.total_cost?.toFixed?.(2) ?? s.total_cost}</td>
                        <td className="text-end">{s.paid?.toFixed?.(2) ?? s.paid}</td>
                        <td>{s.currency}</td>
                        <td>
                          <div className="d-flex justify-content-end gap-2">
                            <span className="badge bg-light text-muted">{s.supplier_name}</span>
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={(e) => { e.stopPropagation(); toggleExpand(s.id); }}
                              aria-label={`Open shipment ${s.id} details`}
                              title="Open details"
                            >
                              <i className="bi bi-box-seam"></i>
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* inline panel */}
                      {expandedId === s.id && (
                        <tr className="inline-panel">
                          <td colSpan={6} className="p-0">
                            <div
                              ref={expandedPanelRef}
                              tabIndex={-1}
                              className="p-3 border-top bg-white"
                              aria-live="polite"
                              aria-label={`Details for shipment ${s.id}`}
                            >
                              {/* header actions */}
                              <div className="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                  <strong>Shipment #{s.id} items</strong>
                                  <div className="small-muted">Edit fields inline. Press Enter to save a row, or use Save All.</div>
                                </div>

                                <div className="d-flex gap-2">
                                  <button className="btn btn-sm btn-outline-secondary" onClick={(e) => { e.stopPropagation(); setDetailsMap((m)=>{ const c={...m}; delete c[s.id]; return c; }); toggleExpand(s.id); setTimeout(()=>toggleExpand(s.id),100); }}>
                                    <i className="bi bi-arrow-repeat"></i> Reload
                                  </button>

                                  <button
                                    className="btn btn-sm btn-primary"
                                    onClick={(e) => { e.stopPropagation(); saveAll(s.id); }}
                                    disabled={savingBulk === s.id || Object.keys(dirtyMap).filter((k)=> (detailsMap[s.id]||[]).some(d=>d.id===Number(k))).length===0}
                                  >
                                    {savingBulk === s.id ? (<><span className="spinner-border spinner-border-sm me-1" role="status"></span> Saving...</>) : (<><i className="bi bi-save2 me-1"></i> Save All</>)}
                                  </button>
                                </div>
                              </div>

                              {/* details content */}
                              <div className="table-responsive">
                                <table className="table table-sm align-middle mb-0">
                                  <thead>
                                    <tr className="text-muted small">
                                      <th style={{ width: 60 }}>#</th>
                                      <th>Product</th>
                                      <th style={{ width: 120 }}>Qty</th>
                                      <th style={{ width: 160 }}>Unit</th>
                                      <th style={{ width: 140 }}>Total</th>
                                      <th style={{ width: 140 }}>Paid</th>
                                      <th style={{ width: 160 }}></th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {/* loader */}
                                    {detailsMap[s.id] === null && <SkeletonRow />}

                                    {/* empty */}
                                    {Array.isArray(detailsMap[s.id]) && detailsMap[s.id].length === 0 && (
                                      <tr><td colSpan={7} className="text-center text-muted py-3">No items</td></tr>
                                    )}

                                    {/* rows */}
                                    {Array.isArray(detailsMap[s.id]) && detailsMap[s.id].map((d) => (
                                      <tr key={d.id} className={dirtyMap[d.id] ? "table-warning" : ""}>
                                        <td>{d.id}</td>
                                        <td style={{ minWidth: 220 }}>{d.product_title || d.product_id}</td>
                                        <td>
                                          <input
                                            type="number"
                                            className="form-control form-control-sm"
                                            value={d.quantity}
                                            aria-label={`Quantity for item ${d.id}`}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => handleDetailChange(s.id, d.id, "quantity", Number(e.target.value))}
                                            onKeyDown={(e) => handleKeyDown(e, s.id, d)}
                                          />
                                        </td>
                                        <td>
                                          <input
                                            type="number"
                                            step="0.01"
                                            className="form-control form-control-sm"
                                            value={d.unit_cost === null ? "" : d.unit_cost}
                                            aria-label={`Unit cost for item ${d.id}`}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => handleDetailChange(s.id, d.id, "unit_cost", e.target.value === "" ? null : Number(e.target.value))}
                                            onKeyDown={(e) => handleKeyDown(e, s.id, d)}
                                          />
                                        </td>
                                        <td className="text-end">{computeRowTotal(d)}</td>
                                        <td>
                                          <input
                                            type="number"
                                            step="0.01"
                                            className="form-control form-control-sm"
                                            value={d.paid ?? 0}
                                            aria-label={`Paid for item ${d.id}`}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => handleDetailChange(s.id, d.id, "paid", Number(e.target.value))}
                                            onKeyDown={(e) => handleKeyDown(e, s.id, d)}
                                          />
                                        </td>
                                        <td className="text-end">
                                          <div className="d-flex gap-2 justify-content-end">
                                            <button
                                              className="btn btn-sm btn-outline-success"
                                              onClick={(ev) => { ev.stopPropagation(); saveRow(s.id, d); }}
                                              disabled={savingRow === d.id}
                                              title="Save row (Enter)"
                                            >
                                              {savingRow === d.id ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-check-lg"></i>}
                                            </button>
                                            <button className="btn btn-sm btn-outline-secondary" onClick={(ev)=>{ ev.stopPropagation(); undoRow(s.id, d.id); }} title="Undo changes">
                                              <i className="bi bi-arrow-counterclockwise"></i>
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      {/* toast area */}
      <div style={{ position: "fixed", right: 16, bottom: 16, zIndex: 1060 }}>
        {toast && (
          <div className={`toast show align-items-center text-bg-${toast.type === "error" ? "danger" : toast.type === "success" ? "success" : "secondary"}`} role="alert" aria-live="assertive" aria-atomic="true">
            <div className="d-flex">
              <div className="toast-body">{toast.message}</div>
              <button type="button" className="btn-close btn-close-white me-2 m-auto" aria-label="Close" onClick={() => setToast(null)}></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
