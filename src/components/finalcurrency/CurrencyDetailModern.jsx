import React from "react";

const CurrencyDetailModern = ({ currency }) => {
  if (!currency) return null;


  return (
    <div className="container py-3">
      {/* General Info */}
      <h4 className="mb-3 text-primary" >{currency.name}</h4>
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <label className="form-label">ISO / الرمز</label>
          <input className="form-control" value={currency.currency_iso} disabled />
        </div>
        <div className="col-md-6">
          <label className="form-label">Name / الاسم </label>
          <input className="form-control" value={currency.name} disabled />
        </div>
        <div className="col-md-6">
          <label className="form-label">sympol /  الشكل</label>
          <input className="form-control" value={currency.symbol} disabled />
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

export default CurrencyDetailModern;
