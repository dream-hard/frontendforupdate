import React, { useEffect, useState } from "react";
import ProductImageGallery from "./image";
import { Link, useNavigate, useParams } from "react-router-dom";
import './productpage.css'
import useAuth from "../../Hooks/useAuth";
import axios from "../../api/fetch";
import useCart from "../../Hooks/useCart";
import useNotification from "../../Hooks/useNotification";
import NodeCategory from "../testfiles/nodeCategories";


export default function ProductDetailsPage() {
    const { slug } = useParams();   
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [newReview, setNewReview] = useState({
        rating: 5,
        comment: "",
    });
    const { addToCart} =useCart();
    const{showNotification}=useNotification();
    const navigate = useNavigate();
    const{auth}=useAuth();

const increaseQty = () => {
  setQuantity((prev) => prev + 1);
};
const decreaseQty = () => {
  if (quantity > 1) setQuantity((prev) => prev - 1);
};
const handleAddToCart = () => {
  addToCart(product,quantity||1);
  showNotification("info","تمت إضافة المنتج إالى السلة")
  
  // Send product + quantity to your cart context or API
};
const handelquantitychange=(e)=>{
    setQuantity((e.target.value>0?e.target.value:1))
}

const handleBuyNow =async () => {
  addToCart(product,1);
  showNotification("info","تمت إضافة المنتج إالى السلة")
    navigate("/cart"); 

};


  const handleChangereveiw = (e) => {
    const { name, value } = e.target;
    setNewReview((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handlenewclick=(e)=>{
    window.scroll(0,0);
  }

  async function fetchProductBySlug(slug) {
  try {
    const res = await axios.post('/product/justgettheproudctbyslug',{slug});
    let metadata = null;
    try {
      metadata = res.data.product.metadata ? JSON.parse(res.data.product.metadata) : null;
    } catch (e) {
      metadata = null; // لو صار خطأ بالتحويل
    }
     res.data.product.metadata=metadata;
    return res.data.product;   
  } catch (error) {
    throw error;
  }
}
useEffect(() => {
  async function loadProduct() {
    const data = await fetchProductBySlug(slug);
    setProduct(data);
  }
  loadProduct();
}, [slug]);


  if (!product) return <div>Loading...</div>;

  return (
    <div className="container mt-4">
      <div className="row" style={{justifyContent:"start",alignItems:"start",alignContent:"start"}}>
        {/* Main Image and Gallery */}

<ProductImageGallery images={product.Product_images} />
        {/* Product Info */}
      
        <div className="col-md-6">
  <h2 className="fw-bold mb-2">{product.title}</h2>

<p className="text-muted mb-3">
  SKU: {product?.uuid ? product.uuid.slice(0,18) : "N/A"}
</p>
  {(product.discount)?
   (<>
  <div className="mb-4">
    <h4 className="text-success d-inline me-3">
      {product?.price} {product.Currency?.symbol}
    </h4>
    <span> {` `}</span>
    {product.original_price && (
      <span className="text-danger text-decoration-line-through fs-6">
        {product.original_price} {product.Currency?.symbol}
      </span>
    )}
  </div>

   </>)
  :(<>
  <div className="mb-4">
    <h4 className="text-muted d-inline me-3">
      {product.original_price} {product?.Currency?.symbol} 
    </h4>
  </div>
  </>)}
  
  <p className="mb-4">{product.description}</p>

  <div className="d-flex flex-wrap align-items-center gap-3 mt-4">

  {/* Counter with rounded design */}
  
<div
  className="d-flex align-items-center rounded-pill px-2"
  style={{
    height: "45px",
    maxWidth: "fit-content",
    backgroundColor: "#f0f2f5",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
  }}
>
  <button
    onClick={decreaseQty}
    className="btn d-flex justify-content-center align-items-center rounded-circle"
    style={{
      width: "38px",
      height: "38px",
      border: "none",
      backgroundColor: "white",
      boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
      fontSize: "1.5rem",
      color: "#555",
      cursor: "pointer",
      transition: "background-color 0.3s, color 0.3s",
      userSelect: "none",
    }}
    onMouseEnter={e => {
      e.currentTarget.style.backgroundColor = "#2070d2";
      e.currentTarget.style.color = "white";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.backgroundColor = "white";
      e.currentTarget.style.color = "#555";
    }}
  >
    −
  </button>

  <input
    dir="ltr"
    type="text"
    onChange={handelquantitychange}
    value={quantity}
    min={1}
    className="text-center mx-3"
    style={{
      width: "50px",
      fontWeight: "600",
      fontSize: "1.25rem",
      border: "none",
      backgroundColor: "transparent",
      userSelect: "none",
    }}
  />

  <button
    onClick={increaseQty}
    className="btn d-flex justify-content-center align-items-center rounded-circle"
    style={{
      width: "38px",
      height: "38px",
      border: "none",
      backgroundColor: "white",
      boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
      fontSize: "1.5rem",
      color: "#555",
      cursor: "pointer",
      transition: "background-color 0.3s, color 0.3s",
      userSelect: "none",
    }}
    onMouseEnter={e => {
      e.currentTarget.style.backgroundColor = "#2070d2";
      e.currentTarget.style.color = "white";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.backgroundColor = "white";
      e.currentTarget.style.color = "#555";
    }}
  >
    +
  </button>
</div>



  {/* Modern Add to Cart Button */}
<div className="d-flex flex-wrap gap-2 ">
  {/* زر Add to Cart */}
  <button
    className=" ms-auto  btn custom-btn-cart flex-grow-1 flex-md-grow-0"
    onClick={handleAddToCart}
  >
    <i className="bi bi-cart-plus-fill fs-5 me-2"></i>
    إضافة إالى السلة
  </button>

  {/* زر Buy Now */}
  <button
    className=" btn custom-btn-buy flex-grow-1 flex-md-grow-0"
    onClick={handleBuyNow}
  >
    <i className="bi bi-bag-check-fill fs-5 me-2"></i>
    شراء فوراََ
  </button>
</div>
{(product?.isactive_phonenumber && product?.isactive_phonenumber) 
&&
<div className="mt-1  shadow-sm p-0 p-sm-4">
  <h5 className="mb-3 text-primary">معلومات البائع</h5>

  <div className=" p-4 rounded bg-white d-flex flex-wrap gap-5 align-items-center">
    {/* Seller Name */}
    <div className="d-flex flex-column flex-sm-row align-items-sm-center gap-2">
      <span className="text-uppercase bg-light text-muted small" style={{ minWidth: "100px" }}>
         البائع
      </span>
      <span className="fw-semibold fs-6">{product?.User?.username || "غير متوفر"}</span>
    </div>

    {/* Phone Number */}
    <div className="d-flex flex-column flex-sm-row align-items-sm-center gap-2">
      <span className="text-uppercase bg-light text-muted small" style={{ minWidth: "100px" }}>
        رقم الهاتف
      </span>
      <span className="fw-semibold fs-6">{product?.User?.phone_number || "غير متوفر"}</span>
    </div>
  </div>
</div>
}

</div>

</div>

      </div>


<div className="mt-5 p-0 p-sm-4">
 

<h4 className="mb-3">الوصف</h4>
<div className="mb-4 border rounded shadow-sm overflow-hidden p-3 ">
<div className="">
      <p className="">{product.description}</p>
</div>
</div>
{(product.metadata && Object.keys(product.metadata).length >0 )&&
   ( <><h4 className="mb-3">المواصفات</h4>
    <div className="table-responsive">
        <div className="border rounded shadow-sm overflow-hidden p-3">
        <table className="table   align-middle m-0">
            <tbody>
            {Object.entries(product.metadata).map(([key, value]) => (
                <tr key={key}>
                <th className="text-capitalize bg-light text-secondary" style={{ width: "35%" }}>
                    {key.replace(/_/g, " ")}
                </th>
                <td className="bg-light">{value}</td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>
    </div></>)
    }





      </div>
    
      


      {/* Reviews */}
      {/* <div className="mt-5">
        <h5>Reviews</h5>
        {product.reviews.map((review, index) => (
          <div key={index} className="border p-2 mb-2">
            <strong>{review.user}</strong>{" "}
            <span className="text-warning">{"★".repeat(review.rating)}</span>
            <p className="mb-0">{review.comment}</p>
          </div>
        ))}
      </div> */}
        <div className="mt-5">
        <h5 className="mb-3">التقييمات</h5>
        {(product.reviews && product.reviews.length > 0) ?
            (<>
                {product.reviews.map((review, index) => (
                    <div
                    key={index}
                    className="d-flex gap-3 align-items-start border rounded shadow-sm p-3 mb-3 bg-white"
                    >
                    {/* Avatar or Initials */}
                    <div className="bg-primary text-white rounded-circle d-flex justify-content-center align-items-center" style={{ minWidth: 45, minHeight: 45 }}>
                        {review.user?.charAt(0).toUpperCase()}
                    </div>

                    {/* Review Content */}
                    <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-center">
                        <strong>{review.user}</strong>
                        <span className="text-warning small fs-5">
                            {"★".repeat(review.rating)}{" "}
                            {"☆".repeat(5 - review.rating)}
                        </span>
                        </div>
                        <p className="mb-0 text-muted">{review.comment}</p>
                    </div>
                    </div>
                ))}
            </>)
            :(<>
                <div className="d-flex align-items-center justify-content-center flex-column text-center border rounded py-4 px-3 shadow-sm bg-light-subtle mt-4">
                    <i className="bi bi-chat-left-text fs-1 text-secondary mb-3"></i>
                    <h6 className="text-muted">لا توجد مراجعات بعد</h6>
                    <p className="text-secondary small mb-0">كن أول من يشارك رأيه حول هذا المنتج!</p>
                </div>
            </>)
        }
        </div>
          {product?.Category && <div className='container-fluid  rounded px-3  mt-4  shadow-sm highlight-box'>
                              <NodeCategory  onCardClick={handlenewclick} categoryslug={product?.Category?.slug} cardWidth={300}></NodeCategory>
                          </div>}

       {/* Add New Review */}
    {auth ? (<>
    
      <form className="mt-4" >
        <h6>Add a Review</h6>
        <div className="mb-2">
          <select
            name="rating"
            className="form-select"
            onChange={handleChangereveiw}
            value={newReview.rating}
          >
            <option value="5">★★★★★ - ممتاز جداً</option>
            <option value="4">★★★★☆ - جيد</option>
            <option value="3">★★★☆☆ - متوسط</option>
            <option value="2">★★☆☆☆ - ضعيف</option>
            <option value="1">★☆☆☆☆ - سيئ جداً</option>
          </select>
        </div>

        <div className="mb-2">
          <textarea
            name="comment"
            className="form-control"
            rows="3"
            placeholder="Your comment..."
            onChange={handleChangereveiw}
            value={newReview.comment}
          ></textarea>
        </div>

        <button className="btn btn-primary" type="submit">
          Submit Review
        </button>
      </form>
    
    </>):(<>
 <div className="alert alert-warning mt-3" role="alert">
  يجب عليك <Link to="/log" className="alert-link">تسجيل الدخول</Link> لترك تعليق.
</div>

    
    </>)}
    </div>
  );
}
