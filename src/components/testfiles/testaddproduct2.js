import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/fetch";
import useNotification from "../../Hooks/useNotification";

const AddProductPage2 = () => {
  const navigate=useNavigate();
  const {showNotification}=useNotification();
  const [mainImage, setMainImage] = useState(null);
  const [suppImages, setSuppImages] = useState([]);
  
  // Metadata
  const [metadataObj, setMetadataObj] = useState({});
  const [metaKey, setMetaKey] = useState("");
  const [metaValue, setMetaValue] = useState("");
  
  const [currencies, setCurrencies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [conditions, setConditions] = useState([]);
  
  // All product attributes

  const [formData, setFormData] = useState({
  title: "",
  category_id: null,
  currency: null,
  status_id: 1,
  condition_id: 1,
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


  useEffect(() => {
    axios.get("/category/justgetall").then(res => setCategories(res.data));
    axios.get("/currency/justgetall").then(res => setCurrencies(res.data));

  }, []);
useEffect(() => {
  axios.get("/productstatus/justgetall").then(res => setStatuses(res.data));
  axios.get("/productcondition/justgetall").then(res => setConditions(res.data));
}, []);
  
  // Input change handler
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // Metadata handlers
  const handleAddMetadata = () => {
    if (metaKey.trim() && metaValue.trim()) {
      setMetadataObj(prev => ({ ...prev, [metaKey]: metaValue }));
      setMetaKey("");
      setMetaValue("");
    }
  };

  const handleRemoveMetadata = (key) => {
    const newMeta = { ...metadataObj };
    delete newMeta[key];
    setMetadataObj(newMeta);
  };

  // Image handlers
  const handleSuppImagesChange = (e) => {
    setSuppImages(prev => [...prev, ...Array.from(e.target.files)]);
  };

  const removeSuppImage = (index) => {
    setSuppImages(prev => prev.filter((_, idx) => idx !== index));
  };


  const removeMainImage = () => setMainImage(null);


const handleSubmit = async (e) => {
  e.preventDefault();
  const data = new FormData();

  // 1️⃣ Append Images
  if (mainImage) {
    data.append("files", mainImage);
    data.append(`image_type_${mainImage.name}`, "main");
  }
  suppImages.forEach(file => {
    data.append("files", file);
    data.append(`image_type_${file.name}`, "sup");
  });

  // 2️⃣ Append Metadata
  data.append("metadata", JSON.stringify(metadataObj));

  // 3️⃣ Append All Form Fields with correct types
  Object.keys(formData).forEach(key => {
    let value = formData[key];

    // Convert booleans properly
    if (typeof value === "boolean") value = value;

    // Ensure required fields exist
    if (["status_id", "condition_id", "category_id"].includes(key)) {
      if (!value) {
        throw new Error(`${key} is required and cannot be empty`);
      }
    }

    data.append(key, value);
  });

  try {
    const res = await axios.post("/product/create/createproductwithimages", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    showNotification("success","تمت اضافة النتج بنجاح");
    navigate(-1);

  } catch (err) {
    showNotification(
      "error",
      err.response?.data?.error || err.message
    );
  }
};



  // Boolean fields for toggle switches
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
  ];

  return (
    <div className="container my-5">
      <h2>Add Product</h2>
      <form onSubmit={handleSubmit} >

        {/* Title & Slug */}
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input type="text" className="form-control" name="title" value={formData.title} onChange={handleChange} required />
        </div>

        {/* Price & Stock */}
        <div className="row mb-3">
          <div className="col">
            <label className="form-label">Price</label>
            <input type="number" className="form-control" min={1}  name="price" value={formData.price} onChange={handleChange} />
          </div>
          <div className="col">
            <label className="form-label">Original Price</label>
            <input type="number" className="form-control" min={1} name="original_price" value={formData.original_price} onChange={handleChange} />
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label">Stock Quantity</label>
          <input type="number" className="form-control" min={0} name="stock_quantity_fy" value={formData.stock_quantity_fy} onChange={handleChange} />
        </div>

        {/* Boolean switches */}

        {/* Metadata */}
        <div className="mb-3">
          <label className="form-label">Metadata</label>
          <div className="d-flex flex-wrap gap-1 mb-2">
            {Object.entries(metadataObj).map(([key, value], idx) => (
              <span key={idx} className="badge bg-primary d-flex align-items-center">
                {key}: {value}
                <button
                  type="button"
                  className="btn-close btn-close-white btn-sm ms-1"
                  aria-label="Remove"
                  onClick={() => handleRemoveMetadata(key)}
                ></button>
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
                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  style={{ position: "absolute", top: "5px", right: "5px", borderRadius: "50%", padding: "0.25rem 0.5rem" }}
                  onClick={() => removeSuppImage(idx)}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>

{/* Warranty Period */}
<div className="mb-3">
  <label className="form-label">Warranty Period (months)</label>
  <input
    type="number"
    min={0}
    className="form-control"
    name="warranty_period"
    value={formData.warranty_period}
    onChange={handleChange}
  />
</div>

{/* Description */}
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
        
        {/* Category & Currency */}
        <div className="mb-3">
          <label className="form-label">Category</label>
          <select className="form-select" name="category_id" value={formData.category_id} onChange={handleChange} required>
            <option value="">Select category</option>
            {categories.map(c => <option key={c.uuid} value={c.uuid}>{c.name}</option>)}
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Currency</label>
          <select className="form-select" name="currency" value={formData.currency} onChange={handleChange} required>
            <option value="">Select currency</option>
            {currencies.map(c => <option key={c.uuid} value={c.uuid}>{c.currency_iso}</option>)}
          </select>
        </div>
{/* Status */}
<div className="mb-3">
  <label className="form-label">Status</label>
  <select
    className="form-select"
    name="status_id"
    value={formData.status_id}
    onChange={handleChange}
    required
  >
    <option value="">Select status</option>
    {statuses.map(s => (
      <option key={s.id} value={s.id}>{s.statu}</option>
    ))}
  </select>
</div>

{/* Condition */}
<div className="mb-3">
  <label className="form-label">Condition</label>
  <select
    className="form-select"
    name="condition_id"
    value={formData.condition_id}
    onChange={handleChange}
    required
  >
    <option value="">Select condition</option>
    {conditions.map(c => (
      <option key={c.id} value={c.id}>{c.condition}</option>
    ))}
  </select>
</div>

<div className="mb-3 d-flex flex-wrap gap-3">
  {booleanFields.map(field => (
    <div 
      key={field.name} 
      className="card p-3 checkbox-card"
      style={{ minWidth: "150px", flex: "1 1 150px", cursor: "pointer" }}
onClick={(e) => {
    e.stopPropagation();
    handleChange({ target: { name: field.name, type: "checkbox", checked: !formData[field.name] } })
}}    >
      <span className="fw-bold mb-2 d-block">{field.label}</span>
      <div  className="form-switch-custom">
        <input
          type="checkbox"
          id={field.name}
          name={field.name}
          checked={formData[field.name]}
          onChange={handleChange}
          className="form-switch-input"
          
        />
        <label  htmlFor={field.name} className="form-switch-label">
          <span  className="form-switch-button"></span>
        </label>
      </div>
      <small className="text-muted mt-1">{formData[field.name] ? "Enabled" : "Disabled"}</small>
    </div>
  ))}
</div>


{/* Soft Delete */}
<div className="form-check form-switch mb-3">
  <input
    type="checkbox"
    className="form-check-input"
    id="softdelete"
    name="softdelete"
    checked={formData.softdelete}
    onChange={handleChange}
  />
  <label className="form-check-label" htmlFor="softdelete">
    Soft Delete
  </label>
</div>


<style jsx>{`
  .checkbox-card {
    transition: all 0.3s ease;
    border-radius: 10px;
    background-color: #f8f9fa;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  }

  .checkbox-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.15);
    background-color: #e9ecef;
  }

  .form-switch-custom {
    position: relative;
    width: 50px;
    height: 24px;
  }

  .form-switch-input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .form-switch-label {
    position: absolute;
    cursor: pointer;
    background-color: #ccc;
    border-radius: 30px;
    top: 0; left: 0; right: 0; bottom: 0;
    transition: background-color 0.3s;
  }

  .form-switch-label .form-switch-button {
    position: absolute;
    height: 20px;
    width: 20px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    border-radius: 50%;
    transition: transform 0.3s;
  }

  .form-switch-input:checked + .form-switch-label {
    background-color: #4caf50;
  }

  .form-switch-input:checked + .form-switch-label .form-switch-button {
    transform: translateX(26px);
  }
`}</style>

        <button type="submit" className="btn btn-primary">Add Product</button>
      </form>
    </div>
  );
};

export default AddProductPage2;
