// src/components/ModernSingleCategoryCarousel.jsx
import React, { useEffect, useRef, useState } from "react";
import './400.css'
import { Link, NavLink } from "react-router-dom";
import axios from "../../api/fetch";
import SmallSkeletonCard from "../SkeltonCard/smallSkeltonCard";

export default function ModernSingleCategoryCarousel400edit({
  initialCategorySlug = null,
  fileName=null,
  visibleCards = 4,
  cardWidth = 180,
  autoplay = true,
  autoplayInterval = 3500, // <-- default to 3500ms (3.5s)
  onCardClick,
}) {
  const [data,setData]= useState([])
  const [loading,setLoading]=useState(false);
 
  async function fetchData() {
    setLoading(true);
    try {
      let fileName="BestCategoriesProducts"
      const res = await axios.get(`json/fetch/${fileName}`);
      let fetchedData = res.data.data;
      // Convert object to array if needed
      if (!Array.isArray(fetchedData)) {
        fetchedData = Object.keys(fetchedData).map(key =>{
          return ({
          category: {
            name: fetchedData[key].category.name||"",
            slug: fetchedData[key].category.slug||"",
            uuid:fetchedData[key].category.uuid||"",
            display_name:fetchedData[key].category.display_name ||""// using the key as slug
          },
          products: fetchedData[key].products || []
        })});
      }
      setData(fetchedData);
      setSelectedSlug(fetchedData[0].category.slug)
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }

  
  useEffect(() => {
    fetchData();
  }, []);

  const defaultSlug = initialCategorySlug || (data[0] && data[0].category.slug) || null;
  const [selectedSlug, setSelectedSlug] = useState(defaultSlug);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0); // keep a ref in sync with state for interval closure

  const scrollerRef = useRef(null);
  const autoplayRef = useRef(null);
  const isHoverRef = useRef(false);
  const dragging = useRef(false);
  const dragStartX = useRef(0);
  const scrollStart = useRef(0);

  const group = data.find(g => g.category.slug === selectedSlug) || (data[0] || { category: { name: "-", slug: "-" }, products: [] });

  // compute percent fallback (keeps previous behaviour if cardWidth not used)
  const cardWidthPct = Math.max(12, Math.floor(100 / visibleCards)); // lowered min to 12%

  useEffect(() => {
    // sync ref whenever activeIndex changes
    activeIndexRef.current = activeIndex; 
    return;
  }, [activeIndex]);

  useEffect(() => {
    setActiveIndex(0);
    activeIndexRef.current = 0;
    if (scrollerRef.current) scrollerRef.current.scrollLeft = 0;
    return
  }, [selectedSlug]);

  useEffect(() => {
    if (!autoplay) return;
    startAuto();
    return stopAuto;
    // eslint-disable-next-line
  }, [selectedSlug, autoplay, autoplayInterval]); // not depending on activeIndex now (we use ref)

  function startAuto() {
    stopAuto();
    // make sure interval is a reasonable positive number
    const interval = Math.max(50, Number(autoplayInterval) || 3500); // protect against insane tiny values
    autoplayRef.current = setInterval(() => {
      if (isHoverRef.current || dragging.current) return;
      const len = Math.max(1, group.products.length);
      const next = (activeIndexRef.current + 1) % len;
      // scroll and update both ref + state so UI and logic stay in sync
      scrollToIndex(next);
      activeIndexRef.current = next;
      setActiveIndex(next);
    }, interval);
  }

  function stopAuto() {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  }

  function handlePrev() { scrollBy(-1); }
  function handleNext() { scrollBy(1); }

  function scrollBy(direction = 1) {
    const el = scrollerRef.current;
    if (!el) return;
    const child = el.querySelector(".mscs-card");
    const gap = parseInt(getComputedStyle(el).gap || 12, 10) || 12;
    const step = child ? child.offsetWidth + gap : el.clientWidth / visibleCards;
    el.scrollBy({ left: direction * step, behavior: "smooth" });
  }

  function scrollToIndex(i) {
    const el = scrollerRef.current;
    if (!el) return;
    const child = el.querySelectorAll(".mscs-card")[i];
    if (!child) return;
    const left = child.offsetLeft - (el.clientWidth - child.offsetWidth) / 2;
    el.scrollTo({ left, behavior: "smooth" });
  }

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      let best = { ratio: 0, index: 0 };
      entries.forEach(ent => {
        const idx = Number(ent.target.getAttribute("data-idx"));
        if (ent.intersectionRatio > best.ratio) {
          best = { ratio: ent.intersectionRatio, index: idx };
        }
      });
      setActiveIndex(best.index);
      activeIndexRef.current = best.index;
    }, { root: el, threshold: [0,0.25,0.5,0.75,1] });

    const items = el.querySelectorAll(".mscs-card");
    items.forEach((it) => obs.observe(it));
    return () => obs.disconnect();
  }, [selectedSlug, group.products.length]);

  // drag
function onPointerDown(e) {
  if (!scrollerRef.current) return; // <-- تأكد أن العنصر موجود
  dragging.current = true;
  dragStartX.current = e.clientX ?? (e.touches && e.touches[0].clientX);
  scrollStart.current = scrollerRef.current.scrollLeft;
  scrollerRef.current.style.scrollBehavior = "auto";
  document.addEventListener("pointermove", onPointerMove);
  document.addEventListener("pointerup", onPointerUp);
}

function onPointerMove(e) {
  if (!dragging.current || !scrollerRef.current) return; // <-- هنا نتحقق
  const curX = e.clientX ?? (e.touches && e.touches[0].clientX);
  const dx = dragStartX.current - curX;
  scrollerRef.current.scrollLeft = scrollStart.current + dx;
}

  function onPointerUp() {
      if (!scrollerRef.current) return; // <-- تأكد أن العنصر موجود

    dragging.current = false;
    scrollerRef.current.style.scrollBehavior = "smooth";
    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", onPointerUp);
  }

  function onKeyDown(e) {
    if (e.key === "ArrowLeft") { handlePrev(); e.preventDefault(); }
    else if (e.key === "ArrowRight") { handleNext(); e.preventDefault(); }
  }

  const cardVar = cardWidth ? `${cardWidth}px` : `${cardWidthPct}%`;

  return (
    <div className="mscs-root" dir="rtl">

      <div className="d-flex align-items-center justify-content-between mb-3">

        <div className="d-flex align-items-center gap-3">
            <div className="mt-2">
              <h5 className="mb-0 ">{group.category.display_name} الأفضل من </h5>
              <small className="text-muted">عرض {group.products.length} منتج</small>
            </div>
        </div>

        <div  className="d-flex align-items-center gap-3">
          <div className="dropdown">
            <button 
              className="btn btn-outline-primary rounded-pill px-3 shadow-sm dropdown-toggle" 
              type="button" 
              data-bs-toggle="dropdown" 
              aria-expanded="false"
            >
              {data.find(d => d.category.slug === selectedSlug)?.category.display_name || "اختر التصنيف"}
            </button>

            <ul className="dropdown-menu">
              {data.map(d => (
                <li key={d.category.slug}>
                  <button 
                    className={`dropdown-item ${selectedSlug === d.category.slug ? "active" : ""}`} 
                    onClick={() => setSelectedSlug(d.category.slug)}
                  >
                    {d.category.display_name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <NavLink 
            to={`/category/${group.category.slug}`} 
            className="btn btn-sm btn-primary rounded-pill shadow-sm d-flex align-items-center gap-1"
          >
            <i className="bi bi-box-arrow-up-right"></i>
            <span>عرض الكل</span>
          </NavLink>
        </div>
      </div>

      <div className="mscs-wrap position-relative">
        <button className="mscs-nav mscs-prev" aria-label="Previous" onClick={handlePrev}>‹</button>

        <div
          className="mscs-scroller"
          ref={scrollerRef}
          onMouseEnter={() => { isHoverRef.current = true; stopAuto(); }}
          onMouseLeave={() => { isHoverRef.current = false; if (autoplay) startAuto(); }}
          onPointerDown={onPointerDown}
          onKeyDown={onKeyDown}
          tabIndex={0}
          role="region"
          aria-roledescription="carousel"
          style={{ ['--mscs-card-w' /* eslint-disable-line */]: cardVar }}
        >
          {loading? (
              Array.from({ length: 3 }).map((_, idx) => (
                <SmallSkeletonCard key={idx} width={310}  height={230} />
              ))
          ):(
          group.products.map((p, idx) => (
          <Link style={{textDecoration:"none"}} to={`/product/${p.slug}`}>
            <div
              key={p.uuid}
              className="mscs-card"
              data-idx={idx}
              onClick={() => onCardClick ? onCardClick(p) : null}
            >
              <div className="mscs-thumb">
                <img className="text-muted" src={p.Product_images[0]?.filename || "/placeholder.png"} alt={p.Product_images[0]?.filename} loading="lazy" />
                <div className="mscs-badges">
                  {p.discount && <span className="badge bg-danger">خصم</span>}
                  {p.featured && <span className="badge bg-success">جديد</span>}
                  {p.upcoming && <span className="badge bg-info">قريبًا</span>}
                  {p.latest && <span className="badge bg-warning">الأحدث</span>}
                </div>
              </div>

              <div className="mscs-info">
                <div className="mscs-title text-black fs-5 ">{p.title}</div>
                <div className="d-flex justify-content-between align-items-end">
                  <div className="mscs-price">
                    {/* {fmtPrice(p.price ?? p.original_price)} {p.Currency?.symbol}
                    {p.discount && p.original_price && <small className="text-muted ms-2 text-decoration-line-through">{fmtPrice(p.original_price)}</small>} */}
            {(p.discount ) ? (
              <>
                <span className="text-danger text-decoration-line-through ">
                  {p.original_price} {p.Currency?.symbol}
                </span>{" "}
                <span className="text-success fw-bold fs-6">
                  {p.price} {p.Currency?.symbol}
                </span>{" "}
              </>
            ) : (
              <>
                <small className="text-muted fs-6">
                  {fmtPrice(p.original_price ?? p.original_price)} {p.Currency?.symbol}
                </small>
              </>
            )}
                  </div>
                  {(p.stock_quantity_fy <= 8 && p.stock_quantity_fy>0) && <small className="text-danger">متبقي {p.stock_quantity_fy}</small>}
                </div>
              </div>
            </div>
          </Link>
          ))
          )}
        </div>
        <button className="mscs-nav mscs-next" aria-label="Next" onClick={handleNext}>›</button>
      </div>
    </div>
  );

  function fmtPrice(v) { if (v == null) return "-"; return (typeof v === "number") ? v.toFixed(2) : v; }
}
