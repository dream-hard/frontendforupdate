import React, { useEffect, useState } from "react";
import ProductCard from "../card/card";
import { Link, NavLink, Outlet } from "react-router-dom";
import './defaultpage.css'
import useNotification from "../../../Hooks/useNotification";
import axios from "../../../api/fetch";
const bannerss = [
  { id: 1, img: "https://t3.ftcdn.net/jpg/13/37/08/44/240_F_1337084486_wRLMY1JtYtNHoBhgYbHF6wLXMXLvJV86.jpg", title: "تخفيضات كبيرة!", subtitle: "حتى 50% خصم على اللابتوبات" },
  { id: 2, img: "https://t4.ftcdn.net/jpg/11/77/07/57/240_F_1177075792_WKsRfZEDkRrTGuXq9qMAZE2B5pI2ep2K.jpg", title: "وصل حديثاً", subtitle: "اكتشف أحدث الأجهزة" },
  { id: 3, img: "https://t3.ftcdn.net/jpg/05/95/80/10/240_F_595801093_y1v9owKmJXfnSef9mzD9SD8pFDRyTTAk.jpg", title: "أدوات الألعاب", subtitle: "أفضل الملحقات للاعبين" },
  {id:5 ,img:"https://placehold.co/1920x530?text=slidshokkw",subtitle:" hi man go"},
  {id: 4 , img:"https://images.unsplash.com/photo-1682687982298-c7514a167088?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxfHx8ZW58MHx8fHx8"}
];

export default function Defaultpage() {
  const [page, setPage] = useState(1);
      const [limit, setLimit] = useState(10000);
      const [itemsnumber,setItemsnumber]=useState(0);
      const [orderby, setOrderby] = useState("created-desc");
      const [filters, setFilters] = useState({});
      const [category,setCategory]=useState("all")
      const [totalPages, setTotalPages] = useState(1);
    const {showNotification}=useNotification();
    const [istoggled, setIstoggled] = useState(false);
    const toggleSidebar=()=>{setIstoggled(!istoggled);
    }
    const [finalproduct,setFinalproduct]=useState([]);


    const fetchProducts = async () => {
    const latestNewSlugs = category && category !== "all" ? [category] : [];
  
  const existingSlugs = [];
  const mergedSlugs = [...existingSlugs, ...latestNewSlugs].filter((v, i, a) => v && a.indexOf(v) === i);
  
    try {
      const res = await axios.post("/product/filterproducts", {
        page,
        limit,
        orderby,
        slugs:mergedSlugs,
      });
      setFinalproduct(res.data.products);
      setPage(res.data.currentPage);
      setTotalPages(res.data.totalPages);
      setItemsnumber(res.data.total);
    } catch (err) {
    }
  };
  useEffect(()=>{
    fetchProducts();
    return;
  },[])
return(<>
{/* 
    <div
      id="bannerCarousel"
         className="me-auto ms-auto carousel slide carousel-fade"
        data-bs-ride="carousel"
      data-bs-interval="4000"
      data-bs-pause="false"
      style={{maxWidth:"1248px"}}

            >
              <div className="carousel-inner" >
                {banners.map((banner, idx) => (
                  <div
                    key={banner.id}
                    className={`carousel-item ${idx === 0 ? "active" : ""}`}
                  >
               <div className="carousel-image-container  position-relative">
                    <img
                      src={banner.img}
                      className="d-block   image-in-container"
                      alt={banner.title}
                      
                      />

               </div>
                    <div className="d-none d-md-block carousel-caption p-2 p-md-3 bg-dark bg-opacity-50 rounded banner-caption">
                      <h3 className="d-none d-md-block fs-6 fs-md-4">{banner.title}</h3>
                      <p className="d-none d-md-block fs-7 fs-md-6">{banner.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
<button
  className="carousel-control-prev custom-arrow"
  type="button"
  data-bs-target="#bannerCarousel"
  data-bs-slide="prev"
>
  <i className="bi bi-chevron-left"></i>
  <span className="visually-hidden">Previous</span>
</button>

<button
  className="carousel-control-next custom-arrow"
  type="button"
  data-bs-target="#bannerCarousel"
  data-bs-slide="next"
>
  <i className="bi bi-chevron-right"></i>
  <span className="visually-hidden">Next</span>
</button>


            </div>
 */}

                <div className="container-fluid mt-4" style={{backgroundColor:'',maxWidth:"1240px"}}>
            {/* المنتجات المميزة */}
            {/* <h4 className=" mb-3 ">منتجات مميزة</h4> */}
               <div  className=" mt-5 container-fluid py-4">
<div className="row gy-2 gy-sm-3 gy-md-4 justify-content-start  "   >
        {finalproduct.map((product, idx) => (
          <div  className="col-6 col-sm-6 col-md-4 col-lg-3 mt-3 px-1 px-sm-3 px-md-2 px-lg-3" key={idx}>
            <Link style={{textDecoration:"none"}} to={`/product/${product.slug}`}>
            <ProductCard product={product} />
            </Link>
          </div>
        ))}
      </div>
    </div>
           </div></>
  );}