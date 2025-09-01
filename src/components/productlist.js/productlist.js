import React, { useEffect, useLayoutEffect, useState } from 'react';
import RightOptions from '../rightoptions/rightoptions';
import ProductCard from '../main/card/card';
import { Link, useLocation } from 'react-router-dom';
import useNotification from '../../Hooks/useNotification';
import axios from '../../api/fetch'


const ProductList = () => {
  const location=useLocation();
  const segments = location.pathname.split("/").filter(Boolean);
  const [slug,setSlug]= useState(null);
  let middleSegments = [];
  
  const { showNotification}=useNotification();
  const [selectedFilters, setSelectedFilters] = useState({});
  const[optionFilters,setOptionFilters]=useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [itemsnumber,setItemsnumber]=useState(0);
  const [orderbyoption, setOrderbyoption] = useState('default');
  const [filters, setFilters] = useState({isAvailable:true,softdelete:false});
  const [totalPages, setTotalPages] = useState(1);
  const [productss, setProducts] = useState([]);
  const [categroyinfo,setCategoryinfo]=useState({});
  
  const handleFilterChange = (filterName, selected) => {
    const updated = { ...selectedFilters, [filterName]: selected };
    setSelectedFilters(updated);

  };



  const fetchProducts = async () => {
  const latestNewSlugs = slug && slug !== "all" ? [slug] : [];

    const mergedSlugs = [ ...latestNewSlugs];
    
  try {
    console.log(slug)
    const res = await axios.post("/product/filterproducts", {
      page:page,
      limit:limit,
      orderby:orderbyoption,
      ...filters,
      slugs:[slug], 
    });
    console.log(res.data,"somthign somthing somthing somthing ")
    setProducts(res.data.products || []);
    setPage(res.data.currentPage || 1);
    setTotalPages(res.data.totalPages || 1);
    setItemsnumber(res.data.total || 0);
  } catch (err) {
     setProducts([]);
    showNotification("error","لا يوجد اي منتج في هذا التصنيف")
  }
};
  const fetchcategories = async () => {
  try {
    const res = await axios.post("/category/filtercategories", {
      slugs:slug 
    });
    setCategoryinfo(res.data.categories[0]);
  } catch (err) {
    console.log(err)
    showNotification("error","هذا التصنيف لا يوجد")
  }
};



    const [orderby,setorderby]=useState(false);

    const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };
  
  const handelorder = (option) => {
    setOrderbyoption(option);
  };
    useEffect(()=>{
      setSlug(null);
      setProducts([])
      setCategoryinfo({})
    if (segments.length > 1) {
      setSlug(segments[segments.length - 1]); 
      setPage(1);
      middleSegments = segments.slice(1, -1); 
    } else {
      setSlug('all');
      middleSegments = [];
    }
    return;
    },[location.pathname])
    
    useEffect(() => {
      if (slug === null) return;
      fetchProducts();
      fetchcategories();
      return;
    },[slug,orderbyoption,page,limit]);

  return (
    <div className='container-fluid'>
      {/* Top: Sort Bar */}
    <div className="d-flex justify-content-between align-items-center flex-wrap py-3 "  style={{ paddingLeft: '1.5rem' }}>
  <h5 className="mb-2 mb-md-0">المنتجات</h5> {/* Arabic title "Products" */}


</div>


      {/* Main Grid Row: Filters + Products */}
      <div className="row ">
        
        {/* Filter Panel (Inside ProductList) */}
        <div className="d-none d-lg-block col-md-3 mb-3 p-2 pt-4  col-lg-2"  style={{ }}>
          <RightOptions
          optionFilters={optionFilters}
          onFilterChange={handleFilterChange} 
          selectedFilters={selectedFilters}/>
        </div>
           {/* Overlay background when open */}
      {orderby && (
        <div
          className="overlay d-lg-none"
          onClick={() => setorderby(false)}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1040,
          }}
        />
      )}

      {/* Sidebar panel */}
      <div
        className={`d-block d-lg-none right-options-sidebar bg-white shadow d-md-block ${
          orderby ? 'open' : ''
        }`}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100vh',
          width: '280px',
          maxWidth: '80vw',
          overflowY: 'auto',
          transition: 'transform 0.3s ease',
          zIndex: 1050,
          transform: orderby ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        {/* Close button */}
        <button
          className="btn btn-light d-lg-none m-3"
          onClick={() => setorderby(false)}
        >
          <i className="bi bi-x-lg"></i>
        </button>

        {/* Your options content here */}
        <div className="p-3">
                    <RightOptions 
                  optionFilters={optionFilters}
                  onFilterChange={handleFilterChange}
                  selectedFilters={selectedFilters} />

        </div>
      </div>
 

        {/* Product Cards */}
        <div className="col-md-12 col-lg-10 mt-3"  >
        <div className='container  '>
        <h2 className="fw-semibold mb-3 pb-3 container ps-0" 
  style={{
    textAlign:"start",
    fontSize: "1.8rem",
    color: "#4B5563",
    borderBottom: "2px solid #E5E7EB", // light gray underline
    display: "inline-block",
  }}>
      {categroyinfo.display_name || ""}
    </h2>

    {/* Clean Description */}
    <p className="text-muted mb-4" style={{ fontSize: "1rem", maxWidth: "700px" }}>
      {categroyinfo.description}
    </p>
        </div>             
              <div className="d-flex align-items-center gap-2 me-auto mb-5 pt-2">
         <div className='px-3' style={{display:"flex" ,flexFlow:"row nowrap",justifyContent:"space-around",alignItems:"center",margin:""}}>
    <label htmlFor="sort" className="me-2 fw-medium text-muted ">
      ترتيب حسب:
    </label>
    <select
      value={orderbyoption}

      id="sort"
      className="form-select form-select-sm w-auto"
      onChange={(e) => handelorder(e.target.value)}
    >
      <option value={null}>الافتراضي</option>
      <option value="price-asc">السعر: الأقل أولاً</option>
      <option value="price-desc">السعر: الأعلى أولاً</option>
      <option value="title-asc">الاسم: A-Z</option>
      <option value="title-desc">الاسم: Z-A</option>
    </select>
    </div>

          <button className="d-block d-lg-none btn btn-outline-primary d-flex align-items-center gap-2 ms-auto"
          onClick={()=>setorderby(true)}>
  <i className="bi bi-filter"></i>
  <span>تصفية</span>
</button>
  </div>
          {/* <div className="row g-4">
            {products.map((product) => (
              <div className="col-lg-4 col-md-6  col-6" key={product.id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div> */}

               <div  className="container-fluid pb-2" style={{backgroundColor:"" ,borderBottom: '1px solid #ddd',}}>
<div className="row gy-2 gy-sm-3 gy-md-4 justify-content-start" >
        {productss.map((product, idx) => (
          <div style={{backgroundColor:''}} className="col-6 col-sm-6 col-md-4 mt-3 col-lg-3 px-1 px-sm-3 px-md-2 px-lg-3" key={idx}>
            <Link style={{textDecoration:"none"}} to={`/product/${product.slug}`}>
            <ProductCard product={product} />
            </Link>
          </div>
        ))}
      </div>
    </div>

    < Pagination
  page={page}
  totalPages={totalPages}
  onPageChange={handlePageChange}
/>

        </div>
        
        
      </div>
     
    </div>
  );
};

export default ProductList;


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
