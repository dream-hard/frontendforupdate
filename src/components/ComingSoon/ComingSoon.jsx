

import React from "react";
import cortex from './cortex.png'
export default function ComingSoon() {
  const handleBack = () => {
    window.history.back();
  };

  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center vh-100  text-center"
      style={{ fontFamily: "Tahoma, sans-serif" }}
    >
      {/* الأيقونة */}
      <img
        src={cortex}
        alt="Icon"
        className="mb-4"
        style={{ width: "200px", height: "200px" }}
      />

      {/* النص */}
      <h1 className="fw-bold mb-3">قريباً</h1>
      <p className="text-muted fs-5">موقعنا الجديد قيد التطوير 🚀</p>

      {/* شريط تحميل */}
      <div className="progress w-50 mt-4" style={{ maxWidth: "300px" }}>
        <div
          className="progress-bar progress-bar-striped progress-bar-animated"
          role="progressbar"
          style={{ width: "75%" }}
        ></div>
      </div>

      {/* الروابط مع أيقونات */}
      <div className="mt-4">
        {/* Instagram */}
          <a
          href="/"
          className="btn btn-sm mx-2 rounded-pill pe-3 "
          style={{
              backgroundColor: "#325A5F", // نفس لون الخلفية من الأيقونة
              color: "#F8F59C", // نفس لون الشكل الداخلي
              fontWeight: "bold",
          }}
          >
          <img
              src="/favicon-16x16.png"
              alt="Cortex 7"
              className="me-2"
              style={{ width: "20px", height: "20px", borderRadius: "50%" }}
          />
          Cortex 7
      </a>
        <a
          href="https://www.instagram.com/cortex__7?igsh=MTB3dnJrb2Ztcnh4eQ%3D%3D&utm_source=qr"
          target="_blank"
          rel="noreferrer"
          className="btn text-white btn-sm mx-2 rounded-pill pe-3"
          style={{
            background:
              "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
          }}
        >
          <i className="bi bi-instagram me-2"></i> انستغرام
        </a>

        {/* Facebook */}
        <a
          href="https://www.facebook.com/share/19d6shfM2g/"
          target="_blank"
          rel="noreferrer"
          className="btn btn-primary btn-sm mx-2 rounded-pill pe-3"
        >
          <i className="bi bi-facebook me-2"></i> فيسبوك
        </a>
     <a
          href="https://t.me/C_ortex7"
          target="_blank"
          rel="noreferrer"
          className="btn btn-info btn-sm mx-2 rounded-pill pe-3"
        >
          <i className="bi bi-telegram me-2 "></i>تيليجرام 
        </a>
        {/* Website */}

      </div>

      {/* زر الرجوع */}
      <button
        onClick={handleBack}
        className="btn btn-secondary mt-4 rounded-pill px-4"
      >
        <i className="bi bi-arrow-left"></i> رجوع
      </button>
    </div>
  );
}
