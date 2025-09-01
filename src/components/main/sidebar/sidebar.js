import React, { useState,useEffect, useRef, useLayoutEffect } from 'react';
import './sidebar.css';
import { NavLink,useLocation } from 'react-router-dom';
import axios ,{originalAxios} from '../../../api/fetch'
import useNotification from '../../../Hooks/useNotification';
export default function Sidebar({ istoggled, toggleSidebar }) {
    const location = useLocation()
    const[links,setLinks]=useState([]);

    const [openMenus, setOpenMenus] = useState({});
    const controllerRef = useRef(null);
    const {showNotification}=useNotification()

    const toggleMenu = (name) => {
      setOpenMenus(prev => ({
        ...prev,             // keep other menus' states
        [name]: !prev[name]  // toggle only the clicked one
      }));
    };

  const renderLinksss = (items, isSub = false) => {
  return items.map((item, index) => {
    const hasSub = !!item.submenu;
    const isOpen = openMenus[item.name];

    return (
        
      <li
        key={index}
        className={`${isSub ? 'sidebarr-subitem' : 'sidebarr-item'} ${hasSub ? 'has-submenu' : ''}`}
      >
        <div
          className="d-flex justify-content-between align-items-center"
          onClick={() => hasSub ? toggleMenu(item.display_name) : null}
          style={{ cursor: 'pointer' }}
        >
          {!hasSub ? (
            <NavLink
              to={item.link}
              className={({ isActive }) =>
                `nav-link d-block w-100 ${isActive ? 'active-link text-primary' : 'text-dark'}`
              }
            >
              {item.name}
            </NavLink>
          ) : (
            <span className="nav-link d-block text-dark w-100">{item.display_name}</span>
          )}

          {hasSub && (
            <i className={`bi ms-2 ${isOpen ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
          )}
        </div>

        {hasSub && isOpen && (
          <ul className="sidebarr-submenu list-unstyled ps-3">
            {renderLinksss(item.submenu, true)}
          </ul>
        )}
      </li>
    );
  });
};

  const renderLinkssss= (items, isSub = false) => {
  return items.map((item, index) => {
    const hasSub = !!item.children && item.children.length > 0;
    const isOpen = openMenus[item.name];

    return (
        
      <li
        key={index}
        className={`${isSub ? 'sidebarr-subitem' : 'sidebarr-item'} ${hasSub ? 'has-submenu' : ''}`}
      >
        <div
          className="d-flex justify-content-between align-items-center"
          onClick={() => hasSub ? toggleMenu(item.name) : null}
          style={{ cursor: 'pointer' }}
        >
          {!hasSub ? (
            <NavLink
              to={item.link}
              className={({ isActive }) =>
                `nav-link d-block w-100 ${isActive ? 'active-link text-primary' : 'text-dark'}`
              }
            >
              {item.display_name}
            </NavLink>
          ) : (
            <span className="nav-link d-block text-dark w-100">{item.display_name}</span>
          )}

          {hasSub && (
            <i className={`bi ms-2 ${isOpen ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
          )}
        </div>

        {hasSub && isOpen && (
          <ul className="sidebarr-submenu list-unstyled ps-3">
            {renderLinkssss(item.children, true)}
          </ul>
        )}
      </li>
    );
  });
};
  ////////////////////////////////////////////////////////
    
    const renderLinkss = (items, isSub = false) => {
    return items.map((item, index) => {
      const hasSub = !!item.submenu;
      const isOpen = openMenus[item.name];

      return (
        
        <li
          key={index}
          className={`${isSub ? 'sidebarr-subitem' : 'sidebarr-item'} ${hasSub ? 'has-submenu' : ''}`}
        >
          <div
            className="d-flex justify-content-between align-items-center"
            onClick={() => hasSub ? toggleMenu(item.name) : null}
            style={{ cursor: hasSub ? 'pointer' : 'default' }}
          >
            <NavLink
              to={item.link}
              className={({ isActive }) =>
                `nav-link d-block w-100 ${isActive ? 'active-link text-primary' : 'text-dark'}`
              }
            >
              {item.name}
            </NavLink>
            {hasSub && (
              <i className={`bi ms-2 ${isOpen ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
            )}
          </div>

          {hasSub && isOpen && (
            <ul className="sidebarr-submenu list-unstyled ps-3">
              {renderLinkss(item.submenu, true)}
            </ul>
          )}
        </li>
      );
    });
  };
  

  const getlinks= async (signal)=>{
      try {

        const res = await axios.post("/category/getallnestedcategorieswithallchildren",{id:null,deleted:false,includeall:false}, {
          signal
        });
        console.log(res.data)
        setLinks(res.data);
        return
      } catch (error) {
        if (originalAxios.isCancel(error)|| error.name === 'CanceledError') {
          showNotification("info","Request canceled")
        } else {
          showNotification("error",error?.response?.data?.err+" "+error?.response?.data?.msg)
          
        }
        return
      }
    }

  useEffect(() => {
  }, [istoggled]);

  useLayoutEffect(()=>{
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    controllerRef.current = new AbortController();
    getlinks(controllerRef.current.signal);
    return () => {
      controllerRef.current?.abort();
    };
  },[])

const renderlinkfinal= (items,issub=false)=>{
        return items.map((item,index)=>{
            const hasSub=!!item.children;
            const isOpen=openMenus[item.display_name];

            return(<>
                {!hasSub ?  (
       <NavLink
        to={item.link}
        className={({ isActive }) =>
          `nav-link d-block ${isActive ? 'active-link text-primary' : 'text-dark'}`
        }
      >
        <li className={`${issub ? "sidebarr-item":"sidebarr-item" }  `}>
          {item.display_name}
        </li>
      </NavLink>

          ) : (
            <li

        key={index}
        className={`${issub ? 'sidebarr-subitem' : 'sidebarr-item'}  ${hasSub ? 'has-submenu ' : ''}`}>
        <div
          className="d-flex justify-content-between align-items-center  "
          onClick={() => hasSub ? toggleMenu(item.name) : null}
          style={{ cursor: 'pointer',width:"100%",backgroundColor:"" }}
        >
            <>
            <span className="nav-link d-block text-dark w-100">{item.display_name}</span>
            <i className={`bi ms-2 ${isOpen ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
            </>
          

     
        </div>

        {hasSub && isOpen && (
          <ul className="sidebarr-submenu list-unstyled ">
            {renderLinksss(item.children, true)}
          </ul>)}
            </li>
          )}
                      </>

            )
        });
        
    }

const renderlinkfinalfinal= (items,issub=false)=>{
        return items.map((item,index)=>{
const hasSub = !!item.children && item.children.length > 0;
            const isOpen=openMenus[item.name];

            return(<>
                {!hasSub ?  (
       <NavLink
        to={`/category${item.link}`}
        className={({ isActive }) =>
          `nav-link d-block ${isActive ? 'active-link text-primary' : 'text-dark'}`
        }
      >
        <li className={`${issub ? "sidebarr-item":"sidebarr-item" }  `}>
          {item.display_name}
        </li>
      </NavLink>

          ) : (
            <li

        key={index}
        className={`${issub ? 'sidebarr-subitem' : 'sidebarr-item'}  ${hasSub ? 'has-submenu ' : ''}`}>
        <div
          className="d-flex justify-content-between align-items-center  "
          onClick={() => hasSub ? toggleMenu(item.name) : null}
          style={{ cursor: 'pointer',width:"100%",backgroundColor:"" }}
        >
            <>
            <span className="nav-link d-block text-dark w-100">{item.display_name}</span>
            <i className={`bi ms-2 ${isOpen ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
            </>
          

     
        </div>

        {hasSub && isOpen && (
          <ul className="sidebarr-submenu list-unstyled ">
            {renderlinkfinalfinal(item.children, true)}
          </ul>)}
            </li>
          )}
                      </>

            )
        });
        
    }




  const renderLinks = (items,bool =false) => {
  return items.map((item, index) => (
    <>
      <NavLink
        to={item.link}
        className={({ isActive }) =>
          `nav-link d-block ${isActive ? 'active-link text-primary' : 'text-dark'}`
        }
      >
        <li className={`${bool ? "sidebarr-subitem":"sidebarr-item" }  ${item.submenu ? 'has-submenu' : ''}`}>
          {item.name}
          
          {item.submenu && (
            <ul className="sidebarr-submenu list-unstyled ps-3">
              {renderLinks(item.submenu,true)} {/* 🔁 recursion هنا */}
            </ul>
          )}
        </li>
      </NavLink>

    </>
  ));
};





  return (
    <div className={`sidebarr bg-light ${istoggled ? 'opeen' : ''}`}>
      <div className="sidebarr-header p-3 fw-bold border-bottom d-flex justify-content-between align-items-center">
        جميع الاقسام
        <button className="btn btn-sm btn-outline-secondary " onClick={toggleSidebar}>
  <i className="bi bi-x-lg"></i>
</button>


      </div>
      <ul className="list-unstyled m-0 p-3 sidebarr-list">


  {/* {renderLinks(linkss)} */}
  {/* {renderLinksss(linkss)} */}

  {/*  */}
  {/* {renderlinkfinal(linkss)} */}
{/*  */}
{renderlinkfinalfinal(links)}

      </ul>

    </div>
  );
}
