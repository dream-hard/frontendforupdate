import React, { useEffect, useState } from "react";
import axios from "../../api/fetch";
import useNotification from "../../Hooks/useNotification";
import SearchableSelect from "../seachselect/searchselect";

const EditExchangeRate = ({ rate, onClose, onUpdated }) => {
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState({
    base: "", target: "", rateValue: "", date: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currencies,setCurrencies]=useState([])
  useEffect(() => {
    if (!rate) {
      setFormData({ base: "", target: "", rateValue: "", date: "" });
      return;
    }
    setFormData({
      base: rate.base_currency_id || rate.base || "",
      target: rate.target_currency_id || rate.target || "",
      rateValue: rate.exchange_rate || rate.rate || "",
      date: rate.dateofstart || rate.date || ""
    });
  }, [rate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e && e.preventDefault && e.preventDefault();
    if (!formData.base || !formData.target || !formData.rateValue) {
      showNotification("error", "اكمل الحقول الاساسية");
      return;
    }

    setIsSubmitting(true);
    try {
      if (rate) {
        // update both directions (your controller has updateRate endpoint)
        const payload = {
          base_edit: formData.base,
          target_edit: formData.target,
          base: rate.base_currency_id || rate.base,
          target: rate.target_currency_id || rate.target,
          rate: formData.rateValue,
          date: formData.date || undefined
        };

        // be robust: call updaterate (patch) endpoint used in your routes
        await axios.patch("/exch_rate/update/updaterate", payload);
        showNotification("success", "تم التحديث");
        onUpdated && onUpdated();
        onClose && onClose();
      } else {
        // create via addRate endpoint
        const payload = {
          base: formData.base,
          target: formData.target,
          rate: formData.rateValue,
          date: formData.date || undefined
        };
        await axios.post("/exch_rate/create/addrate", payload);
        showNotification("success", "تم الإضافة");
        onUpdated && onUpdated();
        onClose && onClose();
      }
    } catch (err) {
      showNotification("error", err?.response?.data?.message || err?.response?.data || err.message || "فشل العملية");
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
  },[]);

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog modal-lg modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{rate ? "تعديل سعر الصرف" : "اضافة سعر جديد"}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
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
                <label className="form-label">Exchange Rate</label>
                <input name="rateValue" type="number" step="0.0000000001" className="form-control" value={formData.rateValue} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Date of Start</label>
                <input name="date" type="date" className="form-control" value={formData.date} onChange={handleChange} />
              </div>

              <div className="d-flex gap-2">
                <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? <><span className="spinner-border spinner-border-sm"></span><span className="ms-2">جاري...</span></> : (rate ? "Update Rate" : "Create Rate")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditExchangeRate;
