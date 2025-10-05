// src/components/ModernSingleCategoryCarousel.jsx
import React, { useEffect, useRef, useState } from "react";
import './400.css'
import { Link, NavLink } from "react-router-dom";
import axios from "../../api/fetch";
import SmallSkeletonCard from "../SkeltonCard/smallSkeltonCard";

export default function NodeCategory({
    productchoosed=null,
  initialCategorySlug = null,
  fileName=null,
  categoryslug=null,
  visibleCards = 10,
  cardWidth = 180,
  autoplay = true,
  autoplayInterval = 3500, // <-- default to 3500ms (3.5s)
  onCardClick,
}) {

  const [data,setData]= useState([]);
  const [category,setCategory]=useState(null);
  const [slug,setSlug]=useState(null);
  const [filters, setFilters] = useState({isAvailable:true,softdelete:false});
    
  const [loading,setLoading]=useState(false);
 
  async function fetchData() {
    setLoading(true);
    try {
        if(!category) return;

      const res = await axios.post(`/product/filterproducts`,{limit:5, slugs:[slug],...filters });
      let fetchedData = res.data.products;
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
    } catch (error) {
        setData([])
    } finally {
      setLoading(false);
    }
  }
  async function fetchCategory() {
    setLoading(true)
  try {
    const res = await axios.post("/category/filtercategories", {
      slug:slug 
    });
    setCategory(res.data.categories[0]);
  } catch (err) {
    setCategory({})
  }finally{
    setLoading(false);
  }
  }

  useEffect(()=>{
    setSlug(categoryslug);
  },[categoryslug]);
  useEffect(() => {
    fetchCategory();
  }, [slug]);
  useEffect(()=>{
    fetchData();
  },[category]);

  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0); // keep a ref in sync with state for interval closure
  const scrollerRef = useRef(null);
  const autoplayRef = useRef(null);
  const isHoverRef = useRef(false);
  const dragging = useRef(false);
  const dragStartX = useRef(0);
  const scrollStart = useRef(0);


  // compute percent fallback (keeps previous behaviour if cardWidth not used)
  const cardWidthPct = Math.max(12, Math.floor(100 / visibleCards)); // lowered min to 12%

  useEffect(() => {
    // sync ref whenever activeIndex changes
    activeIndexRef.current = activeIndex;
    return
  }, [activeIndex]);

 

  useEffect(() => {
    if (!autoplay) return;
    startAuto();
    return stopAuto;
    // eslint-disable-next-line
  }, [data.length, autoplay, autoplayInterval]); // not depending on activeIndex now (we use ref)

  function startAuto() {
    stopAuto();
    // make sure interval is a reasonable positive number
    const interval = Math.max(50, Number(autoplayInterval) || 3500); // protect against insane tiny values
    autoplayRef.current = setInterval(() => {
      if (isHoverRef.current || dragging.current) return;
      const len = Math.max(1, data.length);
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
  }, [data.length]);

  // drag
function onPointerDown(e) {
  if (!scrollerRef.current) return; 
  dragging.current = true;
  dragStartX.current = e.clientX ?? (e.touches && e.touches[0].clientX);
  scrollStart.current = scrollerRef.current.scrollLeft;
  scrollerRef.current.style.scrollBehavior = "auto";
  document.addEventListener("pointermove", onPointerMove);
  document.addEventListener("pointerup", onPointerUp);
}

function onPointerMove(e) {
  if (!dragging.current || !scrollerRef.current) return; 
  const curX = e.clientX ?? (e.touches && e.touches[0].clientX);
  const dx = dragStartX.current - curX;
  scrollerRef.current.scrollLeft = scrollStart.current + dx;
}

  function onPointerUp() {
      if (!scrollerRef.current) return;

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
          <div class="d-flex align-items-center gap-2 mb-3 highlight-text">
            <i class="bi bi-star fs-4 text-warning "></i>
            <span class="fw-semibold fs-4 text-muted">قد يعجبك ايضًا</span>
          </div>
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
          data.map((p, idx) => (
          <Link onClick={()=>onCardClick()} key={p.uuid || idx} to={`/product/${p.slug}`} style={{ textDecoration: "none" }}>
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

