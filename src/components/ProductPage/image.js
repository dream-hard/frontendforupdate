import React, { useState } from "react";

const ProductImageGallery = ({ images }) => {
  const mainImage = images.find((img) => img.image_type === "main") || images[0];
  const [selectedImage, setSelectedImage] = useState(mainImage?.filename);

  return (
    <div className="col text-center  mb-4" style={{ maxWidth: "600px", marginRight: "auto" ,marginLeft:"auto"}}>
      {/* Main Image Preview */}
      <div
        className="mb-1 mb-sm-3"
        style={{
          width: "100%",
          height: "350px",
          borderRadius: "10px",
          overflow: "hidden",
          backgroundColor: "#f8f9fa",
        }}
      >
        <img
          src={selectedImage}
          alt="Selected"
          className="img-fluid m-0 p-0 h-100 w-100"
          style={{ objectFit: "contain" }}
        />
      </div>

      {/* Thumbnails */}
      <div className="d-flex flex-wrap justify-content-center gap-2" >
        {images.map((img, idx) => (
          <img
            key={idx}
            src={img.filename}
            alt={`Thumbnail ${idx}`}
            className={`img-thumbnail ${img.filename === selectedImage ? "border-primary" : ""}`}
            style={{

              width: "140px",
              height:"140px",
              objectFit: "contain",
                objectPosition: "center",

              cursor: "pointer",
              borderWidth: img.filename === selectedImage ? "2px" : "1px",
            }}
            onClick={() => setSelectedImage(img.filename)}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductImageGallery;
