import React, { useEffect } from "react";
import useAuth from "../../Hooks/useAuth";

export default function DashboardWelcome() {
  const {claims,auth,loading}=useAuth()

  

  if(!claims.id){
    return (
      <div className="container-fluid bg-light min-vh-100 p-4" dir="rtl">
        <div className="bg-white shadow rounded-4 p-5 mb-5">
          <h1 className="placeholder-glow mb-3">
            <span className="placeholder col-6"></span>
          </h1>
          <p className="placeholder-glow">
            <span className="placeholder col-8"></span>
          </p>
        </div>

        <div className="row g-4">
          {[1, 2, 3].map((i) => (
            <div className="col-md-4" key={i}>
              <div className="card shadow-sm border-0 rounded-4 h-100">
                <div className="card-body">
                  <h5 className="placeholder-glow mb-3">
                    <span className="placeholder col-7"></span>
                  </h5>
                  <p className="placeholder-glow mb-4">
                    <span className="placeholder col-10"></span>
                  </p>
                  <div className="d-flex justify-content-between">
                    <span className="placeholder col-4"></span>
                    <span className="placeholder col-3"></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* أقسام إضافية */}
        <div className="row g-4 mt-4">
          {[1, 2].map((i) => (
            <div className="col-md-6" key={i}>
              <div className="card shadow-sm border-0 rounded-4 h-100">
                <div className="card-body">
                  <h5 className="placeholder-glow mb-3">
                    <span className="placeholder col-5"></span>
                  </h5>
                  <p className="placeholder-glow">
                    <span className="placeholder col-8"></span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
    }
  return (
    <div className="container-fluid bg-light min-vh-100 p-4" dir="rtl">
      {/* بانر الترحيب */}
      <div className="bg-white shadow rounded-4 p-5 mb-5">
        <h1 className="fw-bold display-5">
          👋 أهلاً بعودتك، <span className="text-primary">{claims?.name || "المستخدم"}</span>
        </h1>
        <p className="text-muted fs-5 mt-2">
          إليك لمحة عامة عن لوحة التحكم الخاصة بك اليوم.
        </p>
        <p className="lead fs-4 mt-2">
          رقم الهاتف : {claims.phoneNumber}
        </p>
        <p className="lead fs-4 mt-2">
        السماحية : {claims.role.uuid}
        </p>
        
      </div>

      {/* الكروت الرئيسية */}
      <div className="row g-4">
        {/* الإحصائيات */}
        {/* <div className="col-md-4">
          <div className="card shadow-sm border-0 rounded-4 h-100">
            <div className="card-body">
              <h5 className="card-title fw-semibold">📊 الإحصائيات السريعة</h5>
              <p className="text-muted">نظرة عامة على نشاطك</p>
              <div className="d-flex justify-content-between mt-4">
                <div>
                  <h3 className="fw-bold text-primary">١٢٠</h3>
                  <small className="text-muted">مهمة مكتملة</small>
                </div>
                <div>
                  <h3 className="fw-bold text-success">٨</h3>
                  <small className="text-muted">مشاريع نشطة</small>
                </div>
              </div>
            </div>
          </div>
        </div> */}

        {/* الإشعارات */}


  
        {/* دعوة لاتخاذ إجراء */}
   
      </div>

      {/* أقسام إضافية */}

    </div>
  );
}
