import React, { useEffect, useRef, useState } from "react";
import ProductCard from "../card/card";

import { NavLink, Outlet ,useNavigate,Link ,useLocation} from "react-router-dom";
import './main.css'
import mayimage from './cortex 7 final.png'
import myimage from './cortexcopy.png'
import Sidebar from "../sidebar/sidebar";
import useAuth from "../../../Hooks/useAuth";
import useLogout from "../../../Hooks/useLogout";

export default function MainPage() {
    const [istoggled, setIstoggled] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [keyword, setKeyword] = useState("");
    const year = new Date().getFullYear()
    const handelchange=(e)=>{
      setKeyword(e.target.value);
    }

    const [locat,setLocat]=useState("");

    const{auth,Setauth}=useAuth();
    const navigate = useNavigate();
    const location = useLocation();
        const handelsearchsumit=async (e)=>{
      e.preventDefault();
      if(keyword.trim()==="") return;
      navigate(`/search?keyword=${keyword.trim()}`);
      return;
    }

  const logout=useLogout();
    
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


  useEffect(() => {
    setLocat(location.pathname);
    return ;
  }, [location]);
  return (
    <>     
      <div className="container-fluid p-0 m-0  conmain">

           <Sidebar  istoggled={istoggled} toggleSidebar={toggleSidebar} />

    <div className={` conatiner-fluid mainn bg-white`} style={{marginRight:(istoggled) ? "":"0",minHeight:"100vh",width: (istoggled) ? "":"100%" }}>

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
            <h4 className="fw-bold mb-0 wave-text" style={{ fontFamily: "'Comfortaa', sans-serif" }}>
              The Cortex 7
            </h4>

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
        
            setShowSearch(false);
            setShowdash((prev)=> !prev);
          
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
        <form onSubmit={handelsearchsumit} className="d-flex p-2" style={{ gap: "8px" }}>
          <input
            className="form-control"
            type="text"
            placeholder="ابحث عن المنتجات..."
            aria-label="بحث"
            value={keyword}
            onChange={handelchange}
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

        {auth ? (<>   
        <NavLink to='/profile' className='nav-link text-dark m-2'><li> <i className="bi bi-person text-primary "></i> الصفحة الشخصية </li></NavLink>
        <NavLink to='/cart' className='nav-link text-dark m-2'><li><i className="bi bi-cart-plus text-primary"></i> السلة </li></NavLink>
        <NavLink onClick={(event)=>{event.preventDefault(); logout(); }} className='nav-link text-dark m-2 mb-0'><li className="text-danger"><i className="bi bi-box-arrow-in-right text-danger"></i> تسجيل الخروج</li></NavLink></>)
        :(<>
        <NavLink to='/log' className='nav-link text-dark m-2'><li> <i className="bi bi-person text-primary "></i> تسجيل دخول </li></NavLink>
        <NavLink to='/log' className='nav-link text-dark m-2'><li><i className="bi bi-cart-plus text-primary"></i> إنشاء حساب </li></NavLink>
        </>) }

      </ul>
      </div>
    </div>

    {/* ///////////////////////////////////////////////// */}
          <div style={{backgroundColor:""}} className="navbarmain collapse  navbar-collapse p-sm-1 p-md-2 pb-md-2  " >
       
       

            <ul className="navbar-nav mb-2 mb-lg-0" style={{gap:"30px",}}>
              <Link className="nav-link text-white p-0 m-0 pb-0 pt-0" >

              <li className="nav-item p-0 m-0 " >
                  <i className="bi bi-box text-white fs-4 p-0 m-0"></i>

         
              </li>
                     </Link>
              <Link to={"/cart"} className="nav-link text-white p-0 m-0 pb-0 pt-0" >

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
                ref={dashref}
                  className={` fdfdfd  rounded mt-2 overflow-hidden`}
                  style={{
                    backgroundColor:"#e9ecef",
                    maxHeight: showdash ? "150px" : "0px",
                    transition: "max-height 0.4s ease",
                  }}
                >
                <ul className="list-unstyled m-0 p-3 ">
                  <NavLink to='/profile' className='nav-link text-dark'><li> <i className="bi bi-person text-primary"></i> الصفحة الشخصية </li></NavLink>
                  <NavLink to='/cart' className='nav-link text-dark'><li><i className="bi bi-cart-plus text-primary"></i> السلة </li></NavLink>
                  <NavLink to='fff' onClick={(e)=>{e.preventDefault();logout();}} className='nav-link text-dark m-0'><li className="text-danger"><i className="bi bi-box-arrow-in-right text-dangere"></i> تسجيل الخروج</li></NavLink>
                  
                  

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
        

        <div className="row header-row p-0 m-0 " style={{backgroundColor:""}}>
        {(!locat.startsWith("/profile")) ? 
           (<>
               <header className="app-header d-none d-lg-flex me-auto ms-auto py-3 " style={{backgroundColor:""}}>
          {/* 1) Home icon */}
          <Link to="/" className="home-link">
            <img 
              src={mayimage}
              alt="Home"
              className="home-icon"
            />
          </Link>

          {/* 2) Search input with attached icon button */}
          
          <div className="input-group search-group">
            <form className="d-flex w-100" onSubmit={handelsearchsumit} >
            <input
              type="text"
              value={keyword}
              onChange={handelchange}
              className="form-control"
              placeholder="Search…"
              aria-label="Site search"
            />
            <button
              className="btn btn-outline "
              type="button"
              aria-label="Search"
              onClick={handelsearchsumit}
            >
              <i className="bi bi-search rounded"></i>
            </button>
            </form>
          </div>

          {/* 3) Text logo */}
        <Link to="/" className="home-link">
            <img 
              src={myimage}
              alt="Home"
              className="home-icon"
            />
          </Link>
    </header>

        </>):(<></>) }

    <div className="header-footer d-none d-lg-flex  p-0 py-1 " style={{maxWidth:"1240px"}} >
      <button className="btn  d-flex  gap-2" style={{ fontSize: "1.25rem" }} type="button"             
      onClick={toggleSidebar}
      >
        <i className="bi bi-list" style={{ fontSize: "1.5rem" }}></i>
        <span>جميع الأقسام</span>
      </button>
      <div className="conter ">
        {auth?
        (<>
        <NavLink to='' onClick={(e)=>{e.preventDefault(); logout(); return;}} className='conter-link text-danger'>تسجيل خروج</NavLink>

        
        </>)
        :(<>
        <NavLink to='/log' style={{ fontSize: "1.1rem" }} className='conter-link'>تسجيل</NavLink>
        <NavLink to='/log' style={{ fontSize: "1.1rem" }} className='conter-link'>دخول</NavLink>  
        </>)}
      </div>
      


    </div>

        </div>
        <hr className="mb-0 d-none d-lg-block border-top border-secondary" />

        <div className="row main-row " style={{backgroundColor:""}}>    
          {/* لفوق كل ثابت */}
          {/* المحتوى الرئيسي */}
     
          {/*  */}
          
          <main style={{backgroundColor:"",minHeight:"100vh"}} className="col-lg-12  p-0 ">
           
            <Outlet></Outlet>
         
          </main>
        </div>




      </div>



      {/* الفوتر */}{/* هون ثابت */}
      {/* <footer className=" text-light py-4 mt-4 footer" style={{backgroundColor:"rgb(32, 112, 210)"}}>
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
      </footer> */}

        <footer
          className="text-light py-4 mt-5 footer"
          style={{
            backgroundColor:"rgb(32, 112, 210)"
          }}
         >
          <div className="container">
            <div className="row align-items-center">
              {/* Left side */}
              <div className="col-md-6 mb-3 mb-md-0">
                        <h4 style={{ fontFamily: "'Comfortaa', 'Poppins', sans-serif", fontWeight:700 }}>
                          The Cortex 7
                        </h4>
                        
                        <p className="mb-0 small opacity-75">&copy; {year} جميع الحقوق محفوظة.</p>
              </div>

              {/* Right side - Social links */}
                  <div className="col-md-6 d-flex justify-content-md-end justify-content-start align-items-center gap-2">
                    {/* Social buttons */}
                    <a
                      href="https://www.facebook.com/share/19d6shfM2g/"
                      className="btn btn-outline-light btn-sm rounded-circle d-inline-flex align-items-center justify-content-center"
                      style={{ width: 40, height: 40 }}
                      aria-label="Facebook"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="bi bi-facebook" />
                    </a>

                    <a
                      href="https://t.me/C_ortex7"
                      className="btn btn-outline-light btn-sm rounded-circle d-inline-flex align-items-center justify-content-center"
                      style={{ width: 40, height: 40 }}
                      aria-label="Telegram"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="bi bi-telegram" />
                    </a>

                    <a
                      href="https://www.instagram.com/cortex__7?igsh=MTB3dnJrb2Ztcnh4eQ%3D%3D&utm_source=qr"
                      className="btn btn-outline-light btn-sm rounded-circle d-inline-flex align-items-center justify-content-center"
                      style={{ width: 40, height: 40 }}
                      aria-label="Instagram"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="bi bi-instagram" />
                    </a>

                    {/* optionally: WhatsApp as a pill */}
                    <a
                      href={`https://wa.me/963956330906`}
                      className="btn btn-success btn-sm rounded-pill ms-2  d-sm-inline-flex align-items-center"
                      style={{ paddingLeft: 12, paddingRight: 12, fontWeight: 600 }}
                      aria-label="WhatsApp"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="bi bi-whatsapp me-2" />
                      تواصل معنا
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

