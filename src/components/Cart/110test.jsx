// src/pages/CartPage.js
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import html2pdf from "html2pdf.js";
import InvoiceLayout from "../main/InvoiceLayout/InvoiceLayout";
import useCart from "../../Hooks/useCart";
import { Link } from "react-router-dom";
import axios from "../../api/fetch";
import useNotification from "../../Hooks/useNotification";
import useAuth from "../../Hooks/useAuth";

// --- ثوابت خارجية (you can keep, but we'll override with API results)

export default function Cart110Test() {
  const { cart, removeFromCart, updateQuantity, increment, decrement, clearCart, giveme } = useCart();
  const { showNotification } = useNotification();
    const{auth,claims}=useAuth();
    useEffect(() => {
      
    }, [claims])
    
  // --- exchange rates state (you said rates come from outside; keep local state to store them if needed)
  const [rates, setRates] = useState([
    { base: "USD", target: "USD", rate: 1 },
    { base: "SYP", target: "SYP", rate: 1 },
    { base: "TK", target: "TK", rate: 1 },
  ]);

  // currencies may come from API; normalize it to an array of currency codes
  const [currencies, setCurrencies] = useState(DEFAULT_CURRENCIES);
// 

// 
  // helper: normalize various API shapes to an array of codes
const normalizeCurrencyResponse = (data) => {
  if (!data) return DEFAULT_CURRENCIES;

  // 1) array of strings -> turn to objects
  if (Array.isArray(data) && data.every((x) => typeof x === "string")) {
    return data.map((c) => ({ code: c, name: "", symbol: "" }));
  }

  // 2) array of objects -> try to extract {code, name, symbol}
  if (Array.isArray(data) && data.every((x) => typeof x === "object")) {
    return data.map((o) => {
      // handle different possible keys from API
      const code = o.currency_iso || o.code || o.currency || o.id || Object.values(o)[0];
      const name = o.name || o.currency_name || o.title || "";
      const symbol = o.symbol || o.sign || "";
      return { code: String(code || "").trim(), name: String(name || "").trim(), symbol: String(symbol || "").trim(), raw: o };
    }).filter((c) => c.code);
  }

  // 3) object -> keys -> map to code objects
  if (typeof data === "object") {
    return Object.keys(data).map((k) => ({ code: k, name: String(data[k]?.name || ""), symbol: String(data[k]?.symbol || "") }));
  }

  // fallback
  return DEFAULT_CURRENCIES;
};



async function fetchcurrencies() {
  try {
    const res = await axios.get("/currency/justgetall");
    const normalized = normalizeCurrencyResponse(res?.data);
    // ensure there's at least default
    setCurrencies((normalized && normalized.length) ? normalized : DEFAULT_CURRENCIES);
  } catch (error) {
    setCurrencies(DEFAULT_CURRENCIES);
  }
}
  useEffect(() => {
    fetchcurrencies();
  }, []);

  // UI state
  const [targetCurrency, setTargetCurrency] = useState("USD"); // apply-to-all target
  const [itemCurrencies, setItemCurrencies] = useState({}); // per-item keyed by uuid
  const [currencyTotals, setCurrencyTotals] = useState({}); // built dynamically below
  const [displayCurrency, setDisplayCurrency] = useState("SYP"); // currency for invoice totals
  const containerRef = useRef(null);
  const [invoiceChunks, setInvoiceChunks] = useState([]);
  const [printCurrency, setPrintCurrency] = useState("SYP");

  const pendingRef = useRef(new Set());

  // keep a memoized array of currency codes for mapping in JSX
 const currencyKeys = useMemo(() => {
  // currencies might be array of strings (old) or objects (new) but we normalized to objects above
  return (Array.isArray(currencies) ? currencies : []).map((c) => (typeof c === "string" ? c : c.code));
}, [currencies]);
  // ensure currencyTotals has a key for every currency (keeps toFixed safe)
  useEffect(() => {
    setCurrencyTotals((prev) => {
      const next = { ...prev };
      currencyKeys.forEach((k) => {
        if (!Object.prototype.hasOwnProperty.call(next, k)) next[k] = 0;
      });
      // remove keys that no longer exist if you want (optional)
      Object.keys(next).forEach((k) => {
        if (!currencyKeys.includes(k)) delete next[k];
      });
      return next;
    });
  }, [currencyKeys]);

  // --- helpers
  const findRateInState = useCallback(
    (base, target) => {
      if (!base || !target) return null;
      const found = rates.find((r) => r.base === base && r.target === target);
      return found ? Number(found.rate) : null;
    },
    [rates]
  );

  const fetchExchangeRate = useCallback(
    async (base, target) => {
      if (!base || !target) return null;
      const key = `${base}:${target}`;
      if (pendingRef.current.has(key)) return null;
      pendingRef.current.add(key);
      try {
        const res = await axios.post("/exch_rate/getjustratewithrate", { base, target });
        const data = res.data.rate;
        const rateValue = Number(data?.exchange_rate ?? data?.value ?? data) || null;
        if (!Number.isFinite(rateValue)) throw new Error("invalid rate from API");
        setRates((prev) => {
          const exists = prev.some((r) => r.base === base && r.target === target);
          if (exists) return prev;
          return [...prev, { base, target, rate: rateValue }];
        });
        return rateValue;
      } catch (err) {
        showNotification?.("error", "لا يوجد لهذه العملة مقابل");
        return null;
      } finally {
        pendingRef.current.delete(key);
      }
    },
    [showNotification]
  );

  const convertCurrency = useCallback(
    (amount = 0, from = "USD", to = "USD") => {
      const a = Number(amount) || 0;
      if (from === to) return a;
      const rateFromState = findRateInState(from, to);
      if (rateFromState != null && Number.isFinite(rateFromState)) {
        return a * rateFromState;
      }
      // trigger fetch (fire-and-forget)
      fetchExchangeRate(from, to).catch(() => {});
      // provisional fallback: return amount (you can change)
      return a;
    },
    [findRateInState, fetchExchangeRate]
  );

  // --- recalc totals
  const prevTotalsRef = useRef(null);
  useEffect(() => {
    const totals = {};
    currencyKeys.forEach((k) => (totals[k] = 0));
    cart.forEach((item) => {
      if (!item) return;
      const key =item.product_id|| item.uuid || item.id;
      const from = item.currency || "USD";
      const to = itemCurrencies[key] || from;
      const baseAmount = Number(item.price || 0) * Number(item.quantity || 0);
      const converted = convertCurrency(baseAmount, from, to);
      totals[to] = (totals[to] || 0) + converted;
    });
    const currStr = JSON.stringify(totals);
    if (prevTotalsRef.current !== currStr) {
      prevTotalsRef.current = currStr;
      setCurrencyTotals(totals);
    }
  }, [cart, itemCurrencies, convertCurrency, currencyKeys]);

  // --- chunk invoices
  useEffect(() => {
    const itemsPerInvoice = 10;
    const chunks = [];
    for (let i = 0; i < cart.length; i += itemsPerInvoice) {
      chunks.push(cart.slice(i, i + itemsPerInvoice));
    }
    setInvoiceChunks(chunks);
  }, [cart]);

  const applyToAll = useCallback(() => {
    const updated = {};
    const missingPairs = new Set();
    cart.forEach((item) => {
      const key =item.product_id|| item.uuid || item.id;
      if (!key) return;
      updated[key] = targetCurrency;
      const base = item.currency || "USD";
      if (base !== targetCurrency && findRateInState(base, targetCurrency) == null) {
        missingPairs.add(`${base}:${targetCurrency}`);
      }
    });
    missingPairs.forEach((pair) => {
      const [base, target] = pair.split(":");
      fetchExchangeRate(base, target).catch(() => {});
    });
    setItemCurrencies(updated);
  }, [cart, targetCurrency, findRateInState, fetchExchangeRate]);

  const getImageSrc = useCallback((item) => {
    try {
      if (!item) return "https://placehold.co/400";
      if (Array.isArray(item.Product_images) && item.Product_images.length > 0) {
        return item.Product_images[0].filename || item.Product_images[0].name || "https://placehold.co/400";
      }
      return "https://placehold.co/400";
    } catch {
      return "https://placehold.co/400";
    }
  }, []);

  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => {
      if (!item) return acc;
      const from = item.currency || "USD";
      const qty = Number(item.quantity) || 0;
      const base = Number(item.cost_per_one || 0) * qty;
      return acc + convertCurrency(base, from, displayCurrency);
    }, 0);
  }, [cart, convertCurrency, displayCurrency]);

  const total = useMemo(() => subtotal, [subtotal]);

  const handleDownloadPDF = useCallback(() => {
    const element = containerRef.current;
    if (!element) {
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
  }, []);

  const handleRemove = useCallback(
    (item) => {
      if (!item) return;
      const key =item.product_id|| item.uuid || item.id;
      if (key) removeFromCart(key);
    },
    [removeFromCart]
  );

  useEffect(() => {
    giveme?.();
  }, [cart, giveme]);
const getCurrencyMeta = useCallback(
  (code) => {
    if (!code) return { code: "", name: "", symbol: "" };
    const found = (currencies || []).find((c) => (typeof c === "string" ? c === code : c.code === code));
    if (!found) return { code, name: "", symbol: "" };
    if (typeof found === "string") return { code: found, name: "", symbol: "" };
    return { code: found.code, name: found.name || "", symbol: found.symbol || "" };
  },
  [currencies]
);

const getCurrencyLabel = (code) => {
  const m = getCurrencyMeta(code);
  // format like: "USD — $ (Dollar)" or fallback to code
  if (m.symbol || m.name) return `${m.code} ${m.symbol ? `— ${m.symbol}` : ""} `.trim();
  return m.code;
};

  // prefetch rates when displayCurrency changes
  useEffect(() => {
    const missingPairs = new Set();
    cart.forEach((item) => {
      const base = item.currency || "USD";
      const target = displayCurrency;
      if (base !== target && findRateInState(base, target) == null) {
        missingPairs.add(`${base}:${target}`);
      }
    });
    missingPairs.forEach((pair) => {
      const [base, target] = pair.split(":");
      fetchExchangeRate(base, target).catch(() => {});
    });
  }, [cart, displayCurrency, findRateInState, fetchExchangeRate]);

  // --- render


  const [showCheckout, setShowCheckout] = useState(false);
const [loadingCheckout, setLoadingCheckout] = useState(false);
const [checkoutForm, setCheckoutForm] = useState({
  address_id: "",         // optional id of saved address
  custom_address: "",     // free text address
  phoneNumber: "",        // required phone
  shipping_address: "",   // name/label or full address
  note: "",
  currency: displayCurrency || "SYP", // default to selected displayCurrency
});

// helper to build products structure expected by backend
const buildProductsPayload = (cartArr) => {
  return cartArr.map((item) => ({
    product_id: item.id || item.product_id || item.uuid, // try common ids
    uuid: item.uuid,
    title: item.title || item.name,
    quantity: Number(item.quantity || 1),
    price: Number(item.price || 0),
    currency: item.currency || "USD",
  }));
};

// open/close helpers
const openCheckout = () => {
  setCheckoutForm((s) => ({ ...s, currency: displayCurrency || s.currency }));
  setShowCheckout(true);
};
const closeCheckout = () => {
  if (!loadingCheckout) {
    setShowCheckout(false);
  }
};

useEffect(()=>{
    setCheckoutForm((prev)=>({...prev,phoneNumber:claims.phoneNumber||""}))
},[claims])

// --- جديد: حالات لعناوين المستخدم
const [addresses, setAddresses] = useState([]); // { id, label, full_address }
const [selectedAddressId, setSelectedAddressId] = useState(""); // id of saved address
const [useCustomAddress, setUseCustomAddress] = useState(false); // إذا بدنا نستخدم العنوان المخصص
const [addingAddress, setAddingAddress] = useState(false); // عرض فورم إضافة عنوان جديد
const [newAddressText, setNewAddressText] = useState("");
const modalCurrency = checkoutForm.currency || displayCurrency;
const modalItems = cart.map((item) => {
  const qty = Number(item.quantity || 1);
  const unitConv = convertCurrency(Number(item.cost_per_one || 0), item.currency || "USD", modalCurrency);
  const totalConv = Number(unitConv) * qty;
  return {
    key: item.product_id||item.uuid || item.id,
    title: item.title || item.name || "Unnamed product",
    img: getImageSrc(item),
    qty,
    unitConv,
    totalConv,
  };
});
const modalSubtotal = modalItems.reduce((s, it) => s + (it.totalConv || 0), 0);
const shippingCost = Number(checkoutForm.shipping_cost || 0);
const modalTotal = modalSubtotal + shippingCost;

// استدعي العناوين لما يفتح المودال
const fetchAddresses = useCallback(async () => {
  try {
    const res = await axios.get("/addresses/justgetall"); 
    const data = Array.isArray(res?.data) ? res.data : res?.data?.addresses ?? [];
    setAddresses(data);
    // لو في عناوين و ما في اختيار سابق، اختار الأول تلقائياً
    if (data.length && !selectedAddressId && !useCustomAddress) {
      setSelectedAddressId(String(data[0].id || data[0].address_id || ""));
    }
  } catch (err) {
    setAddresses([]);
  }
}, [selectedAddressId, useCustomAddress]);

// جلب العناوين كل ما نفتح المودال
useEffect(() => {
  if (showCheckout) fetchAddresses();
}, [showCheckout, fetchAddresses]);



// --- عدّل handleSubmitCheckout للتحقق من وجود عنوان واحد فقط
const handleSubmitCheckout = async (e) => {
  e?.preventDefault?.();

  if (!cart || cart.length === 0) {
    showNotification?.("error", "السلة فارغة");
    return;
  }

  // تأكد من وجود عنوان واحد (إما saved أو custom)
  const address_id_to_send = useCustomAddress ? null : (selectedAddressId || null);
  const custom_address_to_send = useCustomAddress ? (checkoutForm.custom_address || "").trim() : "";

  if (!address_id_to_send && !custom_address_to_send) {
    showNotification?.("error", "يرجى اختيار عنوان  أو إدخال عنوان مخصص");
  }

  if (!checkoutForm.phoneNumber || checkoutForm.phoneNumber.trim().length < 6) {
    showNotification?.("error", "رجاء أدخل رقم هاتف صحيح");
    return;
  }

  setLoadingCheckout(true);
  try {
    const body = {
      address_id: address_id_to_send, // سيرفر يستخدم هذا أو req.user
      custom_address: custom_address_to_send,
      phoneNumber: checkoutForm.phoneNumber,
      shipping_address: checkoutForm.shipping_address || custom_address_to_send || "",
      products: cart.map((item) => ({
        product_id: item.product_id || item.uuid || null,
        quantity: Number(item.quantity || 1),
        cost_per_one: Number(item.cost_per_one||item.original_cost || 0),
        currency: item.currency || "USD",
      })),
      note: checkoutForm.note || "",
      currency: checkoutForm.currency || displayCurrency,
      shipping_cost: Number(checkoutForm.shipping_cost || 0),
      subtotal: modalSubtotal,
      total: modalTotal,
    };
    const ORDER_API = "/order/create/placeOrder";
    const res = await axios.post(ORDER_API, body);

    if (res?.status === 201 || res?.data) {
      showNotification("success", "تم إرسال الطلب بنجاح سوف نقوم بالتواصل معك قريبًا");
      clearCart();
      setItemCurrencies({});
      setShowCheckout(false);
      // reset address selection if you want:
      // setSelectedAddressId("");
      // setUseCustomAddress(false);
    } else {
      const msg =  "فشل إنشاء الطلب";
      showNotification?.("error", msg);
    }
  } catch (err) {
    const msg = err?.response?.data?.message || "خطأ في الاتصال بالخادم";
    showNotification?.("error", msg);
  } finally {
    setLoadingCheckout(false);
  }
};




  return (
    <div className="container py-4">
      <div className="row">
        {/* Cart Items */}
        <div className="col-md-8">
          <h2 className="mb-4">🛒 السلة</h2>
          <div className="mb-3">
            <label className="me-2">تغيير الكل إلى :</label>
            <select
              className="form-select d-inline-block w-auto me-2"
              value={targetCurrency}
              onChange={(e) => setTargetCurrency(e.target.value)}
            >
     
{currencyKeys.map((curr) => (
  <option key={curr} value={curr}>
    {getCurrencyLabel(curr)}
  </option>
))}
            </select>

            <button className="btn btn-outline-primary ms-2" onClick={applyToAll}>
              تغيير الكل
            </button>

            <button className="btn btn-outline-danger ms-2" onClick={() => clearCart()}>
              إزالة الجميع
            </button>
          </div>

          {cart.length === 0 ? (
            <p>السلة فارغة.</p>
          ) : (
            cart.map((item) => {
              const itemKey =item?.product_id|| item?.uuid || item?.id;
              const originalCurrency = item?.currency || "USD";
              const selectedCurrency = itemCurrencies[itemKey] || originalCurrency;
              const baseTotal = Number(item?.cost_per_one || 0) * Number(item?.quantity || 0);
              const converted = convertCurrency(baseTotal, originalCurrency, selectedCurrency);
              const convUnit = convertCurrency(Number(item?.cost_per_one || 0), originalCurrency, selectedCurrency);
              const hasdiscount=item.cost_per_one<item.original_price;
              return (
                <div key={itemKey} className="d-flex align-items-center mb-3 p-3 shadow-sm rounded">
                  <Link to={`/product/${item?.slug || ""}`} style={{ textDecoration: "none" }}>
                    <img
                      src={getImageSrc(item)}
                      width={100}
                      height={100}
                      alt={item?.title || item?.name || "product"}
                      className="me-3 rounded object-fit-cover"
                    />
                  </Link>

                  <div className="flex-grow-1">
                    <h5 className="mb-1">{item?.title || item?.name || "Unnamed product"}</h5>

                    <p className="mb-1">
                      السعر للواحدة: {Number(item?.cost_per_one || 0).toFixed(2)}     {getCurrencyLabel(originalCurrency)} 
                      <br />
                      وحدة (محولة): {Number(convUnit).toFixed(2)} {getCurrencyLabel(selectedCurrency)}
                    </p>

                    <div className="d-flex gap-2 align-items-center">
                      <select
                        className="form-select w-50"
                        value={selectedCurrency}
                        onChange={(e) => {
                          const newCurr = e.target.value;
                          setItemCurrencies((s) => ({ ...s, [itemKey]: newCurr }));

                          if (originalCurrency !== newCurr && findRateInState(originalCurrency, newCurr) == null) {
                            fetchExchangeRate(originalCurrency, newCurr).catch(() => {});
                          }
                        }}
                      >
                        {currencyKeys.map((curr) => (
                          <option key={curr} value={curr}>
                            {getCurrencyLabel(curr)}
                          </option>
                        ))}
                      </select>

                      <div className="input-group" style={{ width: 130 }}>
                        <button className="btn btn-outline-secondary" onClick={() => decrement(itemKey, 1)} type="button">
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          className="form-control text-center"
                          value={Number(item?.quantity || 1)}
                          onChange={(e) => {
                            const q = parseInt(e.target.value, 10);
                            updateQuantity(itemKey, Number.isFinite(q) && q > 0 ? q : 1);
                          }}
                        />
                        <button className="btn btn-outline-secondary" onClick={() => increment(itemKey, 1)} type="button">
                          +
                        </button>
                      </div>
                      
                    </div>
                              <div className="container text-start mt-2" >
                    <p className="mb-1 ">
                       المجموع لهذا المنتج : {" "}
                      <strong>
                        {Number(converted || 0).toFixed(2)}    {getCurrencyLabel(selectedCurrency)}

                      </strong>
                    </p>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleRemove(item)}>
                      إزالة
                    </button>
                  </div>
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
              <label className="me-2">المجموع بالعملة :</label>
              <select className="form-select d-inline-block w-auto me-2" value={displayCurrency} onChange={(e) => setDisplayCurrency(e.target.value)}>
                {currencyKeys.map((curr) => (
                  <option key={curr} value={curr}>
                    {getCurrencyLabel(curr)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="border rounded p-3 bg-light">
            <div className="d-flex justify-content-between mb-2">
              <span>المجموع:</span>
              <strong>
                {subtotal.toFixed(2)} {getCurrencyLabel(displayCurrency)}
              </strong>
            </div>
                        <div className="mb-3">
              <label className="form-label">كود الخصم</label>
              <div className="input-group" >
                <input
                  disabled
                  type="text"
                  className="form-control"
                  value={""}
                  onChange={(e) => {}}
                />
                <button disabled className="btn btn-outline-primary" onClick={()=>{}}>
                  تطبيق
                </button>
              </div>
            </div>

            <hr />
            <div className="d-flex justify-content-between fs-5">
              <span>المجموع النهائي:</span>
              <strong>
                {total.toFixed(2)}     {getCurrencyLabel(displayCurrency)}
              </strong>
            </div>

            <button className="btn btn-primary w-100 mt-3" onClick={() => openCheckout()}>المتابعة لإتمام الطلب</button>

            <div className="mt-4">
              <h5>💰 المجموع بعملات :</h5>
              {currencyKeys.map((curr) => (
                <div key={curr} className="d-flex justify-content-between">
                  <span>{getCurrencyLabel(curr)}:</span>
                  <strong>
                    {Number(currencyTotals[curr] ?? 0).toFixed(2)}     {(curr)}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>



      {/* Hidden invoice sections for printing (converted values passed) */}
      {/* ... */}

     {showCheckout && (
        <>
        <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1040 }}
        onClick={() => !loadingCheckout && closeCheckout()}
        />
            <div
            role="dialog"
            aria-modal="true"
            style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 1050,
                width: "min(960px, 95%)",
                maxHeight: "90vh",
                overflow: "auto",
            }}
            >
                <div className="bg-white rounded-3 shadow-lg p-3 p-md-4" >
                    <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="m-0">تفاصيل الشحن — إتمام الطلب</h5>
                    <button className="btn btn-sm btn-outline-secondary" onClick={closeCheckout} disabled={loadingCheckout}>
                        إغلاق
                    </button>
                    </div>

                    <div className="row  bg-light shadow rounded  p-1 g-3">
                    {/* Left: Form */}
                    <div className="col-12 col-md-6">
                        <div className="card border-0">
                        <div className="card-body p-2">

                            <label htmlFor="phonenumber" className='form-label'>   <div className="d-flex align-items-center">
                                <div>رقم الهاتف : </div>   
          <span
            className="badge rounded-pill bg-light border d-flex align-items-center shadow-sm"
            style={{ padding: "0.35rem 0.5rem", fontSize: "0.85rem" }}
            aria-hidden="true"
            title="من المفضّل أن يكون الرقم مفعلًا على واتساب"
          >
            <i
              className="bi bi-whatsapp"
              style={{
                fontSize: "1.05rem",
                marginInlineEnd: "0.4rem",
                color: "#25D366",
              }}
            ></i>
            <span style={{ fontWeight: 600, color: "#155724" }}>واتساب</span>
          </span>

          <small className="text-muted ms-2">من المفضّل أن يكون الرقم مفعلًا على واتساب</small>
        </div></label>
                            <div className='input-group'>
                            <input
                                type="tel"
                                id="phonenumber"
                                name="phoneNumber"
                                value={checkoutForm.phoneNumber}
                                onKeyDown={(e) => {
                                const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab'];
                                if (!/^\d$/.test(e.key) && !allowedKeys.includes(e.key)) {
                                    e.preventDefault();
                                }
                                }}

                                onChange={(e) => setCheckoutForm((s) => ({ ...s, phoneNumber: e.target.value }))}
                                placeholder="09XXXXXXXX"
                                className={`form-control ${
                                true && ! /^09\d{8}$/.test(checkoutForm.phoneNumber)
                                ?    'is-invalid'
                                    : ''
                                    }`}  
                                minLength={10}
                                maxLength={10}
                                />
                                <span
                                className="input-group-text "
                                style={{ cursor: 'pointer', userSelect: 'none' }}
                                >
                                963+   <img className='ms-2' src="//upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Emojione_1F1F8-1F1FE_New.svg/40px-Emojione_1F1F8-1F1FE_New.svg.png"  width="32" height="32"  ></img> 
                                </span>
                            </div>

                            <label className="form-label small">ملاحظة للطلب</label>
                            <input
                            className="form-control mb-2"
                            value={checkoutForm.note}
                            onChange={(e) => setCheckoutForm((s) => ({ ...s, note: e.target.value }))}
                            />

                            <label className="form-label small">عملة الطلب</label>
                            <select
                            disabled
                            className="form-select mb-2"
                            value={checkoutForm.currency}
                            onChange={(e) => setCheckoutForm((s) => ({ ...s, currency: e.target.value }))}
                            >
                            {currencyKeys.map((c) => (
                                <option key={c} value={c}>
                                {getCurrencyLabel(c)}
                                </option>
                            ))}
                            </select>


                            <div className="mb-2">
                            <label className="form-label small">اختر عنوان الشحن</label>

                            {/* قائمة العناوين المحفوظة */}
                            <div className="list-group mb-2" style={{ maxHeight: 160, overflow: "auto" }}>
                                {addresses.length === 0 ? (
                                <div className="p-2 text-muted">لا توجد عناوين </div>
                                ) : (
                                addresses.map((addr) => (
                                    <label key={addr.id || addr.address_id || addr._id} className="list-group-item list-group-item-action d-flex align-items-start gap-2">
                                        <input
                                            className="form-check-input me-2 mt-1"
                                            type="radio"
                                            name="saved_addr"
                                            checked={!useCustomAddress && String(selectedAddressId) === String(addr.id || addr.address_id || addr._id)}
                                            onChange={() => {
                                            setSelectedAddressId(String(addr.id || addr.address_id || addr._id));
                                            setUseCustomAddress(false);
                                            // optional: populate textarea with address for review
                                            setCheckoutForm((s) => ({ ...s, custom_address: addr.full_address || addr.label || "" }));
                                            }}
                                        />
                                        <div className="flex-grow-1">
                                            <div style={{ fontWeight: 600 }}>{addr.label || addr.name || `العنوان ${addr.id || ""}`}</div>
                                            <div className="small text-muted">{addr.full_address || addr.address || "-"}</div>
                                        </div>
                                    </label>
                                ))
                                )}
                            </div>

                            {/* خيار استخدام عنوان مخصص */}
                            <div className="form-check mb-2">
                                <input
                                className="form-check-input"
                                type="checkbox"
                                id="useCustomAddr"
                                checked={useCustomAddress}
                                onChange={(e) => {
                                    const on = e.target.checked;
                                    setUseCustomAddress(on);
                                    if (on) {
                                    setSelectedAddressId("");
                                    }
                                }}
                                />
                                <label className="form-check-label" htmlFor="useCustomAddr">
                                استخدام عنوان مخصص
                                </label>
                            </div>

                            {useCustomAddress && (
                                <textarea
                                className="form-control mb-2"
                                rows={2}
                                placeholder="أدخل عنوان الشحن هنا"
                                value={checkoutForm.custom_address}
                                onChange={(e) => setCheckoutForm((s) => ({ ...s, custom_address: e.target.value }))}
                                />
                            )}

                            {/* زر إضافة عنوان جديد */}
                  
                            </div>


                            <div className="d-grid gap-2 mt-2">
                                <button className="btn btn-primary" onClick={handleSubmitCheckout} disabled={loadingCheckout}>
                                    {loadingCheckout ? "جاري الإرسال..." : `تأكيد و إرسال (${cart.length} منتج)`}
                                </button>
                                <button className="btn btn-outline-secondary" onClick={closeCheckout} disabled={loadingCheckout}>
                                    إلغاء
                                </button>
                            </div>
              </div>
            </div>


          </div>

          {/* Right: Order summary */}
          <div className="col-12 col-md-6">
            <div className="card border-0">
              <div className="card-body p-2">
                <h6 className="mb-2">ملخص الطلب</h6>

                <div className="list-group mb-2" style={{ maxHeight: 320, overflow: "auto" }}>
                  {modalItems.length === 0 ? (
                    <div className="p-2 text-muted">لا توجد منتجات</div>
                  ) : (
                    modalItems.map((it) => (
                      <div key={it.key} className="list-group-item d-flex align-items-center gap-2">
                        <img src={it.img} alt={it.title} width="56" height="56" style={{ objectFit: "cover", borderRadius: 8 }} />
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between">
                            <div style={{ fontSize: 14, fontWeight: 600 }}>{it.title}</div>
                            <div style={{ fontSize: 13 }}>{Number(it.totalConv || 0).toFixed(2)} {getCurrencyLabel(modalCurrency)}</div>
                          </div>
                          <div className="text-muted small d-flex justify-content-between">
                            <div>كمية: {it.qty}</div>
                            <div>وحدة: {Number(it.unitConv || 0).toFixed(2)} {getCurrencyLabel(modalCurrency)}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mb-2">
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">المجموع</span>
                    <strong>{Number(modalSubtotal || 0).toFixed(2)}     {getCurrencyLabel(modalCurrency)}</strong>
                  </div>
            
                  <hr />
                  <div className="d-flex justify-content-between fs-5">
                    <span>المجموع النهائي</span>
                    <strong>{Number(modalTotal || 0).toFixed(2)} {getCurrencyLabel(modalCurrency)}</strong>
                  </div>
                </div>

                <div className="small text-muted">عملة العرض: {getCurrencyLabel(modalCurrency)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
)}
    </div>
  );
}


// --- ثوابت خارجية (you can keep, but we'll override with API results)
// keep default as objects so rest of code can expect same shape
const DEFAULT_CURRENCIES = [
  { code: "USD", name: "Dollar", symbol: "$" },
  { code: "SYP", name: "Syrian Pound", symbol: "ل.س" },
];

// ... rates state stays the same ...

// currencies state: store array of objects { code, name, symbol, raw }

// helper: normalize various API shapes to a consistent array of objects


// keep a memoized array of currency codes for mapping in JSX (same name currencyKeys used elsewhere)


// helper to get full label and symbol by code

