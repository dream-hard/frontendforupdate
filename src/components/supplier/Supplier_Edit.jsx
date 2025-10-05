import React, { useEffect, useState } from "react";
import axios from "../../api/fetch";
import useNotification from "../../Hooks/useNotification";
function isJsonString(value) {
  if (typeof value !== "string") return false;
  const s = value.trim();
  if (!s) return false;
  // quick pre-check: JSON text must start with { or [
  if (!(s[0] === "{" || s[0] === "[")) return false;
  try {
    JSON.parse(s);
    return true;
  } catch {
    return false;
  }
}

const EditSupplier = ({ supplier, onClose, onUpdated }) => {
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState({
    id: "", name: "", phoneNumber: "", address: ""
  });
  const [metadataObj, setMetadataObj] = useState({});
  const [metaKey, setMetaKey] = useState("");
  const [metaValue, setMetaValue] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!supplier) {
      setFormData({ id: "", name: "", phoneNumber: "", address: "" });
      setMetadataObj({});
    }else{
  setMetadataObj(supplier.metadata ? isJsonString(supplier.metadata) ? JSON.parse(supplier.metadata):supplier.metadata : {});

setFormData({
    id: supplier.uuid || supplier.name || "",
    name: supplier.name ||  "",
    phoneNumber: supplier.phone_number || "",
    address: supplier.address || ""
});
}
    return;
  }, [supplier]);



  // metadata
  const handleAddMetadata = () => {
    if (!metaKey.trim() || !metaValue.trim()) return;
    setMetadataObj(prev => ({ ...prev, [metaKey]: metaValue }));
    setMetaKey("");
    setMetaValue("");
  };
  const handleRemoveMetadata = (key) => {
    const copy = { ...metadataObj };
    delete copy[key];
    setMetadataObj(copy);
  };

  ////
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e && e.preventDefault && e.preventDefault();
    if (!formData.name || !formData.phoneNumber || !formData.address) {
      showNotification("error", "اكمل الحقول الاساسية");
      return;
    }

    setIsSubmitting(true);
    try {
      if (supplier) {
        // update both directions (your controller has updateRate endpoint)

        
        const data = new FormData();
        data.append("id", supplier.uuid|| formData.id);
        data.append("name", formData.name);
        data.append("address", formData.address);
        data.append("metadata", JSON.stringify(metadataObj || {}));
        const payload = {
          id:supplier.uuid,

          name: formData.name,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
          metadata:JSON.stringify(metadataObj) || {},
        };
        // be robust: call updaterate (patch) endpoint used in your routes
        await axios.post("/supplier/update/updatedsupplier", payload);
        showNotification("success", "تم التحديث");
        onUpdated && onUpdated();
        onClose && onClose();
      } else {
        // create via addRate endpoint
        const payload = {
          name: formData.name,
          phone_number: formData.phoneNumber,
          address: formData.address,
          metadata: {...metadataObj}
        };
        await axios.post("/supplier/create/createsupplier", payload);
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

  if(!supplier)return (<><div>not here</div></>)
  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog modal-lg modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{supplier ? "تعديل المورد" : "اضافة مورد"}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
             <div className="mb-3">
                <label className="form-label">name / اسم المورد</label>
                <input name="name" type="text"  className="form-control" value={formData.name} onChange={handleChange} required />
             </div>
             <div className="mb-3">
                <label className="form-label">Phone Number / رقم الهاتف</label>
                <input name="phoneNumber" type="text" className="form-control" value={formData.phoneNumber} onChange={handleChange} required />
             </div>
             <div className="mb-3">
                <label className="form-label">Metadata</label>
                <div className="d-flex flex-wrap gap-1 mb-2">
                  {Object.entries(metadataObj).map(([k, v], i) => (
                    <span key={i} className="badge bg-primary d-flex align-items-center">
                      {k}: {v}
                      <button type="button" className="btn-close btn-close-white btn-sm ms-1" onClick={() => handleRemoveMetadata(k)}></button>
                    </span>
                  ))}
                </div>
                <div className="input-group">
                  <input type="text" placeholder="Key" className="form-control" value={metaKey} onChange={e => setMetaKey(e.target.value)} />
                  <input type="text" placeholder="Value" className="form-control" value={metaValue} onChange={e => setMetaValue(e.target.value)} />
                  <button type="button" className="btn btn-outline-primary" onClick={handleAddMetadata}>Add</button>
                </div>
              </div>

              <div className="d-flex gap-2">
                <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? <><span className="spinner-border spinner-border-sm"></span><span className="ms-2">جاري...</span></> : (supplier ? "Update Rate" : "Create Rate")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditSupplier;
