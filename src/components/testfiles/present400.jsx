// src/components/ModernSingleCategoryCarousel.jsx
import React, { useEffect, useRef, useState } from "react";
import './400.css'

export default function ModernSingleCategoryCarousel400({
  data = [],
  initialCategorySlug = null,
  visibleCards = 4,
  cardWidth = 180,            // NEW: width in px (use this to make cards small)
  autoplay = true,
  autoplayInterval = 3000,
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

  const group = data.find(g => g.category.slug === selectedSlug) || (data[0] || { category: { name: "-", slug: "-" }, products: [] });

  // compute percent fallback (keeps previous behaviour if cardWidth not used)
  const cardWidthPct = Math.max(12, Math.floor(100 / visibleCards)); // lowered min to 12%

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
    }, { root: el, threshold: [0,0.25,0.5,0.75,1] });

    const items = el.querySelectorAll(".mscs-card");
    items.forEach((it) => obs.observe(it));
    return () => obs.disconnect();
  }, [selectedSlug, group.products.length]);

  // drag
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

  function onKeyDown(e) {
    if (e.key === "ArrowLeft") { handlePrev(); e.preventDefault(); }
    else if (e.key === "ArrowRight") { handleNext(); e.preventDefault(); }
  }

  // choose inline style variable: prefer pixel width if cardWidth provided
  const cardVar = cardWidth ? `${cardWidth}px` : `${cardWidthPct}%`;

  return (
    <div className="mscs-root" dir="rtl">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h5 className="mb-0">{group.category.name}</h5>
          <small className="text-muted">عرض {group.products.length} منتج</small>
        </div>

        <div className="d-flex gap-2 align-items-center">
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
          {group.products.map((p, idx) => (
            <div
              key={p.uuid}
              className="mscs-card"
              data-idx={idx}
              onClick={() => onCardClick ? onCardClick(p) : null}
            >
              <div className="mscs-thumb">
                <img src={p.images?.[0]?.url || "/placeholder.png"} alt={p.title} loading="lazy" />
                <div className="mscs-badges">
                  {p.discount && <span className="badge bg-danger">خصم</span>}
                  {isNew(p.createdAt) && <span className="badge bg-success">NEW</span>}
                </div>
              </div>

              <div className="mscs-info">
                <div className="mscs-title">{p.title}</div>
                <div className="d-flex justify-content-between align-items-end">
                  <div className="mscs-price">
                    {fmtPrice(p.price ?? p.original_price)} {p.currency_id}
                    {p.discount && p.original_price && <small className="text-muted ms-2 text-decoration-line-through">{fmtPrice(p.original_price)}</small>}
                  </div>
                  {p.stock_quantity_fy <= 5 && <small className="text-danger">متبقي {p.stock_quantity_fy}</small>}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="mscs-nav mscs-next" aria-label="Next" onClick={handleNext}>›</button>
      </div>
    </div>
  );

  function fmtPrice(v) { if (v == null) return "-"; return (typeof v === "number") ? v.toFixed(2) : v; }
  function isNew(createdAt) { if (!createdAt) return false; try { const diff = (Date.now() - new Date(createdAt).getTime()) / (1000*60*60*24); return diff <= 7; } catch { return false; } }
}
