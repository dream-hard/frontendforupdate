import React, { useEffect, useState } from "react";
import ProductCard from "../card/card";
import { Link, NavLink, Outlet } from "react-router-dom";
import './defaultpage.css'
import useNotification from "../../../Hooks/useNotification";
import axios from "../../../api/fetch";
import ModernSingleCategoryCarousel400edit from "../../testfiles/present400edit";
import Node1 from "../../testfiles/400node1";
import Node2 from "../../testfiles/400node2";
import Node3 from "../../testfiles/400node3";
import Node4 from "../../testfiles/400node4";
import SkeletonCard from "../../SkeltonCard/SkeletonCard";


export default function Defaultpage() {
  const [page, setPage] = useState(1);
  const[loadingif,setLoadingif]=useState(true)
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

  const [flags, setFlags] = useState({
    NewProducts: false,
    LatestProducts: false,
    DiscountProducts: false,
    UpcomingProducts: false,
    BestCategoriesProducts: false,
    MyPickUp:false
  });
  const flagNames = [
    "NewProducts",
    "LatestProducts",
    "DiscountProducts",
    "UpcomingProducts",
    "BestCategoriesProducts",
    "MyPickUp"
  ];

  const fetchFlag = async (name) => {
    try {
      const response = await axios.get(`/json/check/${name}`);
      // assuming API returns { value: true } or { value: false }
      setFlags((prev) => ({ ...prev, [name]: response.data.result }));
    } catch (error) {
    }
  };
  const fetchAllFlags = () => {
    flagNames.forEach((name) => fetchFlag(name));
  };
  
  const fetchProducts = async () => {
    setLoadingif(true)
    const latestNewSlugs = category && category !== "all" ? [category] : [];
    
    const existingSlugs = [];
    const mergedSlugs = [...existingSlugs, ...latestNewSlugs].filter((v, i, a) => v && a.indexOf(v) === i);
    if(!flags.MyPickUp) return;

    try {
      const fileName='MyPickUp';
      const res = await axios.get(`/json/fetch/${fileName}`, {
        page,
        limit,
        orderby,
        slugs:mergedSlugs,
      });
      setFinalproduct(res.data.data.products);
      setPage(res.data?.currentPage||1);
      setTotalPages(res.data?.totalPages||1);
      setItemsnumber(res.data?.total||0);
    } catch (err) {
      setFinalproduct([])
    }finally{
      setLoadingif(false)
    }
  };
  
    useEffect(() => {
      fetchAllFlags();
    }, []);
    useEffect(()=>{
      fetchProducts();
      return;
    },[flags]);
    
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

          <div className="container-fluid mt-4" style={{backgroundColor:'',maxWidth:"1280px"}}>
              
              {flags?.MyPickUp ===undefined ? (
                <p>جار التحميل ...</p>
              ):
              flags?.MyPickUp && loadingif ? (
              <div  className=" mt-5 container-fluid py-4">
                  <div className="row gy-2 gy-sm-3 gy-md-4 justify-content-start  "   >
                        <div className="row m-0 p-0 rounded   shadow-sm py-4 " >
                            <div class="d-flex align-items-center gap-2 mb-2">
                              <i class="bi bi-star-fill text-warning fs-4"></i> 
                              <span class="fw-semibold text-muted fs-4">اخترنا لك بعناية</span> 
                            </div>       
                            {Array.from({ length: 6 }).map((_, i) => (
                                    <div
                                      className="col-6 col-sm-6 col-md-3 col-lg-3 mt-3"
                                      key={"skeleton-" + i}
                                    >
                                      <SkeletonCard />
                                    </div>
                             ))}
                        </div>
                   </div>
                </div>
                       
                ):finalproduct?(<>

                                 <div  className=" mt-5 container-fluid py-4">
                                    <div className="row gy-2 gy-sm-3 gy-md-4 justify-content-start  "   >
                                      <div className="row m-0 p-0 rounded   shadow-sm py-4 " >
                                        <div class="d-flex align-items-center gap-2 mb-2">
                                          <i class="bi bi-star-fill text-warning fs-4"></i> 
                                          <span class="fw-semibold text-muted fs-4">اخترنا لك بعناية</span> 
                                        </div>
                                        {finalproduct.map((product, idx) => (
                                        <div  className="col-6 col-sm-6 col-md-4 col-lg-3 mt-3 px-1  px-sm-2  px-md-2 px-lg-3 " key={idx}>
                                          <Link style={{textDecoration:"none"}} to={`/product/${product.slug}`}>
                                          <ProductCard product={product} />
                                          </Link>
                                        </div>
                                        ))}
                                      </div>
                                    </div>
                                </div>
                                </>):(<>
                                not found 
                                </>)} 
      

              {flags?.BestCategoriesProducts === undefined ? (
                <p>Loading...</p>
              ) : flags.BestCategoriesProducts && (                
                <div className='container-fluid  rounded px-3 py-4 mt-4  shadow-sm highlight-box'>
                  <ModernSingleCategoryCarousel400edit cardWidth={300}>
                  </ModernSingleCategoryCarousel400edit>
                </div>
              )}

              {flags?.NewProducts === undefined ? (
                <p>Loading...</p>
              ) : flags.NewProducts && (
              <div className='container-fluid  rounded px-3 py-4 mt-4  shadow-sm highlight-box'>
                <Node1  cardWidth={300}>

              </Node1>
            </div>   
              )}
              {flags?.DiscountProducts === undefined ? (
                <p>Loading...</p>
              ) : flags.DiscountProducts && (
                <div className='container-fluid  rounded px-3 py-4 mt-4  shadow-sm highlight-box'>
                  <Node2 cardWidth={300}>
                  </Node2> 
               </div>
              )}

              {flags?.LatestProducts === undefined ? (
                <p>Loading...</p>
              ) : flags.LatestProducts && (
                  <div className='container-fluid  rounded px-3 py-4 mt-4  shadow-sm highlight-box'>
                    <Node3  cardWidth={300}>
                    </Node3>
                  </div>
              )}

              {flags?.UpcomingProducts === undefined ? (
                <p>Loading...</p>
              ) : flags.UpcomingProducts && (
              <div className='container-fluid  rounded px-3 py-4 mt-4  shadow-sm highlight-box'>
                    <Node4 cardWidth={300}>
                  </Node4>     
                </div>
              )}  
        </div>    
    </>
  );}
  