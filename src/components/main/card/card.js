
import React, { useEffect } from "react";
import './card.css'
import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
      const hasDiscount =product.discount;
    const discountPercent = hasDiscount
    ? Math.round(
        ((product.original_price - product.price) / product.original_price) * 100
      )
    : 0;

    useEffect(()=>{
    },[])
  return (
    <div className="card h-100 shadow-sm border-0 rounded-3 card-hover position-relative overflow-hidden " style={{justifyContent:"end"}}>
     
  <div className="   top-0  " style={{position:"absolute",left:0}}>
  {hasDiscount && (
   <span className="badge bg-danger  top-0   m-2">
     -{discountPercent}%
   </span>
 )}

</div>
<Link
  to={`/category/${product.Category.slug }`}
  className="text-muted small mb-0 text-decoration-none d-block px-2 mt-2 category-link"
>
  {product.Category?.display_name || "الفئة"}
</Link>



        <h5 className="card-title text-primary fw-bold  m-2 mb-1 responsive-title " style={{backgroundColor:"",minHeight:"fit-content"}}>{product.title}</h5>


      <div className="p-md-2  pt-md-0 pb-md-0  text-center bg-white " style={{backgroundColor:"red"}}>
  <img
  src={product.Product_images?.[0]?.filename || "/placeholder.png"}
  alt={product.title}
  className="img-fluid"
  style={{ maxHeight: "200px", objectFit: "contain" }}
/>

      </div>

      <div className="card-body text-end   " style={{display:"flex",flexFlow:"column nowrap",justifyContent:"end",backgroundColor:""}}>

       
        <div className="d-flex justify-content-between align-items-center  " style={{backgroundColor:"",gap:"3px"}}>
                    <div className="text-start">
            {(hasDiscount ) ? (
              <>
                <span className="text-danger text-decoration-line-through fs-6">
                  ${product.original_price}
                </span>{" "}
                <span className="text-success fw-bold fs-5">
                  ${product.price}
                </span>{" "}
              </>
            ) : (
              <span className="text-black fw-bold fs-5">
                ${product.original_price}
              </span>
            )}
   
<div>
<span className={`small ${product.stock > 0 ? "text-success" : "text-danger"}`}>
  {product.stock > 0 ? `الكمية المتبقية: ${product.stock}` : "غير متوفر حالياً"}
</span>
</div>
<div className="m-0 p-0">
<span className="text-muted  small" style={{fontSize:"0.7rem"}}>يشحن خلال 24 ساعة</span>
</div>
          </div>

          {/* <span className="text-primary fw-bold fs-5">${product.price}</span> */}
<button className="btn btn-outline-primary btn-sm rounded-pill">
  <span className="d-none d-lg-inline">أضف إلى السلة</span>
  <i className="bi bi-cart-plus d-inline d-lg-none"></i>
</button>

        </div>
      </div>
    </div>

    
    
  );
};

export default ProductCard;

