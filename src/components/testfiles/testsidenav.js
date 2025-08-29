
import React, { useEffect, useState } from "react";
import "./Sidebar.css";

export default function SidebarMenu({ nestcats,onSelect,isOpen,toggleSidebar }) {
  const [nestcategories,setnestcategories]=useState([]);
  useEffect(()=>{
    
const updated = [{uuid:"all", name:"all", display_name:"الجميع", parent_category_id:null, slug:"all"}, ...nestcats];
setnestcategories(updated);
  },[nestcats]);
  

  const renderMenu = (items, level = 0) =>
    items.map((item, i) => (
      <li
        key={i}
        className={`menus-item level-${level}`}
        onClick={(e) => {
          e.stopPropagation(); // ✅ prevent parent click from firing
          onSelect(item.slug);
        }}
      >
        <span className="menus-link">{item.name}</span>
        {item.children && (
          <ul className="submenus">{renderMenu(item.children, level + 1)}</ul>
        )}
      </li>
    ));
  if(!nestcategories) return (  
  <aside className={`sidebars ${isOpen ? "open" : ""}`}>
      <div className="sidebars-header">
        الاصناف
        <button className="btn btn-sm btn-outline-secondary" onClick={toggleSidebar}>
          <i className="bi bi-x-lg"></i>
        </button>
      </div>
    </aside>)
    
  if(nestcategories)
  return (
    <aside className={`sidebars ${isOpen ? "open" : ""}`}>
      <div className="sidebars-header">
        الاصناف
        <button className="btn btn-sm btn-outline-secondary" onClick={toggleSidebar}>
          <i className="bi bi-x-lg"></i>
        </button>
      </div>
      <ul className="menus-list">{renderMenu(nestcategories)}</ul>
    </aside>
  );
}