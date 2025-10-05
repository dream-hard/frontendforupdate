import './App.css';
import Layout from './components/adminlayout/Layout';
import { useNavigate,createBrowserRouter,Routes , Route ,Link,NavLink, createRoutesFromElements, RouterProvider, Outlet, Navigate} from 'react-router-dom';
import { useEffect, useState,useContext, useLayoutEffect } from 'react';
//////components 
///////////////        TESTING           /////////////////////////





///////////////        TESTING           /////////////////////////

import NoNeedAuth from './components/noneedAuth/NoNeedAuth';
import Notfound from './components/notfound/Notfound';
import TableGenerator from './components/TableGenerator/TableGenerator';  
import CloudinaryUpload from './components/cloud/cloud';
import MainPage from './components/main/layoutpage/main';
import ProductList from './components/productlist.js/productlist';
import Defaultpage from './components/main/mainpage/default';
 import Auth from "./components/login/AuthPage.js"
import CartPage from './components/Cart/Cart.js';
import Test from './components/test.js';
import CartPagetest from './components/Cart/Carttest.js';
import UserProfile from './components/Profile/Profile.js';
import Info from './components/Profile/info.js';
import Premiumandup from './components/premiumuserandup/premiumandup.js';
import ProductDetail from './components/ProductPage/ProductDetailsPage.jsx';
import ModernTable from './components/testfiles/test1.js';
import { SlideInDrawerTable } from './components/testfiles/test2.js';
import { ExpandableRowTable } from './components/testfiles/test3.js';
import { OpenNewPageApp } from './components/testfiles/test4.js';
import Test5 from './components/testfiles/test5.js';
import Test6 from './components/testfiles/test6.js';
import Test7 from './components/testfiles/test7.js';
import AddProductPage from './components/testfiles/testaddproduct.js';
import ProductForm from './components/testfiles/testaddproduct2.js';
import AddProductPage2 from './components/testfiles/testaddproduct2.js';
import Alreadylogin from './components/alreadylogin/alreadylogin.js';
import DashboardWelcome from './components/Dashboardwelcome/Dashboardwelcome.jsx';
import ComingSoon from './components/ComingSoon/ComingSoon.jsx';
import AdminCurrenciesExchangeBootstrap from './components/currency/currencycontroller.jsx';
import Currency from './components/finalcurrency/Currency.jsx';
import CurrencyAdd from './components/finalcurrency/CurrencyAdd.jsx';
import ExchangeRates from './components/finalExchange_rate/Exchange_rate.jsx';
import ExchangeRateAdd from './components/finalExchange_rate/Exchnage_rate_Add.jsx';
import Supplier from './components/supplier/Suppliers.jsx';
import TestShipmentInlinePage from './components/supplier/testsup.jsx';
import TestInlineSectionPage from './components/supplier/testsupplier12.jsx';
import SupplierManager from './components/supplier/mainsupplier.jsx';
import AddSupplier from './components/supplier/addsupplier.jsx';
import A from './components/supplier/928202540.jsx';
import B from './components/supplier/9282025632.jsx';
import C from './components/supplier/9282025619test.jsx';
import D from './components/supplier/9282025649.jsx'
// import TopCategoriesSection, { TopCategoriesHorizontal } from './components/testfiles/present1581012025.jsx';
// import ModernCategoryCarousel from './components/testfiles/presentcategory228.jsx';
// import ModernSingleCategoryCarousel from './components/testfiles/present300.jsx';
import ModernSingleCategoryCarousel400 from './components/testfiles/present400.jsx';
import ModernSingleCategoryCarousel400edit from './components/testfiles/present400edit.jsx';
import SearchLayout from './components/Searchpage/searchlayout.jsx';
import Cart654 from './components/Cart/654.jsx';
import Cart110 from './components/Cart/110.jsx';
import AdminOrdersDashboardWithModal from './components/Order/Order.jsx';
import AdminOrdersFilter2 from './components/Order/1143.jsx';
import AdminOrdersFilter21155 from './components/Order/1155.jsx';
import AdminOrdersFilter21158 from './components/Order/1158.jsx';
import Cart110Test from './components/Cart/110test.jsx';
// import ModernCategoryCarouselBootstrap from './components/testfiles/present500.jsx';



function App() {
  return (
    <>
      <Routes>
        <Route path='/*' element={<Notfound></Notfound>}></Route>

        <Route  path="/" element={<MainPage></MainPage>}>
            <Route path="/comingsoon" element={<ComingSoon></ComingSoon>}></Route>
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/category/*" element={<ProductList/>}/>
            <Route path='/profile' element={<UserProfile></UserProfile>}>
              <Route path='*' element={<Notfound></Notfound>}></Route>
              <Route index element={<Navigate to="info" replace />} />
              
              <Route path="info" element={<Info></Info>}/>
              <Route element={<ComingSoon></ComingSoon>}>
              <Route path='products' element={<div><NavLink to='New_Products'>new</NavLink><NavLink to='Used_Products'>old</NavLink><Outlet></Outlet></div>}>
                <Route element={<Premiumandup></Premiumandup>}> 
                    <Route path='New_Products' element={<div>new product</div>}></Route>
                </Route>  
                <Route path='Used_Products' element={<div>used product</div>}></Route>
              </Route>
              <Route path='services' ></Route>
              <Route path='courses'></Route>
              </Route>
              
            </Route>

            <Route  path='' element={<Defaultpage></Defaultpage>}/>
            <Route path="cart" element={<Cart110Test></Cart110Test>}/>
            
            
            <Route path="search" element={<SearchLayout></SearchLayout>}></Route>
            <Route path='/*' element={<Notfound></Notfound>}/>
            <Route element={<Alreadylogin/>}>
            </Route>
              <Route path='/log' element={<div className='container-fluid d-flex justify-content-center'  style={{minHeight:"100vh",alignItems:"center"}}><Auth></Auth></div>}></Route>
        </Route>

        <Route path='/dashboard' element={<NoNeedAuth></NoNeedAuth>}>
        
          <Route path='' element={<Layout></Layout>}>
            <Route index element={<DashboardWelcome></DashboardWelcome>}></Route>
            
            <Route path='currency' element={<Currency></Currency>}></Route>
            <Route path='currency_add' element={<CurrencyAdd></CurrencyAdd>}></Route>
            <Route path='exchange_rate' element={<ExchangeRates></ExchangeRates>}></Route>
            <Route path='exchange_rate_add' element={<ExchangeRateAdd></ExchangeRateAdd>}></Route>
            {/*this where we add the outlet or out look and the route that will apper inside it  */}
            <Route path='orders' element={<AdminOrdersFilter21158></AdminOrdersFilter21158>}></Route>

            <Route path='*' element={<Notfound/>}/>
            
            <Route path='productlayout' element={<ProductList></ProductList>}></Route>
            <Route path="products_manger" element ={<div className='m-0 container-fluid p-0'><Test7></Test7></div>}></Route>
            <Route path='latest_products' element={<></>}></Route>
            <Route path='upcoming_porducts' element={<></>}></Route>
            <Route path='new_products' element={<></>}></Route>
            <Route path='discount_product' element={<></>}></Route>
            <Route path='most_products' element={<></>}></Route>
            <Route path="new_Product_Adding" element={<AddProductPage2></AddProductPage2>}></Route>
            
            <Route path='supplier_shipments_manger' element={<Supplier></Supplier>}> </Route>
            <Route path='supplier' element ={<SupplierManager></SupplierManager>}></Route>
            <Route path='addsupplier' element={<AddSupplier></AddSupplier>}></Route>
          </Route>


        </Route>
        
        
        
      
      
      
      </Routes>
    </>
  );
}

export default App;

