// AdminOrdersDashboardWithModal.jsx
import React, { useEffect, useState } from "react";
import axios from "../../api/fetch";

const OrderPlaceholder = ({ i }) => (
  <div className="d-flex align-items-center gap-3 py-2 placeholder-glow" key={i}>
    <div className="placeholder col-1 me-2" style={{ height: 24 }}></div>
    <div className="flex-grow-1">
      <div className="d-flex justify-content-between">
        <div className="placeholder col-4"></div>
        <div className="placeholder col-2"></div>
      </div>
      <div className="d-flex justify-content-between mt-2">
        <div className="placeholder col-6"></div>
        <div className="placeholder col-3"></div>
      </div>
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
    default: "badge bg-secondary"
  };
  return <span className={map[status] || map.default}>{status}</span>;
};

const OrderDetailsModal = ({ show, order, onClose, onMarkPaid, onChangeStatus }) => {
  if (!show) return null;

  // safe defaults
  const items = order?.items || order?.order_items || [];
  const created = order?.createdAt || order?.date || Date.now();
  const currency = order?.Currency?.symbol || "$";

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop fade show"></div>

      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
        aria-labelledby="orderDetailsLabel"
      >
        <div className="modal-dialog modal-lg modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 id="orderDetailsLabel" className="modal-title">Order #{order?.order_number || order?.id}</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
            </div>

            <div className="modal-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <div className="fw-semibold">{order?.customer_name || (order?.User && order.User.username) || "Guest"}</div>
                  <div className="text-muted small">{new Date(created).toLocaleString("en-GB")}</div>
                  <div className="mt-2"><StatusBadge status={order?.status || order?.order_status || "pending"} /></div>
                </div>

                <div className="text-end">
                  <div className="fw-bold">{currency}{Number(order?.total || order?.amount || 0).toFixed(2)}</div>
                  <div className="text-muted small">{order?.items?.length ? `${order.items.length} items` : ""}</div>
                </div>
              </div>

              <hr />

              <h6 className="mb-2">Items</h6>
              {items.length === 0 ? (
                <div className="text-muted small">No items.</div>
              ) : (
                <div className="list-group mb-3">
                  {items.map((it, idx) => (
                    <div key={it.id || idx} className="list-group-item d-flex gap-3 align-items-center">
                      <div style={{ width: 56, height: 56 }}>
                        <img
                          src={it.image || it.thumbnail || (it.Product && it.Product.img) || `https://placehold.co/56`}
                          alt={it.title || it.name || "item"}
                          className="rounded"
                          style={{ width: 56, height: 56, objectFit: "cover" }}
                        />
                      </div>
                      <div className="flex-grow-1">
                        <div className="fw-semibold small">{it.title || it.name || it.product_title}</div>
                        <div className="small text-muted">{it.qty ? `${it.qty} × ${currency}${it.price}` : `${currency}${it.price}`}</div>
                      </div>
                      <div className="text-end small fw-bold">{currency}{((it.qty || 1) * (it.price || 0)).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              )}

              <h6 className="mb-2">Shipping</h6>
              <div className="small text-muted mb-3">
                {order?.shipping_address ? (
                  <>
                    <div>{order.shipping_address.name}</div>
                    <div>{order.shipping_address.address_line}</div>
                    <div>{order.shipping_address.city} {order.shipping_address.postal_code}</div>
                    <div>{order.shipping_address.country}</div>
                  </>
                ) : (
                  <div>Not provided</div>
                )}
              </div>

              <hr />
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">Order ID: {order?.id}</small>
                </div>
                <div className="fw-bold">{currency}{Number(order?.total || 0).toFixed(2)}</div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Close</button>
              <button type="button" className="btn btn-success" onClick={() => onMarkPaid(order?.id)}>Mark Paid</button>

              <div className="btn-group">
                <button type="button" className="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                  Change Status
                </button>
                <ul className="dropdown-menu">
                  <li><button className="dropdown-item" onClick={() => onChangeStatus(order?.id, "placed")}>Placed</button></li>
                  <li><button className="dropdown-item" onClick={() => onChangeStatus(order?.id, "shipped")}>Shipped</button></li>
                  <li><button className="dropdown-item" onClick={() => onChangeStatus(order?.id, "cancelled")}>Cancelled</button></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};


const AdminOrdersDashboardWithModal = ({ fetchUrl = "/order/filterorders", limit = 20 }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await axios.post(fetchUrl, { status: "pending", limit });
      setOrders(Array.isArray(res.data) ? res.data : []);
      setLoading(false);
    };
    load();
  }, [fetchUrl, limit]);

  const openModal = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const markPaid = async (orderId) => {
    if (!window.confirm("Mark this order as PAID?")) return;
    try {
      await axios.post("/order/payingorder", { id: orderId });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "paid" } : o));
      if (selectedOrder?.id === orderId) setSelectedOrder(prev => ({ ...prev, status: "paid" }));
    } catch (err) {
      console.error(err);
      alert("Failed to update order.");
    }
  };

  const changeStatus = async (orderId, newStatus) => {
    try {
      await axios.post("/order/update/updateOrderStatus", { id: orderId, status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder?.id === orderId) setSelectedOrder(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error(err);
      alert("Failed to change status.");
    }
  };

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h5 className="mb-0">Coming Orders</h5>
          <small className="text-muted">{loading ? "Loading..." : `${orders.length} orders`}</small>
        </div>

        <div className="list-group list-group-flush">
          {loading ? (
            Array.from({ length: Math.min(6, limit) }).map((_, i) => <OrderPlaceholder i={i} key={i} />)
          ) : orders.length === 0 ? (
            <div className="py-3 text-center text-muted">No coming orders.</div>
          ) : (
            orders.map((o) => (
              <div key={o.id} className="list-group-item d-flex gap-3 align-items-center">
                <div style={{ minWidth: 48 }}>
                  <div className="fw-bold small">#{o.order_number || o.id}</div>
                </div>

                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div className="fw-semibold">{o.customer_name || (o.User && o.User.username) || "Guest"}</div>
                      <div className="small text-muted">{o.items_count ? `${o.items_count} items` : (o.items?.length ? `${o.items.length} items` : "")}</div>
                    </div>

                    <div className="text-end">
                      <div className="fw-bold">{o.Currency?.symbol || "$"}{o.total?.toFixed ? o.total.toFixed(2) : o.total}</div>
                      <div className="small text-muted">{ new Date(o.createdAt || o.date || Date.now()).toLocaleString("en-GB") }</div>
                    </div>
                  </div>

                  <div className="mt-2 d-flex align-items-center gap-2">
                    <StatusBadge status={o.status || o.order_status || "pending"} />

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
            ))
          )}
        </div>

        <div className="mt-3 d-flex justify-content-end">
          <a href="/admin/orders" className="btn btn-sm btn-outline-primary">View all orders</a>
        </div>
      </div>

      {/* Modal (rendered when showModal is true) */}
      <OrderDetailsModal
        show={showModal}
        order={selectedOrder || {}}
        onClose={() => setShowModal(false)}
        onMarkPaid={markPaid}
        onChangeStatus={changeStatus}
      />
    </div>
  );
};

export default AdminOrdersDashboardWithModal;
