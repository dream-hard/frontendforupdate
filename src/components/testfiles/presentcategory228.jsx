// src/components/ModernCategoryCarousel.jsx
import React, { useEffect, useRef, useState } from "react";
import "./present101158.css";
/* 
  Props:
    - data: array of { category: { name, slug, uuid }, products: [...] }
    - initialCategorySlug: string (slug to show initially)
    - autoplay: boolean (default true)
    - autoplayInterval: ms (default 4000)
*/
export default function ModernCategoryCarousel({
  data = [
  {
    category: { uuid: "c1", name: "Phones", slug: "phones" },
    products: [
      { uuid: "p1", title: "iPhone 12 Pro", slug: "iphone-12-pro", price: 599.99, original_price: 799.99, currency_id: "USD", stock_quantity_fy: 8, discount: true, createdAt: "2025-09-20T10:15:00.000Z", images: [{ url: "/images/products/iphone12pro.jpg" }] },
      { uuid: "p2", title: "Samsung Galaxy S21", slug: "samsung-galaxy-s21", price: 449.0, original_price: 549.0, currency_id: "USD", stock_quantity_fy: 15, discount: true, createdAt: "2025-09-10T09:00:00.000Z", images: [{ url: "/images/products/galaxy-s21.jpg" }] },
      { uuid: "p3", title: "OnePlus Nord CE", slug: "oneplus-nord-ce", price: 199.0, original_price: 199.0, currency_id: "USD", stock_quantity_fy: 3, discount: false, createdAt: "2025-09-28T12:00:00.000Z", images: [{ url: "/images/products/oneplus-nord-ce.jpg" }] }
    ]
  },
  {
    category: { uuid: "c2", name: "Laptops", slug: "laptops" },
    products: [
      { uuid: "p5", title: "MacBook Air M1", slug: "macbook-air-m1", price: 899.0, original_price: 999.0, currency_id: "USD", stock_quantity_fy: 6, discount: true, createdAt: "2025-08-15T08:30:00.000Z", images: [{ url: "/images/products/macbook-air-m1.jpg" }] },
      { uuid: "p6", title: "Dell XPS 13", slug: "dell-xps-13", price: 1099.0, original_price: 1199.0, currency_id: "USD", stock_quantity_fy: 4, discount: false, createdAt: "2025-07-30T11:20:00.000Z", images: [{ url: "/images/products/dell-xps13.jpg" }] }
    ]
  }
],
  initialCategorySlug = null,
  autoplay = true,
  autoplayInterval = 4000,
}) {
  const defaultCategory =
    initialCategorySlug || (data.length ? data[0].category.slug : null);
  const [selected, setSelected] = useState(defaultCategory);
  const carouselRef = useRef(null);
  const autoplayRef = useRef(null);
  const isHoveringRef = useRef(false);
  const isDraggingRef = useRef(false);
  const dragStartX = useRef(0);
  const scrollStartX = useRef(0);

  useEffect(() => {
    if (!autoplay) return;
    stopAutoplay();
    startAutoplay();
    return stopAutoplay;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, autoplay, autoplayInterval]);

  function startAutoplay() {
    if (!autoplay || !carouselRef.current) return;
    autoplayRef.current = setInterval(() => {
      if (isHoveringRef.current || isDraggingRef.current) return;
      scrollBy(1); // scroll right by one card width
    }, autoplayInterval);
  }
  function stopAutoplay() {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  }

  function onMouseEnter() {
    isHoveringRef.current = true;
  }
  function onMouseLeave() {
    isHoveringRef.current = false;
  }

  function scrollBy(direction = 1) {
    const el = carouselRef.current;
    if (!el) return;
    // calculate one card width (assume children[0])
    const child = el.querySelector(".mcc-card");
    const gap = parseInt(getComputedStyle(el).gap || 12, 10) || 12;
    const cardWidth = child ? child.offsetWidth + gap : 240;
    const delta = direction > 0 ? cardWidth * 1.05 : -cardWidth * 1.05;
    el.scrollBy({ left: delta, behavior: "smooth" });
  }

  // Drag to scroll
  function onPointerDown(e) {
    const el = carouselRef.current;
    if (!el) return;
    isDraggingRef.current = true;
    dragStartX.current = e.clientX ?? (e.touches && e.touches[0].clientX);
    scrollStartX.current = el.scrollLeft;
    el.style.scrollBehavior = "auto";
    document.addEventListener("pointerup", onPointerUp);
    document.addEventListener("pointermove", onPointerMove);
  }
  function onPointerMove(e) {
    if (!isDraggingRef.current) return;
    const el = carouselRef.current;
    const curX = e.clientX ?? (e.touches && e.touches[0].clientX);
    const dx = dragStartX.current - curX;
    el.scrollLeft = scrollStartX.current + dx;
  }
  function onPointerUp() {
    isDraggingRef.current = false;
    const el = carouselRef.current;
    if (el) el.style.scrollBehavior = "smooth";
    document.removeEventListener("pointerup", onPointerUp);
    document.removeEventListener("pointermove", onPointerMove);
  }

  const group = data.find((g) => g.category.slug === selected) || data[0] || {
    category: { name: "-", slug: "-" },
    products: [],
  };

  return (
    <div className="mcc-root" dir="rtl">
      {/* Category selector (single-select pills) */}
      <div className="d-flex flex-wrap gap-2 mb-3 align-items-center">
        <div className="me-auto"><strong>اختر تصنيف</strong></div>
        {data.map((g) => {
          const active = g.category.slug === selected;
          return (
            <button
              key={g.category.slug}
              onClick={() => setSelected(g.category.slug)}
              className={`btn btn-sm ${active ? "btn-primary" : "btn-outline-secondary"}`}
              aria-pressed={active}
            >
              {g.category.name}
            </button>
          );
        })}
        <a href={`/category/${group.category.slug}`} className="btn btn-link btn-sm ms-2">عرض الكل</a>
      </div>

      {/* Carousel area */}
      <div className="mcc-carousel-wrap position-relative">
        <button
          className="mcc-nav mcc-prev"
          aria-label="Previous"
          onClick={() => scrollBy(-1)}
        >‹</button>

        <div
          className="mcc-carousel"
          ref={carouselRef}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onPointerDown={onPointerDown}
          role="list"
          tabIndex={0}
        >
          {group.products.map((p) => (
            <article key={p.uuid} className="mcc-card" role="listitem">
              <div className="mcc-image-wrap">
                <img
                  src={p.images?.[0]?.url || "/placeholder.png"}
                  alt={p.title}
                  loading="lazy"
                />
                {/* badges */}
                <div className="mcc-badges">
                  {p.discount && (
                    <span className="badge bg-danger mcc-badge">خصم</span>
                  )}
                  {isNew(p.createdAt) && (
                    <span className="badge bg-success mcc-badge">NEW</span>
                  )}
                </div>
              </div>

              <div className="mcc-body">
                <h6 className="mcc-title">{p.title}</h6>
                <div className="d-flex justify-content-between align-items-end">
                  <div className="mcc-price">
                    {formatPrice(p.price ?? p.original_price)} {p.currency_id}
                    {p.discount && p.original_price && (
                      <small className="text-muted text-decoration-line-through ms-2">
                        {formatPrice(p.original_price)}
                      </small>
                    )}
                  </div>
                  {p.stock_quantity_fy <= 5 && (
                    <small className="text-danger">متبقي {p.stock_quantity_fy}</small>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        <button
          className="mcc-nav mcc-next"
          aria-label="Next"
          onClick={() => scrollBy(1)}
        >›</button>
      </div>
    </div>
  );
}

/* helpers */
function formatPrice(v) {
  if (v == null) return "-";
  return typeof v === "number" ? v.toFixed(2) : v;
}
function isNew(createdAt) {
  if (!createdAt) return false;
  try {
    const created = new Date(createdAt);
    const now = new Date();
    const diffDays = (now - created) / (1000 * 60 * 60 * 24);
    return diffDays <= 7; // new if within 7 days
  } catch {
    return false;
  }
}
