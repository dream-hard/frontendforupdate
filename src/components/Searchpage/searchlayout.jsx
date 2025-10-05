import React, { useEffect, useState } from "react";
import Node4 from "../testfiles/400node4";
import axios from "../../api/fetch";
import { Link, useParams, useSearchParams } from "react-router-dom";
import ProductList from "../productlist.js/productlist";
import ProductCard from "../main/card/card";
import SkeletonCard from "../SkeltonCard/SkeletonCard";
import Node1 from "../testfiles/400node1";
import ModernSingleCategoryCarousel400edit from "../testfiles/present400edit";
import NodeCategory from "../testfiles/nodeCategories";


export default function SearchResultsPage() {

  // Sample data - replace with your real data
    const[page,setPage]=React.useState(1);
    const[Totalpage,setTotalpage]=React.useState(1);
    const[limit,setLimit]=React.useState(15);
    const[searchresults,setsearchresults]=React.useState([]);
    const[suggested,setSuggested]=useState([]);
    const[loadingsuggeste,setLoadingsuggeste]=useState(true);
    const[loading,setloading]=React.useState(true);
    const[error,seterror]=React.useState(false);
    const [isloadingresults,setisloadingresults]=useState(false);

    const [searchParams] = useSearchParams();
    const keyword = searchParams.get("keyword") || "";

    async function fetchsearh(){
        setisloadingresults(true);
        seterror(false);
        try{
            const res=await axios.post(`/product/filterproducts?_page=${page}&_limit=${limit}`,{page:page,limit:limit,title:keyword,softdelete:false});
            setsearchresults(res.data.products||[]);
            setPage(res.data.currentPage);
            setTotalpage(res.data.totalPages);
            
        }catch(err){
          seterror(true);
        }finally{
            setisloadingresults(false);
        }
    }



      const [category,setCategory]=useState("all")



     const fetchsuggesting = async (limit=6) => {
       setLoadingsuggeste(true);
      try {
        const res = await axios.get("/json/fetch/MyPickUp");
        setSuggested(Array.isArray(res.data.data.products) ? res.data.data.products.slice(0, limit) : []);
      } catch (err) {
        setSuggested([])
      } finally {
        setLoadingsuggeste(false);
      }
    };

  useEffect(()=>{
    fetchsuggesting();
    return;
  },[])

  useEffect(() => {
    // runs whenever ?keyword=... changes (including manual URL change)
    fetchsearh();
    // fetch or filter using `keyword` here
  }, [page,limit,keyword]); // <--- important : listen for changes


  // Handler: change limit (page size)
  const onChangeLimit = (e) => {
    const newLimit = Number(e.target.value) || 15;
    setPage(1); // reset to first page when changing page size
    setLimit(newLimit);
    // useEffect will pick this up and call fetchsearh()
  };
 
  
    const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Totalpage) {
      setPage(newPage);
    }
  };

  return (
    <div className="container py-4">
      {/* Search bar + mobile sidebar toggle */}
      {/* Layout: main + sidebar (sidebar on the side for >= lg) */}
      <div className="row pb-3 g-4" >
              {/* SIDEBAR (right on desktop) */}
   
         <aside className="d-none d-lg-block col-6 col-lg-3">
      <div className="sticky-aside bg-white pt-1 px-4 pb-3 rounded-3 shadow-sm">
                                <div class="d-flex align-items-center gap-2 mb-3">
                              <i class="bi bi-star-fill text-warning fs-6"></i> 
                              <span class="fw-semibold text-muted fs-6">اخترنا لك ايضًا</span> 
                            </div>
        {loadingsuggeste ? (
          Array.from({ length: limit }).map((_, i) => (
            <PlaceholderRow keyVal={i} key={i} />
          ))
        ) : suggested.length === 0 ? (
          <div className="text-muted small"></div>
        ) : (
          suggested.map((m) => (
            <Link style={{ textDecoration: "none" }} to={`/product/${m.slug}`}>
  <div
    className="card d-flex flex-column gap-2 mb-3 align-items-center border-bottom p-1 px-0"
    key={m.id}
  >
    <img
      src={m?.Product_images[0]?.filename}
      className="rounded w-100"
      width="10"
      height="120"
      alt={m.title}
      style={{ objectFit: "cover" }}
    />

    <div className="text-center mt-2 w-100">
      <div
        className="fw-semibold small text-truncate text-dark mb-1"
        title={m.title}
      >
        {m.title}
      </div>

      {m.discount ? (
        <>
          <small className="text-danger text-decoration-line-through">
            {m?.Currency?.symbol}
            {m.original_price}
          </small>{" "}
          <small className="text-success fw-bold fs-6">
            {m?.Currency?.symbol}
            {m.price}
          </small>
        </>
      ) : (
        <div className="text-muted small">
          {m?.Currency?.symbol} {m.original_price}
        </div>
      )}
    </div>
  </div>
</Link>
          ))
        )}


      </div>
    </aside>
        {/* MAIN (left) */}
        
        <main className="col-12 col-lg-9 shadow-sm">
          <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h5 mb-3">نتائج البحث عن : <span className="text-primary">{keyword}</span></h2>
          <div className="input-group input-group-sm ms-2" style={{ width: 120 }}>
            <label className="input-group-text" htmlFor="pageLimitSelect" style={{ cursor: "default" }}>
              عرض
            </label>
            <select
              id="pageLimitSelect"
              className="form-select"
              value={limit}
              onChange={onChangeLimit}
              aria-label="Items per page"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
            </select>
          </div>
          

          </div>

          {/* grid of result cards */}
  
          <div  className=" mt-5 container-fluid py-4">
              <div className="row gy-2 gy-sm-3 gy-md-4 justify-content-start  "   >
                <div className="row m-0 p-0 rounded    py-4 " >

                  {isloadingresults ? (
                    // 1. Loading state with skeletons
                    Array.from({ length: 6 }).map((_, i) => (
                      <div
                        className="col-6 col-sm-6 col-md-4 col-lg-4 mt-3"
                        key={"skeleton-" + i}
                      >
                        <SkeletonCard />
                      </div>
                    ))
                  ) : !searchresults || searchresults.length === 0 ? (
                    // 2. Empty state
                    <div className="col-12">
                      <div
                        className="d-flex flex-column align-items-center justify-content-center text-center p-5 bg-white rounded "
                        dir="rtl"
                        style={{ minHeight: "320px" }}
                      >
                        <div className="mb-4">
                          <i
                            className="bi bi-search text-primary"
                            style={{ fontSize: "4rem" }}
                          ></i>
                        </div>
                        <h3 className="mb-2 fw-bold text-dark">لا توجد نتائج</h3>
                        <p className="text-muted mb-4">
                          عذراً، لم نعثر على منتجات مطابقة. جرّب كلمات بحث أخرى أو تصفح الأقسام.
                        </p>
                        <div className="d-flex gap-2">
                          <Link to="/" className="btn btn-primary">
                            الصفحة الرئيسية
                          </Link>
                          <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="btn btn-outline-secondary"
                          >
                            إعادة البحث
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // 3. Show products
                    searchresults.map((product, idx) => (
                      <div
                        className="col-6 col-sm-6 col-md-4 col-lg-4 mt-3 p-0 "
                        key={idx}
                      >
                        <Link
                          style={{ textDecoration: "none" }}
                          to={`/product/${product.slug}`}
                        >
                          <ProductCard product={product} />
                        </Link>
                      </div>
                    )) 
                  )}
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <Pagination
                    page={page}
                    totalPages={Totalpage}
                    onPageChange={handlePageChange}
                  />
                </div>
              </div>
            </div>
          </div>
 

      
        </main>

  
      </div>

  
                      {(searchresults && searchresults?.length>0)? (<>
                                {searchresults[0]?.Category && <div className='container-fluid  rounded px-3  mt-4  shadow-sm highlight-box'>
                                                    <NodeCategory onCardClick={()=>{window.scroll(0,0)}} categoryslug={searchresults[0]?.Category?.slug} cardWidth={300}></NodeCategory>
                                                </div>}
                      </>):(<>
                    <div className='container-fluid  rounded px-3  mt-4  shadow-sm highlight-box'>
                      <ModernSingleCategoryCarousel400edit cardWidth={300}>
            
                    </ModernSingleCategoryCarousel400edit>
                    
                    </div>
                      </>) }
       
        

    </div>
  );
}

  const PlaceholderRow = ({ keyVal }) => (
    <div className="d-flex gap-2 mb-3 align-items-center w-100" key={keyVal}>
      <div
        className="placeholder rounded"
        style={{ width: 64, height: 64 }}
      />
      <div className="flex-grow-1">
        <div className="placeholder-glow">
          <span className="placeholder col-8 mb-1"></span>
        </div>
        <div className="placeholder-glow">
          <span className="placeholder col-4"></span>
        </div>
      </div>
    </div>
  );

function Pagination({ page, totalPages, onPageChange }) {
  // How many page buttons to show around current page
  const siblingCount = 1;

  // Helper to create a range of numbers
  const range = (start, end) => {
    let length = end - start + 1;
    return Array.from({ length }, (_, i) => start + i);
  };

  // Calculate the pages to show
  const paginationRange = (() => {
    const totalPageNumbers = siblingCount * 2 + 5;

    if (totalPages <= totalPageNumbers) {
      return range(1, totalPages);
    }

    const leftSiblingIndex = Math.max(page - siblingCount, 1);
    const rightSiblingIndex = Math.min(page + siblingCount, totalPages);

    const showLeftEllipsis = leftSiblingIndex > 2;
    const showRightEllipsis = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    if (!showLeftEllipsis && showRightEllipsis) {
      let leftItemCount = 3 + 2 * siblingCount;
      let leftRange = range(1, leftItemCount);

      return [...leftRange, '...', totalPages];
    }

    if (showLeftEllipsis && !showRightEllipsis) {
      let rightItemCount = 3 + 2 * siblingCount;
      let rightRange = range(totalPages - rightItemCount + 1, totalPages);

      return [firstPageIndex, '...', ...rightRange];
    }

    if (showLeftEllipsis && showRightEllipsis) {
      let middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [firstPageIndex, '...', ...middleRange, '...', lastPageIndex];
    }
  })();

  return (
    <div className="containe mt-3 col-11 d-flex g-0" style={{flexFlow:"row nowrap",justifyContent:"space-evenly",alignItems:"end"}}>
    <nav aria-label="Page navigation ">
      <ul className="pagination  justify-content-center pagination-rounded shadow-sm m-0 p-0">


        {paginationRange.map((pageNum, idx) => {
          if (pageNum === '...') {
            return (
              <li key={`ellipsis-${idx}`} className="page-item disabled">
                <span className="page-link">...</span>
              </li>
            );
          }
          return (
            <li
              key={pageNum}
              className={`page-item ${pageNum === page ? 'active' : ''}`}
            >
              <button className="page-link" onClick={() => onPageChange(pageNum)}>
                {pageNum}
              </button>
            </li>
          );
        })}

   
      </ul>
    </nav>
    </div>
  );
}
