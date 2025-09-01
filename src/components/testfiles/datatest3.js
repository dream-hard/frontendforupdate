import React from "react";

const ProductDetailsModern = ({ product }) => {
  if (!product) return null;

  // Boolean fields
  const booleanFields = [

    { name:"isactive_name",label:"Seller name display"},
    {name:"isactive_price",label:"Price display"},
    {name:"isactive_phonenumber",label:"Seller Phone Number display"},
    {name:"isAvailable",label:"Available"},
    {name:"featured",label:"New product"},
    {name:"upcoming",label:"Coming soon"},
    {name:"negotiable",label:"السعر قابل للمناقشة"},
    {name:"warranty",label:"Warranty period Active"},
    {name:"latest",label:"Latest version"},
    {name:"discount",label:"Discount Active"},
    {name:"softdelete",label:"Is Delelted"},

  ];

  return (
    <div className="container py-3">
      {/* General Info */}
      <h4 className="mb-3 text-primary" >{product.title}</h4>
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <label className="form-label">UUID</label>
          <input className="form-control" value={product.uuid} disabled />
        </div>
        <div className="col-md-6">
          <label className="form-label">Title</label>
          <input className="form-control" value={product.title} disabled />
        </div>
        <div className="col-md-6">
          <label className="form-label">slug</label>
          <input className="form-control" value={product.slug} disabled />
        </div>
        <div className="col-md-12">
  <label className="form-label">Description</label>
  <textarea
    className="form-control"
    rows={4} // adjust height
    value={product.description} // the text to display
    readOnly // prevents editing
  />
        </div>
        <h4 className="mb-3">Category infos </h4>

        <div className="col-md-6">
          <label className="form-label">Category name</label>
          <input className="form-control" value={product.Category.name} disabled />
        </div>
        <div className="col-md-6">
          <label className="form-label">Category id</label>
          <input className="form-control" value={product.Category.uuid} disabled />
        </div>
        <div className="col-md-6">
          <label className="form-label">Category slug</label>
          <input className="form-control" value={product.Category.slug} disabled />
        </div>

        <h4 className="mb-3">Currency infos </h4>

        <div className="col-md-6">
          <label className="form-label">Currency iso</label>
          <input className="form-control" value={product.Currency.currency_iso} disabled />
        </div>
        <div className="col-md-6">
          <label className="form-label">Currency symbol</label>
          <input className="form-control" value={product.Currency.symbol} disabled />
        </div>

        <h4 className="mb-3">Seller infos </h4>
        <div className="col-md-6">
          <label className="form-label">User name </label>
          <input className="form-control" value={product.User.username} disabled />
        </div>
        <div className="col-md-6">
          <label className="form-label">User phone_number </label>
          <input className="form-control" value={product.User.username} disabled />
        </div>
        <div className="col-md-6">
          <label className="form-label">Currency symbol</label>
          <input className="form-control" value={(product.User.email)?product.User.email:"email was not found"} disabled />
        </div>


      </div>

      {/* Pricing */}
      <h4 className="mb-3">Pricing</h4>
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <label className="form-label">Price</label>
          <input className="form-control" value={product.price} disabled />
        </div>
        <div className="col-md-6">
          <label className="form-label">Original Price</label>
          <input
            className="form-control"
            value={product.original_price}
            disabled
          />
        </div>
      </div>
        <h4 className="mb-3">Quantity and Warranty Informations</h4>
        <div className="col-md-6">
          <label className="form-label">Quantity for display</label>
          <input
            className="form-control"
            value={product.stock_quantity_fy}
            disabled
          />
        </div>
        
        <div className="col-md-6">
          <label className="form-label">Warranty Period</label>
          <input
            className="form-control"
            value={product.warranty_period}
            disabled
          />
        </div>
        

      {/* Metadata */}
{product.metadata && (
  <>
    <h4 className="mb-3">Metadata</h4>
    <div className="metadata-display d-flex flex-wrap gap-2">
      {Object.entries(JSON.parse(product.metadata)).map(([key, value]) => (
        <div
          key={key}
          className="p-2 border rounded bg-light d-flex flex-column align-items-start"
          style={{ minWidth: "120px", flex: "1 1 120px" }}
        >
          <span className="fw-bold text-primary">{key}</span>
          <span className="text-dark">{value}</span>
        </div>
      ))}
    </div>
  </>
)}

      {/* Attributes */}
      {product.Product_attributes?.length > 0 && (
        <>
          <h4 className="mb-3">Attributes</h4>
          <div className="row g-3 mb-4">
            {product.Product_attributes.map((attr) => (
              <div className="col-md-4" key={attr.id}>
                <div className="card p-3 h-100 shadow-sm " style={{backgroundColor:attr.isfilteractive? "#d1e7dd" : "#f8d7da",  borderLeft: `5px solid ${attr.isfilteractive ? "#0f5132" : "#842029"}`,}}>
                  <h6 className="fw-bold mb-2">
                    {attr.Attribute_option?.Attribute_type?.name}
                  </h6>
                  <p className="mb-0">{attr.Attribute_option?.name}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Boolean Flags */}
      <h4 className="mb-3">Flags</h4>
      <div className="mb-3 d-flex flex-wrap gap-3">
        {booleanFields.map((field) => (
          <div
            key={field.name}
            className="card p-3 checkbox-card"
            style={{ minWidth: "150px", flex: "1 1 150px", cursor: "pointer" }}
          >
            <span className="fw-bold mb-2 d-block">{field.label}</span>
            <div className="form-switch-custom">
              <input
                type="checkbox"
                checked={product[field.name]}
                readOnly
                className="form-switch-input"
              />
              <label className="form-switch-label">
                <span className="form-switch-button"></span>
              </label>
            </div>
            <small className="text-muted mt-1">
              {product[field.name] ? "Enabled" : "Disabled"}
            </small>
          </div>
        ))}
      </div>

<div className="card mb-4 shadow-sm">
  <div className="card-body">
    <h5 className="card-title mb-3">Images</h5>

    {/* Main Image */}
    <div className="text-center mb-4">
      <div
        className="border rounded shadow-sm p-2 d-inline-block"
        style={{ maxWidth: "400px" }}
      >
        <img
          src={`${product.Product_images?.find(img => img.image_type === "main")?.filename || ""}`}
          alt="Main Product"
          className="img-fluid rounded"
        />
          {product.Product_images?.find(img => img.image_type === "main")?.filename && (
    <small className="text-muted">
      Filename: {product.Product_images.find(img => img.image_type === "main").filename}
    </small>
  )}
      </div>
      <p className="mt-2 text-muted">Main Image</p>
    </div>

    {/* Other Images */}
    {product.Product_images && product.Product_images.filter(img => img.image_type !== "main").length > 0 && (
      <>
        <h6 className="fw-bold mb-3">Other Images</h6>
        <div className="d-flex flex-wrap gap-3">
          {product.Product_images
            .filter(img => img.image_type !== "main")
            .map((img, idx) => (
              <div
                key={idx}
                className="border rounded shadow-sm p-2"
                style={{ width: "300px", minHeight: "max-contant", overflow: "hidden" }}
              >
                <img
                  src={`${img.filename}`}
                  alt={`Product ${idx}`}
                  className="img-fluid rounded"
                />
                <p>{img.filename}</p>
              </div>
            ))}
        </div>
      </>
    )}
  </div>
</div>

      {/* Styles */}
      <style jsx>{`
        .checkbox-card {
            transition: all 0.3s ease;
          border-radius: 10px;
          background-color: #f8f9fa;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          }

        .checkbox-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
          background-color: #e9ecef;
        }
        
        .form-switch-custom {
          position: relative;
          width: 50px;
          height: 24px;
        }

        .form-switch-input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .form-switch-label {
          position: absolute;
          cursor: pointer;
          background-color: #ccc;
          border-radius: 30px;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          transition: background-color 0.3s;
        }

        .form-switch-label .form-switch-button {
          position: absolute;
          height: 20px;
          width: 20px;
          left: 2px;
          bottom: 2px;
          background-color: white;
          border-radius: 50%;
          transition: transform 0.3s;
        }

        .form-switch-input:checked + .form-switch-label {
          background-color: #4caf50;
        }

        .form-switch-input:checked + .form-switch-label .form-switch-button {
          transform: translateX(26px);
        }
      `}</style>
    </div>
  );
};

export default ProductDetailsModern;
