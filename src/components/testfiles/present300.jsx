// src/components/ModernSingleCategoryCarousel.jsx
import React, { useEffect, useRef, useState } from "react";
import './300.css'
/**
 Props:
  - data: array of groups [{ category: { name, slug, uuid }, products: [...] }]
  - initialCategorySlug: slug of category to show initially
  - visibleCards: how many cards roughly visible (affects card width), default 4
  - autoplay: boolean (default false)
  - autoplayInterval: ms (default 4000)
  - onCardClick: (product) => void optional
*/
export default function ModernSingleCategoryCarousel({
  data = [],
  initialCategorySlug = null,
  visibleCards = 4,
  autoplay = false,
  autoplayInterval = 3500,
  onCardClick,
}) {
  const defaultSlug = initialCategorySlug || (data[0] && data[0].category.slug) || null;
  const [selectedSlug, setSelectedSlug] = useState(defaultSlug);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollerRef = useRef(null);
  const autoplayRef = useRef(null);
  const isHoverRef = useRef(false);
  const dragging = useRef(false);
  const dragStartX = useRef(0);
  const scrollStart = useRef(0);

  // ensure selected group exists
  const group = data.find(g => g.category.slug === selectedSlug) || (data[0] || { category: { name: "-", slug: "-" }, products: [] });

  // compute card width via CSS variable; we set it using style on container
  const cardWidthPct = Math.max(18, Math.floor(100 / visibleCards)); // fallback

  useEffect(() => {
    setActiveIndex(0);
    if (scrollerRef.current) scrollerRef.current.scrollLeft = 0;
  }, [selectedSlug]);

  useEffect(() => {
    if (!autoplay) return;
    startAuto();
    return stopAuto;
    // eslint-disable-next-line
  }, [selectedSlug, autoplay, autoplayInterval]);

  function startAuto() {
    stopAuto();
    autoplayRef.current = setInterval(() => {
      if (isHoverRef.current || dragging.current) return;
      scrollToIndex((activeIndex + 1) % Math.max(1, group.products.length));
    }, autoplayInterval);
  }
  function stopAuto() {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  }

  function handlePrev() {
    scrollBy(-1);
  }
  function handleNext() {
    scrollBy(1);
  }

  function scrollBy(direction = 1) {
    const el = scrollerRef.current;
    if (!el) return;
    const child = el.querySelector(".msc-card");
    const gap = parseInt(getComputedStyle(el).gap || 12, 10) || 12;
    const step = child ? child.offsetWidth + gap : el.clientWidth / visibleCards;
    el.scrollBy({ left: direction * step, behavior: "smooth" });
  }

  function scrollToIndex(i) {
    const el = scrollerRef.current;
    if (!el) return;
    const child = el.querySelectorAll(".msc-card")[i];
    if (!child) return;
    const left = child.offsetLeft - (el.clientWidth - child.offsetWidth) / 2; // center card
    el.scrollTo({ left, behavior: "smooth" });
  }

  // update activeIndex on scroll using center detection
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      // find the entry with largest intersectionRatio
      let best = { ratio: 0, index: 0 };
      entries.forEach(ent => {
        const idx = Number(ent.target.getAttribute("data-idx"));
        if (ent.intersectionRatio > best.ratio) {
          best = { ratio: ent.intersectionRatio, index: idx };
        }
      });
      setActiveIndex(best.index);
    }, {
      root: el,
      threshold: [0, 0.25, 0.5, 0.75, 1]
    });

    const items = el.querySelectorAll(".msc-card");
    items.forEach((it) => obs.observe(it));
    return () => obs.disconnect();
  }, [selectedSlug, group.products.length]);

  // drag to scroll handlers
  function onPointerDown(e) {
    dragging.current = true;
    dragStartX.current = e.clientX ?? (e.touches && e.touches[0].clientX);
    scrollStart.current = scrollerRef.current.scrollLeft;
    scrollerRef.current.style.scrollBehavior = "auto";
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
  }
  function onPointerMove(e) {
    if (!dragging.current) return;
    const curX = e.clientX ?? (e.touches && e.touches[0].clientX);
    const dx = dragStartX.current - curX;
    scrollerRef.current.scrollLeft = scrollStart.current + dx;
  }
  function onPointerUp() {
    dragging.current = false;
    scrollerRef.current.style.scrollBehavior = "smooth";
    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", onPointerUp);
  }

  // keyboard accessibility: left/right arrows when focused
  function onKeyDown(e) {
    if (e.key === "ArrowLeft") {
      handlePrev();
      e.preventDefault();
    } else if (e.key === "ArrowRight") {
      handleNext();
      e.preventDefault();
    }
  }

  return (
    <div className="msc-root" dir="rtl">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h5 className="mb-0">{group.category.name}</h5>
          <small className="text-muted">عرض {group.products.length} منتج</small>
        </div>

        <div className="d-flex gap-2 align-items-center">
          {/* category selector: simple select element for modern clean UI */}
          <select
            value={selectedSlug}
            onChange={(e) => setSelectedSlug(e.target.value)}
            className="form-select form-select-sm"
            aria-label="اختر التصنيف"
            style={{ minWidth: 160 }}
          >
            {data.map(d => (
              <option key={d.category.slug} value={d.category.slug}>{d.category.name}</option>
            ))}
          </select>

          <a href={`/category/${group.category.slug}`} className="btn btn-link btn-sm">عرض الكل</a>
        </div>
      </div>

      <div className="msc-wrap position-relative">
        <button className="msc-nav msc-prev" aria-label="Previous" onClick={handlePrev}>‹</button>

        <div
          className="msc-scroller"
          ref={scrollerRef}
          onMouseEnter={() => { isHoverRef.current = true; stopAuto(); }}
          onMouseLeave={() => { isHoverRef.current = false; if (autoplay) startAuto(); }}
          onPointerDown={onPointerDown}
          onKeyDown={onKeyDown}
          tabIndex={0}
          role="region"
          aria-roledescription="carousel"
          style={{ ['--msc-card-w' /* eslint-disable-line */]: `${cardWidthPct}%` }}
        >
          {group.products.map((p, idx) => (
            <div
              key={p.uuid}
              className="msc-card"
              data-idx={idx}
              onClick={() => onCardClick ? onCardClick(p) : null}
            >
              <div className="msc-thumb">
                <img src={p.images?.[0]?.url || "/placeholder.png"} alt={p.title} loading="lazy" />
                <div className="msc-badges">
                  {p.discount && <span className="badge bg-danger">خصم</span>}
                  {isNew(p.createdAt) && <span className="badge bg-success">NEW</span>}
                </div>
              </div>

              <div className="msc-info">
                <div className="msc-title">{p.title}</div>
                <div className="d-flex justify-content-between align-items-end">
                  <div className="msc-price">
                    {fmtPrice(p.price ?? p.original_price)} {p.currency_id}
                    {p.discount && p.original_price && <small className="text-muted ms-2 text-decoration-line-through">{fmtPrice(p.original_price)}</small>}
                  </div>
                  {p.stock_quantity_fy <= 5 && <small className="text-danger">متبقي {p.stock_quantity_fy}</small>}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="msc-nav msc-next" aria-label="Next" onClick={handleNext}>›</button>
      </div>

      {/* indicators */}

    </div>
  );

  // helpers inside component to keep code compact
  function startAuto() {
    if (autoplayRef.current) return;
    autoplayRef.current = setInterval(() => {
      if (isHoverRef.current || dragging.current) return;
      scrollToIndex((activeIndex + 1) % Math.max(1, group.products.length));
    }, autoplayInterval);
  }
  function stopAuto() {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  }
  function fmtPrice(v) {
    if (v == null) return "-";
    return (typeof v === "number") ? v.toFixed(2) : v;
  }
  function isNew(createdAt) {
    if (!createdAt) return false;
    try {
      const diff = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
      return diff <= 7;
    } catch { return false; }
  }
}
