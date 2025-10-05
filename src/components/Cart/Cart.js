// src/pages/CartPage.js
import useCart  from "../../Hooks/useCart";
import { useState,useRef,useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import InvoiceLayout from "../main/InvoiceLayout/InvoiceLayout";
import html2pdf  from "html2pdf.js";



const customer = {
  name: "أحمد يوسف",
  email: "ahmed@example.com",
  phone: "0987654321"
};

export default function CartPage() {
  const { cart, removeFromCart,updateQuantity ,giveme} = useCart();
  const [discountCode, setDiscountCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);





    const handleDownloadPDF = () => {
    const element = containerRef.current;
    const options = {
      margin: 0,
      filename: `invoice-${Date.now()}.pdf`,
      image: { type: "jpeg", quality: 0.9 },
      html2canvas: { scale: 1.5,scrollY: 0 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    html2pdf().set(options).from(element).save();
  };
  const containerRef = useRef(null);

  const handleApplyDiscount = () => {
    if (discountCode === "SAVE10") {
      setDiscountPercent(10);
    } else {
      setDiscountPercent(0);
      alert("Invalid code");
    }
  };


  const [invoiceChunks, setInvoiceChunks] = useState([]);

  useEffect(() => {
    // تقطيع العناصر كل 10 عناصر
    const itemsPerInvoice = 10;
    const chunks = [];
    for (let i = 0; i < cart.length; i += itemsPerInvoice) {
      chunks.push(cart.slice(i, i + itemsPerInvoice));
    }
    setInvoiceChunks(chunks);
  }, [cart]);


  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discount = (subtotal * discountPercent) / 100;
  const tax = (subtotal - discount) * 0.05;
  const total = subtotal - discount + tax;

  return (
    <div className="container py-4">
      <div className="row">
        {/* Cart Items */}
        <div className="col-md-8">
          <h2 className="mb-4">🛒 Your Cart</h2>
          {cart.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="d-flex align-items-center mb-3 p-3 border rounded">
                <img src={item.image || "https://placehold.co/400"} width={80} height={80} alt={item.name} className="me-3" />
                <div className="flex-grow-1">
                  <h5 className="mb-1">{item.name}</h5>
                  <p className="mb-1">${item.price}</p>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    className="form-control w-25"
                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                  />
                </div>
                <div className="text-end">
                  <p className="mb-1"><strong>${(item.price * item.quantity).toFixed(2)}</strong></p>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => removeFromCart(item.id)}>Remove</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Invoice Summary */}
        <div className="col-md-4">
          <h2 className="mb-4">📋 Invoice</h2>
          <div className="border rounded p-3 bg-light">
            <div className="d-flex justify-content-between mb-2">
              <span>Subtotal:</span>
              <strong>${subtotal.toFixed(2)}</strong>
            </div>

            <div className="mb-3">
              <label className="form-label">Discount Code</label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                />
                <button className="btn btn-outline-primary" onClick={handleApplyDiscount}>Apply</button>
              </div>
            </div>

            {discountPercent > 0 && (
              <div className="d-flex justify-content-between mb-2 text-success">
                <span>Discount ({discountPercent}%):</span>
                <strong>- ${discount.toFixed(2)}</strong>
              </div>
            )}

            <div className="d-flex justify-content-between mb-2">
              <span>Tax (5%):</span>
              <strong>${tax.toFixed(2)}</strong>
            </div>

            <hr />
            <div className="d-flex justify-content-between fs-5">
              <span>Total:</span>
              <strong>${total.toFixed(2)}</strong>
            </div>

            <button className="btn btn-primary w-100 mt-3">Proceed to Checkout</button>
          </div>
        </div>
      </div>
        
        <button className="btn btn-secondary" onClick={handleDownloadPDF}>
        🖨️ طباعة الفاتورة
        </button>

        <div  className=' p-0 m-0 container-fluid' ref={containerRef} style={{ display: "" }}>
            {invoiceChunks.map((items, index) => (
                <InvoiceLayout
                key={index}
                cart={items}
                subtotal={subtotal}
                discount={discount}
                tax={tax}
                total={total}
                customer={customer}
                />
            ))}
        </div>



    </div>
  );
}
