import React, { useState } from 'react';
import './Layout.css';
import Sidebar from '../sidebar/Sidebar';
import { Outlet, useLocation } from 'react-router-dom';
import Breadcrumbs from '../breadcrumb/breadcrumb';


export default function Layout({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <div className="d-flex">
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />
      <div className="main-content flex-grow-1" style={{marginRight:(isOpen) ? "":"0",width: (isOpen) ? "":"100%" }}>
        <nav className="navbar navbar-light bg-light shadow-sm px-3">
          <button
            className="btn btn-outline-primary d-md-none"
            onClick={toggleSidebar}
          >
            <i className="bi bi-list"></i>
          </button>

           <button
            className={`btn btn-outline-primary ${!isOpen? "d-md-inline-block":"d-none"} d-none `}
            onClick={toggleSidebar}
          >
            <i className="bi bi-list"></i>
          </button>

          <span className="ms-2 fw-bold">Admin Dashboard</span>

        </nav>
        <div className="p-0 ">
          <Breadcrumbs/>
          <Outlet/>
        </div>
      </div>
    </div>
  );
}
