import React from 'react';
import './Sidebar.css';
import { NavLink,useLocation } from 'react-router-dom';

export default function Sidebar({ isOpen, toggleSidebar }) {
  const location = useLocation()
  const links =[];

  const linkss = [
    {name:"صفحة التحكم الرئيسية",link:"/dashboard"},
    {name:'PRODUCTS',link:"products_manger",submenu:[{name:"المنتجات",link:"products_manger"},{name:"Add New Product",link:"new_Product_Adding"},{name:"منتجات آخر إصدار" ,link:"latest_products"},{name:"منتجات قادمة قريبا",link:'upcoming_porducts'},{name:"منتجلت جديدة",link:"new_products"},{name:"الأفضل من :التصنيفات",link:"chooses_categories"},{name:"منتجلت العروض",link:"discount_product"},{name:"منتجات إخترنا لك",link:'most_products'}]},
    {name:"العملات" , link:"currency",submenu:[{name:"العملات" , link:"currency"},{name:"إضافة عملة جديدة",link:"currency_add"},{name:"مركز الصرافة",link:'exchange_rate'},{name:"إضافة صرافة جديدة",link:"exchange_rate_add"}]},
    {name:'الطلبات', link: 'orders' },
    {name:"مركز الموردين" ,link:"supplier",submenu:[{name:"الموردين",link:"supplier"},{name:"مركز شحنات الموردين",link:"supplier_shipments_manger"},{name:"إضافة مورد جديد",link:"addsupplier"}]},
    {name:"إدارة  الواجهة",link:"ADS_Settings"},
    {name:"إدارة الواجهة",link:"",submenu:[{name:"منتجات التخفيضات",link:"dropin_product_settings"} ,{name:"صور الواجهة",link:"ADS_Settings"}]},
    {name : "إدارة التصنيفات" , link : 'category_Settings' },
    {name : "إدارة المستخدمين" , link : 'USERS_Settings' },
    {name : "إدارة الكوبونات : codes" , link : 'CODES_Settings' },
    {name:'Viewlayout',link:'productlayout'}
];


  const renderLinks = (items,bool =false) => {
  return items.map((item, index) => (
    <>
      <NavLink
        to={item.link}
        className={({ isActive }) =>
          `nav-link d-block ${isActive ? 'active-link text-primary' : 'text-dark'}`
        }
      >
        <li className={`${bool ? "sidebar-subitem":"sidebar-item" }  ${item.submenu ? 'has-submenu' : ''}`}>
          {item.name}
          
          {item.submenu && (
            <ul className="sidebar-submenu list-unstyled ps-3">
              {renderLinks(item.submenu,true)} {/* 🔁 recursion هنا */}
            </ul>
          )}
        </li>
      </NavLink>

    </>
  ));
};




  return (
    <div className={`sidebar bg-light ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header p-3 fw-bold border-bottom d-flex justify-content-between align-items-center">
        Admin Menu
        <button className="btn btn-sm btn-outline-secondary" onClick={toggleSidebar}>
  <i className="bi bi-x-lg"></i>
</button>


      </div>
      <ul className="list-unstyled m-0 p-3 sidebar-list">
  

  {renderLinks(linkss)}



      </ul>

    </div>
  );
}
