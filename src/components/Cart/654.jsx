// src/pages/CartPage.js
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import html2pdf from "html2pdf.js";
import InvoiceLayout from "../main/InvoiceLayout/InvoiceLayout";
import useCart from "../../Hooks/useCart";
import { Link } from "react-router-dom";
import axios from "axios";
import useNotification from "../../Hooks/useNotification";





export default function Cart654() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    increment,
    decrement,
    clearCart,
    giveme,
  } = useCart();

  // Currency setup
  const exchangeRates = {
    USD: 1,
    SYP: 13000,
    TK: 110,
  };
  const {shownotification}=useNotification();
  const [currencies,setCurrencies]=useState([]);
  const[rates,setRates]=useState([
    {base:"USD",target:"USD",rate:1},
    {base:"SYP",target:"SYP",rate:1},
    {base:"EUR",target:"EUR",rate:1}
  ])
  
  async function fetchcurrencies(){
    try {
        const res=axios.get('/currency/justgetall');
        setCurrencies(res.data);
    } catch (error) {
        setCurrencies([]);
    }
  }

    async function fetchexchangerate(base,target){
    try {
        const res=axios.post('/exch_rate/getjustratewithrate',{base:base,target:target});
        const data=res.data.rate;
        setRates((prev)=>[...prev,{base : data.base_currency_id,target:data.target_currency_id,rate:data.rate}]);
    } catch (error) {
        shownotification("error","لا يوجد لهذه العملة مقابل");
    }
  }


  const [targetCurrency, setTargetCurrency] = useState("USD"); // apply-to-all target
  const [itemCurrencies, setItemCurrencies] = useState({}); // per-item keyed by uuid
  const [currencyTotals, setCurrencyTotals] = useState({ USD: 0, SYP: 0, TK: 0 });

  const [discountCode, setDiscountCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);

  const containerRef = useRef(null);
  const [invoiceChunks, setInvoiceChunks] = useState([]);
  const [displayCurrency, setDisplayCurrency] = useState("SYP"); // currency used for invoice totals on screen

  // Helper: Currency conversion (safe)


  // Recalculate totals by currency (uses uuid keys)

  // invoice chunking
  useEffect(() => {
    const itemsPerInvoice = 10;
    const chunks = [];
    for (let i = 0; i < cart.length; i += itemsPerInvoice) {
      chunks.push(cart.slice(i, i + itemsPerInvoice));
    }
    setInvoiceChunks(chunks);
  }, [cart]);

  // Apply a global currency (sets itemCurrencies keyed by uuid)
  const applyToAll = useCallback(() => {
    const updated = {};
    cart.forEach((item) => {
      if (item && item.uuid) updated[item.uuid] = targetCurrency;
    });
    setItemCurrencies(updated);
  }, [cart, targetCurrency]);

  // subtotal computed in a chosen display currency (displayCurrency)

  // safer image getter

  // PDF download (make sure element exists)
  const handleDownloadPDF = () => {
    const element = containerRef.current;
    if (!element) {
      console.warn("No invoice container to print.");
      return;
    }
    const options = {
      margin: 0,
      filename: `invoice-${Date.now()}.pdf`,
      image: { type: "jpeg", quality: 0.9 },
      html2canvas: { scale: 1.5, scrollY: 0 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };
    html2pdf().set(options).from(element).save();
  };

  const handleApplyDiscount = () => {
    if (discountCode.trim().toUpperCase() === "SAVE10") {
      setDiscountPercent(10);
    } else {
      setDiscountPercent(0);
      // don't alert by default — keep UI friendly; you can enable alert if you want:
      // alert("Invalid code");
    }
  };

  // Small debug hook (keeps giveme call but avoid noisy return)
  useEffect(() => {
    // console.log("Cart changed:", cart);
    giveme?.();
  }, [cart, giveme]);

  // Improvements to remove handler: ensure we pass uuid
  const handleRemove = useCallback(
    (item) => {
      if (!item) return;
      // prefer uuid (CartContext uses uuid), fallback to id
      const key = item.uuid || item.id;
      removeFromCart(key);
    },
    [removeFromCart]
  );

  // Render
  return (
    <div className="container py-4">
      <div className="row">
        {/* Cart Items */}
        <div className="col-md-8">
          <h2 className="mb-4">🛒 Your Cart</h2>

          <div className="mb-3">
            <label className="me-2">تغيير الكل إلى : </label>
            <select
              className="form-select d-inline-block w-auto me-2"
              value={targetCurrency}
              onChange={(e) => setTargetCurrency(e.target.value)}
            >
              {/* {mainCurrencies.map((curr) => (
                <option key={curr} value={curr}>
                  {curr}
                </option>
              ))} */}
            </select>

       

            <button className="btn btn-outline-primary ms-2" onClick={applyToAll}>
              تغيير الكل
            </button>

            <button className="btn btn-outline-danger ms-2" onClick={() => clearCart()}>
              إزالة الجميع
            </button>
          </div>

          {cart.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            cart.map((item) => {
                console.log(item)
              const uuid = item?.uuid || item?.id; // prefer uuid
              const originalCurrency = item?.currency || "USD";
              const selectedCurrency = itemCurrencies[uuid] || originalCurrency;
              const baseTotal = Number(item?.price || 0) * Number(item?.quantity || 0);
            //   const converted = convertCurrency(baseTotal, originalCurrency, selectedCurrency);
            //   const convUnit = convertCurrency(Number(item?.price || 0), originalCurrency, selectedCurrency);

              return (
                <div key={uuid} className="d-flex align-items-center mb-3 p-3 border rounded">
                                  <Link className="" style={{ textDecoration: "none" }} to={`/product/${item.slug}`}>
                  <img
                    src={item.Product_images[0].name}
                    width={80}
                    height={80}
                    alt={item?.name || "product"}
                    className="me-3 object-fit-cover"
                  />
                                  </Link>

                  <div className="flex-grow-1">
                    <h5 className="mb-1">{item?.title || "Unnamed product"}</h5>

                    <p className="mb-1">
                      السعر الاصلي: {Number(item?.price || 0).toFixed(2)} {originalCurrency}
                      <br />
                      السعر (محول): {Number(4).toFixed(2)} {selectedCurrency}
                    </p>

                    <div className="d-flex gap-2 align-items-center">
                      <select
                        className="form-select w-50"
                        value={selectedCurrency}
                        onChange={(e) => setItemCurrencies((s) => ({ ...s, [uuid]: e.target.value }))}
                      >
                        {/* {mainCurrencies.map((curr) => (
                          <option key={curr} value={curr}>
                            {curr}
                          </option>
                        ))} */}
                      </select>

                      <div className="input-group" style={{ width: 130 }}>
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() => decrement(uuid, 1)}
                          type="button"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          className="form-control text-center"
                          value={Number(item?.quantity || 1)}
                          onChange={(e) => {
                            const q = parseInt(e.target.value, 10);
                            updateQuantity(uuid, Number.isFinite(q) && q > 0 ? q : 1);
                          }}
                        />
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() => increment(uuid, 1)}
                          type="button"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="text-end">
                    <p className="mb-1">
                      <strong>
                        {Number(4 || 0).toFixed(2)} {selectedCurrency}
                      </strong>
                    </p>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleRemove(item)}>
                      إزالة
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Invoice Summary */}
        <div className="col-md-4">
            <div className="d-flex justify-content-between">
          <h2 className="mb-4">📋 الفاتورة</h2>
              <div>
                <label className="me-2 ">المجموع بالعملة :</label>
                <select
                className="form-select d-inline-block w-auto me-2"
                value={displayCurrency}
                onChange={(e) => setDisplayCurrency(e.target.value)}
                >
                {/* {mainCurrencies.map((curr) => (
                    <option key={curr} value={curr}>
                    {curr}
                    </option>
                ))} */}
                </select>
              </div>
          </div>
          <div className="border rounded p-3 bg-light">
            <div className="d-flex justify-content-between mb-2">
              <span>المجموع:</span>
              <strong>
                {/* {subtotal.toFixed(2)} {displayCurrency} */}
              </strong>
            </div>

            <div className="mb-3">
              <label className="form-label">Discount Code</label>
              <div className="input-group" >
                <input
                  disabled
                  type="text"
                  className="form-control"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                />
                <button disabled className="btn btn-outline-primary" onClick={handleApplyDiscount}>
                  Apply
                </button>
              </div>
            </div>

            {discountPercent > 0 && (
              <div className="d-flex justify-content-between mb-2 text-success">
                <span>Discount ({discountPercent}%):</span>
                {/* <strong>- {discount.toFixed(2)} {displayCurrency}</strong> */}
              </div>
            )}

      

            <hr />
            <div className="d-flex justify-content-between fs-5">
              <span>Total:</span>
              {/* <strong>{total.toFixed(2)} {displayCurrency}</strong> */}
            </div>

            <button className="btn btn-primary w-100 mt-3">Proceed to Checkout</button>

            <div className="mt-4">
              <h5>💰 المجموع بعملات :</h5>
              {/* {mainCurrencies.map((curr) => (
                <div key={curr} className="d-flex justify-content-between">
                  <span>{curr}:</span>
                  <strong>{(currencyTotals[curr] || 0).toFixed(2)} {curr}</strong>
                </div>
              ))} */}
            </div>

            <div className="mt-3 d-grid gap-2">
              <button className="btn btn-secondary" onClick={handleDownloadPDF}>
                🖨️ Print Invoice (PDF)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden invoice sections for printing (converted values passed) */}
      {/* <div className="p-0 m-0 container-fluid visually-hidden" ref={containerRef}>
        {invoiceChunks.map((items, index) => (
          <InvoiceLayout
            key={index}
            currency={printCurrency}
            cart={items.map((item) => ({
              ...item,
              price: convertCurrency(item.price, item.currency || "USD", printCurrency),
            }))}
            subtotal={convertCurrency(subtotal, displayCurrency, printCurrency)}
            discount={convertCurrency(discount, displayCurrency, printCurrency)}
            tax={convertCurrency(tax, displayCurrency, printCurrency)}
            total={convertCurrency(total, displayCurrency, printCurrency)}
            customer={customer}
            itemCurrencies={itemCurrencies}
            exchangeRates={exchangeRates}
          />
        ))}
      </div> */}
    </div>
  );
}
