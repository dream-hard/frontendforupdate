// AdminOrdersFilter2.jsx
import React, { useEffect, useState } from "react";
import axios from "../../api/fetch";
import { Link } from "react-router-dom";

/* ------------------ helpers for amounts ------------------ */
const currencySymbols = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  SYP: "SYP", // show code for less-common currencies
  // add more mappings if you want
};

/**
 * parseAmountField:
 * Accepts:
 *  - array like [{ amount: 123, currency: 'USD' }, ...]
 *  - object like { amount: 123, currency: 'USD' }
 *  - number or numeric string
 *  - JSON string representation of any of the above
 *
 * Returns { amount: Number, currency: String|null }
 */
function parseAmountField(field, preferCurrency = null) {
  if (field === null || field === undefined) return { amount: 0, currency: null };

  // If it's a JSON string, try to parse it
  if (typeof field === "string") {
    const trimmed = field.trim();
    if ((trimmed.startsWith("[") && trimmed.endsWith("]")) || (trimmed.startsWith("{") && trimmed.endsWith("}"))) {
      try {
        field = JSON.parse(trimmed);
      } catch (e) {
        // not JSON, fall through to numeric parse
      }
    }
  }

  // If array
  if (Array.isArray(field) && field.length > 0) {
    // pick preferred currency if given
    if (preferCurrency) {
      const found = field.find(f => String(f.currency).toUpperCase() === String(preferCurrency).toUpperCase());
      if (found) return { amount: Number(found.amount || 0), currency: String(found.currency || "").toUpperCase() };
    }
    const first = field[0];
    if (first && typeof first === "object" && ("amount" in first)) {
      return { amount: Number(first.amount || 0), currency: String(first.currency || "").toUpperCase() || null };
    }
    // fallback: try numeric first element
    const n = Number(first);
    if (!Number.isNaN(n)) return { amount: n, currency: null };
    return { amount: 0, currency: null };
  }

  // If object with amount
  if (typeof field === "object" && field !== null && ("amount" in field)) {
    return { amount: Number(field.amount || 0), currency: String(field.currency || "").toUpperCase() || null };
  }

  // If primitive number or numeric string
  const n = Number(field);
  if (!Number.isNaN(n)) return { amount: n, currency: null };

  // default fallback
  return { amount: 0, currency: null };
}

/**
 * fmtAmount(amount, currencyCode, locale)
 * - tries to format via Intl.NumberFormat with currency if currencyCode is valid ISO code
 * - otherwise falls back to "symbol/code + localized number"
 */
function fmtAmount(amount, currencyCode = null, locale = "en-GB") {
  const num = Number(amount || 0);

  // try Intl currency formatting if currencyCode looks valid (3-letter)
  try {
    if (currencyCode && typeof currencyCode === "string" && currencyCode.length === 3 && Intl && Intl.NumberFormat) {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currencyCode,
        maximumFractionDigits: 2,
      }).format(num);
    }
  } catch (e) {
    // fallthrough
  }

  // fallback: use symbol mapping or code + localized number
  const symbolOrCode = currencySymbols[currencyCode] || currencyCode || "";
  const formatted = Number(num).toLocaleString(locale, { maximumFractionDigits: 2 });
  return symbolOrCode ? `${symbolOrCode} ${formatted}` : formatted;
}

/* ------------------ UI helpers ------------------ */
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
  };
  return <span className={map[status] || "badge bg-secondary"}>{status}</span>;
};

/* ------------------ Modal (React-driven) ------------------ */
const OrderDetailsModal = ({ show, order, onClose, onMarkPaid, onChangeStatus }) => {
  if (!show || !order) return null;

  const items = order.order_details || order.items || order.order_items || [];
  const created = order.createdAt || order.order_date || Date.now();

  // parse total_amount according to stored JSON array style
  const totalField = order.total_amount || order.total || order.amount || null;
  const { amount: modalTotalAmount, currency: modalCurrency } = parseAmountField(totalField);
  const totalFormatted = fmtAmount(modalTotalAmount, modalCurrency);

  return (
    <>
      <div className="modal-backdrop fade show"></div>

      <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
        <div className="modal-dialog modal-lg modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Order #{order.order_number || order.uuid || order.id}</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
            </div>

            <div className="modal-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <div className="fw-semibold">
                    {order.User?.username || order.customer_name || "Guest"}
                  </div>
                  <div className="text-muted small">{new Date(created).toLocaleString("en-GB")}</div>
                  <div className="mt-2"><StatusBadge status={order.Order_statu?.statu || order.status || order.order_status || "pending"} /></div>
                </div>

                <div className="text-end">
                  <div className="fw-bold">{totalFormatted}</div>
                  <div className="small text-muted">{items.length ? `${items.length} items` : ""}</div>
                </div>
              </div>

              <hr />

              <h6 className="mb-2">Items</h6>
              {items.length === 0 ? (
                <div className="text-muted small">No items.</div>
              ) : (
                <div className="list-group mb-3">
                  {items.map((it, idx) => {
                    // attempt to parse item price if it's stored as JSON array/object
                    const priceField = it.price ?? it.unit_price ?? it.amount ?? it.price_amount ?? null;
                    const { amount: itemPrice, currency: itemCurrency } = parseAmountField(priceField);
                    const itemPriceFormatted = fmtAmount(itemPrice, itemCurrency);
                    const qty = Number(it.qty ?? it.quantity ?? 1);

                    return (
                      <div key={it.id ?? idx} className="list-group-item d-flex align-items-center gap-3">
                        <div style={{ width: 56, height: 56 }}>
                          <img
                            src={it.image || it.thumbnail || it.filename || (it.Product && (it.Product.img || it.Product.image)) || `https://placehold.co/56`}
                            alt={it.title || it.name || "item"}
                            className="rounded"
                            style={{ width: 56, height: 56, objectFit: "cover" }}
                          />
                        </div>
                        <div className="flex-grow-1">
                          <div className="fw-semibold small">{it.title || it.product_title || it.name}</div>
                          <div className="small text-muted">{(qty ? `${qty} × ` : "")}{itemPriceFormatted}</div>
                        </div>
                        <div className="text-end small fw-bold">
                          {fmtAmount((itemPrice || 0) * (qty || 1), itemCurrency)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <h6 className="mb-2">Shipping</h6>
              <div className="small text-muted mb-3">
                {order.Address || order.AddressData || order.shipping_address ? (
                  <>
                    <div>{(order.Address && (order.Address.name || order.Address.full_name)) || (order.shipping_address && order.shipping_address.name)}</div>
                    <div>{(order.Address && (order.Address.address_line || order.Address.line1)) || (order.shipping_address && order.shipping_address.address_line)}</div>
                  </>
                ) : (
                  <div>Not provided</div>
                )}
              </div>

              <hr />
              <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted">Order ID: {order.uuid || order.id}</small>
                <div className="fw-bold">{totalFormatted}</div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Close</button>
              <button type="button" className="btn btn-success" onClick={() => onMarkPaid(order.id)}>Mark Paid</button>

              <div className="btn-group">
                <button type="button" className="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                  Change Status
                </button>
                <ul className="dropdown-menu">
                  <li><button className="dropdown-item" onClick={() => onChangeStatus(order.id, "placed")}>Placed</button></li>
                  <li><button className="dropdown-item" onClick={() => onChangeStatus(order.id, "shipped")}>Shipped</button></li>
                  <li><button className="dropdown-item" onClick={() => onChangeStatus(order.id, "cancelled")}>Cancelled</button></li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

/* ------------------ Main component ------------------ */
const AdminOrdersFilter21155 = ({ fetchUrl = "/order/filterorders2" }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // paging / filter state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [statusFilter, setStatusFilter] = useState("pending"); // default show coming orders
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const body = {
          page,
          limit,
          status: statusFilter,
        };
        const res = await axios.post(fetchUrl, body);
        const data = res.data || {};
        setOrders(Array.isArray(data.orders) ? data.orders : []);
        setTotal(data.total ?? 0);
        setTotalPages(data.totalPages ?? 1);
      } catch (err) {
        console.error("Failed to load orders:", err);
        setOrders([]);
        setTotal(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [page, limit, statusFilter, fetchUrl]);

  const openModal = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };
  const closeModal = () => {
    setSelectedOrder(null);
    setShowModal(false);
  };

  const markPaid = async (orderId) => {
    if (!window.confirm("Mark this order as PAID?")) return;
    try {
      await axios.post("/order/payingorder", { id: orderId });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "paid", order_status: "paid" } : o));
      if (selectedOrder?.id === orderId) setSelectedOrder(prev => ({ ...prev, status: "paid", order_status: "paid" }));
    } catch (err) {
      console.error(err);
      alert("Failed to update order.");
    }
  };

  const changeStatus = async (orderId, newStatus) => {
    if (!window.confirm(`Change order status to "${newStatus}"?`)) return;
    try {
      await axios.post("/order/update/updateOrderStatus", { id: orderId, status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus, order_status: newStatus } : o));
      if (selectedOrder?.id === orderId) setSelectedOrder(prev => ({ ...prev, status: newStatus, order_status: newStatus }));
    } catch (err) {
      console.error(err);
      alert("Failed to change status.");
    }
  };

  // pagination helpers
  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between mb-3 gap-3">
          <h5 className="mb-0">Coming Orders</h5>

          <div className="d-flex gap-2 align-items-center">
            <select className="form-select form-select-sm" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="pending">Pending</option>
              <option value="placed">Placed</option>
              <option value="paid">Paid</option>
              <option value="shipped">Shipped</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <small className="text-muted">{loading ? "Loading..." : `${total} orders`}</small>
          </div>
        </div>

        <div className="list-group list-group-flush">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <OrderPlaceholder i={i} key={i} />)
          ) : orders.length === 0 ? (
            <div className="py-3 text-center text-muted">No orders found.</div>
          ) : (
            orders.map((o) => {
              // parse total for list row
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

                      <button className="btn btn-sm btn-outline-secondary" onClick={() => openModal(o)}>View</button>

                      <button className="btn btn-sm btn-success" onClick={() => markPaid(o.id)}>Mark Paid</button>

                      <div className="btn-group">
                        <button type="button" className="btn btn-sm btn-outline-primary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                          Change Status
                        </button>
                        <ul className="dropdown-menu">
                          <li><button className="dropdown-item" onClick={() => changeStatus(o.id, "placed")}>Placed</button></li>
                          <li><button className="dropdown-item" onClick={() => changeStatus(o.id, "shipped")}>Shipped</button></li>
                          <li><button className="dropdown-item" onClick={() => changeStatus(o.id, "cancelled")}>Cancelled</button></li>
                        </ul>
                      </div>
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

      <OrderDetailsModal
        show={showModal}
        order={selectedOrder}
        onClose={closeModal}
        onMarkPaid={markPaid}
        onChangeStatus={changeStatus}
      />
    </div>
  );
};

export default AdminOrdersFilter21155;
