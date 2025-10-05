// src/components/SkeletonCard.jsx
import React from "react";

export default function SmallSkeletonCard({ width = 180, height = 250 }) {
  return (
    <div 
      className="card shadow-sm border-0 rounded m-1 my-0" 
      style={{ maxHeight:`${height}px`,minHeight:`${height}px`,maxWidth:`${width}px`,minWidth:`${width}px`,width: `${width}px`, height: `${height}px` }}
    >
      {/* Image placeholder */}
      <div className="card-img-top bg-light d-flex align-items-center justify-content-center">
        <span className="placeholder placeholder-wave  col-12" style={{ height: "150px" }}></span>
      </div>

      <div className="card-body">
        {/* Title placeholder */}
        <h6 className="card-title">
          <span className="placeholder placeholder-wave col-8"></span>
        </h6>

        {/* Price + stock placeholder */}
        <p className="card-text">
          <span className="placeholder placeholder-wave  col-6 me-2"></span>
          <span className="placeholder placeholder-wave col-3"></span>
        </p>

        {/* Button placeholder */}

      </div>
    </div>
  );
}
