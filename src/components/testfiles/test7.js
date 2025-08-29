import { useState,useRef,useEffect } from "react";
import axios from '../../api/fetch'
import Sidebar from "./testsidenav"
import { data, NavLink } from "react-router-dom";

import ProductDetailsModern from "./datatest3";
import EditProductModal from "./finalupdate";
import useNotification from "../../Hooks/useNotification";

const orderOptions = [
  // UUID
  { label: "UUID Asc", value: "uuid-asc" },
  { label: "UUID Desc", value: "uuid-desc" },

  // Relations
  { label: "Category Asc", value: "category-asc" },
  { label: "Category Desc", value: "category-desc" },
  { label: "User Asc", value: "user-asc" },
  { label: "User Desc", value: "user-desc" },
  { label: "Status Asc", value: "status-asc" },
  { label: "Status Desc", value: "status-desc" },
  { label: "Condition Asc", value: "condition-asc" },
  { label: "Condition Desc", value: "condition-desc" },
  { label: "Currency Asc", value: "currency-asc" },
  { label: "Currency Desc", value: "currency-desc" },

  // Basic fields
  { label: "Title Asc", value: "title-asc" },
  { label: "Title Desc", value: "title-desc" },
  { label: "Slug Asc", value: "slug-asc" },
  { label: "Slug Desc", value: "slug-desc" },

  // Numbers
  { label: "Stock Asc", value: "stock-asc" },
  { label: "Stock Desc", value: "stock-desc" },
  { label: "Price Asc", value: "price-asc" },
  { label: "Price Desc", value: "price-desc" },
  { label: "Original Price Asc", value: "original_price-asc" },
  { label: "Original Price Desc", value: "original_price-desc" },
  { label: "Warranty Period Asc", value: "warranty_period-asc" },
  { label: "Warranty Period Desc", value: "warranty_period-desc" },

  // Flags / Booleans
  { label: "Active Name Asc", value: "active_name-asc" },
  { label: "Active Name Desc", value: "active_name-desc" },
  { label: "Active Price Asc", value: "active_price-asc" },
  { label: "Active Price Desc", value: "active_price-desc" },
  { label: "Active Phone Asc", value: "active_phone-asc" },
  { label: "Active Phone Desc", value: "active_phone-desc" },
  { label: "Available Asc", value: "available-asc" },
  { label: "Available Desc", value: "available-desc" },
  { label: "Featured Asc", value: "featured-asc" },
  { label: "Featured Desc", value: "featured-desc" },
  { label: "Upcoming Asc", value: "upcoming-asc" },
  { label: "Upcoming Desc", value: "upcoming-desc" },
  { label: "Negotiable Asc", value: "negotiable-asc" },
  { label: "Negotiable Desc", value: "negotiable-desc" },
  { label: "Warranty Asc", value: "warranty-asc" },
  { label: "Warranty Desc", value: "warranty-desc" },
  { label: "Latest Asc", value: "latest-asc" },
  { label: "Latest Desc", value: "latest-desc" },
  { label: "Discount Asc", value: "discount-asc" },
  { label: "Discount Desc", value: "discount-desc" },
  { label: "Soft Delete Asc", value: "softdelete-asc" },
  { label: "Soft Delete Desc", value: "softdelete-desc" },

  // Timestamps
  { label: "Created At Asc", value: "created-asc" },
  { label: "Created At Desc", value: "created-desc" },
  { label: "Updated At Asc", value: "updated-asc" },
  { label: "Updated At Desc", value: "updated-desc" },
];

 const initialFilters = {
    id: "", id_enabled: false,
    category_ids: "", category_enabled: false,
    price: 0, price_enabled: false, price_dir: "eq",
    user_id: "", user_id_enabled: false,
    status_id: "", status_id_enabled: false,
    condition_id: "", condition_id_enabled: false,
    currency: "", currency_enabled: false,
    title: "", title_enabled: false,
    product_slug: "", product_slug_enabled: false,
    slugs: [], slugs_enabled: false,
    quantity_foryou: 0, quantity_foryou_enabled: false, quantity_dir: "eq",
    isactive_name: false, isactive_name_enabled: false,
    isactive_phonenumber: false, isactive_phonenumber_enabled: false,
    isactive_price: false, isactive_price_enabled: false,
    isAvailable: false, isAvailable_enabled: false,
    featured: false, featured_enabled: false,
    upcoming: false, upcoming_enabled: false,
    negotiable: false, negotiable_enabled: false,
    warranty: false, warranty_enabled: false,
    warranty_period: 0, warranty_period_enabled: false, warranty_period_dir: "eq",
    latest: false, latest_enabled: false,
    discount: false, discount_enabled: false,
    original_price: 0, original_price_enabled: false, original_price_dir: "eq",
    includedeletedcategory: false, includedeletedcategory_enabled: false,
    onlyDeletedCategory: false, onlyDeletedCategory_enabled: false,
    softdelete: false, softdelete_enabled: false,
    attribute_option_ids: [], attribute_option_ids_enabled: false,
  };


export default function Test7() {
const {showNotification}=useNotification();
const [productsStatus, setProductsStatus] = useState("idle"); // idle, loading, success, error
const [selectedItemStatus, setSelectedItemStatus] = useState("idle"); // idle, loading, success, error
const [productsError, setProductsError] = useState(null);
const [selectedItemError, setSelectedItemError] = useState(null);

const [showEditModal, setShowEditModal] = useState(false);
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [selectedProduct, setSelectedProduct] = useState(null);
const handleEditClick = (item) => {
  fetchSelectedProduct(item)
  setSelectedProduct(selectedItem);
  setShowEditModal(true);
};
const handleDeleteClick = (item) => {
    fetchSelectedProduct(item)

  setSelectedProduct(selectedItem);
  setShowDeleteModal(true);
};
const handleCloseModals = () => {
  setShowEditModal(false);
  setShowDeleteModal(false);
  setSelectedProduct(null);
};

    const [status,setStatus]=useState({});
    const [condition,setCondition]=useState({});
    const [users,setUsers]=useState({});
    const [categories,setCategories]=useState({});
    const [currencies,setCurrencies]=useState({});
    const [nestcat,setNestcat]=useState([]);

    const fetchsubmenucategory=async()=>{
      try {
        const cats=await axios.post('/category/getallnestedcategorieswithallchildren',{nothing:"nothing"});
        setNestcat(cats.data);
      } catch (error) {
          console.error(error)
      }
    }
    const fetchcategories=async()=>{
      try {
        const cats=await axios.post('/category/getallcategoryleafids',{});
        console.log(cats.data)
        setCategories(cats.data);
      } catch (error) {
      console.error(error)
      }
    }
    const fetchcurrencies=async()=>{
      try {
        const curs=await axios.get('/currency/justgetall');

        setCurrencies(curs.data);
      } catch (error) {
      }
    }
    const fetchconditions=async()=>{
      try {
        const cats=await axios.get('/productcondition/justgetall');

        setCondition(cats.data);
      } catch (error) {
      }
    }
    
    const fetchusers=async()=>{
      try {
        const users=await axios.get('/user/justgetall');
        setUsers(users.data);
      } catch (error) {
      }
    }
    const fetchstatus=async()=>{
      try {
        const status=await axios.get('/productstatus/justgetall');

        setStatus(status.data);
      } catch (error) {
      }
    }
  

    const [isOpen, setIsOpen] = useState(false);
    const toggleSidebar = () => setIsOpen(!isOpen);
    
    const [body,setBody]=useState({})
    
    const [category,setCategory]=useState('all');
    const [newSlugs,setNewSlugs]=useState([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [itemsnumber,setItemsnumber]=useState(0);
    const [orderby, setOrderby] = useState("created-desc");
    const [filters, setFilters] = useState(initialFilters);
    
    const [totalPages, setTotalPages] = useState(1);
    const [products, setProducts] = useState([]);

  
  const [selectedItem, setSelectedItem] = useState(null);
   

const [masterEnabled, setMasterEnabled] = useState(false);
const handleChange = (e) => {
  const { name, value, type, checked } = e.target;
  setFilters(prev => {
    if (type === "checkbox" && !name.endsWith("_enabled")) {
      return { ...prev, [name]: checked };
    }
    if (type === "checkbox") {
      return { ...prev, [name]: checked };
    }
    if (type === "number") {
      return { ...prev, [name]: value === "" ? "" : Number(value) };
    }
    return { ...prev, [name]: value };
  });
};
const handleReset = () => setFilters(initialFilters);


const handlechangebody = async (e) => {
    e.preventDefault();
    let body = {};
    Object.keys(filters).forEach(key => {
      if (key.endsWith("_enabled") && filters[key]) {
        const realKey = key.replace("_enabled", "");
        body[realKey] = filters[realKey];
        // include *_dir if exists
        const dirKey = `${realKey}_dir`;
        if (filters.hasOwnProperty(dirKey)) body[dirKey] = filters[dirKey];
      }
    });

    setBody(body);
  };

  const handleMasterButtonToggle = () => {
  const newEnabled = !masterEnabled;
  setMasterEnabled(newEnabled);

  // Update all *_enabled filters
  const newFilters = { ...filters };
  Object.keys(filters).forEach((key) => {
    if (key.endsWith("_enabled")) newFilters[key] = newEnabled;
  });
  setFilters(newFilters);
};


const handelsearch= ()=>{
  fetchProducts();
}
const handleDeleteProduct = async () => {
  if (!selectedProduct?.uuid) return;

  try {
    // call your backend API to delete the product
    await axios.delete(`/product/delete/deleteProduct`,{id:selectedProduct.uuid});


    // close modal
    handleCloseModals();
  } catch (err) {
    showNotification("error","Failed to delete product: " + (err?.response?.data?.message || err.message))
    alert("Failed to delete product: " + (err?.response?.data?.message || err.message));
  }
};

  const fetchProducts = async () => {
  setProductsStatus("loading");
  const latestNewSlugs = category && category !== "all" ? [category] : [];

const existingSlugs = Array.isArray(body.slugs) ? body.slugs : [];
const mergedSlugs = [...existingSlugs, ...latestNewSlugs].filter((v, i, a) => v && a.indexOf(v) === i);

const { slugs, ...bodyWithoutSlugs } = body;
  try {
    const res = await axios.post("/product/filterproducts", {
      page,
      limit,
      orderby,
      ...bodyWithoutSlugs,
      slugs:mergedSlugs,
    });
    setProducts(res.data.products);
    setPage(res.data.currentPage);
    setTotalPages(res.data.totalPages);
    setItemsnumber(res.data.total);
    setProductsStatus("success");
    showNotification("success","products were found")
  } catch (err) {
    showNotification("error","products  were not found under this category or filters")
    setProductsError(err.message || "Failed to fetch products");
    setProductsStatus("error");
  }
};

const fetchSelectedProduct = async (id) => {
  setSelectedItemStatus("loading");
  try {
    const res = await axios.post(`/product/justgetalltheproduct`,{id:id});
    setSelectedItem(res.data.product);
    setSelectedItemStatus("success");
  } catch (err) {
    showNotification("error",(err.message || "Failed to fetch product"))
    
    setSelectedItemError(err.message || "Failed to fetch product");
    setSelectedItemStatus("error");
  }
};

  
  const drawerRef = useRef(null);
  const drawerInstanceRef = useRef(null);
  const openDrawer = (item) => {
    fetchSelectedProduct(item)
    setSelectedProduct(selectedItem);
    if (!drawerInstanceRef.current && window.bootstrap?.Offcanvas) {
      drawerInstanceRef.current = new window.bootstrap.Offcanvas(drawerRef.current);
    }
    drawerInstanceRef.current?.show();
  };

  const renderInput = (key) => {
    const enabledKey = `${key}_enabled`;
    const isEnabled = filters[enabledKey];
    const value = filters[key];

    const dirKey = `${key}_dir`;
    const hasDir = filters.hasOwnProperty(dirKey);

    let inputElement;

    if (typeof value === "boolean") {
      inputElement = (
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            id={key}
            name={key}
            checked={value}
            onChange={handleChange}
            disabled={!isEnabled}
          />
          <label className="form-check-label" htmlFor={key}>{key}</label>
        </div>
      );
    } else if (typeof value === "number" || typeof value === "string") {
      inputElement = (
        <div className="input-group">
          <input
            type={typeof value === "number" ? "number" : "text"}
            className="form-control"
            name={key}
            value={value}
            onChange={handleChange}
            disabled={!isEnabled}
          />
          {hasDir && isEnabled && (
            <select
              className="form-select"
              name={dirKey}
              value={filters[dirKey]}
              onChange={handleChange}
            >
              <option value="eq">equal =</option>
              <option value="lt">lower</option>
              <option value="lte">lower or equal</option>
              <option value="gt">bigger</option>
              <option value="gte">greater or equal</option>
            </select>
          )}
        </div>
      );
    } else if (Array.isArray(value)) {
      inputElement = (
        <input
          type="text"
          className="form-control"
          name={key}
          value={value.join(",")}
          onChange={(e) =>
            setFilters(prev => ({ ...prev, [key]: e.target.value.split(",").map(v => v.trim()) }))
          }
          disabled={!isEnabled}
          placeholder="Comma separated values"
        />
      );
    }

    return (
      <div className="mb-3" key={key}>
        <div className="form-check mb-2">
          <input
            className="form-check-input"
            type="checkbox"
            name={enabledKey}
            checked={isEnabled}
            onChange={handleChange}
            id={`enable-${key}`}
          />
          <label className="form-check-label fw-bold" htmlFor={`enable-${key}`}>
            Enable {key}
          </label>
        </div>
        {inputElement}
      </div>
    );
  };
  const sections = {
    "General": ["id","category_ids","user_id","status_id","condition_id","currency","title","product_slug","slugs"],
    "Price & Discount": ["price","original_price","discount"],
    "Availability": ["isAvailable","featured","upcoming","negotiable","softdelete","includedeletedcategory","onlyDeletedCategory"],
    "Warranty & Extras": ["warranty","warranty_period"],
    "Metadata": ["isactive_name","isactive_phonenumber","isactive_price","quantity_foryou","quantity_dir","latest","attribute_option_ids"]
  };

  useEffect(()=>{
    fetchsubmenucategory();
    fetchProducts();
    fetchcategories();
    fetchconditions();
    fetchcurrencies();
    fetchstatus();
    fetchusers();
  },[]);
  useEffect(()=>{
    fetchProducts();
  },[page,limit,orderby,category]);

    return (

    <div className="container-fluid py-5">
      <div className="m-0 p-0 row">
           <form onSubmit={handlechangebody} className="container-fluid  py-4 " >
      <h2 className="mb-2">تصفية المنتجات</h2>

      {/* Master toggle + Reset */}
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <button
          type="button"
          className={`btn ${masterEnabled ? "btn-primary" : "btn-secondary"} btn-md`}
          onClick={handleMasterButtonToggle}
        >
          {masterEnabled ? "All Filters Enabled" : "Enable All Filters"}
          <span
            className={`ms-2 rounded-circle ${masterEnabled ? "bg-white" : "bg-dark"}`}
            style={{ display: "inline-block", width: "10px", height: "10px" }}
          ></span>
        </button>

                
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-secondary btn-md"
              onClick={handleReset}
            >
              Reset Filters
            </button>

            <button
              type="submit"
              className="btn btn-md d-flex align-items-center"
              style={{
                backgroundColor: Object.keys(body).length > 0 ? "green" : "red",
                borderColor: Object.keys(body).length > 0 ? "green" : "red",
                color: "white",
              }}
            >
              Apply Filters
              <span
                className="ms-2 rounded-circle"
                style={{
                  display: "inline-block",
                  width: "8px",
                  height: "8px",
                  backgroundColor: "white",
                }}
                title={Object.keys(body).length > 0 ? "Filters active" : "No filters"}
              ></span>
            </button>
          </div>

      </div>

      {masterEnabled && Object.entries(sections).map(([sectionName, keys], index) => (
        <div className="card mb-3" key={index}>
          <div className="card-header">
            <button
              className="btn btn-link text-decoration-none"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target={`#collapse${index}`}
            >
              {sectionName}
            </button>
          </div>
          <div className="collapse show" id={`collapse${index}`}>
            <div className="card-body">
              <div className="row">
                {keys.map(key => (
                  <div className="col-md-6" key={key}>
                    {renderInput(key)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}


    </form>
    </div>
    <div className="m-0 p-0 container-fluid d-flex gap-3" style={{}}>
      <div className={`p-0 m-0 ${isOpen? "col-4 col-sm-4 col-md-2 col-lg-2": "d-none"}`}><Sidebar nestcats={nestcat}  onSelect={setCategory} isOpen={isOpen} toggleSidebar={toggleSidebar}></Sidebar></div>
    <div className="m-0 p-0 responsive" style={{overflow:"auto"}}>
<h2 className="mb-4 d-flex align-items-center gap-2">
  <button className="btn btn-sm btn-primary" disabled>
    {category}
  </button>
  Products
</h2>
      {/* Controls */}
      <div className="d-flex gap-3 mb-3 flex-wrap">
        <div className="dropdown">
          <button className="btn btn-outline-primary dropdown-toggle" data-bs-toggle="dropdown">
            Limit: {limit}
          </button>
          <ul className="dropdown-menu">
            {[5, 10, 15, 20, 25,35,50,80,100,200].map((val) => (
              <li key={val}>
                <button className="dropdown-item" onClick={() => { setLimit(val); setPage(1); }}>
                  {val}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="dropdown">
          <button className="btn btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
            OrderBy: {orderby}
          </button>
          <ul className="dropdown-menu">
            {orderOptions.map((opt) => (
              <li key={opt.value}>
                <button className="dropdown-item" onClick={() => { setOrderby(opt.value); setPage(1); }}>
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <button
          className="btn btn-warning btn-sm"
          onClick={() => toggleSidebar(!isOpen)}
        >
          Category : <span className="text-white">{category}</span>
        </button>      
      <button
        type="button"
        className="btn btn-info btn-sm text-white "
        onClick={() => handelsearch() }
      >
        <i className="bi bi-search"></i> Search
      </button>
      <NavLink
        to="/dashboard/add2"
        state={{ category }}
        className="btn btn-success"
      >
        <i className="bi bi-plus-circle me-2"></i> Add To {category}
      </NavLink>
      </div>


      <div className="table-responsive shadow rounded" style={{minHeight:"30vh"}}>
        <table className="table table-hover align-middle text-center mb-0">
          <thead className="table-dark"  >
            <tr  >
              <th>Actions</th>
              <th>Title</th>
              <th>Status</th>
              <th>Condition</th>
              <th>Currency</th>
              <th>Stock</th>
              <th>Price</th>
              <th>Original Price</th>
              <th>Warranty</th>
              <th>Warranty Period</th>
              <th>Active Name</th>
              <th>Active Price</th>
              <th>Active Phone</th>
              <th>Available</th>
              <th>Featured</th>
              <th>Upcoming</th>
              <th>Negotiable</th>
              <th>Latest</th>
              <th>Discount</th>
              <th>Soft Delete</th>
            </tr>
          </thead>
          <tbody>
  {productsStatus === "idle" && (
    <tr>
      <td colSpan={21} className="text-center py-3 text-muted">
        Waiting for action...
      </td>
    </tr>
  )}

{productsStatus === "loading" && (
  <tr>
    <td colSpan={21} className="text-center py-3">
      <div className="d-flex justify-content-center align-items-center gap-2">
        <div className="spinner-border text-primary" role="status" style={{ width: "1.5rem", height: "1.5rem" }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <span className="text-primary">...Loading products</span>
      </div>
    </td>
  </tr>
)}


  {productsStatus === "error" && (
    <tr>
      <td colSpan={21} className="text-center py-3 text-danger">
        {productsError}
      </td>
    </tr>
  )}

  {productsStatus === "success" && products.length === 0 && (
    <tr>
      <td colSpan={21} className="text-center py-3">
        No products found
      </td>
    </tr>
  )}

  {productsStatus === "success" &&
    products.map((item) => (
      <tr key={item.uuid}>
        <td>
          <div className="d-flex gap-2 justify-content-center">
            <button className="btn btn-sm btn-outline-primary" onClick={() => handleEditClick(item.uuid)}>Edit</button>
            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteClick(item.uuid)}>Delete</button>
            <button className="btn btn-sm btn-secondary" onClick={() => openDrawer(item.uuid)}>View</button>
          </div>
        </td>
        <td className="text-primary" style={{ cursor: "pointer" }} onClick={() => openDrawer(item)}>
          {item.title}
        </td>
        <td>{item.status_id}</td>
        <td>{item.condition_id}</td>
        <td>{item.currency_id}</td>
        <td>{item.stock_quantity_fy}</td>
        <td>{item.price}</td>
        <td>{item.original_price}</td>
        <td>{item.warranty ? "Yes" : "No"}</td>
        <td>{item.warranty_period}</td>
        <td>{item.isactive_name ? "Yes" : "No"}</td>
        <td>{item.isactive_price ? "Yes" : "No"}</td>
        <td>{item.isactive_phonenumber ? "Yes" : "No"}</td>
        <td>{item.isAvailable ? "Yes" : "No"}</td>
        <td>{item.featured ? "Yes" : "No"}</td>
        <td>{item.upcoming ? "Yes" : "No"}</td>
        <td>{item.negotiable ? "Yes" : "No"}</td>
        <td>{item.latest ? "Yes" : "No"}</td>
        <td>{item.discount ? "Yes" : "No"}</td>
        <td>{item.softdelete ? "Yes" : "No"}</td>
      </tr>
    ))}
</tbody>

        </table>
      </div>
      </div>
      </div>
      <div className="d-flex justify-content-center align-items-center gap-2 mt-3 flex-wrap">
        <button className="btn btn-outline-primary" disabled={page===1} onClick={()=>setPage(page-1)}>
          &lt; Previous
        </button>
        {Array.from({length: totalPages}, (_, i)=>
          <button key={i+1} className={`btn ${page===i+1?"btn-primary":"btn-outline-primary"}`} onClick={()=>setPage(i+1)}>
            {i+1}
          </button>
        )}
        <button className="btn btn-outline-primary" disabled={page===totalPages} onClick={()=>setPage(page+1)}>
          Next &gt;
        </button>
      </div>


      {/* Drawer */}
      <div ref={drawerRef} className="offcanvas offcanvas-end offcanvas-wide" tabIndex="-1">
        <div className="offcanvas-header bg-dark text-white">
          <h5 className="offcanvas-title">Product Details</h5>
          <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>
        </div>
        <div className="offcanvas-body">
          {/* Idle / Loading / Error states */}
    
  <div>
      <ProductDetailsModern product={selectedItem}></ProductDetailsModern>
  </div>


        </div>

      </div>

      {/* Edit Modal */}
<div className={`modal ${showEditModal ? "show d-block" : ""}`} tabIndex="-1">
  <div className="modal-dialog">
    <div className="modal-content">
      <div className="modal-header">
        <h5 className="modal-title">Edit Product</h5>
        <button type="button" className="btn-close" onClick={handleCloseModals}></button>
      </div>
      <div className="modal-body">
        <EditProductModal product={selectedItem} onClose={handleCloseModals} Statuses={status} Categories={categories} Currencies={currencies} Users={users} Conditions={condition}></EditProductModal>
      </div>
      <div className="modal-footer">
        <button className="btn btn-secondary" onClick={handleCloseModals}>Cancel</button>
        <button className="btn btn-primary">Save Changes</button>
      </div>
    </div>
  </div>
</div>

{/* Delete Modal */}
<div className={`modal ${showDeleteModal ? "show d-block" : ""}`} tabIndex="-1">
  <div className="modal-dialog">
    <div className="modal-content">
      <div className="modal-header">
        <h5 className="modal-title">Delete Product</h5>
        <button type="button" className="btn-close" onClick={handleCloseModals}></button>
      </div>
      <div className="modal-body">
        {selectedProduct && <p>هل انت متأكد انك تريد حذف  <strong>{selectedProduct.title} (نهائيا) </strong>؟</p>}
      </div>
      <div className="modal-footer">
        <button className="btn btn-secondary" onClick={handleCloseModals}>Cancel</button>
        <button className="btn btn-danger" onClick={handleDeleteProduct}>Delete</button>
      </div>
    </div>
  </div>
</div>

    </div>
  );
}
