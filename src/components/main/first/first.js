import React, { useEffect, useRef, useState } from "react";
import ProductCard from "../card/card";

import { NavLink, Outlet ,useNavigate,Link } from "react-router-dom";
import './main.css'
import mayimage from './cortex 7 final.png'
import myimage from './cortexcopy.png'
import Sidebar from "../sidebar/sidebar";
import useAuth from "../../../Hooks/useAuth";

const banners = [
  { id: 1, img: "https://cdn.pixabay.com/photo/2015/10/29/14/38/web-1012467_1280.jpg", title: "تخفيضات كبيرة!", subtitle: "حتى 50% خصم على اللابتوبات" },
  { id: 2, img: "https://cdn.pixabay.com/photo/2015/10/29/14/38/web-1012467_1280.jpg", title: "وصل حديثاً", subtitle: "اكتشف أحدث الأجهزة" },
  { id: 3, img: "https://cdn.pixabay.com/photo/2015/10/29/14/38/web-1012467_1280.jpg", title: "أدوات الألعاب", subtitle: "أفضل الملحقات للاعبين" },
];



const categoriess = [
  {
    id: 'laptops',
    title: 'لابتوبات و ملحقاتها',
    items: [
      { id: 'new', label: 'لابتوبات جديدة', href: '/laptops/new' },
      { id: 'mac', label: 'أجهزة Mac', href: '/laptops/mac' },
      // …
    ]
  },
  {
    id: 'desktops',
    title: 'حواسيب مكتبية و ملحقاتها',
    items: [
      { id: 'pcs', label: 'حواسب مكتبية', href: '/desktops/pcs' },
      { id: 'monitors', label: 'شاشات حواسيب', href: '/desktops/monitors' },
      // …
    ]
  },
  // …more categories
];

const productss = [
  {
    badge: "الأكثر مبيعًا",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlndpwDalSNF8TzBG6T7kGv73l0IOReNJpKw&s",
    title: "قرص تخزين محمول",
    description: "سرعة عالية بفضل منفذ USB-C وتخزين 1 تيرابايت.",
    specs: ["1 تيرابايت", "USB-C", "محمول"],
    price: 89.99,
  },
  {
    badge: "جديد",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlndpwDalSNF8TzBG6T7kGv73l0IOReNJpKw&s",
    title: "شاحن سريع",
    description: "دعم الشحن السريع للهواتف والأجهزة اللوحية.",
    specs: ["18W", "USB-A", "خفيف الوزن"],
    price: 19.99,
  },
  {
    badge: "مميز",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlndpwDalSNF8TzBG6T7kGv73l0IOReNJpKw&s",
    title: "سماعة بلوتوث",
    description: "جودة صوت عالية واتصال مستقر بالبلوتوث.",
    specs: ["BT 5.0", "8 ساعات", "ميكروفون مدمج"],
    price: 29.99,
  },
  
  {
    badge: "مميز",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlndpwDalSNF8TzBG6T7kGv73l0IOReNJpKw&s",
    title: "سماعة بلوتوث",
    description: "جودة صوت عالية واتصال مستقر بالبلوتوث.",
    specs: ["BT 5.0", "8 ساعات", "ميكروفون مدمج"],
    price: 29.99,
  },
  {
    badge: "مميز",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlndpwDalSNF8TzBG6T7kGv73l0IOReNJpKw&s",
    title: "سماعة بلوتوث",
    description: "جودة صوت عالية واتصال مستقر بالبلوتوث.",
    specs: ["BT 5.0", "8 ساعات", "ميكروفون مدمج"],
    price: 29.99,
  },
  {
    badge: "مميز",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlndpwDalSNF8TzBG6T7kGv73l0IOReNJpKw&s",
    title: "سماعة gog oggoog man  شسيب ",
    description: "جودة صوت عالية واتصال مستقر بالبلوتوث.",
    specs: ["BT 5.0", "8 ساعات", "ميكروفون مدمج"],
    price: 29.99,
  },
  {
    badge: "مميز",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlndpwDalSNF8TzBG6T7kGv73l0IOReNJpKw&s",
    title: "سماعة بلوتوث",
    description: "جودة صوت عالية واتصال مستقر بالبلوتوث.",
    specs: ["BT 5.0", "8 ساعات", "ميكروفون مدمج"],
    price: 29.99,
  },
  {
    badge: "مميز",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlndpwDalSNF8TzBG6T7kGv73l0IOReNJpKw&s",
    title: "سماعة بلوتوث",
    description: "جودة صوت عالية واتصال مستقر بالبلوتوث.",
    specs: ["BT 5.0", "8 ساعات", "ميكروفون مدمج"],
    price: 29.99,
  },
  {
    badge: "مميز",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlndpwDalSNF8TzBG6T7kGv73l0IOReNJpKw&s",
    title: "سماعة بلوتوث",
    description: "جودة صوت عالية واتصال مستقر بالبلوتوث.",
    specs: ["BT 5.0", "8 ساعات", "ميكروفون مدمج"],
    price: 29.99,
  }
];
export default function MainPage() {
    const [istoggled, setIstoggled] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const{auth,Setauth}=useAuth();
    const navigate = useNavigate();
    
    const toggleSidebar=()=>{setIstoggled(!istoggled);
    }
  

    ////

 const [showdash, setShowdash] = useState(false);
  const dashref = useRef(null);
    const searchref = useRef(null);

 useEffect(() => {
    function handleClickOutside(event) {
   
        if (dashref.current && !dashref.current.contains(event.target)) {
        setShowdash(false);
      }
      
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setShowSearch(false);
        setShowdash(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

    ///
  useEffect(() => {
    const carouselEl = document.getElementById('bannerCarousel');
    if (carouselEl && window.bootstrap) {
      new window.bootstrap.Carousel(carouselEl, {
        interval: 3000,
        ride: 'carousel',
        pause: false
      });
    }
  }, []);
  return (
    <>     
      <div className="container-fluid p-0 m-0  conmain">

           <Sidebar  istoggled={istoggled} toggleSidebar={toggleSidebar} />

    <div className={` conatiner-fluid mainn `} style={{marginRight:(istoggled) ? "":"0",minHeight:"100vh",width: (istoggled) ? "":"100%",backgroundColor:"" }}>

      {/* شريط التنقل العلوي */}
      <nav className="navbar navbar-expand-lg navbar-dark    mb-0" style={{backgroundColor:"rgb(32, 112, 210)",paddingBottom:"6px" ,paddingTop:"6px"}}>
        <div className="container-fluid" style={{backgroundColor:'rgb(32, 112, 210)',display:'flex',flexFlow:"row nowrap",justifyContent:"space-between"}}>
          {/* زر القائمة الجانبية للأجهزة الصغيرة */}
          <button
            className="btn btn-outline-light d-lg-none ms-2"
            type="button"
            onClick={toggleSidebar}
          
          >
            ☰
          </button>

          <Link to="/" className="navbar-brand  ms-3 p-sm-1 p-md-2 pb-md-2">
            The Cortex 7
          </Link>

      
 <div className="seachicon position-relative d-inline-block">






      {/* Search Icon Button */}
      <button
        className="btn"
        ref={searchref}
        onClick={() => {
          setShowdash(false);
          setShowSearch((prev)=>!prev);
          
        }}      >
        <i className="bi bi-search fs-4 text-white"></i>
      </button>

     <button
        className="btn"
        onClick={()=>navigate('/cart')}
        
      >
        <i className="bi bi-cart fs-4 text-white"></i>
      </button>
      
      <button
      ref={dashref}
           style={{ outline: "none", boxShadow: "none" }}
           
        className="btn "
        onClick={() => {
          Setauth('asdfdsf')
          if(auth===null ||auth===undefined){setShowSearch(false);navigate('/log');}
          else{
            setShowSearch(false);
            setShowdash((prev)=> !prev);
          }
        }}
      >
        <i className="bi bi-person-circle fs-4 text-white"></i>
</button>
      {/* Search Form: slides down under the icon */}
      <div
    
        className={` fdfdf rounded mt-2 overflow-hidden`}
        style={{
          backgroundColor:"#e9ecef",
          maxHeight: showSearch ? "100px" : "0px",
          transition: "max-height 0.4s ease",
        }}
      >
        <form className="d-flex p-2" style={{ gap: "8px" }}>
          <input
            className="form-control"
            type="search"
            placeholder="ابحث عن المنتجات..."
            aria-label="بحث"
          />
          <button className="btn btn-primary btn-outline-light text-white" type="submit">
            بحث
          </button>
        </form>
      </div>

      
      {/* Search Form: slides down under the icon */}
       <div
    
        className={` fdfdf  rounded mt-2 overflow-hidden`}
        style={{
          backgroundColor:"#e9ecef",
          maxHeight: showdash ? "150px" : "0px",
          transition: "max-height 0.4s ease",
        }}
      >
      <ul className="list-unstyled m-0 p-3 ">
        <NavLink className='nav-link text-dark m-2'><li> <i className="bi bi-person text-white"></i> الصفحة الشخصية </li></NavLink>
        <NavLink className='nav-link text-dark m-2'><li><i className="bi bi-cart-plus text-white"></i> السلة </li></NavLink>
        <NavLink className='nav-link text-dark m-2 mb-0'><li><i className="bi bi-box-arrow-in-right text-white"></i> تسجيل الخروج</li></NavLink>
      </ul>
      </div>
    </div>

    {/* ///////////////////////////////////////////////// */}
          <div style={{backgroundColor:""}} className="navbarmain collapse  navbar-collapse p-sm-1 p-md-2 pb-md-2  " >
       
       

            <ul className="navbar-nav mb-2 mb-lg-0" style={{gap:"30px"}}>
              <Link className="nav-link text-white p-0 m-0 pb-0 pt-0" >

              <li className="nav-item p-0 m-0 " >
                  <i className="bi bi-box text-white fs-4 p-0 m-0"></i>

         
              </li>
                     </Link>
              <Link className="nav-link text-white p-0 m-0 pb-0 pt-0" >

                  <li className="nav-item p-0 m-0 " >
                      <i className="bi bi-cart text-white fs-4 p-0 m-0"></i>

            
                  </li>
              </Link>
              
              {auth?  ( 
                <>
                <li className="nav-item p-0 m-0">
               <button
              ref={dashref}
              style={{ outline: "none", boxShadow: "none" }}
           
             className="btn p-0 m-0"
              onClick={() => {
              Setauth('asdfdsf')
            if(auth===null ||auth===undefined){setShowSearch(false);navigate('/log');}
             else{
            setShowSearch(false);
            setShowdash((prev)=> !prev);
          }
        }}
            >
            <i className="bi bi-person-circle fs-4 m-0 pe-2 text-white"></i>
            </button>
            </li>
              
                <div
              
                  className={` fdfdfd  rounded mt-2 overflow-hidden`}
                  style={{
                    backgroundColor:"#e9ecef",
                    maxHeight: showdash ? "150px" : "0px",
                    transition: "max-height 0.4s ease",
                  }}
                >
                <ul className="list-unstyled m-0 p-3 ">
                  <NavLink to='/profile' className='nav-link text-dark'><li> <i className="bi bi-person text-white"></i> الصفحة الشخصية </li></NavLink>
                  <NavLink to='/cart' className='nav-link text-dark'><li><i className="bi bi-cart-plus text-white"></i> السلة </li></NavLink>
                  <NavLink className='nav-link text-dark'><li><i className="bi bi-box-arrow-in-right text-white"></i> تسجيل الخروج</li></NavLink>
                </ul>
                </div>
                </>)

              :(
                  <NavLink to="/log" className="nav-link p-1 px-0 mt-1">

              <li className="nav-item text-white p-0 m-0">
                  تسجيل الدخول
              </li>
              </NavLink>
              )}       
            
            </ul> 
          </div>
        </div>
      </nav>


      <div className="container-fluid  fff "  >
        <Outlet/>

        <div className="row header-row p-0 m-0 " style={{backgroundColor:""}}>
       <header className="app-header d-none d-lg-flex me-auto ms-auto py-3 " style={{backgroundColor:""}}>
          {/* 1) Home icon */}
          <a href="/main" className="home-link">
            <img 
              src={mayimage}
              alt="Home"
              className="home-icon"
            />
          </a>

          {/* 2) Search input with attached icon button */}
          <div className="input-group search-group">
            <input
              type="search"
              className="form-control"
              placeholder="Search…"
              aria-label="Site search"
            />
            <button
              className="btn btn-outline "
              type="button"
              aria-label="Search"
            >
              <i className="bi bi-search rounded"></i>
            </button>
          </div>

          {/* 3) Text logo */}
        <a href="/main" className="home-link">
            <img 
              src={myimage}
              alt="Home"
              className="home-icon"
            />
          </a>
    </header>
    <div className="header-footer d-none d-lg-flex  p-0 py-1 " >
      <button className="btn  d-flex  gap-2" style={{ fontSize: "1.25rem" }} type="button"             
      onClick={toggleSidebar}
      >
        <i className="bi bi-list" style={{ fontSize: "1.5rem" }}></i>
        <span>جميع الأقسام</span>
      </button>
      <div className="conter ">
        <NavLink className='conter-link'>تسجيل</NavLink>
        <NavLink className='conter-link'>دخول</NavLink>
      </div>
      


    </div>

        </div>
        <div className="row main-row " style={{backgroundColor:""}}>    
          {/* لفوق كل ثابت */}
          {/* المحتوى الرئيسي */}
          {/* /////////////
          // /////////////
          // ///////////
          /////////// */}
          {/*  */}
          
          <main style={{backgroundColor:"",minHeight:"100vh"}} className="col-lg-12 p-0 ">
           
            <Outlet></Outlet>
         
          </main>
        </div>




      </div>



      {/* الفوتر */}{/* هون ثابت */}
      <footer className=" text-light py-4 mt-4 footer" style={{backgroundColor:"rgb(32, 112, 210)"}}>
        <div className="container" style={{backgroundColor:"rgb(32, 112, 210)"}}>
          <div className="row" style={{backgroundColor:"rgb(32, 112, 210)"}}>
            <div className="col-md-6" style={{backgroundColor:"rgb(32, 112, 210)"}}>
              <h5>The Cortex 7</h5>
              <p>© 2025 جميع الحقوق محفوظة.</p>
            </div>
            <div className="col-md-6">
              <a href="#" className="text-light ms-3">
                فيسبوك
              </a>
              <a href="#" className="text-light ms-3">
                تويتر
              </a>
              <a href="#" className="text-light ms-3">
                إنستغرام
              </a>
            </div>
          </div>
        </div>
      </footer>
      </div>
            </div>


    </>
  );
}
