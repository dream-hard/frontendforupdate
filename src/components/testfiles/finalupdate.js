import React, { useEffect, useState } from "react";
import axios from "../../api/fetch";
import useNotification from "../../Hooks/useNotification";

/**
 * EditProductModal
 * Props:
 *  - product: the product object (matches your provided structure)
 *  - onClose: () => void
 *  - onUpdated: (updatedProduct) => void
 *  - Categories, Currencies, Statuses, Conditions: optional initial lists
 */
const EditProductModal = ({ product, onClose, onUpdated, Categories , Currencies = [], Statuses = [], Conditions = [],Users=[] }) => {
  const [categories, setCategories] = useState([]);
  const [currencies, setCurrencies] = useState( []);
  const [statuses, setStatuses] = useState([]);
  const [conditions, setConditions] = useState( []);
  const [users,setUsers]=useState([])
  const { showNotification}=useNotification();

  const [formData, setFormData] = useState({
    id: "",
    title: "",
    cat:null,
    currency: null,
    status_id: null,
    condition_id: null,
    user_id:null,
    stock_quantity_fy: 0,
    price: 0,
    original_price: 0,
    warranty_period: 0,
    description: "",
    isactive_name: true,
    isactive_price: true,
    isactive_phonenumber: false,
    isAvailable: true,
    featured: false,
    upcoming: false,
    negotiable: false,
    warranty: false,
    latest: false,
    discount: false,
    softdelete: false,
  });

  // Images
  const [mainImage, setMainImage] = useState(null); // new selected main file
  const [suppImages, setSuppImages] = useState([]); // new selected supplementary files
  const [existingImages, setExistingImages] = useState([]); // from product.Product_images
  const [deletedFilenames, setDeletedFilenames] = useState([]); // filenames to delete on backend

  // Metadata
  const [metadataObj, setMetadataObj] = useState({});
  const [metaKey, setMetaKey] = useState("");
  const [metaValue, setMetaValue] = useState("");

  // Attributes/options
  const [attributes, setAttributes] = useState([]); // { id?, key, value, isNew? }
  const [deleteAttributes, setDeleteAttributes] = useState([]); // existing attribute ids to delete
  const [newAttribute, setNewAttribute] = useState({ key: "", value: "" });

  // fetch option lists (overrides initial props when available)
  useEffect(() => {
     setCategories(Categories)
     setCurrencies(Currencies);
     setStatuses(Statuses);
     setConditions(Conditions);
    setUsers(Users)
  }, [Categories,Currencies,Statuses,Conditions,Users]);

  // populate form from product
useEffect(() => {
  if (!product) return;

  setFormData({
    id: product.uuid || "",
    title: product.title || "",
    cat: product.category_id ? String(product.category_id) : null,
    currency: product.currency_id ? String(product.currency_id) : null,
    user_id: product.user_id ? String(product.user_id) : null,
    status_id: product.status_id ? String(product.status_id) : null,
    condition_id: product.condition_id ? String(product.condition_id) : null,
    stock_quantity_fy: product.stock_quantity_fy || 0,
    price: product.price || 0,
    original_price: product.original_price || 0,
    warranty_period: product.warranty_period || 0,
    description: product.description || "",
    isactive_name: !!product.isactive_name,
    isactive_price: !!product.isactive_price,
    isactive_phonenumber: !!product.isactive_phonenumber,
    isAvailable: !!product.isAvailable,
    featured: !!product.featured,
    upcoming: !!product.upcoming,
    negotiable: !!product.negotiable,
    warranty: !!product.warranty,
    latest: !!product.latest,
    discount: !!product.discount,
    softdelete: !!product.softdelete,
  });

  // images
  setExistingImages(Array.isArray(product.Product_images) ? product.Product_images.slice() : []);
  setMainImage(null);
  setSuppImages([]);
  setDeletedFilenames([]);


  // attributes mapping
  const mappedAttrs = (Array.isArray(product.Product_attributes) ? product.Product_attributes : []).map(pa => {
    const key = pa?.Attribute_option?.Attribute_type?.name || "Attribute";
    const value = pa?.Attribute_option?.name || "";
    return { id: pa.id, key, value, isNew: false };
  });
  setAttributes(mappedAttrs);
  setDeleteAttributes([]);

try {
  setMetadataObj(product.metadata ? JSON.parse(product.metadata) : {});
} catch (e) {
  console.error("Invalid metadata JSON", e);
  setMetadataObj({});
}
}, [product]);


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

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

  // images (new)
  const handleSuppImagesChange = (e) => {
    setSuppImages(prev => [...prev, ...Array.from(e.target.files)]);
  };
  const removeSuppImage = (index) => setSuppImages(prev => prev.filter((_, i) => i !== index));

  // existing image deletion: mark filename and remove from UI
  const removeExistingImage = (filename) => {
    if (!filename) return;
    setDeletedFilenames(prev => Array.from(new Set([...prev, filename])));
    setExistingImages(prev => prev.filter(img => img.filename !== filename));
  };

  // main image removal/replacement
  const removeMainImage = () => {
    if (mainImage) {
      setMainImage(null);
      return;
    }
    const main = existingImages.find(img => img.image_type === "main");
    if (main?.filename) removeExistingImage(main.filename);
  };

  // attributes
  const handleAddAttribute = () => {
    if (!newAttribute.key.trim() || !newAttribute.value.trim()) return;
    setAttributes(prev => [...prev, { ...newAttribute, isNew: true }]);
    setNewAttribute({ key: "", value: "" });
  };
  const handleRemoveAttribute = (index) => {
    const attr = attributes[index];
    if (!attr) return;
    if (!attr.isNew && attr.id) setDeleteAttributes(prev => [...prev, attr.id]);
    setAttributes(prev => prev.filter((_, i) => i !== index));
  };

  const booleanFields = [
    { name: "isactive_name", label: "Active Name" },
    { name: "isactive_price", label: "Active Price" },
    { name: "isactive_phonenumber", label: "Active Phone" },
    { name: "isAvailable", label: "Available" },
    { name: "featured", label: "Featured" },
    { name: "upcoming", label: "Upcoming" },
    { name: "negotiable", label: "Negotiable" },
    { name: "warranty", label: "Warranty" },
    { name: "latest", label: "Latest" },
    { name: "discount", label: "Discount" },
    { name: "softdelete", label: "Soft Delete" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id) {
      alert("Missing product id.");
      return;
    }

    // ensure existing main is deleted if user uploaded a new main
    const existingMain = existingImages.find(img => img.image_type === "main");
    const deleted = [...deletedFilenames];
    if (mainImage && existingMain?.filename && !deleted.includes(existingMain.filename)) {
      deleted.push(existingMain.filename);
    }

    const data = new FormData();
    data.append("id", formData.id);

    // coerce numeric fields to proper types
    const statusVal = Number(formData.status_id || 0);
    const conditionVal = Number(formData.condition_id || 0);
    const quantityVal = Number(formData.stock_quantity_fy || 0);
    const priceVal = parseFloat(formData.price || 0) || 0;
    const originalPriceVal = parseFloat(formData.original_price || 0) || 0;
    const warrantyPeriodVal = Number(formData.warranty_period || 0);

    // map to backend expected fields (including misspellings to be safe)
    data.append("cat", formData.cat || "");
    data.append("status", statusVal);
    data.append("condition", conditionVal);
    data.append('user',formData.user_id);
    data.append("currency", formData.currency || "");
    data.append("title", formData.title || "");
    data.append("quantity", quantityVal);
    data.append("price", priceVal);
    data.append("original_price", originalPriceVal);

    // description & warranty period
    data.append("description", formData.description || "");
    data.append("warranty_peroid", warrantyPeriodVal);

    data.append("active_name", formData.isactive_name ? true : false);
    data.append("active_number", formData.isactive_phonenumber ? true : false);
    data.append("active_prcie", formData.isactive_price ? true : false); // backend typo
    data.append("active_price", formData.isactive_price ? true: false);
    data.append("available", formData.isAvailable ? true: false);
    data.append("featured", formData.featured ? true: false);
    data.append("upcoming", formData.upcoming ? true: false);
    data.append("negotiable", formData.negotiable ? true : false);
    data.append("warranty", formData.warranty ? true: false);
    data.append("latest", formData.latest ? true: false);
    data.append("discount", formData.discount ? true : false);
    data.append("softdelete", formData.softdelete ? true : false);

    // metadata
    data.append("metadata", JSON.stringify(metadataObj || {}));

    // attributes: send only new attributes and send deleted attribute ids
    const newAttrs = attributes
      .filter(a => a.isNew)
      .map(a => ({ key: a.key.trim(), value: a.value.trim() }));
    data.append("attributes", JSON.stringify(newAttrs));
    data.append("delete_attributes", JSON.stringify(deleteAttributes || []));

    // files: main + supp with image_type markers
    if (mainImage) {
      data.append("files", mainImage);
      data.append(`image_type_${mainImage.name}`, "main");
    }
    suppImages.forEach(file => {
      data.append("files", file);
      data.append(`image_type_${file.name}`, "sup");
    });

    // deleted existing image filenames
    data.append("delete_filenames", JSON.stringify(deleted));

    try {
      console.log(formData)
      const res = await axios.patch("/product/update/updateproductwithimages", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showNotification('success',"لقد تم تحديث المنتج بنجاح")
      onUpdated && onUpdated(res.data.product || {});
      onClose && onClose();
      
      
    } catch (err) {
      showNotification("error",(err?.response?.data?.message || err.message));
    }
  };

  if (!product) return null;

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
              {/* Title */}
              <div className="mb-3">
                <label className="form-label">Title</label>
                <input type="text" className="form-control" name="title" value={formData.title} onChange={handleChange} required />
              </div>

              {/* Price / Original */}
              <div className="row mb-3">
                <div className="col">
                  <label className="form-label">Price</label>
                  <input type="number" step="0.01" className="form-control" name="price" value={formData.price} onChange={handleChange} />
                </div>
                <div className="col">
                  <label className="form-label">Original Price</label>
                  <input type="number" step="0.01" className="form-control" name="original_price" value={formData.original_price} onChange={handleChange} />
                </div>
              </div>

              {/* Stock */}
              <div className="mb-3">
                <label className="form-label">Stock Quantity</label>
                <input type="number" className="form-control" name="stock_quantity_fy" value={formData.stock_quantity_fy} onChange={handleChange} />
              </div>

              {/* Warranty period (editable) */}
              <div className="mb-3">
                <label className="form-label">Warranty Period (months)</label>
                <input
                  type="number"
                  className="form-control"
                  name="warranty_period"
                  value={formData.warranty_period}
                  onChange={handleChange}
                  min={0}
                />
              </div>

              {/* Description (editable) */}
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              {/* Boolean cards */}
              <div className="mb-3 d-flex flex-wrap gap-3">
                {booleanFields.map(f => (
                  <div key={f.name} className="card p-3 checkbox-card" style={{ minWidth: "150px", flex: "1 1 150px", cursor: "pointer" }} onClick={() => handleChange({ target: { name: f.name, type: "checkbox", checked: !formData[f.name] } })}>
                    <span className="fw-bold mb-2 d-block">{f.label}</span>
                    <div className="form-switch-custom">
                      <input type="checkbox" id={f.name} name={f.name} checked={formData[f.name]} onChange={handleChange} className="form-switch-input" />
                      <label htmlFor={f.name} className="form-switch-label"><span className="form-switch-button"></span></label>
                    </div>
                    <small className="text-muted mt-1">{formData[f.name] ? "Enabled" : "Disabled"}</small>
                  </div>
                ))}
              </div>

              {/* Metadata, images, attributes, selects... (unchanged) */}
              {/* Metadata */}
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

              {/* Main Image */}
              <div className="mb-3">
                <h3>Main Image</h3>
                {mainImage ? (
                  <div className="card mb-2" style={{ width: "150px" }}>
                    <img src={URL.createObjectURL(mainImage)} className="card-img-top" alt="Main" />
                    <div className="card-body p-2 text-center">
                      <button type="button" className="btn btn-sm btn-danger" onClick={removeMainImage}>Delete</button>
                    </div>
                  </div>
                ) : existingImages.find(img => img.image_type === "main") ? (
                  (() => {
                    const m = existingImages.find(img => img.image_type === "main");
                    return (
                      <div className="card mb-2" style={{ width: "150px" }}>
                        <img src={`${m.filename}`} className="card-img-top" alt="Main" />
                        <div className="card-body p-2 text-center">
                          <button type="button" className="btn btn-sm btn-danger" onClick={() => removeExistingImage(m.disk_filename)}>Delete</button>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <input type="file" accept="image/*" onChange={e => setMainImage(e.target.files[0])} className="form-control" />
                )}
              </div>

              {/* Supplementary Images */}
              <div className="mb-3">
                <h3>Supplementary Images</h3>
                <input type="file" accept="image/*" multiple onChange={handleSuppImagesChange} className="form-control mb-2" />
                <div className="d-flex flex-wrap gap-2">
                  {suppImages.map((img, idx) => (
                    <div key={idx} className="card" style={{ width: "120px", position: "relative" }}>
                      <img src={URL.createObjectURL(img)} className="card-img-top" alt={`Supp ${idx}`} />
                      <button type="button" className="btn btn-sm btn-danger" style={{ position: "absolute", top: "5px", right: "5px", borderRadius: "50%", padding: "0.25rem 0.5rem" }} onClick={() => removeSuppImage(idx)}>&times;</button>
                    </div>
                  ))}

                  {existingImages.filter(img => img.image_type !== "main").map((img, idx) => (
                    <div key={idx} className="card" style={{ width: "120px", position: "relative" }}>
                      <img src={`${img.filename}`} className="card-img-top" alt={`Supp ${idx}`} />
                      <button type="button" className="btn btn-sm btn-danger" style={{ position: "absolute", top: "5px", right: "5px", borderRadius: "50%", padding: "0.25rem 0.5rem" }} onClick={() => removeExistingImage(img.disk_filename)}>&times;</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attributes / Options */}
              <div className="mb-3">
                <label className="form-label">Attributes / Options</label>
                <div className="d-flex gap-2 mb-2">
                  <input type="text" placeholder="Key" className="form-control" value={newAttribute.key} onChange={e => setNewAttribute(prev => ({ ...prev, key: e.target.value }))} />
                  <input type="text" placeholder="Value" className="form-control" value={newAttribute.value} onChange={e => setNewAttribute(prev => ({ ...prev, value: e.target.value }))} />
                  <button type="button" className="btn btn-outline-primary" onClick={handleAddAttribute}>Add</button>
                </div>
                <div className="d-flex flex-wrap gap-1">
                  {attributes.map((attr, idx) => (
                    <span key={idx} className="badge bg-secondary d-flex align-items-center">
                      {attr.key}: {attr.value}
                      <button type="button" className="btn-close btn-close-white btn-sm ms-1" onClick={() => handleRemoveAttribute(idx)}></button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Category / Currency / Status / Condition */}
              <div className="mb-3">
                <label className="form-label">Category</label>
                <select className="form-select" name="cat" value={formData.cat} onChange={handleChange} required>
                  <option value="">Select category</option>
  {categories?.map(c => (
    <option key={c.uuid} value={c.uuid}>
      {c.name}
    </option>
  ))}
             </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Currency</label>
                <select className="form-select" name="currency" value={formData.currency} onChange={handleChange} required>
                  <option value="">Select currency</option>
{currencies?.map(c => (
  <option key={c.uuid || c.currency_iso} value={c.currency_iso || c.uuid}>
    {c.currency_iso || c.symbol || c.name}
  </option>
))}
              </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Status</label>
                <select className="form-select" name="status_id" value={formData.status_id} onChange={handleChange} required>
                  <option value="">Select status</option>
{statuses?.map(s => (
  <option key={s.id} value={s.id}>
    {s.statu}
  </option>
))}
           </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Condition</label>
                <select className="form-select" name="condition_id" value={formData.condition_id} onChange={handleChange} required>
                  <option value="">Select condition</option>
{conditions?.map(c => (
  <option key={c.id} value={c.id}>
    {c.condition}
  </option>
))}
          </select>
              </div>
                <div className="mb-3">
                <label className="form-label">Seller</label>
                <select className="form-select" name="user_id" value={formData.user_id} onChange={handleChange} required>
                  <option value="">Select condition</option>
{users?.map(u => (
  <option key={u.uuid} value={u.uuid}>
    {u.name}
  </option>
))}         </select>
              </div>

              <button type="submit" className="btn btn-primary">Update Product</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProductModal;
