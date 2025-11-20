// AdminOrdersFilter2.jsx
import React, { useEffect, useRef, useState } from "react";
import axios from "../../api/fetch";
import { Link } from "react-router-dom";
import InvoiceLayout from "../main/InvoiceLayout/InvoiceLayout";
import html2pdf  from "html2pdf.js";


/* ------------------ amount helpers (same as before) ------------------ */
const currencySymbols = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  SYP: "SYP",
};

function parseAmountField(field, preferCurrency = null) {
  if (field === null || field === undefined) return { amount: 0, currency: null };

  if (typeof field === "string") {
    const trimmed = field.trim();
    if ((trimmed.startsWith("[") && trimmed.endsWith("]")) || (trimmed.startsWith("{") && trimmed.endsWith("}"))) {
      try {
        field = JSON.parse(trimmed);
      } catch (e) {}
    }
  }

  if (Array.isArray(field) && field.length > 0) {
    if (preferCurrency) {
      const found = field.find(f => String(f.currency).toUpperCase() === String(preferCurrency).toUpperCase());
      if (found) return { amount: Number(found.amount || 0), currency: String(found.currency || "").toUpperCase() };
    }
    const first = field[0];
    if (first && typeof first === "object" && ("amount" in first)) {
      return { amount: Number(first.amount || 0), currency: String(first.currency || "").toUpperCase() || null };
    }
    const n = Number(first);
    if (!Number.isNaN(n)) return { amount: n, currency: null };
    return { amount: 0, currency: null };
  }

  if (typeof field === "object" && field !== null && ("amount" in field)) {
    return { amount: Number(field.amount || 0), currency: String(field.currency || "").toUpperCase() || null };
  }

  const n = Number(field);
  if (!Number.isNaN(n)) return { amount: n, currency: null };

  return { amount: 0, currency: null };
}

function fmtAmount(amount, currencyCode = null, locale = "en-GB") {
  const num = Number(amount || 0);

  try {
    if (currencyCode && typeof currencyCode === "string" && currencyCode.length === 3 && Intl && Intl.NumberFormat) {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currencyCode,
        maximumFractionDigits: 2,
      }).format(num);
    }
  } catch (e) {}

  const symbolOrCode = currencySymbols[currencyCode] || currencyCode || "";
  const formatted = Number(num).toLocaleString(locale, { maximumFractionDigits: 2 });
  return symbolOrCode ? `${symbolOrCode} ${formatted}` : formatted;
}

/* ------------------ simple UI helpers ------------------ */
const OrderPlaceholder = ({ i }) => (
  <div className="list-group-item py-3 placeholder-glow" key={i}>
    <div className="d-flex justify-content-between">
      <div className="placeholder col-3"></div>
      <div className="placeholder col-2"></div>
    </div>
    <div className="mt-2 d-flex justify-content-between">
      <div className="placeholder col-5"></div>
      <div className="placeholder col-1"></div>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    pending: "badge bg-warning text-dark",
    placed: "badge bg-info text-dark",
    paid: "badge bg-success",
    cancelled: "badge bg-danger",
    shipped: "badge bg-primary",
    processing: "badge bg-secondary text-dark",
    returned: "badge bg-dark",
    refunded: "badge bg-light text-dark",
    completed: "badge bg-success",
  };
  return <span className={map[status] || "badge bg-secondary"}>{status}</span>;
};

/* ------------------ helpers to fetch statuses ------------------ */
async function fetchStatusesFromPossibleEndpoints() {
  const endpoints = [
    "/order/statuses",
    "/order/getStatuses",
    "/order/order_statuses",
    "/order/order_statu",
    "/order/getOrderStatuses"
  ];
  for (const ep of endpoints) {
    try {
      const res = await axios.get(ep);
      // accept either array or { statuses: [...] }
      if (Array.isArray(res.data)) return res.data;
      if (Array.isArray(res.data.statuses)) return res.data.statuses;
      if (Array.isArray(res.data.data)) return res.data.data;
    } catch (e) {
      // try next
    }
  }
  return []; // fallback empty
}

/* ------------------ ChangeStatusModal ------------------ */
const ChangeStatusModal = ({ show, order, onClose, onSaved }) => {
  const [statuses, setStatuses] = useState([]);
  const [loadingStatuses, setLoadingStatuses] = useState(false);
  const [selectedStatusId, setSelectedStatusId] = useState("");
  const [submitting, setSubmitting] = useState(false);

    const fetchStatus=async()=>{
    try {
      const res=await axios.get("/orderstatus/getall");
      setStatuses(res.data);

    } catch (error) {
      setStatuses([]);
    }
  }
  useEffect(()=>{fetchStatus();},[])
  // extra fields (used for certain statuses)
  const [shipping_date, setShippingDate] = useState("");
  const [dlivered_date, setDeliveredDate] = useState("");
  const [shipping_address, setShippingAddress] = useState("");
  const [shipping_address_id, setShippingAddressId] = useState("");
  const [note, setNote] = useState("");
  const [edited_products_json, setEditedProductsJson] = useState("[]"); // JSON text
  const [added_products_json, setAddedProductsJson] = useState("[]"); // JSON text
  const [new_total_currency, setNewTotalCurrency] = useState("");
  const [costing, setCosting] = useState(0);
  const [costing_currency, setCostingCurrency] = useState("SYP");
  const [recount, setRecount] = useState(false);
  const [withdelete, setWithDelete] = useState(false);


  useEffect(() => {
    if (!show) return;
    let mounted = true;
    (async () => {
      setLoadingStatuses(true);
      const list = await fetchStatus();
      if (!mounted) return;
      // default selection: try to set to current order status id if present
      const currentId = order?.Order_statu?.id || order?.status_id || order?.status || "";
      setSelectedStatusId(currentId ?? "");
      setLoadingStatuses(false);
    })();
    return () => { mounted = false; };
  }, [show, order]);

  if (!show) return null;

  const chosenStatusObj = statuses.find(s => String(s.id) === String(selectedStatusId));
  const chosenStatusName = chosenStatusObj?.statu?.toLowerCase?.() || "";

  const submit = async () => {
    // build body according to controller expectations
    if (!selectedStatusId) return ;
    setSubmitting(true);

    let body = {
      orderId: order.id ?? order.uuid ?? order.uuid,
      status_id: Number(selectedStatusId),
    };

    // common optional fields
    if (note) body.note = note;
    if (shipping_address) body.shipping_address = shipping_address;
    if (shipping_address_id) body.shipping_address_id = shipping_address_id;

    // add fields for certain statuses
    if (chosenStatusName.includes("processing")) {
      if (shipping_date) body.shipping_date = shipping_date;
      // edited_products and added_products must be arrays (controller expects objects describing products)
      try {
        const edited = JSON.parse(edited_products_json || "[]");
        const added = JSON.parse(added_products_json || "[]");
        body.edited_products = edited;
        body.added_products = added;
      } catch (e) {
        setSubmitting(false);
        return alert("Edited/Added products JSON is invalid. Use valid JSON arrays.");
      }
      if (new_total_currency) body.new_total_currency = new_total_currency;
    } else if (chosenStatusName.includes("shipped")) {
      if (dlivered_date) body.dlivered_date = dlivered_date;
    } else if (chosenStatusName.includes("returned")) {
      body.costing = Number(costing || 0);
      body.costing_currency = costing_currency || "SYP";
    } else if (chosenStatusName.includes("refunded")) {
      body.recount = !!recount;
      body.costing = Number(costing || 0);
      body.costing_currency = costing_currency || "SYP";
    } else if (chosenStatusName.includes("cancelled")) {
      body.withdelete = !!withdelete;
    }

    try {
      const res = await axios.post("/order/update/updateOrderStatus", body);
      if (res.data?.success) {
        // try to get returned order from response
        const updated = res.data.order || res.data.data || null;
        onSaved && onSaved(updated);
        onClose && onClose();
      } else {

        // show message if present
        alert(res.data?.msg || "Status update completed.");
        onSaved && onSaved(null);
        onClose && onClose();
      }
    } catch (err) {

    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="modal-backdrop fade show"></div>
      <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
        <div className="modal-dialog modal-lg modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Change Status — Order #{order.order_number || order.uuid || order.id}</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
            </div>

            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Status</label>
                <select className="form-select" value={selectedStatusId} onChange={e => setSelectedStatusId(e.target.value)}>
                  <option value="">-- select status --</option>
                  {loadingStatuses ? (
                    <option>Loading statuses...</option>
                  ) : statuses.length > 0 ? (
                    statuses.map(s => <option key={s.id} value={s.id}>{s.statu} ({s.id})</option>)
                  ) : (
                    <>
                      {/* fallback names if API not available — but these have no ids, you still need a numeric id on backend */}

                    </>
                  )}
                </select>
                <div className="form-text">Status list loaded from server (id required).</div>
              </div>

              {/* NOTE: show optional fields depending on selected status */}
              {chosenStatusName.includes("processing") && (
                <>
                  <div className="mb-3">
                    <label className="form-label">Shipping date</label>
                    <input type="date" className="form-control" value={shipping_date} onChange={e=>setShippingDate(e.target.value)} />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Shipping address (text)</label>
                    <input type="text" className="form-control" value={shipping_address} onChange={e=>setShippingAddress(e.target.value)} />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Shipping address ID (if available)</label>
                    <input type="text" className="form-control" value={shipping_address_id} onChange={e=>setShippingAddressId(e.target.value)} />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Note (optional)</label>
                    <textarea className="form-control" rows={2} value={note} onChange={e=>setNote(e.target.value)} />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Edited products (JSON array)</label>
                    <textarea className="form-control" rows={3} value={edited_products_json} onChange={e=>setEditedProductsJson(e.target.value)} />
                    <div className="form-text">Example: [{"{id:1, number:3, softdelete:false}"}] — see your controller expected structure.</div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Added products (JSON array)</label>
                    <textarea className="form-control" rows={3} value={added_products_json} onChange={e=>setAddedProductsJson(e.target.value)} />
                    <div className="form-text">Example: [{"{product_id:5, quantity:2, cost_per_one:1000, currency:'SYP'}"}]</div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">New total currency (optional)</label>
                    <input type="text" className="form-control" value={new_total_currency} onChange={e=>setNewTotalCurrency(e.target.value)} />
                  </div>
                </>
              )}

              {chosenStatusName.includes("shipped") && (
                <div className="mb-3">
                  <label className="form-label">Delivered date</label>
                  <input type="date" className="form-control" value={dlivered_date} onChange={e=>setDeliveredDate(e.target.value)} />
                </div>
              )}

              {chosenStatusName.includes("returned") && (
                <>
                  <div className="mb-3">
                    <label className="form-label">Return costing</label>
                    <input type="number" className="form-control" value={costing} onChange={e=>setCosting(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Costing currency</label>
                    <input type="text" className="form-control" value={costing_currency} onChange={e=>setCostingCurrency(e.target.value)} />
                  </div>
                </>
              )}

              {chosenStatusName.includes("refunded") && (
                <>
                  <div className="mb-3 form-check">
                    <input className="form-check-input" type="checkbox" checked={recount} onChange={e=>setRecount(e.target.checked)} id="recountCheck" />
                    <label className="form-check-label" htmlFor="recountCheck">Recount stock (add back to shipments)</label>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Refund costing</label>
                    <input type="number" className="form-control" value={costing} onChange={e=>setCosting(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Costing currency</label>
                    <input type="text" className="form-control" value={costing_currency} onChange={e=>setCostingCurrency(e.target.value)} />
                  </div>
                </>
              )}

              {chosenStatusName.includes("cancelled") && (
                <div className="mb-3 form-check">
                  <input className="form-check-input" type="checkbox" checked={withdelete} onChange={e=>setWithDelete(e.target.checked)} id="withDeleteCheck" />
                  <label className="form-check-label" htmlFor="withDeleteCheck">Delete order from DB as well</label>
                </div>
              )}

            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={submitting}>Close</button>
              <button type="button" className="btn btn-primary" onClick={submit} disabled={submitting}>
                {submitting ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

/* ------------------ Paying modal ------------------ */
const PayingModal = ({ show, order, onClose, onSaved }) => {
  // initial safe values
  const [amount, setAmount] = useState(0);
  const [currency, setCurrency] = useState("SYP");
  const [submitting, setSubmitting] = useState(false);

  // تحديث القيم عند تغيير order أو show
  useEffect(() => {
    if (!order) return;

    const totalField = order.total_amount || order.total || order.amount || null;
    const { amount: defaultAmount, currency: defaultCurrency } = parseAmountField(totalField);

    setAmount(defaultAmount || 0);
    setCurrency(defaultCurrency || "SYP");
  }, [order, show]);

  // conditional render after hooks
  if (!show || !order) return null;

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Pay Order</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Amount</label>
              <input type="number" className="form-control" value={amount} onChange={e => setAmount(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label">Currency</label>
              <select className="form-select" value={currency} onChange={e => setCurrency(e.target.value)}>
                <option value="SYP">SYP</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={submitting}>Close</button>
            <button type="button" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ------------------ Delete modal ------------------ */
const DeleteModel = ({ show, order, onClose, onSaved }) => {
  const [submitting, setSubmitting] = useState(false);

  
  if (!show || !order) return null;

  const submit = async () => {
    setSubmitting(true);
    try {
      const res = await axios.delete(`/order/delete/delete?id=${order?.uuid}`);
      if (res.data?.success || res.status === 200 || res.status === 201) {
        onSaved && onSaved(null);
      } else {
        onSaved && onSaved(null);
      }
      onClose && onClose();
    } catch (err) {
      console.error(err);
      onClose && onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop fade show"></div>

      <div className="modal show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg">

            {/* Header */}
            <div className="modal-header border-0">
              <h5 className="modal-title fw-bold">حذف الطلبية</h5>
              <button type="button" className="btn-close" onClick={onClose} disabled={submitting}></button>
            </div>

            {/* Body */}
            <div className="modal-body text-center">

              <div className="text-danger mb-3" style={{ fontSize: "3rem" }}>
                <i className="bi bi-exclamation-triangle-fill"></i>
              </div>

              <h5 className="fw-semibold"> هل أنت متأكد ؟</h5>
              <p className="text-muted mb-3">
                This action will permanently delete<br />
                <strong>Order #{order.uuid || order.id}</strong>.
              </p>

              <div className="input-group mb-3">
                <span className="input-group-text bg-light text-muted">Order ID</span>
                <input
                  type="text"
                  className="form-control bg-light"
                  value={order?.uuid || order?.id}
                  disabled
                />
              </div>

              <div className="input-group mb-3">
                <span className="input-group-text bg-light text-muted">المستخدم </span>
                <input
                  type="text"
                  className="form-control bg-light"
                  value={order?.User?.username || "—"}
                  disabled
                />
              </div>
              <div className="input-group mb-3">
                <span className="input-group-text bg-light text-muted">رقم المستخدم </span>
                <input
                  type="text"
                  className="form-control bg-light"
                  value={order?.User?.phone_number || "—"}
                  disabled
                />
              </div>
              <div className="input-group mb-3">
                <span className="input-group-text bg-light text-muted">تاريخ الطلب :  </span>
                <input
                  type="text"
                  className="form-control bg-light"
                  value={order?.order_date || "—"}
                  disabled
                />
              </div>
              <div className="input-group mb-3">
                <span className="input-group-text bg-light text-muted">ملاحظات الطلب :  </span>
                <input
                  type="text"
                  className="form-control bg-light"
                  value={order?.note || "—"}
                  disabled
                />
              </div>
              <div className="input-group mb-3 ">
                <span className="input-group-text bg-light text-muted"> حالة الطلب : </span>
                <input
                  type="text"
                  className={`form-control ${(order?.Order_statu?.statu==='shipped')?"bg-info text-light":(order?.Order_statu?.statu==="pending")?"bg-warning":(order?.Order_statu?.statu==='cancelled')?"bg-danger text-light":"text-light bg-black"}`}
                  value={order?.Order_statu?.statu || "—"}
                  disabled
                />
              </div>
 

              <div className="input-group mb-3">
                <span className="input-group-text bg-light text-muted">عملة الطلب </span>
                <input
                  type="text"
                  className="form-control bg-light"
                  value={order?.total_amount[0]?.currency || "—"}
                  disabled
                />
              </div>
              <div className="input-group mb-3">
                <span className="input-group-text bg-light text-muted">مجموع الطلب </span>
                <input
                  type="text"
                  className="form-control bg-light"
                  value={order?.total_amount[0]?.amount || "—"}
                  disabled
                />
              </div>
              <div className="alert alert-warning small">
              هذا الحذف لا يمكن إعادته
              </div>

            </div>

            {/* Footer */}
            <div className="modal-footer border-0">
              <button 
                type="button" 
                className="btn btn-outline-secondary" 
                onClick={onClose} 
                disabled={submitting}
              >
                Cancel
              </button>

              <button 
                type="button" 
                className="btn btn-danger" 
                onClick={submit} 
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Deleting...
                  </>
                ) : (
                  "Delete Permanently"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

/* ------------------ OrderDetailsModal (unchanged except using parse helpers) ------------------ */

// Small StatusBadge fallback — replace with your own if you have one
const OrderDetailsModal = ({ show, order, onClose }) => {
    const [invoiceChunks, setInvoiceChunks] = useState([]);

  function parseAmountField(field) {
    if (!field) return { amount: 0, currency: 'USD' };
  
    if (Array.isArray(field) && field.length > 0) {
      const f = field[0];
      return { amount: Number(f.amount || 0), currency: f.currency || 'USD' };
    }
  
    if (typeof field === 'object' && field !== null) {
      return { amount: Number(field.amount || 0), currency: field.currency || 'USD' };
    }
  
    const n = Number(field);
    return { amount: isNaN(n) ? 0 : n, currency: 'USD' };
  }
  
  function fmtAmount(amount = 0, currency = 'USD') {
    try {
      const locale = (typeof navigator !== 'undefined' && navigator.language) || 'en-GB';
      return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
    } catch (e) {
      return `${amount} ${currency}`;
    }
  }
  
  const StatusBadge = ({ status }) => {
    const s = (status || '').toString().toLowerCase();
    let cls = 'badge bg-secondary';
    if (s.includes('pending')) cls = 'badge bg-warning text-dark';
    if (s.includes('processing')) cls = 'badge bg-info text-dark';
    if (s.includes('shipped')) cls = 'badge bg-primary';
    if (s.includes('completed')) cls = 'badge bg-success';
    if (s.includes('cancel') || s.includes('refunded')) cls = 'badge bg-danger';
    return <span className={cls}>{status || 'unknown'}</span>;
  };
  
  const [items, setItems] = useState([]); // order details array
  const [orderMeta, setOrderMeta] = useState(null); // order-level metadata
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!show) {
      setItems([]);
      setOrderMeta(null);
      setLoading(false);
      setError(null);
      return;
    }

    if (!order) {
      setError('No order provided');
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;

    const fetchOrder = async () => {
      setLoading(true);
      setError(null);

      try {
        const orderId = order.uuid || order.id || order.order_number;
        // Adjust this URL to your actual endpoint
        const url = '/order/justgetalltheorder';

        const res = await axios.post(url, { order_id: orderId }, { signal });
        const data = res.data;

        // CASE A: server returned a single `order` object with nested `Order_details`
        if (data?.order_details && typeof data.order_details === 'object') {
          const fetchedOrder = data.order_details;
          // Accept either Order_details or order_details
          const details =
            Array.isArray(fetchedOrder.Order_details) ? fetchedOrder.Order_details :
            Array.isArray(fetchedOrder.order_details) ? fetchedOrder.order_details : [];
          setItems(details);
          setOrderMeta(fetchedOrder);
          setLoading(false);
          return;
        }

        // CASE B: server returned order_details array directly (older shape)
        if (Array.isArray(data?.order_details)) {
          const detailsOnly = data.order_details;
          setItems(detailsOnly);

          // derive meta from first detail row (if present) or fallback to provided order prop
          if (detailsOnly.length > 0) {
            const first = detailsOnly[0];
            setOrderMeta({
              User: first?.User ?? order?.User ?? null,
              Shipping: first.Shipping ?? order.Shipping ?? null,
              Order_statu: first.Order_statu ?? order.Order_statu ?? null,
              createdAt: order.createdAt ?? first.createdAt ?? order.order_date ?? Date.now(),
              total_amount: order.total_amount ?? order.total ?? order.amount ?? null,
              uuid: order.uuid ?? order.id,
            });
          } else {
            setOrderMeta({
              User: order.User ?? null,
              Shipping: order.Shipping ?? null,
              Order_statu: order.Order_statu ?? null,
              createdAt: order.createdAt ?? order.order_date ?? Date.now(),
              total_amount: order.total_amount ?? order.total ?? order.amount ?? null,
              uuid: order.uuid ?? order.id,
            });
          }

          setLoading(false);
          return;
        }

        // Nothing useful returned; fallback to the provided order prop
        setItems([]);
        setOrderMeta({
          User: order?.User ?? null,
          Shipping: order.Shipping ?? null,
          Order_statu: order.Order_statu ?? null,
          createdAt: order.createdAt ?? order.order_date ?? Date.now(),
          total_amount: order.total_amount ?? order.total ?? order.amount ?? null,
          uuid: order.uuid ?? order.id,
        });
      } catch (err) {
        if (axios.isCancel && axios.isCancel(err)) {
          // request was cancelled - ignore
        } else {
          setError(err?.message || 'Failed to fetch order details');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    return () => controller.abort();
  }, [show, order]);
    useEffect(() => {
      if(!orderMeta)return
      const itemsPerInvoice = 20;
    const chunks = [];
    for (let i = 0; i < orderMeta.Order_details.length; i += itemsPerInvoice) {
      chunks.push(orderMeta.Order_details.slice(i, i + itemsPerInvoice));
    }
    setInvoiceChunks(chunks);
  }, [orderMeta]);
    useEffect(() => {
      if(!orderMeta)return
      // تقطيع العناصر كل 10 عناصر
    const itemsPerInvoice = 10;
    const chunks = [];
    for (let i = 0; i < orderMeta.Order_details.length; i += itemsPerInvoice) {
      chunks.push(orderMeta.Order_details.slice(i, i + itemsPerInvoice));
    }
  }, [orderMeta]);
  
    const containerRef = useRef(null);
  

  if (!show || !order) return null;

  const meta = orderMeta || {
    User: order?.User ?? null,
    Shipping: order.Shipping ?? null,
    Order_statu: order.Order_statu ?? null,
    createdAt: order.createdAt ?? order.order_date ?? Date.now(),
    total_amount: order.total_amount ?? order.total ?? order.amount ?? null,
    uuid: order.uuid ?? order.id,
  };

      const handleDownloadPDF = () => {
      const element = containerRef.current;
      const options = {
        margin: 0,
        filename: `${meta?.uuid}.pdf`,
        image: { type: "jpeg", quality: 1.0 },
        html2canvas: { scale: 2,scrollY: 0 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };
  
      html2pdf().set(options).from(element).save();
    };
  // ensure items is array
  const safeItems = Array.isArray(items) ? items : [];

  const totalField = meta.total_amount;
  const { amount: modalTotalAmount, currency: modalCurrency } = parseAmountField(totalField);
  const totalFormatted = fmtAmount(modalTotalAmount, modalCurrency);
 const defaultCountry = '963'; // <- set this to your country code if numbers are local (e.g. '966' or '1')
  function phoneDigitsOnly(phone = '') {
    return String(phone).replace(/[^\d+]/g, '');
    
  }
  function normalizePhoneForWhatsApp(phone = '') {
    let p = phoneDigitsOnly(phone);
    if (!p) return '';
    if (p.startsWith('+')) p = p.slice(1);
    if (p.startsWith('00')) p = p.replace(/^00/, '');
    if (p.startsWith('0') && defaultCountry) {
      p = defaultCountry + p.slice(1);
    }
    // If it already looks like country+number (length > 8) keep it
    return p;
  }

  function prettyPhone(phone = '') {
    const p = phoneDigitsOnly(phone);
    if (!p) return '';
    // simple prettifier: show as groups, preserve leading +
    if (phone.trim().startsWith('+')) return `+${p}`;
    // show raw if no better
    return p;
  }

  const waPhone = normalizePhoneForWhatsApp(meta?.User.phone_number || '');
  const orderNumber = order?.uuid || order?.id || 'N/A'; // your order ID
const rawMessage = `شكرا على تسوقكم من موقعنا   CORTEX 7 
  Order N:#${orderNumber} `;

// encode only once, keep the line break
const waLink = `https://wa.me/${waPhone}?text=${encodeURIComponent(rawMessage)}`;



  async function copyPhone() {
    try {
      await navigator.clipboard.writeText(meta?.User.phone_number || waPhone || '');
      // small visual feedback could be added (toast) - using alert for minimal example
      // replace alert with your toast system
    } catch (e) {
    }
  }

  

  return (
    <>
      <div className="modal-backdrop fade show"></div>

      <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
        <div className="modal-dialog modal-lg modal-dialog-scrollable">
          <div className="modal-content ">
            <div className="modal-header">
              <h5 className="modal-title">Order #{order.order_number || meta.uuid || order.uuid || order.id}</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
            </div>

            <div className="modal-body ">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <div className="fw-semibold">
                    {meta?.User?.username || meta?.User?.name || order.customer_name || 'Guest'}
                  </div>
                  <div className="text-muted small">{new Date(meta.createdAt).toLocaleString('en-GB')}</div>
                  <div className="mt-2">
                    <StatusBadge status={meta.Order_statu?.statu || order.status || order.order_status || 'pending'} />
                  </div>
      <div className="flex-grow-1">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <div className="fw-semibold" style={{ fontSize: 16 }}>{meta?.User.name || 'Guest'}</div>
              <div className="text-muted small">{/* optional subtitle */}</div>
            </div>

            <div className="text-end">
              {/* WhatsApp link */}
              {waLink ? (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="d-inline-flex align-items-center text-decoration-none"
                  title="Open in WhatsApp"
                  style={{ gap: 8 }}
                >
                  {/* small WhatsApp SVG icon */}
                   <span
            className="badge rounded-pill bg-light border d-flex align-items-center shadow-sm"
            style={{ padding: "0.35rem 0.5rem", fontSize: "0.85rem" }}
            aria-hidden="true"
          >
            <i
              className="bi bi-whatsapp"
              style={{
                fontSize: "1.05rem",
                marginInlineEnd: "0.4rem",
                color: "#25D366",
              }}
            ></i>
            <span style={{ fontWeight: 600, color: "#155724" }}>واتساب</span>
          </span>

                  <span className="small" style={{ color: '#0b5826', fontWeight: 600 }}>
                    { normalizePhoneForWhatsApp(meta?.User.phone_number) || waPhone }
                  </span>
                </a>
              ) : (
                <span className="small text-muted">{prettyPhone(meta?.User.phone_number) || 'No phone'}</span>
              )}
            </div>
          </div>

          <div className="mt-2 d-flex gap-2">
            {/* Copy button */}
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={copyPhone} title="Copy phone">
              Copy
            </button>

            {/* Optional: direct call (tel:) */}
            {meta?.User.phone_number ? (
              <a href={`tel:${phoneDigitsOnly(meta?.User.phone_number)}`} className="btn btn-sm btn-outline-primary" title="Call">
                Call
              </a>
            ) : null}

            {/* small hint */}
            <div className="ms-auto small text-muted">Click phone to open WhatsApp</div>
          </div>
        </div>
                </div>

                <div className="text-end">
                  <div className="fw-bold">{totalFormatted}</div>
                  <div className="small text-muted">{safeItems.length ? `${safeItems.length} items` : ''}</div>
                </div>
              </div>

              <hr />

              <h6 className="mb-2">Items</h6>

              {loading ? (
                <div className="small text-muted">Loading items...</div>
              ) : error ? (
                <div className="text-danger small mb-3">{error}</div>
              ) : safeItems.length === 0 ? (
                <div className="text-muted small">No items.</div>
              ) : (
                <div className="list-group mb-3">
                  {safeItems.map((it, idx) => {
                    const priceField = it.cost_per_one ?? it.price ?? it.unit_price ?? it.amount ?? null;
                    const { amount: itemPrice, currency: itemCurrency } = parseAmountField(priceField);
                    const itemPriceFormatted = fmtAmount(itemPrice, it.currency);
                    const qty = Number(it.quantity ?? it.qty ?? 1);

                    const product = it.Product ?? {};

                    const imgSrc =
                      it.Product?.Product_images[0]?.filename ||
                      it.thumbnail ||
                      it.filename ||
                      product.img ||
                      product.image ||
                      `https://placehold.co/56`;

                    return (
                      <div key={it.id ?? idx} className="list-group-item d-flex align-items-center gap-3">
                        <div style={{ width: 56, height: 56 }}>
                          <img
                            src={imgSrc}
                            alt={it.title || product.title || it.name || 'item'}
                            className="rounded"
                            style={{ width: 56, height: 56, objectFit: 'cover' }}
                          />
                        </div>
                        <div className="flex-grow-1">
                          <div className="fw-semibold small">{it.title || product.title || product.name || 'Product'}</div>
                          <div className="small text-muted">{(qty ? `${qty} × ` : '')}{itemPriceFormatted}</div>
                        </div>
                        <div className="text-end small fw-bold">
                          {fmtAmount((itemPrice || 0) * (qty || 1),it.currency)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <h6 className="mb-2">Shipping</h6>
              <div className="small text-muted mb-3">
                {meta.Shipping || order.Address || order.AddressData || order.shipping_address ? (
                  <>
                    <div>
                      {(meta.Shipping && (meta.Shipping.name || meta.Shipping.full_name)) ||
                        (order.Address && (order.Address.name || order.Address.full_name)) ||
                        (order.shipping_address && order.shipping_address.name) ||
                        ''}
                    </div>
                    <div>
                      {(meta.Shipping && (meta.Shipping.address_line || meta.Shipping.line1)) ||
                        (order.Address && (order.Address.address_line || order.Address.line1)) ||
                        (order.shipping_address && order.shipping_address.address_line) ||
                        ''}
                    </div>
                  </>
                ) : (
                  <div>Not provided</div>
                )}
              </div>

              <hr />
              <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted">Order ID: {meta.uuid || order.uuid || order.id}</small>
                <div className="fw-bold">{totalFormatted}</div>
              </div>

            <button className="btn btn-secondary" onClick={handleDownloadPDF}>
                🖨️ طباعة الفاتورة
            </button>
            <div  className=' p-0 m-0 container-fluid'  ref={containerRef} style={{ display: "block" }}>
              {invoiceChunks.map((items, index) =>{
                  return(
                <InvoiceLayout
                  key={index}
                  cart={items}
                  subtotal={modalTotalAmount}
                  discount={0}
                  tax={0}
                  total={modalTotalAmount}
                  customer={orderMeta?.User}
                  currency={modalCurrency}
                  orderId={orderMeta?.uuid}
                  />
                )})}
            </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

/* ------------------ Main component ------------------ */
const AdminOrdersFilter21158 = ({ fetchUrl = "/order/filterorders2" }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // paging / filter state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [statusFilter, setStatusFilter] = useState(null);

  const [status,setStatus]=useState([]);
  
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [showPayingModal, setShowPayingModal] = useState(false);
  const[showDeleteModal,setShowDeleteModal]=useState(false);

  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const body = { page, limit, status_id: statusFilter };
      const res = await axios.post(fetchUrl, body);
      const data = res.data || {};
      setOrders(Array.isArray(data.orders) ? data.orders : []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch (err) {
      setOrders([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };
  const fetchStatus=async()=>{
    try {
      const res=await axios.get("/orderstatus/getall");
      setStatus(res.data);

    } catch (error) {
      setStatus([]);
    }
  }
  useEffect(() => {
    fetchOrders();
    return
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, statusFilter, fetchUrl]);
  useEffect(()=>{
        fetchStatus();
        return
  },[])

  const openDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };
  const closeDetails = () => { setSelectedOrder(null); setShowDetailsModal(false); };

  const openChangeStatus = (order) => {
    setSelectedOrder(order);
    setShowChangeModal(true);
  };
  const closeChangeStatus = () => { setSelectedOrder(null); setShowChangeModal(false); };

  const openPaying = (order) => {
    setSelectedOrder(order);
    setShowPayingModal(true);
  };
  const closePaying = () => { setSelectedOrder(null); setShowPayingModal(false); };
  
  const openDelete=(order)=>{
    setSelectedOrder(order);
    setShowDeleteModal(true);
  };
  const closeDelete=(order)=>{
    setSelectedOrder(null);
    setShowDeleteModal(false);
  }
  // called when modals finish and request succeeded; we reload the list to reflect changes
  const onModalSaved = (maybeUpdatedOrder) => {
    // prefer re-fetch to be safe with server logic
    fetchOrders();
  };

  // quick optimistic action removed — use Paying modal and ChangeStatus modal instead
  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body p-5">
        <div className="d-flex align-items-center justify-content-between mb-3 gap-3">
          <h5 className="mb-0">Coming Orders</h5>

          <div className="d-flex gap-2 align-items-center">
            <select className="form-select form-select-sm" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
              {status && status.map((item)=>(<>
                            <option value={item.id}>{item.statu}</option>

              </>))}

            </select>
            <small className="text-muted">{loading ? "Loading..." : `${total} orders`}</small>
          </div>
        </div>

        <div className="list-group list-group-flush">
          <div className="alert alert-warning text-center fw-semibold py-2" role="alert">
            ⚠️ <strong>تنبيه:</strong>  عند تتعامل مع أوردر و تنتهي فقط اضغط على تغيير الحالة و من ثم ضعها على cancelled فقط بدون اي شيئ 
          </div>
          <div className="alert alert-warning text-center fw-semibold py-2" role="alert">
            ⚠️ <strong>ملاحظة:</strong> الأوردرات الجديدة تكون بالون البرتقالي في حالة pending أما اللون الأحمر فمعناها أوردر تم التعامل معه 
          </div>
          <div className="alert alert-danger text-center fw-semibold py-2" role="alert">
               <strong>ملاحظة:</strong> سيتم تحديث هذه الواجهة خلال أيام إنشاء الله و لن يؤثر هذا على طلب الاوردرات فأكمل عملك عزيزي المستخدم و لا تهلع 
          </div>
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <OrderPlaceholder i={i} key={i} />)
          ) : orders.length === 0 ? (
            <div className="py-3 text-center text-muted">No orders found.</div>
          ) : (
            orders.map((o) => {
              const rowTotalField = o.total_amount || o.total || o.amount || null;
              const { amount: rowTotalAmount, currency: rowTotalCurrency } = parseAmountField(rowTotalField);
              const rowTotalFormatted = fmtAmount(rowTotalAmount, rowTotalCurrency);

              return (
                <div key={o.id ?? o.uuid} className="list-group-item d-flex gap-3 align-items-center">
                  <div style={{ minWidth: 52 }}>
                    <div className="fw-bold small">#{o.order_number || o.uuid || o.id}</div>
                  </div>

                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div className="fw-semibold">{o.User?.username || o.customer_name || "Guest"}</div>
                        <div className="small text-muted">{o.order_details?.length ? `${o.order_details.length} items` : (o.items?.length ? `${o.items.length} items` : "")}</div>
                      </div>

                      <div className="text-end">
                        <div className="fw-bold">{rowTotalFormatted}</div>
                        <div className="small text-muted">{new Date(o.createdAt || o.order_date || Date.now()).toLocaleString("en-GB")}</div>
                      </div>
                    </div>

                    <div className="mt-2 d-flex align-items-center gap-2">
                      <StatusBadge status={o.Order_statu?.statu || o.status || o.order_status || "pending"} />

                      <button className="btn btn-sm btn-outline-secondary" onClick={() => openDetails(o)}>View</button>

                      <button className="btn btn-sm btn-success" onClick={() => openPaying(o)}>الدفع للطلب</button>

                      <button className="btn btn-sm btn-outline-primary" onClick={() =>{setSelectedOrder(o); openChangeStatus(o)}}>تغيير الحالة</button>

                      <button className="btn btn-sm btn-danger" onClick={() =>{setSelectedOrder(o); openDelete(o)}}>الحذف نهايئاً</button>

                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* pagination */}
        <div className="d-flex justify-content-between align-items-center mt-3">
          
          <div>
            <small className="text-muted">Page {page} / {totalPages} — {total} items</small>
          </div>

          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => goToPage(page - 1)}>Prev</button>
              </li>

              {Array.from({ length: Math.min(totalPages, 5) }).map((_, idx) => {
                let start = Math.max(1, Math.min(page - 2, totalPages - 4));
                const p = start + idx;
                return (
                  <li className={`page-item ${p === page ? "active" : ""}`} key={p}>
                    <button className="page-link" onClick={() => goToPage(p)}>{p}</button>
                  </li>
                );
              })}

              <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => goToPage(page + 1)}>Next</button>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-3 d-flex justify-content-end">
          <Link to="/admin/orders" className="btn btn-sm btn-outline-primary">View all orders</Link>
        </div>
      </div>

      {/* Modals */}
      <OrderDetailsModal show={showDetailsModal} order={selectedOrder} onClose={closeDetails} />

      <ChangeStatusModal
        show={showChangeModal}
        order={selectedOrder}
        onClose={closeChangeStatus}
        onSaved={onModalSaved}
      />

      <PayingModal
        show={showPayingModal}
        order={selectedOrder}
        onClose={closePaying}
        onSaved={onModalSaved}
      />
    
    <DeleteModel
        show={showDeleteModal}
        order={selectedOrder}
        onClose={closeDelete}
        onSaved={onModalSaved}
    />
    </div>

  );
};

export default AdminOrdersFilter21158;
