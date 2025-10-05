// src/components/ModernCategoryCarouselBootstrap.jsx
import React, { useEffect, useRef, useState } from "react";
import "./500.css"; // اضف هالملف اللي تحت

/**
 Props:
  - data: [{ category:{name,slug,uuid}, products:[...] }]
  - initialCategorySlug
  - cardWidth (px) default 170
  - visibleCards (fallback % if cardWidth null)
  - autoplay (bool) default false
  - autoplayInterval (ms)
  - onCardClick(product)
*/
export default function ModernCategoryCarouselBootstrap({
  data = [],
  initialCategorySlug = null,
  cardWidth = 170,
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
  const dragging = useRef(false);
  const dragStartX = useRef(0);
  const scrollStart = useRef(0);

  const group = data.find(g => g.category.slug === selectedSlug) || (data[0] || { category: { name: "-", slug: "-" }, products: [] });

  useEffect(() => {
    setActiveIndex(0);
    if (scrollerRef.current) scrollerRef.current.scrollLeft = 0;
  }, [selectedSlug]);

  useEffect(() => {
    if (!autoplay) return;
    startAuto();
    return stopAuto;
    // eslint-disable-next-line
  }, [selectedSlug, autoplay, autoplayInterval, activeIndex]);

  function startAuto() {
    stopAuto();
    autoplayRef.current = setInterval(() => {
      if (dragging.current) return;
      const next = (activeIndex + 1) % Math.max(1, group.products.length);
      scrollToIndex(next);
    }, autoplayInterval);
  }
  function stopAuto() {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  }

  function scrollBy(direction = 1) {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector(".mc-card");
    const gap = parseInt(getComputedStyle(el).gap || 12, 10) || 12;
    const step = card ? card.offsetWidth + gap : el.clientWidth / visibleCards;
    el.scrollBy({ left: direction * step, behavior: "smooth" });
  }

  function scrollToIndex(i) {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelectorAll(".mc-card")[i];
    if (!card) return;
    // center card
    const left = card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2;
    el.scrollTo({ left, behavior: "smooth" });
  }

  // IntersectionObserver to detect active card (center)
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(entries => {
      let best = { ratio: 0, index: 0 };
      entries.forEach(ent => {
        const idx = Number(ent.target.dataset.idx);
        if (ent.intersectionRatio > best.ratio) best = { ratio: ent.intersectionRatio, index: idx };
      });
      setActiveIndex(best.index);
    }, { root: el, threshold: [0, 0.25, 0.5, 0.75, 1] });

    const items = el.querySelectorAll(".mc-card");
    items.forEach(it => obs.observe(it));
    return () => obs.disconnect();
  }, [selectedSlug, group.products.length]);

  // drag handlers
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

  // keyboard nav
  function onKeyDown(e) {
    if (e.key === "ArrowLeft") { scrollBy(-1); e.preventDefault(); }
    if (e.key === "ArrowRight") { scrollBy(1); e.preventDefault(); }
  }

  // compute CSS var (px or %)
  const cardVar = cardWidth ? `${cardWidth}px` : `${Math.max(12, Math.floor(100 / visibleCards))}%`;

  return (
    <div className="mc-root" dir="rtl">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h5 className="mb-0">{group.category.name}</h5>
          <small className="text-muted">عرض {group.products.length} منتج</small>
        </div>

        <div className="d-flex gap-2 align-items-center">
          <select
            className="form-select form-select-sm"
            value={selectedSlug}
            onChange={(e) => setSelectedSlug(e.target.value)}
            aria-label="اختر التصنيف"
            style={{ minWidth: 160 }}
          >
            {data.map(d => <option key={d.category.slug} value={d.category.slug}>{d.category.name}</option>)}
          </select>

          <a className="btn btn-link btn-sm" href={`/category/${group.category.slug}`}>عرض الكل</a>
        </div>
      </div>

      <div className="position-relative">
        <button className="btn btn-white mc-btn-prev shadow-sm" onClick={() => scrollBy(-1)} aria-label="السابق">‹</button>

        <div
          ref={scrollerRef}
          className="d-flex gap-3 overflow-auto mc-scroller py-2"
          onPointerDown={onPointerDown}
          onKeyDown={onKeyDown}
          tabIndex={0}
          style={{ ['--mc-card-w' /* eslint-disable-line */]: cardVar }}
        >
          {group.products.map((p, idx) => (
            <div
              key={p.uuid}
              data-idx={idx}
              className="mc-card card flex-shrink-0"
              onClick={() => onCardClick ? onCardClick(p) : null}
              role="button"
            >
              <div className="ratio ratio-4x3 overflow-hidden">
                <img src={p.images?.[0]?.url || "/placeholder.png"} alt={p.title} className="w-100 h-100 object-fit-cover" loading="lazy"/>
                <div className="position-absolute top-2 start-2 d-flex flex-column gap-1">
                  {p.discount && <span className="badge bg-danger">خصم</span>}
                  {isNew(p.createdAt) && <span className="badge bg-success">NEW</span>}
                </div>
              </div>

              <div className="card-body p-2">
                <h6 className="card-title small mb-1 text-truncate">{p.title}</h6>
                <div className="d-flex justify-content-between align-items-center">
                  <div className="fw-bold small">{fmtPrice(p.price ?? p.original_price)} {p.currency_id}</div>
                  {p.stock_quantity_fy <= 5 && <small className="text-danger small">متبقي {p.stock_quantity_fy}</small>}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="btn btn-white mc-btn-next shadow-sm" onClick={() => scrollBy(1)} aria-label="التالي">›</button>
      </div>

      {/* indicators */}
      <div className="d-flex justify-content-center gap-2 mt-2">
        {group.products.map((_, i) => (
          <button key={i} className={`mc-dot btn p-0 ${i === activeIndex ? "active" : ""}`} onClick={() => scrollToIndex(i)} aria-label={`عرض ${i+1}`}></button>
        ))}
      </div>
    </div>
  );

  function fmtPrice(v) { if (v == null) return "-"; return (typeof v === "number" ? v.toFixed(2) : v); }
  function isNew(createdAt) { if (!createdAt) return false; try { return ((Date.now() - new Date(createdAt).getTime()) / (1000*60*60*24)) <= 7; } catch { return false; } }
}
