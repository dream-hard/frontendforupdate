import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/fetch";
import useNotification from "../../Hooks/useNotification";
import SearchableSelect from "../seachselect/searchselect";
const initialFormState ={
    supplier_id: "",
    date_received: "",
    total_cost: 0,
    paid: 0,
    currency: "USD",
}

const SupplierShipmentAdd = ({onClose , onUpdated,supplier_id}) => {
  
  const { showNotification } = useNotification();
  const today = new Date().toISOString().split("T")[0]; 
  const [formData, setFormData] = useState({...initialFormState,date_received:today});

  useEffect(()=>{
    setFormData((prev)=>({...prev,supplier_id:supplier_id}));
  },[supplier_id]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);

  // Generic input handler
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (type === "number") {
      // keep number as string to avoid float precision issues until submit
      setFormData((prev) => ({ ...prev, [name]: value === "" ? "" : value }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // fetch suppliers for the select
  const fetchSuppliers = async () => {
    setLoadingSuppliers(true);
    try {
      // adjust endpoint to your API (example: '/suppliers/justgetall' or '/suppliers')
      const res = await axios.get("/supplier/justgetall");
      // assume res.data is array of suppliers each with { uuid, name } or similar
      setSuppliers(res.data || []);
    } catch (err) {
      showNotification("error", "فشل استدعاء الموردين");
      setSuppliers([]);
    } finally {
      setLoadingSuppliers(false);
    }
  };

  // fetch currencies (optional) - adjust endpoint if you have one
  const fetchCurrencies = async () => {
    try {
      const res = await axios.get("/currency/justgetall");
      if (Array.isArray(res.data) && res.data.length) {
        setCurrencies(res.data);
        return;
      }
    } catch (err) {
      // ignore, use fallback
    }
    // fallback list (modify as needed)
    setCurrencies([
      { currency_iso: "USD" },
      { currency_iso: "EUR" },
      { currency_iso: "AED" },
      { currency_iso: "GBP" },
    ]);
  };

  useEffect(() => {
    fetchSuppliers();
    fetchCurrencies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validateForm = () => {
    const { supplier_id, total_cost, paid } = formData;
    if (!supplier_id) {
      showNotification("error", "اختر المورد");
      return false;
    }
    if (total_cost === "" || total_cost === null) {
      showNotification("error", "أدخل تكلفة إجمالية صحيحة");
      return false;
    }
    const totalNum = Number(total_cost);
    const paidNum = Number(paid || 0);
    if (isNaN(totalNum) || totalNum < 0) {
      showNotification("error", "التكلفة الإجمالية يجب أن تكون رقمًا غير سالب");
      return false;
    }
    if (isNaN(paidNum) || paidNum < 0) {
      showNotification("error", "المبلغ المدفوع يجب أن يكون رقمًا غير سالب");
      return false;
    }
    if (paidNum > totalNum) {
      showNotification("error", "المبلغ المدفوع لا يمكن أن يتجاوز التكلفة الإجمالية");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        supplier_id: formData.supplier_id, // UUID expected by model
        date_received: formData.date_received || undefined,
        total_cost: formData.total_cost,
        paid: formData.paid || 0,
        currency: (formData.currency || "USD").toString().toUpperCase(),
      };
      await axios.post("/supplier_shipment/create/create", payload);

      showNotification("success", "تمت إضافة شحنة المورد بنجاح");
      setFormData({...initialFormState,date_received:today});

        onUpdated && onUpdated();
        onClose && onClose();
    } catch (err) {
        const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "فشل العملية";
      showNotification("error", message);
    } finally {
      onClose && onClose();
      setIsSubmitting(false);
    }
  };
  const handleCloseModal=()=>{
    setFormData({...initialFormState,date_received:today});
    onClose && onClose();
  }

  return (
    <div className="container my-5" aria-busy={isSubmitting}>


      <h2>إضافة شحنة مورد</h2>

      {isSubmitting && (
        <div
          className="loading-overlay"
          role="status"
          aria-live="polite"
          aria-label="يتم التحميل , الرجاء الإنتظار"
        >
          <div className="spinner" />
        </div>
      )}

      <form onSubmit={handleSubmit} className={isSubmitting ? "disabled-form" : ""}>
        <div className="mb-3">
          <label className="form-label">المورد / Supplier</label>
          <SearchableSelect
            options={suppliers}
            value={formData.supplier_id}
            onChange={(val) => setFormData((p) => ({ ...p, supplier_id: val }))}
            placeholder={loadingSuppliers ? "جاري التحميل..." : "اختر المورد"}
            valueField="uuid"      // adjust if your supplier PK field is different
            displayField="name"    // adjust to supplier display field
            isLoading={loadingSuppliers}
            isClearable={false}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">تاريخ الاستلام / Date Received (اختياري)</label>
          <input
            name="date_received"
            type="date"
            className="form-control"
            value={formData.date_received}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Total Cost / التكلفة الإجمالية</label>
          <input
            name="total_cost"
            type="number"
            step="0.0000001" // supports DECIMAL(14,7)
            className="form-control"
            value={formData.total_cost}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            placeholder="مثال: 1234.5678901"
            min="0"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Paid / المدفوع</label>
          <input
            name="paid"
            type="number"
            step="0.0000001"
            className="form-control"
            value={formData.paid}
            onChange={handleChange}
            disabled={isSubmitting}
            placeholder="مثال: 0 أو 100.00"
            min={"0"}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Currency / العملة</label>
          <SearchableSelect
            options={currencies}
            value={formData.currency}
            onChange={(val) => setFormData((p) => ({ ...p, currency: val }))}
            placeholder="اختر العملة"
            valueField={typeof currencies[0] === "string" ? undefined : "currency_iso"}
            displayField={typeof currencies[0] === "string" ? undefined : "currency_iso"}
            // If currencies are simple strings, the select should handle that; adjust SearchableSelect if needed.
          />
        </div>

  
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={()=>{handleCloseModal()}}>Cancel</button>
      <button type="submit" className="btn btn-primary" disabled={isSubmitting} aria-disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="btn-spinner" aria-hidden="true" /> جاري...
            </>
          ) : (
            "Add Shipment"
          )}
        </button>
                    </div>
      </form>

      <style jsx>{`
        .loading-overlay {
          position: fixed;
          inset: 0;
          background: rgba(255, 255, 255, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }

        .spinner {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          border: 6px solid rgba(0, 0, 0, 0.08);
          border-top-color: rgba(0, 0, 0, 0.5);
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .btn-spinner {
          display: inline-block;
          vertical-align: middle;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: rgba(255, 255, 255, 1);
          margin-right: 8px;
          animation: spin 0.8s linear infinite;
        }

        input[disabled],
        button[disabled] {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default SupplierShipmentAdd;
