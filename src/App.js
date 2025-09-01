import './App.css';
import Layout from './components/adminlayout/Layout';
import { useNavigate,createBrowserRouter,Routes , Route ,Link,NavLink, createRoutesFromElements, RouterProvider, Outlet, Navigate} from 'react-router-dom';
import { useEffect, useState,useContext, useLayoutEffect } from 'react';
//////components 

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





function App() {
  return (
    <>
      <Routes>
        <Route path='/*' element={<Notfound></Notfound>}></Route>

        <Route  path="/" element={<MainPage></MainPage>}>
            
            <Route path='/test' element={<CartPagetest></CartPagetest>}/>
            <Route path='/test2' element={<ProductDetail></ProductDetail>}></Route>
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/category/*" element={<ProductList/>}/>
            <Route path='/profile' element={<UserProfile></UserProfile>}>
              <Route path='*' element={<Notfound></Notfound>}></Route>
              <Route index element={<Navigate to="info" replace />} />
              
              <Route path="info" element={<Info></Info>}/>
              <Route path='products' element={<div><NavLink to='New_Products'>new</NavLink><NavLink to='Used_Products'>old</NavLink><Outlet></Outlet></div>}>
                <Route element={<Premiumandup></Premiumandup>}> 
                    <Route path='New_Products' element={<div>new product</div>}></Route>
                </Route>  
                <Route path='Used_Products' element={<div>used product</div>}></Route>
              </Route>
              
            </Route>

            <Route  path='' element={<Defaultpage></Defaultpage>}/>
            <Route path='cart' element={<CartPage/>}></Route>
            <Route path='view' element={<ProductList></ProductList>}></Route>
            <Route path='/*' element={<Notfound></Notfound>}/>
            <Route element={<Alreadylogin/>}>
            </Route>
              <Route path='/log' element={<div className='container-fluid d-flex justify-content-center'  style={{minHeight:"100vh",alignItems:"center"}}><Auth></Auth></div>}></Route>
        </Route>

        <Route path='/dashboard' element={<NoNeedAuth></NoNeedAuth>}>
          <Route path='' element={<Layout> <div> adsfasdfsadfasdf</div></Layout>}>
            <Route index element={<div className='mt-5' style={{ backgroundColor:"white",textAlign:"center",fontSize:"3rem",border:" 4px solid",borderRadius:"33px"}}>welcome to the dashboard</div>}></Route>
            {/*this where we add the outlet or out look and the route that will apper inside it  */}
            <Route path='himan' element={<div style={{backgroundColor:"red", overflow:"auto",width:"100%"}}>sdfdsafdsaf</div>}></Route>
            <Route path='orders'/>

            <Route path='upload' element={<CloudinaryUpload/>}></Route>
            <Route path='*' element={<Notfound/>}/>
            <Route path='mainpage' element={<MainPage></MainPage>}>
            </Route>
            <Route path='productlayout' element={<ProductList></ProductList>}></Route>
            <Route path='test1' element ={<div className='m-0 container-fluid p-0'><ModernTable></ModernTable></div>}></Route>
            <Route path='test2' element ={<div className='m-0 container-fluid p-0'><SlideInDrawerTable></SlideInDrawerTable></div>}></Route>
            <Route path='test3' element ={<div className='m-0 container-fluid p-0'><ExpandableRowTable></ExpandableRowTable></div>}></Route>
            <Route path='test4' element ={<div className='m-0 container-fluid p-0'><OpenNewPageApp></OpenNewPageApp></div>}></Route>
            <Route path="test5" element ={<div className='m-0 container-fluid p-0'><Test5></Test5></div>}></Route>
            <Route path="test6" element ={<div className='m-0 container-fluid p-0'><Test6></Test6></div>}></Route>
            <Route path="test7" element ={<div className='m-0 container-fluid p-0'><Test7></Test7></div>}>
            </Route>
              <Route path='add_new_product' element ={<AddProductPage></AddProductPage>}></Route>
            <Route path="add2" element={<AddProductPage2></AddProductPage2>}></Route>
            
          </Route>
        <Route />


        </Route>
        
        
        
      
      
      
      </Routes>
    </>
  );
}

export default App;

