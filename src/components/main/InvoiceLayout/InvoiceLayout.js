


import React, { forwardRef, useEffect } from "react";
import logo from "../layoutpage/cortex 7 final 1.png"; // غيّر المسار حسب موقع الشعار

const InvoiceLayout = forwardRef(({ cart, subtotal, discount, tax, total, customer, orderId, shippingAddress,currency }, ref) => {
  const date = new Date().toLocaleDateString("ar-EG");
  return (
    <div ref={ref} className="container my-4 " dir="rtl"   style={{
        backgroundColor:"#fff",
         minWidth: "210mm",
         maxWidth: "210mm",       // عرض صفحة A4 بالميليمتر
    minHeight: "283mm",      // ارتفاع صفحة A4 بالميليمتر
    maxHeight: "283mm", 
    padding: "10mm",
    paddingTop:'0',
    
    boxSizing: "border-box",
    overflow: "hidden",   // لمنع النزول لصفحة ثانية
    display: "flex",
    
    flexDirection: "column",
    justifyContent: "space-evenly" // ليشغل كل المساحة بشكل متوازن
        }}>
      {/* شعار */}
      <div className="d-flex justify-content-between align-items-center mb-1">
        <img src={logo} alt="شعار المتجر" style={{ maxWidth: "150px" }} />
        <div>
          <h4 className="mb-1">فاتورة الشراء</h4>
          <small >رقم الطلب: #{orderId}</small><br />
          <h6 className="mt-1"> التاريخ : {date}</h6>
        </div>
      </div>

      {/* معلومات الزبون والشحن */}
      <div className="row mb-1">
        <div className="col-md-6">
          <h6>معلومات الزبون:</h6>
          <p className="mb-1"><strong>{customer?.name}</strong></p>
          <p>{customer?.phone_number}</p>
        </div>
        <div className="col-md-6">
          <h6>عنوان الشحن:</h6>
          <p>{shippingAddress}</p>
        </div>
      </div>

      {/* جدول المنتجات */}
<table className="table table-bordered table-sm text-center">
  <thead className="table-light">
    <tr>
      <th>المنتج</th>
      <th>الكمية</th>
      <th>سعر الوحدة</th>
      <th>الإجمالي</th>
    </tr>
  </thead>
  <tbody>
    {cart.map((item, idx) => (
      <tr key={idx}>
        <td style={{ direction: "rtl", textAlign: "right", fontFamily: "'Tajawal', 'Noto Naskh Arabic', sans-serif" }}>
          <span dir="auto">{item?.Product?.title}</span>
        </td>
        <td>{item?.quantity}</td>
        <td>{item?.currency} {item?.cost_per_one}</td>
        <td>{item?.cost_per_one * item?.quantity} {item?.currency}</td>
      </tr>
    ))}
  </tbody>
</table>


      
<div className="card bg-white shadow-sm mt-0" dir="rtl">
  <div className="card-body p-2">
    <ul className="list-unstyled mb-2" style={{ fontSize: "0.85rem", lineHeight: "1.2" }}>
      <li className="d-flex justify-content-between align-items-center py-1 border-bottom">
        <span>المجموع:</span>
        <span className="text-success">{subtotal.toFixed(2)} {currency}</span>
      </li>
      <li className="d-flex justify-content-between align-items-center py-1 border-bottom">
        <span>الخصم:</span>
        <span className="text-danger">- {currency} {discount.toFixed(2)}</span>
      </li>
      <li className="d-flex justify-content-between align-items-center py-1 border-bottom">
        <span>الضريبة:</span>
        <span>{currency} {tax.toFixed(2)}</span>
      </li>
    </ul>
    <div className="d-flex justify-content-between border-top pt-2">
      <strong style={{ fontSize: "0.9rem" }}>الإجمالي النهائي:</strong>
      <strong className="text-primary" style={{ fontSize: "0.9rem" }}>
        {currency} {total.toFixed(2)}
      </strong>
    </div>
  </div>
</div>

      <div className="container-fluid text-start mt-2 pt-1 pb-0 mb-1 " >
        <strong className="d-block text-start ">شروط وأحكام :</strong>
        <ul dir="rtl" className="ps-2 pt-1 m-0 list-unstyled">
    <li>يرجى الاحتفاظ بهذه الفاتورة للرجوع إليها لاحقًا.</li>
        </ul>
      </div>
      {/* ملاحظة ختامية */}
       <footer className="mt-3  pt-1 border-top text-center text-muted small mt-auto" >
    
      <p className="mb-1"> 
        شكراً لتسوقكم معنا ❤️ 
      </p>
      <p className="mb-2">
        للتواصل: <a href="tel:+96170123456"> </a> | <a href="/">facebook</a>
      </p>
      <div className="mb-1">
        <a href="https://facebook.com" className="me-2 text-decoration-none text-muted">
          <i className="bi bi-facebook"></i>
        </a>
        <a href="https://instagram.com" className="me-2 text-decoration-none text-muted">
          <i className="bi bi-instagram"></i>
        </a>
        <a href="https://wa.me/" className="text-decoration-none text-muted ">
          <i className="bi bi-whatsapp"></i>
        </a>
      </div>
      <p className="mb-0">
        &copy; 2025   CORTEX 7   . جميع الحقوق محفوظة.
      </p>
   
    </footer>
    </div>
  );
});

export default InvoiceLayout;
