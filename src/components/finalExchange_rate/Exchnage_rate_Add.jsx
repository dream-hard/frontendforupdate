import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/fetch";
import useNotification from "../../Hooks/useNotification";
import SearchableSelect from "../seachselect/searchselect";

const ExchangeRateAdd = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  
  const [formData, setFormData] = useState({
    base: "",
    target: "",
    rate: "",
    date: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currencies,setCurrencies]=useState([])
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: value === "" ? "" : value }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // basic validation
    const { base, target, rate } = formData;
    if (!base || !target || !rate) {
      showNotification("error", "رجاءً املأ الحقول الأساسية");
      return;
    }
    // if (base.trim().toUpperCase() === target.trim().toUpperCase()) {
    //   showNotification("error", "العملة الأساسية لا يمكن أن تكون نفس العملة الهدف");
    //   return;
    // }

    setIsSubmitting(true);
    try {
      const payload = {
        base: formData.base.trim().toUpperCase(),
        target: formData.target.trim().toUpperCase(),
        rate: String(formData.rate),
        date: formData.date || undefined,
      };

      // call the addRate endpoint (creates direct + reverse)
      await axios.post("/exch_rate/create/addrate", payload);

      showNotification("success", "تمت إضافة سعر الصرف بنجاح");
      navigate("/dashboard/exchange_rate");
    } catch (err) {
      showNotification("error", err?.response?.data?.error || err?.response?.data?.message || err?.message || "فشل العملية");
    } finally {
      setIsSubmitting(false);
    }
  };

      const fetchcurrencies=async()=>{
      try {
        const curs=await axios.get('/currency/justgetall');

        setCurrencies(curs.data);
      } catch (error) {
      }
    }
  useEffect(()=>{
    try {
      fetchcurrencies();
    } catch (error) {

        showNotification('error',"لا يوجد اس منتج")
    }
    return ;
  },[])
  return (
    <div className="container my-5" aria-busy={isSubmitting}>
      <button className="mb-3 btn btn-danger" onClick={() => { navigate('/dashboard/exchange_rate'); }}>
        <span style={{ fontSize: "1.2rem", marginLeft: "8px" }}>→</span> العودة
      </button>

      <h2>إضافة سعر صرف</h2>

      {isSubmitting && (
        <div className="loading-overlay" role="status" aria-live="polite" aria-label="يتم التحميل , الرجاء الإنتظار">
          <div className="spinner" />
        </div>
      )}

      <form onSubmit={handleSubmit} className={isSubmitting ? "disabled-form" : ""}>
       
<div className="mb-3">
  <label className="form-label">Base (ISO) / العملة الأساسية</label>
<SearchableSelect
  options={currencies}
  value={formData.base}
  onChange={(val) => setFormData((p) => ({ ...p, base: val }))}
  placeholder="اختر العملة الأساسية"
    valueField="currency_iso"
  displayField="currency_iso"
/>
</div>
<div className="mb-3">
  <label className="form-label">Target (ISO) / العملة الهدف</label>

<SearchableSelect
  options={currencies}
  value={formData.target}
  onChange={(val) => setFormData((p) => ({ ...p, target: val }))}
  placeholder="اختر العملة الهدف"
  valueField="currency_iso"
  displayField="currency_iso"
/>
</div>
        <div className="mb-3">
          <label className="form-label">Exchange Rate / سعر الصرف</label>
          <input
            name="rate"
            type="number"
            step="0.0000000001"
            className="form-control"
            value={formData.rate}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            placeholder="مثال: 0.8452"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Date of Start / تاريخ البداية (اختياري)</label>
          <input
            name="date"
            type="date"
            className="form-control"
            value={formData.date}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={isSubmitting} aria-disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="btn-spinner" aria-hidden="true" /> جاري...
            </>
          ) : (
            "Add Rate"
          )}
        </button>
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
          to { transform: rotate(360deg); }
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

        input[disabled], button[disabled] { opacity: 0.7; cursor: not-allowed; }
      `}</style>
    </div>
  );
};

export default ExchangeRateAdd;
