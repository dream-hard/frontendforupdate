import React, { useEffect, useState } from "react";

/**
 * ShipmentsWithInlineDetailsMock.jsx
 *
 * Self-contained component that shows:
 * - Shipments table
 * - Inline details shown in a row under the clicked shipment
 * - Inline editing + Save / Save All (mocked)
 *
 * Replace the mock functions (fetchShipmentsMock, fetchDetailsMock, saveDetailMock, bulkSaveMock)
 * with your real API helpers (getShipmentsBySupplier, getDetailsByShipment, updateShipmentDetail, bulkUpdateDetails).
 */

const fetchShipmentsMock = async (supplierUuid) => {
  // simulate server delay
  await new Promise((r) => setTimeout(r, 150));
  return [
    { id: 101, supplier_id: supplierUuid, date_received: "2025-09-10", total_cost: 4963.75, paid: 1956.25, currency: "USD", supplier_name: "Mega Supplies" },
    { id: 102, supplier_id: supplierUuid, date_received: "2025-09-15", total_cost: 1200.0, paid: 300.0, currency: "USD", supplier_name: "Mega Supplies" },
  ];
};

const fetchDetailsMock = async (shipmentId) => {
  await new Promise((r) => setTimeout(r, 150));
  if (shipmentId === 101) {
    return [
      { id: 1, product_id: "a111-b222", product_title: 'Samsung 24" Monitor', quantity: 10, unit_cost: 150.75, total_cost: 1507.5, paid: 500, currency: "USD" },
      { id: 2, product_id: "c333-d444", product_title: "Logitech Wireless Mouse", quantity: 25, unit_cost: 18.25, total_cost: 456.25, paid: 456.25, currency: "USD" },
      { id: 3, product_id: "x555-y666", product_title: 'HP Laptop 15"', quantity: 5, unit_cost: 600.0, total_cost: 3000, paid: 1000, currency: "USD" },
    ];
  } else {
    return [
      { id: 4, product_id: "z777-z888", product_title: "USB-C Cable", quantity: 100, unit_cost: 2.5, total_cost: 250, paid: 0, currency: "USD" },
      { id: 5, product_id: "p999-q000", product_title: "Portable SSD 1TB", quantity: 10, unit_cost: 95.0, total_cost: 950, paid: 300, currency: "USD" },
    ];
  }
};

const saveDetailMock = async (id, payload) => {
  await new Promise((r) => setTimeout(r, 200));
  // simulate server returning updated detail
  return { succes: true, detail: { id, ...payload } };
};

const bulkSaveMock = async (updates) => {
  await new Promise((r) => setTimeout(r, 300));
  return { succes: true, updatedDetails: updates.map((u) => ({ ...u })) };
};

export default function ShipmentsWithInlineDetailsMock({ supplierUuid = "supplier-uuid-1" }) {
  const [shipments, setShipments] = useState([]);
  const [loadingShipments, setLoadingShipments] = useState(false);

  // track which shipment rows are expanded: { [shipmentId]: true }
  const [expanded, setExpanded] = useState({});

  // details cache per shipment: { [shipmentId]: [detail rows] }
  const [detailsMap, setDetailsMap] = useState({});

  // dirty flags per detail: { [detailId]: true }
  const [dirtyMap, setDirtyMap] = useState({});

  const [loadingDetailsFor, setLoadingDetailsFor] = useState(null);
  const [savingBulkFor, setSavingBulkFor] = useState(null);

  useEffect(() => {
    loadShipments();
    // eslint-disable-next-line
  }, [supplierUuid]);

  async function loadShipments() {
    setLoadingShipments(true);
    try {
      const data = await fetchShipmentsMock(supplierUuid);
      setShipments(data);
    } catch (err) {
    } finally {
      setLoadingShipments(false);
    }
  }

  async function toggleExpand(shipmentId) {
    // if already expanded -> collapse
    if (expanded[shipmentId]) {
      setExpanded((s) => {
        const c = { ...s };
        delete c[shipmentId];
        return c;
      });
      return;
    }

    // expand: load details if not present
    setExpanded((s) => ({ ...s, [shipmentId]: true }));
    if (!detailsMap[shipmentId]) {
      setLoadingDetailsFor(shipmentId);
      try {
        const rows = await fetchDetailsMock(shipmentId);
        // add 'raw' copy for undo and normalize numeric values
        const normalized = rows.map((r) => ({
          ...r,
          quantity: Number(r.quantity || 0),
          unit_cost: r.unit_cost === null ? null : Number(r.unit_cost || 0),
          total_cost: r.total_cost === null ? null : Number(r.total_cost || 0),
          paid: Number(r.paid || 0),
          raw: { ...r },
        }));
        setDetailsMap((m) => ({ ...m, [shipmentId]: normalized }));
      } catch (err) {
      } finally {
        setLoadingDetailsFor(null);
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

  async function saveDetail(shipmentId, detailId) {
    const detail = (detailsMap[shipmentId] || []).find((d) => d.id === detailId);
    if (!detail) return;
    // prepare payload (only changed fields or full object)
    const payload = {
      quantity: Number(detail.quantity),
      unit_cost: detail.unit_cost === null ? undefined : Number(detail.unit_cost),
      paid: Number(detail.paid),
      total_cost: detail.total_cost === null ? undefined : Number(detail.total_cost),
      currency: detail.currency || "USD",
    };
    try {
      const res = await saveDetailMock(detailId, payload);
      if (res && res.succes) {
        // merge server result if provided
        setDetailsMap((m) => {
          const arr = (m[shipmentId] || []).map((d) => (d.id === detailId ? { ...d, ...res.detail, raw: { ...res.detail } } : d));
          return { ...m, [shipmentId]: arr };
        });
        setDirtyMap((dm) => {
          const c = { ...dm };
          delete c[detailId];
          return c;
        });
      } else {
      }
    } catch (err) {
    }
  }

  async function saveAllDirty(shipmentId) {
    const rows = detailsMap[shipmentId] || [];
    const dirtyRows = rows.filter((r) => dirtyMap[r.id]);
    if (dirtyRows.length === 0) return;
    setSavingBulkFor(shipmentId);
    try {
      const updates = dirtyRows.map((d) => ({
        id: d.id,
        quantity: Number(d.quantity),
        unit_cost: d.unit_cost === null ? undefined : Number(d.unit_cost),
        paid: Number(d.paid),
        total_cost: d.total_cost === null ? undefined : Number(d.total_cost),
        currency: d.currency || "USD",
      }));
      const res = await bulkSaveMock(updates);
      if (res && res.succes) {
        // apply updatedDetails if server returned them
        if (res.updatedDetails && Array.isArray(res.updatedDetails)) {
          setDetailsMap((m) => {
            const arr = (m[shipmentId] || []).map((d) => {
              const updated = res.updatedDetails.find((u) => u.id === d.id);
              return updated ? { ...d, ...updated, raw: { ...updated } } : d;
            });
            return { ...m, [shipmentId]: arr };
          });
        }
        // clear dirty flags for these ids
        setDirtyMap((dm) => {
          const c = { ...dm };
          dirtyRows.forEach((r) => delete c[r.id]);
          return c;
        });
      }
    } catch (err) {
    } finally {
      setSavingBulkFor(null);
    }
  }

  function undoDetail(shipmentId, detailId) {
    const orig = (detailsMap[shipmentId] || []).find((d) => d.id === detailId)?.raw;
    if (!orig) return;
    setDetailsMap((m) => {
      const arr = (m[shipmentId] || []).map((d) => (d.id === detailId ? { ...orig, raw: { ...orig } } : d));
      return { ...m, [shipmentId]: arr };
    });
    setDirtyMap((dm) => {
      const c = { ...dm };
      delete c[detailId];
      return c;
    });
  }

  return (
    <div>
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="card-title">Shipments (inline details)</h5>

          {loadingShipments ? (
            <div className="py-3 text-center text-muted">Loading shipments...</div>
          ) : shipments.length === 0 ? (
            <div className="py-3 text-center text-muted">No shipments</div>
          ) : (
            <table className="table table-hover table-sm mb-0">
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
                {shipments.map((s) => (
                  <React.Fragment key={s.id}>
                    <tr style={{ cursor: "pointer" }} onClick={() => toggleExpand(s.id)} className={expanded[s.id] ? "table-active" : ""}>
                      <td>{s.id}</td>
                      <td>{s.date_received || "-"}</td>
                      <td>{s.total_cost}</td>
                      <td>{s.paid}</td>
                      <td>{s.currency}</td>
                      <td>{s.supplier_name || s.supplier_id}</td>
                    </tr>

                    {/* Inline detail row: render only when expanded */}
                    {expanded[s.id] && (
                      <tr>
                        <td colSpan={6} className="p-0">
                          <div className="p-3 border-top bg-white">
                            {loadingDetailsFor === s.id ? (
                              <div className="text-center text-muted py-3">Loading details...</div>
                            ) : (
                              <>
                                <div className="mb-2 d-flex justify-content-between align-items-center">
                                  <div>
                                    <strong>Shipment #{s.id} items</strong>
                                    <div className="small text-muted">Click Save to persist changes</div>
                                  </div>
                                  <div>
                                    <button
                                      className="btn btn-sm btn-outline-secondary me-2"
                                      onClick={() => {
                                        // refresh details for this shipment
                                        setDetailsMap((m) => {
                                          const copy = { ...m };
                                          delete copy[s.id];
                                          return copy;
                                        });
                                        toggleExpand(s.id); // collapse then expand will reload, but simpler: just call toggle to reload
                                        setTimeout(() => toggleExpand(s.id), 50);
                                      }}
                                    >
                                      Refresh
                                    </button>
                                    <button
                                      className="btn btn-sm btn-primary"
                                      disabled={Object.keys(dirtyMap).filter((id) => (detailsMap[s.id] || []).some((d) => d.id === Number(id))).length === 0 || savingBulkFor === s.id}
                                      onClick={() => saveAllDirty(s.id)}
                                    >
                                      {savingBulkFor === s.id ? "Saving..." : "Save All"}
                                    </button>
                                  </div>
                                </div>

                                <div className="table-responsive">
                                  <table className="table table-sm mb-0">
                                    <thead>
                                      <tr>
                                        <th style={{ width: 60 }}>#</th>
                                        <th>Product</th>
                                        <th style={{ width: 110 }}>Qty</th>
                                        <th style={{ width: 140 }}>Unit</th>
                                        <th style={{ width: 140 }}>Total</th>
                                        <th style={{ width: 120 }}>Paid</th>
                                        <th style={{ width: 160 }} className="text-end">Actions</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {(detailsMap[s.id] || []).map((d) => (
                                        <tr key={d.id} className={dirtyMap[d.id] ? "table-warning" : ""}>
                                          <td>{d.id}</td>
                                          <td style={{ minWidth: 180 }}>{d.product_title || d.product_id}</td>
                                          <td>
                                            <input
                                              className="form-control form-control-sm"
                                              type="number"
                                              value={d.quantity}
                                              onChange={(e) => handleDetailChange(s.id, d.id, "quantity", Number(e.target.value))}
                                            />
                                          </td>
                                          <td>
                                            <input
                                              className="form-control form-control-sm"
                                              type="number"
                                              step="0.01"
                                              value={d.unit_cost === null ? "" : d.unit_cost}
                                              onChange={(e) =>
                                                handleDetailChange(s.id, d.id, "unit_cost", e.target.value === "" ? null : Number(e.target.value))
                                              }
                                            />
                                          </td>
                                          <td>{d.total_cost ?? (d.quantity && d.unit_cost ? (Number(d.quantity) * Number(d.unit_cost)).toFixed(2) : "-")}</td>
                                          <td>
                                            <input
                                              className="form-control form-control-sm"
                                              type="number"
                                              step="0.01"
                                              value={d.paid ?? 0}
                                              onChange={(e) => handleDetailChange(s.id, d.id, "paid", Number(e.target.value))}
                                            />
                                          </td>
                                          <td className="text-end">
                                            <div className="d-flex gap-2 justify-content-end">
                                              <button className="btn btn-sm btn-success" onClick={() => saveDetail(s.id, d.id)}>
                                                Save
                                              </button>
                                              <button
                                                className="btn btn-sm btn-outline-secondary"
                                                onClick={() => {
                                                  undoDetail(s.id, d.id);
                                                }}
                                              >
                                                Undo
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
