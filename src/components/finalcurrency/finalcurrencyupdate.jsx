// import React, { useEffect, useState } from "react";
// import axios from "../../api/fetch";
// import useNotification from "../../Hooks/useNotification";

// /**
//  * EditProductModal
//  * Props:
//  *  - product: the product object (matches your provided structure)
//  *  - onClose: () => void
//  *  - onUpdated: (updatedProduct) => void
//  *  - Categories, Currencies, Statuses, Conditions: optional initial lists
//  */
// const EditCurrency = ({ currency, onClose, onUpdated}) => {
//   const { showNotification}=useNotification();

//   const [formData, setFormData] = useState({
//     currency_iso:"",
//     name:"",
//     symbol:""
//   });

//   // Images

//   // Metadata

//   // Attributes/options

//   // fetch option lists (overrides initial props when available)


//   // populate form from product
// useEffect(() => {
//   if (!currency) return;

//   setFormData({
//     currency_iso:currency.currency_iso || "",
//     name:currency.name|| "",
//     symbol:currency.symbol || ""
//   });

//   // images



//   // attributes mapping


// }, [currency]);


//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
//   };


//   const handleSubmit = async (e) => {
//     e.preventDefault();


//     // ensure existing main is deleted if user uploaded a new main

//     const data = new FormData();
//     data.append("iso", formData.currency_iso);

//     // coerce numeric fields to proper types

//     // map to backend expected fields (including misspellings to be safe)
//     data.append("name", formData.name || "");
//     data.append("symbol", formData.symbol);
    
//     try {
  
//       const res = await axios.patch("/currency/update/updateCurrency", data, {
//       });
//       showNotification('success',"لقد تم تحديث المنتج بنجاح")
//       onUpdated && onUpdated();
//       onClose && onClose();
      
      
//     } catch (err) {
//       showNotification("error",(err?.response?.data?.message || err.message));
//     }
//   };

//   if (!currency) return null;

//   return (
//     <div className="modal show d-block" tabIndex="-1">
//       <div className="modal-dialog modal-xl modal-dialog-scrollable">
//         <div className="modal-content">
//           <div className="modal-header">
//             <h5 className="modal-title">Edit Product</h5>
//             <button type="button" className="btn-close" onClick={onClose}></button>
//           </div>

//           <div className="modal-body">
//             <form onSubmit={handleSubmit}>
//               {/* Title */}
//               <div className="mb-3">
//                 <label className="form-label">ISO / الرمز</label>
//                 <input type="text" className="form-control" name="iso" value={formData.currency_iso} onChange={handleChange} required />
//               </div>
//               <div className="mb-3">
//                 <label className="form-label">NAME / الاسم</label>
//                 <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required />
//               </div>
//               <div className="mb-3">
//                 <label className="form-label">Symbol / الشكل</label>
//                 <input type="text" className="form-control" name="symbol" value={formData.symbol} onChange={handleChange} required />
//               </div>



//               <button type="submit" className="btn btn-primary">Update Currncey</button>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EditCurrency;

import React, { useEffect, useState } from "react";
import axios from "../../api/fetch";
import useNotification from "../../Hooks/useNotification";

const EditCurrency = ({ currency, onClose, onUpdated }) => {
  const { showNotification } = useNotification();

  // use keys that match the input `name` attributes and backend expectation
  const [formData, setFormData] = useState({
    iso: "",
    name: "",
    symbol: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!currency) return;
    setFormData({
      iso: currency.currency_iso || "",
      name: currency.name || "",
      symbol: currency.symbol || ""
    });
  }, [currency]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Send JSON — no FormData, no multipart, no multer required on server
      const payload = {
        iso: currency.currency_iso ?? "",
        iso_edit:formData.iso ?? "", // in case iso is the identifier and cannot be changed
        name: formData.name ?? "",
        symbol: formData.symbol ?? ""
      };

      // axios.patch(url, data) will send application/json
      const res = await axios.patch("/currency/update/updateCurrency", payload);

      showNotification("success", "لقد تم تحديث المنتج بنجاح");
      onUpdated && onUpdated(res.data?.currency ?? null);
      onClose && onClose();
    } catch (err) {
      // show server message when available
      showNotification("error", (err?.response?.data?.error || err?.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currency) return null;

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog modal-xl modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit Product</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">ISO / الرمز</label>
                <input
                  type="text"
                  className="form-control"
                  name="iso"
                  value={formData.iso}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">NAME / الاسم</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
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
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span className="ms-2">جاري الحفظ...</span>
                  </>
                ) : (
                  "Update Currency"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCurrency;
