import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/fetch";
import useNotification from "../../Hooks/useNotification";

const CurrencyAdd = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState({
    iso: "",
    name: "",
    symbol: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false); // loading state

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    if (["price", "original_price"].includes(name)) {
      const floatVal = value === "" ? "" : parseFloat(value);
      setFormData((prev) => ({ ...prev, [name]: floatVal }));
      return;
    }

    if (["stock_quantity_fy", "warranty_period"].includes(name)) {
      const intVal = value === "" ? "" : parseInt(value, 10);
      setFormData((prev) => ({ ...prev, [name]: intVal }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // prevent double submit

    setIsSubmitting(true);

    const data = {
      iso: formData.iso ?? "",
      name: formData.name ?? "",
      symbol: formData.symbol ?? ""
    };
    try {
     
const res = await axios.post(
  "/currency/create/createCurrency",
  data, // body
);

      showNotification("success", "تمت اضافة العملة بنجاح");
      // navigate to currency dashboard. Keep it absolute or relative as needed
      navigate("/dashboard/currency");
    } catch (err) {
      showNotification("error", err.response?.data?.error || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container my-5" aria-busy={isSubmitting}>
        <button className="mb-3 btn btn-danger" onClick={()=>{navigate('/dashboard/currency')}}>
                  <span style={{ fontSize: "1.5rem", marginLeft: "8px" }}>→</span>
العودة </button>
   

      <h2>Add Currency</h2>

      {/* Loading overlay */}
      {isSubmitting && (
        <div
          className="loading-overlay"
          role="status"
          aria-live="polite"
          aria-label="Submitting, please wait"
        >
          <div className="spinner" />
        </div>
      )}
<div className="alert alert-warning text-center fw-semibold py-2" role="alert">
  ⚠️ <strong>تنبيه:</strong> يرجى عند إضافة عملة جديدة إضافة صرافات جديدة مع كل العملات الموجودة .
</div>
      <form onSubmit={handleSubmit} className={isSubmitting ? "disabled-form" : ""}>
        <div className="mb-3">
          <label className="form-label">ISO / الرمز</label>
          <input
            type="text"
            className="form-control"
            name="iso"
            value={formData.iso}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">name / الاسم</label>
          <input
            type="text"
            className="form-control"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Symbol / الشكل</label>
          <input
            type="text"
            className="form-control"
            name="symbol"
            value={formData.symbol}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
          aria-disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="btn-spinner" aria-hidden="true" /> Saving...
            </>
          ) : (
            "Add Product"
          )}
        </button>
      </form>

      {/* Styles: spinner + overlay + small niceties */}
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

        /* optional: make inputs visibly disabled */
        input[disabled],
        button[disabled] {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default CurrencyAdd;
