// // src/pages/CartPage.js
// import useCart  from "../../Hooks/useCart";
// import { useState,useRef,useEffect } from "react";
// import InvoiceLayout from "../main/InvoiceLayout/InvoiceLayout";
// import html2pdf  from "html2pdf.js";

// const customer = {
//   name: "أحمد يوسف",
//   email: "ahmed@example.com",
//   phone: "0987654321"
// };


// const mainCurrencies = ["USD", "SYP", "TK"];

// const exchangeRates = {
//   USD: 1,
//   SYP: 13000,
//   TK: 110,
// };

// export default function CartPagetest() {
//   const { cart, removeFromCart,updateQuantity } = useCart();
//   const [discountCode, setDiscountCode] = useState("");
//   const [discountPercent, setDiscountPercent] = useState(0);


//   const [targetCurrency, setTargetCurrency] = useState("USD");
//   const [itemCurrencies, setItemCurrencies] = useState({});
//   const [currencyTotals, setCurrencyTotals] = useState({
//     USD: 0,
//     SYP: 0,
//     TK: 0,
//   });

//   const recalculateTotals = (cartItems, currencyOverrides) => {
//     const totals = { USD: 0, SYP: 0, TK: 0 };

//     cartItems.forEach((item) => {
//       const fromCurrency = item.currency || "USD";
//       const toCurrency = currencyOverrides[item.id] || fromCurrency;

//       const baseAmount = item.price * item.quantity;
//       const converted =
//         (baseAmount / exchangeRates[fromCurrency]) *
//         exchangeRates[toCurrency];

//       totals[toCurrency] += converted;
//     });

//     setCurrencyTotals(totals);
//   };

//   useEffect(() => {
//     recalculateTotals(cart, itemCurrencies);
//   }, [cart, itemCurrencies]);

//   const handleGlobalCurrencyChange = () => {
//     const updated = {};
//     cart.forEach((item) => {
//       updated[item.id] = targetCurrency;
//     });
//     setItemCurrencies(updated);
//   };



//     const handleDownloadPDF = () => {
//     const element = containerRef.current;
//     const options = {
//       margin: 0,
//       filename: `invoice-${Date.now()}.pdf`,
//       image: { type: "jpeg", quality: 0.9 },
//       html2canvas: { scale: 1.5,scrollY: 0 },
//       jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
//     };

//     html2pdf().set(options).from(element).save();
//   };

//   const handleApplyDiscount = () => {
//     if (discountCode === "SAVE10") {
//       setDiscountPercent(10);
//     } else {
//       setDiscountPercent(0);
//       alert("Invalid code");
//     }
//   };


//   const containerRef = useRef(null);
//   const [invoiceChunks, setInvoiceChunks] = useState([]);

//   useEffect(() => {
//     // تقطيع العناصر كل 10 عناصر
//     const itemsPerInvoice = 10;
//     const chunks = [];
//     for (let i = 0; i < cart.length; i += itemsPerInvoice) {
//       chunks.push(cart.slice(i, i + itemsPerInvoice));
//     }
//     setInvoiceChunks(chunks);
//   }, [cart]);


//   const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
//   const discount = (subtotal * discountPercent) / 100;
//   const tax = (subtotal - discount) * 0.05;
//   const total = subtotal - discount + tax;

//   return (
//     <div className="container py-4"> 
 
//       <h2 className="mb-4">🛒 Cart</h2>

//       <div className="mb-3 d-flex align-items-center gap-2">
//         <label className="form-label mb-0">Change all to:</label>
//         <select
//           className="form-select w-auto"
//           value={targetCurrency}
//           onChange={(e) => setTargetCurrency(e.target.value)}
//         >
//           {mainCurrencies.map((curr) => (
//             <option key={curr} value={curr}>
//               {curr}
//             </option>
//           ))}
//         </select>
//         <button className="btn btn-primary" onClick={handleGlobalCurrencyChange}>
//           Apply to All
//         </button>
//       </div>

//       <table className="table table-bordered">
//         <thead className="table-light text-center">
//           <tr>
//             <th>Product</th>
//             <th>Quantity</th>
//             <th>Price</th>
//             <th>Currency</th>
//             <th>Change Currency</th>
//           </tr>
//         </thead>
//         <tbody>
//           {cart.map((item) => {
//             const selectedCurrency = itemCurrencies[item.id] || item.currency;
//             return (
//               <tr key={item.id} className="text-center align-middle">
//                 <td>{item.name}</td>
//                 <td>{item.quantity}</td>
//                 <td>{item.price}</td>
//                 <td>{selectedCurrency}</td>
//                 <td>
//                   <select
//                     className="form-select"
//                     value={selectedCurrency}
//                     onChange={(e) => {
//                       const updated = {
//                         ...itemCurrencies,
//                         [item.id]: e.target.value,
//                       };
//                       setItemCurrencies(updated);
//                     }}
//                   >
//                     {mainCurrencies.map((curr) => (
//                       <option key={curr} value={curr}>
//                         {curr}
//                       </option>
//                     ))}
//                   </select>
//                 </td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>

//       <div className="mt-5">
//         <h5>💰 Totals by Currency:</h5>
//         <ul className="list-group">
//           {mainCurrencies.map((curr) => (
//             <li className="list-group-item d-flex justify-content-between" key={curr}>
//               <span>{curr}:</span>
//               <strong>{currencyTotals[curr].toFixed(2)} {curr}</strong>
//             </li>
//           ))}
//         </ul>
//       </div>
    
  
//         <button className="btn btn-secondary" onClick={handleDownloadPDF}>
//         🖨️ طباعة الفاتورة
//         </button>

//         <div  className=' p-0 m-0 container-fluid' ref={containerRef} style={{ display: "" }}>
//             {invoiceChunks.map((items, index) => (
//                 <InvoiceLayout
//                 key={index}
//                 cart={items}
//                 subtotal={subtotal}
//                 discount={discount}
//                 tax={tax}
//                 total={total}
//                 customer={customer}
//                 />
//             ))}
//         </div>



//     </div>
//   );
// }

// src/pages/CartPage.js
import { useState, useRef, useEffect } from "react";
import html2pdf from "html2pdf.js";
import InvoiceLayout from "../main/InvoiceLayout/InvoiceLayout";
import useCart from "../../Hooks/useCart";

const customer = {
  name: "أحمد يوسف",
  email: "ahmed@example.com",
  phone: "0987654321",
};

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity,giveme } = useCart();

  // Currency setup
  const mainCurrencies = ["USD", "SYP", "TK"];
  const exchangeRates = {
    USD: 1,
    SYP: 13000,
    TK: 110,
  };

  const [targetCurrency, setTargetCurrency] = useState("USD"); // For global conversion
  const [itemCurrencies, setItemCurrencies] = useState({});    // Per-item currency
  const [currencyTotals, setCurrencyTotals] = useState({
    USD: 0,
    SYP: 0,
    TK: 0,
  });

  const [discountCode, setDiscountCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);

  const containerRef = useRef(null);
  const [invoiceChunks, setInvoiceChunks] = useState([]);
  const[currencychoosed,setCurrencychoosed]=useState("SYP")
  const[cuurr,setCurrr]=useState('SYP')
  // Helper: Currency conversion
const convertCurrency = (amount, from, to) => {
  if (from === to) return amount;
  return (amount / exchangeRates[from]) * exchangeRates[to];
};

  // Recalculate totals by currency
  const recalculateTotals = (cart, itemCurrencies) => {
    const totals = { USD: 0, SYP: 0, TK: 0 };
    cart.forEach((item) => {
      const fromCurrency = item.currency || "USD";
      const toCurrency = itemCurrencies[item.id] || fromCurrency;
      const baseAmount = item.price * item.quantity;
      const converted = convertCurrency(baseAmount, fromCurrency, toCurrency);
      totals[toCurrency] += converted;
    });
    setCurrencyTotals(totals);
  };

  useEffect(() => {
    recalculateTotals(cart, itemCurrencies);
  }, [cart, itemCurrencies]);

  // Invoice split for printing
  useEffect(() => {
    const itemsPerInvoice = 10;
    const chunks = [];
    for (let i = 0; i < cart.length; i += itemsPerInvoice) {
      chunks.push(cart.slice(i, i + itemsPerInvoice));
    }
    setInvoiceChunks(chunks);
  }, [cart]);

  const handleDownloadPDF = () => {
    const element = containerRef.current;
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
    if (discountCode === "SAVE10") {
      setDiscountPercent(10);
    } else {
      setDiscountPercent(0);
    }
  };

 const subtotal = cart.reduce((acc, item) => {
    
  const itemCurrency = item.currency ;
  const priceInMainCurrency = convertCurrency(item.price* item.quantity, itemCurrency, cuurr);
  return acc + priceInMainCurrency ;
}, 0);

  const discount = (subtotal * discountPercent) / 100;
  const tax = (subtotal - discount) * 0.05;
  const total = subtotal - discount + tax;
  
  useEffect(()=>{
    console.log(cart);
    giveme();
    return;
  },[cart]);

  return (
    <div className="container py-4">
      <div className="row">
        {/* Cart Items */}
        <div className="col-md-8">
          <h2 className="mb-4">🛒 Your Cart</h2>

          {/* Global currency apply */}
          <div className="mb-3">
            <label>Change all to: </label>
            <select
              className="form-select d-inline-block w-auto"
              value={targetCurrency}
              onChange={(e) => setTargetCurrency(e.target.value)}
            >
              {mainCurrencies.map((curr) => (
                <option key={curr} value={curr}>{curr}</option>
              ))}
            </select>
            <select
              className="form-select d-inline-block w-auto"
              value={cuurr}
              onChange={(e) => setCurrr(e.target.value)}
            >
              {mainCurrencies.map((curr) => (
                <option key={curr} value={curr}>{curr}</option>
              ))}
            </select>
            <button
              className="btn btn-outline-primary ms-2"
              onClick={() => {

                const updated = {};
                cart.forEach((item) => {
                  updated[item.id] = targetCurrency;
                });
                setItemCurrencies(updated);
              }}
            >
              Apply to All
            </button>
          </div>

          {cart.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            cart.map((item) => {
              const originalCurrency = item.currency || "USD";
              const selectedCurrency = itemCurrencies[item.id] || originalCurrency;
              const baseTotal = item.price * item.quantity;
              const converted = convertCurrency(baseTotal, originalCurrency, selectedCurrency);
              const conv=convertCurrency(item.price,originalCurrency,selectedCurrency)
              return (
                <div key={item.uuid} className="d-flex align-items-center mb-3 p-3 border rounded">
                  <img
                    src={item.Product_images[0].filename || "https://placehold.co/400"}
                    width={80}
                    height={80}
                    alt={item.name}
                    className="me-3"
                  />
                  <div className="flex-grow-1">
                    <h5 className="mb-1">{item.name}</h5>
                    <p className="mb-1">
                      Original: {item.price} {originalCurrency} <br />
                      Converted: {conv} {selectedCurrency}
                    </p>

                    <select
                      className="form-select w-50"
                      value={selectedCurrency}
                      onChange={(e) => {
                        setItemCurrencies({ ...itemCurrencies, [item.uuid]: e.target.value });
                      }}
                    >
                      {mainCurrencies.map((curr) => (
                        <option key={curr} value={curr}>{curr}</option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      className="form-control w-25 mt-2"
                      onChange={(e) => updateQuantity(item.uuid, parseInt(e.target.value))}
                    />
                  </div>

                  <div className="text-end">
                    <p className="mb-1">
                      <strong>
                        {converted.toFixed(2)} {selectedCurrency}
                      </strong>
                    </p>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => removeFromCart(item.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Invoice Summary */}
        <div className="col-md-4">
          <h2 className="mb-4">📋 Invoice</h2>
          <div className="border rounded p-3 bg-light">
            <div className="d-flex justify-content-between mb-2">
              <span>Subtotal:</span>
              <strong>  {subtotal.toFixed(2)} ل.س </strong>
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
              <strong>  {total.toFixed(2)} ل.س </strong>
            </div>

            <button className="btn btn-primary w-100 mt-3">Proceed to Checkout</button>

            <div className="mt-4">
              <h5>💰 Totals by Currency:</h5>
              {mainCurrencies.map((curr) => (
                <div key={curr} className="d-flex justify-content-between">
                  <span>{curr}:</span>
                  <strong>{currencyTotals[curr].toFixed(2)} {curr}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* <button className="btn btn-secondary mt-4" onClick={handleDownloadPDF}>
        🖨️ طباعة الفاتورة
      </button>
      
         <select
           className="form-select "
           style={{maxWidth:"max-content"}}
            value={currencychoosed}
            onChange={(e) => {
            setCurrencychoosed(e.target.value)
             }}
                    >
                      {mainCurrencies.map((curr) => (
                        <option key={curr} value={curr}>{curr}</option>
                      ))}
                    </select>

      <div className="p-0 m-0 container-fluid" ref={containerRef} style={{ display: "" }}>
        {invoiceChunks.map((items, index) => (
          <InvoiceLayout
            key={index}
            currency={currencychoosed}
            cart={items.map(item => ({
             ...item,
             price : convertCurrency(item.price,item.currency,currencychoosed), 
            }))}    
            subtotal={convertCurrency(subtotal,cuurr,currencychoosed)}
            discount={convertCurrency(discount,cuurr,currencychoosed)}
            tax={convertCurrency(tax,cuurr,currencychoosed)}
            total={convertCurrency(total,cuurr,currencychoosed)}
            customer={customer}
            itemCurrencies={itemCurrencies}
            exchangeRates={exchangeRates}
          />
        ))}
      </div> */}
    </div>
  );
}
