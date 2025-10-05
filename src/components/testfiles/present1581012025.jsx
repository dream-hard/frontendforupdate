import { useMemo, useRef, useState } from "react";

// TopCategoriesSection.jsx

// export default function TopCategoriesSection() {
//     const data = [
//   {
//     "category": { "uuid": "c1a8f6d2-9b1a-4f3a-9a2b-111111111111", "name": "Phones", "slug": "phones" },
//     "products": [
//       {
//         "uuid": "p-11111111-aaaa-4444-bbbb-000000000001",
//         "title": "iPhone 12 Pro",
//         "slug": "iphone-12-pro",
//         "price": 599.99,
//         "original_price": 799.99,
//         "currency_id": "USD",
//         "stock_quantity_fy": 8,
//         "featured": true,
//         "discount": true,
//         "createdAt": "2025-09-20T10:15:00.000Z",
//         "images": [{ "url": "/images/products/iphone12pro.jpg" }]
//       },
//       {
//         "uuid": "p-11111111-aaaa-4444-bbbb-000000000002",
//         "title": "Samsung Galaxy S21",
//         "slug": "samsung-galaxy-s21",
//         "price": 449.00,
//         "original_price": 549.00,
//         "currency_id": "USD",
//         "stock_quantity_fy": 15,
//         "featured": false,
//         "discount": true,
//         "createdAt": "2025-09-10T09:00:00.000Z",
//         "images": [{ "url": "/images/products/galaxy-s21.jpg" }]
//       },
//       {
//         "uuid": "p-11111111-aaaa-4444-bbbb-000000000003",
//         "title": "OnePlus Nord CE",
//         "slug": "oneplus-nord-ce",
//         "price": 199.00,
//         "original_price": 199.00,
//         "currency_id": "USD",
//         "stock_quantity_fy": 3,
//         "featured": false,
//         "discount": false,
//         "createdAt": "2025-09-28T12:00:00.000Z",
//         "images": [{ "url": "/images/products/oneplus-nord-ce.jpg" }]
//       }
//     ]
//   },
//   {
//     "category": { "uuid": "c2b9e7f3-2d2b-4a5c-8b3c-222222222222", "name": "Laptops", "slug": "laptops" },
//     "products": [
//       {
//         "uuid": "p-22222222-bbbb-5555-cccc-000000000004",
//         "title": "MacBook Air M1",
//         "slug": "macbook-air-m1",
//         "price": 899.00,
//         "original_price": 999.00,
//         "currency_id": "USD",
//         "stock_quantity_fy": 6,
//         "featured": true,
//         "discount": true,
//         "createdAt": "2025-08-15T08:30:00.000Z",
//         "images": [{ "url": "/images/products/macbook-air-m1.jpg" }]
//       },
//       {
//         "uuid": "p-22222222-bbbb-5555-cccc-000000000005",
//         "title": "Dell XPS 13",
//         "slug": "dell-xps-13",
//         "price": 1099.00,
//         "original_price": 1199.00,
//         "currency_id": "USD",
//         "stock_quantity_fy": 4,
//         "featured": false,
//         "discount": false,
//         "createdAt": "2025-07-30T11:20:00.000Z",
//         "images": [{ "url": "/images/products/dell-xps13.jpg" }]
//       },
//       {
//         "uuid": "p-22222222-bbbb-5555-cccc-000000000006",
//         "title": "HP Pavilion 15",
//         "slug": "hp-pavilion-15",
//         "price": 549.00,
//         "original_price": 649.00,
//         "currency_id": "USD",
//         "stock_quantity_fy": 10,
//         "featured": false,
//         "discount": true,
//         "createdAt": "2025-09-02T14:00:00.000Z",
//         "images": [{ "url": "/images/products/hp-pavilion-15.jpg" }]
//       }
//     ]
//   },
//   {
//     "category": { "uuid": "c3c0f8a4-3f3c-4d6e-9c4d-333333333333", "name": "Accessories", "slug": "accessories" },
//     "products": [
//       {
//         "uuid": "p-33333333-cccc-6666-dddd-000000000007",
//         "title": "AirPods Pro",
//         "slug": "airpods-pro",
//         "price": 199.00,
//         "original_price": 249.00,
//         "currency_id": "USD",
//         "stock_quantity_fy": 22,
//         "featured": false,
//         "discount": true,
//         "createdAt": "2025-09-25T07:45:00.000Z",
//         "images": [{ "url": "/images/products/airpods-pro.jpg" }]
//       },
//       {
//         "uuid": "p-33333333-cccc-6666-dddd-000000000008",
//         "title": "Anker Power Bank 20K",
//         "slug": "anker-powerbank-20k",
//         "price": 49.99,
//         "original_price": 69.99,
//         "currency_id": "USD",
//         "stock_quantity_fy": 35,
//         "featured": false,
//         "discount": false,
//         "createdAt": "2025-09-05T10:10:00.000Z",
//         "images": [{ "url": "/images/products/anker-20k.jpg" }]
//       },
//       {
//         "uuid": "p-33333333-cccc-6666-dddd-000000000009",
//         "title": "USB-C to Lightning Cable",
//         "slug": "usb-c-lightning-cable",
//         "price": 9.99,
//         "original_price": 12.99,
//         "currency_id": "USD",
//         "stock_quantity_fy": 120,
//         "featured": false,
//         "discount": false,
//         "createdAt": "2025-06-12T09:50:00.000Z",
//         "images": [{ "url": "/images/products/usb-c-lightning.jpg" }]
//       }
//     ]
//   }
// ]

//   return (
//     <div>
//       {data.map(group => (
//         <section key={group.category.uuid} className="mb-4">
//           <div className="d-flex justify-content-between align-items-center mb-2">
//             <h5>{group.category.name}</h5>
//             <a href={`/category/${group.category.slug}`} className="btn btn-link btn-sm">عرض الكل</a>
//           </div>
//           <div className="row g-3">
//             {group.products.map(p => (
//               <div key={p.uuid} className="col-6 col-md-3">
//                 <div className="card">
//                   <img src={p.images?.[0]?.url || '/placeholder.png'} className="card-img-top" alt={p.title} loading="lazy" />
//                   <div className="card-body">
//                     <h6 className="small">{p.title}</h6>
//                     <div className="fw-bold">{p.price || p.original_price} {p.currency_id}</div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </section>
//       ))}
//     </div>
//   );
// }

// src/components/ProductCardSmall.

export  function ProductCardSmall({ p }) {
  return (
    <div className="card h-100" style={{ width: 200 }}>
      <div style={{ height: 120, overflow: "hidden" }}>
        <img
          src={p.images?.[0]?.url || "/placeholder.png"}
          alt={p.title}
          className="card-img-top"
          style={{ objectFit: "cover", width: "100%", height: "120px" }}
          loading="lazy"
        />
      </div>
      <div className="card-body p-2 d-flex flex-column">
        <h6 className="card-title small mb-1" style={{ minHeight: 36 }}>{p.title}</h6>
        <div className="mt-auto d-flex justify-content-between align-items-center">
          <div className="fw-bold small">{p.price ?? p.original_price} {p.currency_id}</div>
          {p.stock_quantity_fy <= 5 && <small className="text-danger">متبقي {p.stock_quantity_fy}</small>}
        </div>
      </div>
    </div>
  );
}

// src/components/TopCategoriesHorizontal.jsx

/**
 * props:
 *  - data: array like sampleTopCategories
 *  - initialSelected: array of category.slug to show initially (optional)
 */
 export function TopCategoriesHorizontal({  initialSelected =['phones','accessories'] }) {
    const data =  [
  {
    category: { uuid: "c1", name: "Phones", slug: "phones" },
    products: [
      { uuid: "p1", title: "iPhone 12 Pro", slug: "iphone-12-pro", price: 599.99, original_price: 799.99, currency_id: "USD", stock_quantity_fy: 8, images: [{ url: "/images/products/iphone12pro.jpg" }] },
      { uuid: "p2", title: "Samsung Galaxy S21", slug: "samsung-galaxy-s21", price: 449.0, original_price: 549.0, currency_id: "USD", stock_quantity_fy: 15, images: [{ url: "/images/products/galaxy-s21.jpg" }] },
      { uuid: "p3", title: "OnePlus Nord CE", slug: "oneplus-nord-ce", price: 199.0, original_price: 199.0, currency_id: "USD", stock_quantity_fy: 3, images: [{ url: "/images/products/oneplus-nord-ce.jpg" }] },
      { uuid: "p4", title: "Xiaomi Redmi Note 11", slug: "redmi-note-11", price: 149.99, original_price: 179.99, currency_id: "USD", stock_quantity_fy: 30, images: [{ url: "/images/products/redmi11.jpg" }] }
    ]
  },
  {
    category: { uuid: "c2", name: "Laptops", slug: "laptops" },
    products: [
      { uuid: "p5", title: "MacBook Air M1", slug: "macbook-air-m1", price: 899.0, original_price: 999.0, currency_id: "USD", stock_quantity_fy: 6, images: [{ url: "/images/products/macbook-air-m1.jpg" }] },
      { uuid: "p6", title: "Dell XPS 13", slug: "dell-xps-13", price: 1099.0, original_price: 1199.0, currency_id: "USD", stock_quantity_fy: 4, images: [{ url: "/images/products/dell-xps13.jpg" }] },
      { uuid: "p7", title: "HP Pavilion 15", slug: "hp-pavilion-15", price: 549.0, original_price: 649.0, currency_id: "USD", stock_quantity_fy: 10, images: [{ url: "/images/products/hp-pavilion-15.jpg" }] }
    ]
  },
  {
    category: { uuid: "c3", name: "Accessories", slug: "accessories" },
    products: [
      { uuid: "p8", title: "AirPods Pro", slug: "airpods-pro", price: 199.0, original_price: 249.0, currency_id: "USD", stock_quantity_fy: 22, images: [{ url: "/images/products/airpods-pro.jpg" }] },
      { uuid: "p9", title: "Anker Power Bank 20K", slug: "anker-powerbank-20k", price: 49.99, original_price: 69.99, currency_id: "USD", stock_quantity_fy: 35, images: [{ url: "/images/products/anker-20k.jpg" }] },
      { uuid: "p10", title: "USB-C Cable", slug: "usb-c-lightning-cable", price: 9.99, original_price: 12.99, currency_id: "USD", stock_quantity_fy: 120, images: [{ url: "/images/products/usb-c-lightning.jpg" }] }
    ]
  }
];
  const [selected, setSelected] = useState(() => {
    if (initialSelected && initialSelected.length) return initialSelected;
    // default: show all categories
    return data.map(d => d.category.slug);
  });

  // helper to toggle category selection
  function toggleCategory(slug) {
    setSelected(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]);
  }

  // refs for each category scroll container
  const scrollRefs = useRef({});

  function scrollBy(slug, delta = 300) {
    const el = scrollRefs.current[slug];
    if (!el) return;
    el.scrollBy({ left: delta, behavior: "smooth" });
  }

  const categories = useMemo(() => data.map(d => d.category), [data]);

  return (
    <div dir="rtl">
      {/* Category picker chips */}
      <div className="mb-3 d-flex flex-wrap gap-2">
        {categories.map(cat => {
          const active = selected.includes(cat.slug);
          return (
            <button
              key={cat.slug}
              type="button"
              onClick={() => toggleCategory(cat.slug)}
              className={`btn btn-sm ${active ? "btn-primary" : "btn-outline-secondary"}`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Render a horizontal carousel per selected category */}
      {data.filter(g => selected.includes(g.category.slug)).map(group => (
        <section key={group.category.uuid} className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="mb-0">{group.category.name}</h5>
            <a href={`/category/${group.category.slug}`} className="btn btn-link btn-sm">عرض الكل</a>
          </div>

          <div className="position-relative">
            {/* Prev button */}
            <button
              className="btn btn-sm btn-light position-absolute top-50 start-0 translate-middle-y"
              style={{ zIndex: 5 }}
              onClick={() => scrollBy(group.category.slug, -300)}
              aria-label="scroll left"
            >
              ‹
            </button>

            {/* Scroll container */}
            <div
              ref={el => (scrollRefs.current[group.category.slug] = el)}
              className="d-flex gap-3 overflow-auto py-2 px-4"
              style={{ scrollBehavior: "smooth" }}
            >
              {group.products.map(p => (
                <div key={p.uuid} className="flex-shrink-0">
                  <ProductCardSmall p={p} />
                </div>
              ))}
            </div>

            {/* Next button */}
            <button
              className="btn btn-sm btn-light position-absolute top-50 end-0 translate-middle-y"
              style={{ zIndex: 5 }}
              onClick={() => scrollBy(group.category.slug, 300)}
              aria-label="scroll right"
            >
              ›
            </button>
          </div>
        </section>
      ))}
    </div>
  );
}
