import React from "react";

export default function SkeletonCard() {
  return (
    <article className="card h-100 border-0 rounded-3">
      {/* small badge placeholder */}
      <div className="px-2 pt-2">
        <span className="placeholder col-3 placeholder-glow rounded-pill" style={{height: "18px", display: "inline-block"}} />
      </div>

      {/* category placeholder */}
      <div className="px-2 mt-2">
        <span className="placeholder col-4 placeholder-wave" style={{height: "12px", display: "inline-block"}} />
      </div>

      {/* image area (ratio) */}
      <div className="card-img-wrap px-2 my-2">
        <div className="ratio ratio-4x3 bg-light rounded">
          {/* use a full-size placeholder inside ratio */}
          <div className="placeholder w-100 h-100 placeholder-wave" style={{minHeight: "100%", borderRadius: "8px"}} />
        </div>
      </div>

      {/* body placeholders */}
      <div className="card-body d-flex flex-column justify-content-end pt-3 pb-2">
        <div className="d-flex justify-content-between align-items-start">
          <div style={{flex: 1}}>
            <div className="placeholder col-6 placeholder-wave" style={{height: "14px", marginBottom: 8}} />

          </div>

          <div style={{minWidth: 90}}>
            {/* mimic button placeholder */}
            <span className="placeholder placeholder-wave" style={{display: "inline-block", width: 90, height: 36, borderRadius: 999}} />
          </div>
        </div>
      </div>
    </article>
  );
}
