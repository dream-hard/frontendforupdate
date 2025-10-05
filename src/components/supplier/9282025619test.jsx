import React, { useEffect, useState, useRef } from "react";
import axios from "../../api/fetch";
import useNotification from "../../Hooks/useNotification";

/*
  ShipmentsWithDetailsSection
  - Inline editable, Bootstrap (CDN) based React component for viewing & editing supplier shipment details.
  - Usage: import and render <ShipmentsWithDetailsSection shipment={...} /> or pass shipmentId prop.

  IMPORTANT:
  - Make sure you include these in your public/index.html (or equivalent):
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">

  - This file expects axios to be configured at ../../api/fetch (same as your code) and a useNotification hook that returns { showNotification }.
  - I fixed small issues from the original snippet (missing awaits, mismatched variable names, improved UX).
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
  "quantity-desc": "الكمية - تنازلي",
  "currency-asc": "العملة - تصاعدي",
  "currency-desc": "العملة - تنازلي",
  "id-asc": "المعرّف - تصاعدي",
  "id-desc": "المعرّف - تنازلي",
  "unit_cost-asc": "تكلفة الوحدة - تصاعدي",
  "unit_cost-desc": "تكلفة الوحدة - تنازلي",
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

export default function ShipmentsWithDetailsSection({
  shipment,
  shipmentId = null,
  onClose,
  onUpdated,
  onDelete,
}) {
  const { showNotification } = useNotification();

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [limit, setLimit] = useState(100);
  const [orderBy, setOrderBy] = useState("createdAt-desc");
  const [detailsLoading, setDetailsLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);

  const [selectedShipment, setSelectedShipment] = useState(null);
  const [shipmentLoading, setShipmentLoading] = useState(true);

  const [detailsMap, setDetailsMap] = useState([]); // array of existing details
  const [dirtyMap, setDirtyMap] = useState([]); // edits for existing items
  const [newdetails, setNewdetails] = useState([]); // newly created items

  const detailsRef = useRef(null);

  const today = new Date().toISOString().split("T")[0];

  // ---------- Helpers for editing existing items ----------
  const addToUpdate = (item) => {
    // avoid duplicates
    setDirtyMap((prev) => {
      if (prev.find((d) => d.id === item.id)) return prev;
      return [...prev, { ...item }];
    });
  };

  const updateUpdate = (id, field, value) => {
    setDirtyMap((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        if (field === "paid") {
          const newPaid = Number(value || 0);
          const totalCost = Number(item.total_cost || 0);
          if (newPaid > totalCost) {
            showNotification("error", "❌ Paid amount cannot be greater than total cost!");
            return item;
          }
        }
        if (field === "total_cost") {
          const newTotalcost = Number(value || 0);
          const paid = Number(item.paid || 0);
          if (newTotalcost < paid) {
            showNotification("error", "❌ Total cost cannot be less than paid amount!");
            return item;
          }
        }

        return { ...item, [field]: value };
      })
    );
  };

  const removeFromUpdate = (id) => {
    setDirtyMap((prev) => prev.filter((item) => item.id !== id));
  };

  // Save all dirty (bulk)
  const saveAll = async () => {
    try {
      setUpdateLoading(true);
      if (dirtyMap.length === 0) {
        showNotification("info", "ℹ️ No changes to save");
        return;
      }
      const res = await axios.post("/supplier_shipment_detail/bulk_update", { updates: dirtyMap });
      showNotification("success", `✅ تم حفظ ${res.data.updatedCount || res.data.updatedDetails?.length || dirtyMap.length} عنصر(عناصر)`);

      // merge returned updates into detailsMap
      if (res.data.updatedDetails && Array.isArray(res.data.updatedDetails)) {
        setDetailsMap((prev) => prev.map((d) => (res.data.updatedDetails.find((u) => u.id === d.id) ? { ...d, ...res.data.updatedDetails.find((u) => u.id === d.id) } : d)));
      }

      setDirtyMap([]);
    } catch (error) {
      showNotification("error", (error?.response?.data?.message) || error.message || "فشل حفظ التغييرات ❌");
    } finally {
      setUpdateLoading(false);
    }
  };

  const saveOne = async (id) => {
    setUpdateLoading(true);
    try {
      const item = dirtyMap.find((d) => d.id === id);
      if (!item) {
        showNotification("info", "لا توجد تغييرات للحفظ ℹ️");
        return;
      }
      const res = await axios.post("/supplier_shipment_detail/update", item);
      showNotification("success", "✅ تم حفظ العنصر");
      if (res.data?.detail) {
        setDetailsMap((prev) => prev.map((d) => (d.id === id ? { ...d, ...res.data.detail } : d)));
      }
      setDirtyMap((prev) => prev.filter((d) => d.id !== id));
    } catch (error) {
      showNotification("error", (error?.response?.data?.message) || error.message || "فشل حفظ التغييرات ❌");
    } finally {
      setUpdateLoading(false);
    }
  };

  const deleteOne = async (id) => {
    if (!window.confirm("هل أنت متأكد أنك تريد حذف هذا العنصر؟")) return;
    setUpdateLoading(true);
    try {
      await axios.post("/supplier_shipment_detail/delete/delete", { id });
      showNotification("success", "✅ تم حذف العنصر");
      setDirtyMap((prev) => prev.filter((d) => d.id !== id));
      // refresh details
      await fetchShipmentDetails();
      onDelete && onDelete(id);
    } catch (error) {
      showNotification("error", (error?.response?.data?.message) || error.message || "فشل حذف العنصر ❌");
    } finally {
      setUpdateLoading(false);
    }
  };

  // ---------- New items handlers ----------
  const addDirtyItem = () => {
    if (!selectedShipment) {
      showNotification("error", "لا توجد شحنة محددة لإنشاء العناصر");
      return;
    }
    setNewdetails((prev) => [
      ...prev,
      {
        ...initialFormState,
        supplier_id: selectedShipment.supplier_id || "",
        supplier_shipment_id: selectedShipment.id || selectedShipment.uuid || "",
        id: `new-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        date_received: today,
      },
    ]);
  };

  const updateDirtyItem = (id, field, value) => {
    setNewdetails((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        if (field === "paid") {
          const newPaid = Number(value || 0);
          const totalCost = Number(item.total_cost || 0);
          if (newPaid > totalCost) {
            showNotification("error", "❌ Paid amount cannot be greater than total cost!");
            return item;
          }
        }
        if (field === "total_cost") {
          const newTotalcost = Number(value || 0);
          const paid = Number(item.paid || 0);
          if (newTotalcost < paid) {
            showNotification("error", "❌ Total cost cannot be less than paid amount!");
            return item;
          }
        }

        return { ...item, [field]: value };
      })
    );
  };

  const deleteDirtyItem = (id) => {
    setNewdetails((prev) => prev.filter((item) => item.id !== id));
  };

  const createDirtyItem = async () => {
    if (newdetails.length === 0) {
      showNotification("info", "لا توجد عناصر جديدة للإنشاء");
      return;
    }
    setDetailsLoading(true);
    try {
      const payload = newdetails.map((d) => {
        const clone = { ...d };
        // strip temporary id if needed
        if (typeof clone.id === "string" && clone.id.startsWith("new-")) delete clone.id;
        return clone;
      });
      const res = await axios.post("/supplier_shipment_detail/create", { details: payload });
      showNotification("success", "✅ تم إنشاء العناصر");
      setNewdetails([]);
      setPage(1);
      setOrderBy("createdAt-desc");
      await fetchShipmentDetails();
    } catch (error) {
      showNotification("error", (error?.response?.data?.message) || error.message || "فشل إنشاء العناصر ❌");
    } finally {
      setDetailsLoading(false);
    }
  };

  // ---------- Fetching ----------
  async function fetchShipment() {
    if (!selectedShipment?.uuid && !shipmentId) return;
    setShipmentLoading(true);
    try {
      const res = await axios.post("/supplier_shipment/getById", { id: selectedShipment.uuid || shipmentId });
      const sh = res.data?.shipment || res.data;
      setSelectedShipment(sh || null);
      setPage(1);
      setTotalPages(0);
      setOrderBy("createdAt-desc");
      await fetchShipmentDetails(sh?.uuid || sh?.id || shipmentId);
    } catch (error) {
      showNotification("error", "❌ Failed to load shipment");
    } finally {
      setShipmentLoading(false);
    }
  }

  async function fetchShipmentDetails(overrideShipmentId) {
    if (!selectedShipment && !overrideShipmentId) return;
    setDetailsLoading(true);
    try {
      const res = await axios.post("/supplier_shipment_detail/getByShipmentId", {
        page,
        limit,
        orderBy,
        shipment_id: overrideShipmentId || selectedShipment.uuid || selectedShipment.id,
      });

      const data = res.data || {};
      setDetailsMap(data.details || data || []);
      setPage(data.page || page);
      setTotalPages(data.totalPages || 0);
      setDirtyMap([]);
      setNewdetails([]);
    } catch (error) {
      showNotification("error", "❌ Failed to load shipment details");
    } finally {
      setDetailsLoading(false);
    }
  }

  // ---------- small helpers ----------
  function displayNumber(n) {
    if (n === null || n === undefined) return "-";
    return Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function computeRowTotal(d) {
    if (d.total_cost !== null && d.total_cost !== undefined && d.total_cost !== "") return displayNumber(d.total_cost);
    if (d.quantity !== undefined && d.unit_cost !== null && d.unit_cost !== undefined) return displayNumber(Number(d.quantity) * Number(d.unit_cost));
    return "-";
  }

  // ---------- lifecycle ----------
  useEffect(() => {
    if (shipment) {
      setSelectedShipment(shipment);
      setShipmentLoading(false);
      setPage(1);
      setTotalPages(0);
      setOrderBy("createdAt-desc");
      fetchShipmentDetails();
    } else if (shipmentId) {
      setSelectedShipment({ uuid: shipmentId });
      fetchShipment();
    } else if (!shipment && !shipmentId) {
      setSelectedShipment(null);
      setDetailsMap([]);
      setDirtyMap([]);
      setNewdetails([]);
      setShipmentLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shipment, shipmentId]);

  useEffect(() => {
    if (selectedShipment) {
      fetchShipmentDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, orderBy, selectedShipment]);

  // ---------- render ----------
  return (
    <div ref={detailsRef} className="card shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h5 className="card-title mb-1">تفاصيل شحنة المورد</h5>
            <small className="text-muted">عرض وتحرير عناصر الشحنة بشكل مباشر</small>
          </div>

          <div className="d-flex gap-2 align-items-center">
            <select className="form-select form-select-sm" value={orderBy} onChange={(e) => setOrderBy(e.target.value)}>
              {Object.entries(orderLabelsArabic).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            <button className="btn btn-outline-primary btn-sm" onClick={() => fetchShipmentDetails()} title="Reload">
              <i className="bi bi-arrow-clockwise me-1" /> تحديث
            </button>
            <button className="btn btn-light btn-sm" onClick={() => onClose && onClose()}>
              إغلاق
            </button>
          </div>
        </div>

        {/* shipment header */}
        <div className="mb-3">
          <div className="row g-2">
            <div className="col-md-4 col-6">
              <div className="border rounded p-2">
                <div className="small text-muted">Supplier ID</div>
                <div>{selectedShipment?.supplier_id || "-"}</div>
              </div>
            </div>
            <div className="col-md-4 col-6">
              <div className="border rounded p-2">
                <div className="small text-muted">Shipment UUID/ID</div>
                <div>{selectedShipment?.uuid || selectedShipment?.id || "-"}</div>
              </div>
            </div>
            <div className="col-md-4 col-6">
              <div className="border rounded p-2">
                <div className="small text-muted">تاريخ الاستلام</div>
                <div>{selectedShipment?.date_received || "-"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* details table */}
        <div className="table-responsive">
          {detailsLoading ? (
            <div className="p-3">{/* simple skeleton */}
              <div className="placeholder-glow mb-2">
                <span className="placeholder col-6"></span>
              </div>
              <div className="placeholder-glow">
                <span className="placeholder col-12 placeholder-lg"></span>
              </div>
            </div>
          ) : (
            <table className="table table-sm align-middle">
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
                {detailsMap && detailsMap.length > 0 ? (
                  detailsMap.map((d, idx) => {
                    const isDirty = dirtyMap.find((x) => x.id === d.id);
                    return (
                      <tr key={d.id || idx} className={isDirty ? "table-warning" : ""}>
                        <td>{d.id}</td>
                        <td>{d.product_id || "-"}</td>
                        <td>
                          <input
                            className="form-control form-control-sm"
                            value={isDirty ? isDirty.quantity : d.quantity || ""}
                            onChange={(e) => {
                              // if not already dirty, push a copy
                              if (!isDirty) addToUpdate({ ...d });
                              updateUpdate(d.id, "quantity", e.target.value);
                            }}
                            type="number"
                            min={0}
                          />
                        </td>
                        <td>
                          <input
                            className="form-control form-control-sm"
                            value={isDirty ? isDirty.unit_cost : d.unit_cost || ""}
                            onChange={(e) => {
                              if (!isDirty) addToUpdate({ ...d });
                              updateUpdate(d.id, "unit_cost", e.target.value);
                            }}
                            type="number"
                            step="0.01"
                            min={0}
                          />
                        </td>
                        <td>
                          <input
                            className="form-control form-control-sm"
                            value={isDirty ? isDirty.total_cost : d.total_cost || ""}
                            onChange={(e) => {
                              if (!isDirty) addToUpdate({ ...d });
                              updateUpdate(d.id, "total_cost", e.target.value);
                            }}
                            type="number"
                            step="0.01"
                            min={0}
                          />
                        </td>
                        <td>
                          <input
                            className="form-control form-control-sm"
                            value={isDirty ? isDirty.paid : d.paid || ""}
                            onChange={(e) => {
                              if (!isDirty) addToUpdate({ ...d });
                              updateUpdate(d.id, "paid", e.target.value);
                            }}
                            type="number"
                            step="0.01"
                            min={0}
                          />
                        </td>
                        <td>
                          <input
                            className="form-control form-control-sm"
                            value={isDirty ? isDirty.currency : d.currency || ""}
                            onChange={(e) => {
                              if (!isDirty) addToUpdate({ ...d });
                              updateUpdate(d.id, "currency", e.target.value);
                            }}
                          />
                        </td>
                        <td>
                          <input
                            className="form-control form-control-sm"
                            value={isDirty ? isDirty.date_received : d.date_received || ""}
                            onChange={(e) => {
                              if (!isDirty) addToUpdate({ ...d });
                              updateUpdate(d.id, "date_received", e.target.value);
                            }}
                            type="date"
                          />
                        </td>
                        <td className="text-end">
                          <div className="btn-group btn-group-sm" role="group">
                            <button
                              className="btn btn-outline-success"
                              onClick={() => saveOne(d.id)}
                              disabled={!isDirty || updateLoading}
                              title="حفظ"
                            >
                              <i className="bi bi-save" />
                            </button>
                            <button
                              className={`btn ${isDirty ? "btn-warning" : "btn-outline-secondary"}`}
                              onClick={() => (isDirty ? removeFromUpdate(d.id) : addToUpdate({ ...d }))}
                              title={isDirty ? "إلغاء التعديلات" : "تعديل"}
                            >
                              <i className={isDirty ? "bi bi-x" : "bi bi-pencil"} />
                            </button>
                            <button className="btn btn-outline-danger" onClick={() => deleteOne(d.id)} title="حذف">
                              <i className="bi bi-trash" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="text-center text-muted py-4">
                      لا توجد عناصر لعرضها
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* bulk actions */}
        <div className="d-flex justify-content-between align-items-center mt-2">
          <div>
            <button className="btn btn-primary btn-sm me-2" onClick={saveAll} disabled={dirtyMap.length === 0 || updateLoading}>
              حفظ كل التغييرات
            </button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => { setDirtyMap([]); showNotification("info", "تم إلغاء جميع التعديلات"); }}>
              إلغاء التعديلات
            </button>
          </div>

          <div className="d-flex gap-2 align-items-center">
            <div className="small text-muted">صفحة</div>
            <input type="number" className="form-control form-control-sm" style={{ width: 80 }} value={page} onChange={(e) => setPage(Number(e.target.value || 1))} />
            <div className="small text-muted">/ {totalPages || 1}</div>
          </div>
        </div>

        <hr />

        {/* New items editor */}
        <div>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0">إضافة عناصر جديدة</h6>
            <div className="btn-group">
              <button className="btn btn-sm btn-outline-success" onClick={addDirtyItem} title="Add row">
                <i className="bi bi-plus-lg me-1" /> إضافة سطر
              </button>
              <button className="btn btn-sm btn-primary" onClick={createDirtyItem} disabled={newdetails.length === 0 || detailsLoading}>
                إنشاء العناصر
              </button>
            </div>
          </div>

          {newdetails.length === 0 ? (
            <div className="text-muted">اضغط "إضافة سطر" لبدء إضافة عناصر جديدة</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm align-middle">
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
                  {newdetails.map((d, i) => (
                    <tr key={d.id || i}>
                      <td>{i + 1}</td>
                      <td>
                        <input className="form-control form-control-sm" value={d.product_id || ""} onChange={(e) => updateDirtyItem(d.id, "product_id", e.target.value)} />
                      </td>
                      <td>
                        <input className="form-control form-control-sm" value={d.quantity || ""} onChange={(e) => updateDirtyItem(d.id, "quantity", e.target.value)} type="number" min={0} />
                      </td>
                      <td>
                        <input className="form-control form-control-sm" value={d.unit_cost || ""} onChange={(e) => updateDirtyItem(d.id, "unit_cost", e.target.value)} type="number" step="0.01" />
                      </td>
                      <td>
                        <input className="form-control form-control-sm" value={d.total_cost || ""} onChange={(e) => updateDirtyItem(d.id, "total_cost", e.target.value)} type="number" step="0.01" />
                      </td>
                      <td>
                        <input className="form-control form-control-sm" value={d.paid || ""} onChange={(e) => updateDirtyItem(d.id, "paid", e.target.value)} type="number" step="0.01" />
                      </td>
                      <td>
                        <input className="form-control form-control-sm" value={d.currency || ""} onChange={(e) => updateDirtyItem(d.id, "currency", e.target.value)} />
                      </td>
                      <td>
                        <input className="form-control form-control-sm" value={d.date_received || today} onChange={(e) => updateDirtyItem(d.id, "date_received", e.target.value)} type="date" />
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button className="btn btn-outline-danger" onClick={() => deleteDirtyItem(d.id)}>
                            <i className="bi bi-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* footer */}
        <div className="mt-3 d-flex justify-content-end gap-2">
          <button className="btn btn-outline-secondary" onClick={() => { setDirtyMap([]); setNewdetails([]); }}>
            مسح ما تم تحريره محلياً
          </button>
          <button className="btn btn-secondary" onClick={() => { onUpdated && onUpdated(); }}>
            تحديث خارجي
          </button>
        </div>
      </div>
    </div>
  );
}
