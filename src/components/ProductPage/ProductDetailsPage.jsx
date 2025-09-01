import React, { useEffect, useState } from "react";
import ProductImageGallery from "./image";
import { Link, useNavigate, useParams } from "react-router-dom";
import './productpage.css'
import useAuth from "../../Hooks/useAuth";
import axios from "../../api/fetch";

const exampleProduct = {
  uuid: "123e4567-e89b-12d3-a456-426614174000",
  title: "K8 Wireless Microphone Type-C",
  slug: "k8-wireless-microphone-type-c",
  price: 29.99,
  original_price: 39.99,
  description: "ميكروفون لاسلكي عالي الجودة متوافق مع أجهزة Type-C. مثالي لتسجيل الصوت، والبث المباشر، ومكالمات الفيديو. يتميز بصوت نقي وواضح مع قدرة على تقليل الضوضاء المحيطة، مما يجعله الخيار الأمثل للمحترفين والهواة على حد سواء. تصميمه المريح وخفة وزنه يتيحان سهولة الاستخدام في مختلف الظروف والأماكن.",
//   description:
//     "High-quality wireless microphone compatible with Type-C devices. Ideal for recording, live streaming, and video calls.",
  metadata: {
    brand: "K8",
    model: "K8-TYPEC",
    connection: "Wireless",
    connector: "Type-C",
    battery_life: "8 hours",
    range: "20 meters",
    color: "Black",
    compatiblae_devices: "Android Phones, Tablets, Laptops",
    compatible_devicfes: "Android Phones, Tablets, Laptops",
    compatible_edevices: "Android Phones, Tablets, Laptops",
    compatible_deviceds: "Android Phones, Tablets, Laptops",
    compatible_devifces: "Android Phones, Tablets, Laptops",
    compatible_devidces: "Android Phones, Tablets, Laptops",
    compatibcle_devices: "Android Phones, Tablets, Ladsf asdf asd asdf asdf asf  dasfndsaf asdf adsf dsaflads flkadsjf ;ljasd;lfj lasd;lfasd flkasd ;faptops",
    compatiable_devsices: "Android Phones, Tablets, Laptops",
    compatiblae_devices: "Android Phones, Tablets, Laptops",

  },
  images: [
    { filename: "https://placehold.co/600x400?text=Main+Image", image_type: "main" },
    { filename: "https://placehold.co/600x400?text=Side+View", image_type: "gallery" },
    { filename: "https://placehold.co/600x400?text=box", image_type: "gallery" },
        { filename: "https://placehold.co/150x150?text=box", image_type: "gallery" },

  ],
  reviews: [
  {
    user: "Ali",
    comment: "الميكروفون فعلاً فاجأني بجودته. أول ما استلمته، جربته على اللابتوب وعلى الهاتف، والصوت كان نقي جدًا. حتى لما سجلت في مكان فيه ضوضاء، قدر يعزل الخلفية بشكل ممتاز. حقيقي منتج ممتاز بالنسبة للسعر.",
    rating: 5
  },
  {
    user: "Maya",
    comment: "بصراحة، بعد أسبوع من الاستخدام، لاحظت فرق كبير في جودة التسجيل مقارنة بالميكروفون السابق اللي كنت أستخدمه. كنت مترددة أطلبه، بس الحمدلله طلع أفضل من التوقعات.",
    rating: 4
  },
  {
    user: "John",
    comment: "المنتج جيد لكن عندي بعض الملاحظات. الكيبل شوي قصير بالنسبة لي، وكان يفضل يكون أطول شوي. غير كذا، كل شيء تمام، التوصيل سريع والتغليف محترم.",
    rating: 3
  },
  {
    user: "Layla",
    comment: "واو! استخدمته للبودكاست، والصوت طالع احترافي كأنك في ستوديو. فعلاً يستاهل كل ريال. حتى أصدقائي لاحظوا فرق الجودة لما سمعوا التسجيل.",
    rating: 5
  },
  {
    user: "Sam",
    comment: "الجودة مقبولة نوعًا ما، لكنها مش الأفضل. في مرات يكون فيه طقطقة خفيفة بالصوت، خصوصًا إذا قربته كثير من الفم. بس مقابل السعر، يفي بالغرض.",
    rating: 3
  },
  {
    user: "Yasmine",
    comment: "الميكروفون رائع جدًا، شريته علشان أسجل فيديوهات تعليمية على اليوتيوب، وما خيّب أملي. التسجيل واضح، وسهل الاستخدام. أنصح فيه لأي شخص يبحث عن جودة ممتازة بسعر مناسب.",
    rating: 5
  },
  {
    user: "Mark",
    comment: "استخدمته للبث المباشر على التويتش، وكانت التجربة فوق الممتازة. المتابعين علقوا على تحسن الصوت، وهذا أكبر دليل إنه فعلاً أداة احترافية. تصميمه أنيق وخفيف الوزن كمان.",
    rating: 4
  },
  {
    user: "Rami",
    comment: "الميكروفون يشتغل تمام، لكن لاحظت إنه يحتاج ضبط دقيق في الإعدادات علشان يعطي أفضل أداء. لو أنت مبتدئ، ممكن تتعب شوي بالبداية. لكنه ممتاز لمن يعرف يتعامل معه.",
    rating: 4
  }
]

 
};

export default function ProductDetailsPage() {
    const { slug } = useParams();   
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [newReview, setNewReview] = useState({
        rating: 5,
        comment: "",
    });
    const navigate = useNavigate();
    const{auth}=useAuth();

const increaseQty = () => {
  setQuantity((prev) => prev + 1);
};
const decreaseQty = () => {
  if (quantity > 1) setQuantity((prev) => prev - 1);
};
const handleAddToCart = () => {
  // Send product + quantity to your cart context or API
  console.log("Added to cart:", product.uuid, "Quantity:", quantity);
};
const handelquantitychange=(e)=>{
    setQuantity((e.target.value>0?e.target.value:1))
}

const handleBuyNow =async () => {
  // أضف المنتج إلى السلة
   await handleAddToCart();
  setTimeout(() => {
    navigate("/cart"); 
  }, 300); 
};


  const handleChangereveiw = (e) => {
    const { name, value } = e.target;
    setNewReview((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  async function fetchProductBySlug(slug) {
  try {
    const res = await axios.post('/product/justgettheproudctbyslug',{slug});
    let metadata = null;
    try {
      metadata = res.data.product.metadata ? JSON.parse(res.data.product.metadata) : null;
    } catch (e) {
      metadata = null; // لو صار خطأ بالتحويل
    }
     res.data.product.metadata=metadata;
    return res.data.product;   
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
}
useEffect(() => {
  async function loadProduct() {
    const data = await fetchProductBySlug(slug);
    setProduct(data);
  }
  loadProduct();
}, [slug]);

  if (!product) return <div>Loading...</div>;

  return (
    <div className="container mt-4">
      <div className="row" style={{justifyContent:"start",alignItems:"start",alignContent:"start"}}>
        {/* Main Image and Gallery */}

<ProductImageGallery images={product.Product_images} />
        {/* Product Info */}
      
        <div className="col-md-6">
  <h2 className="fw-bold mb-2">{product.title}</h2>

<p className="text-muted mb-3">
  SKU: {product?.uuid ? product.uuid.slice(0,18) : "N/A"}
</p>
  {(product.discount)?
   (<>
  <div className="mb-4">
    <h4 className="text-success d-inline me-3">
      ${product.price}
    </h4>
    {product.original_price && (
      <span className="text-danger text-decoration-line-through fs-6">
        ${product.original_price}
      </span>
    )}
  </div>

   </>)
  :(<>
  <div className="mb-4">
    <h4 className="text-muted d-inline me-3">
      ${product.price}
    </h4>
  </div>
  </>)}
  
  <p className="mb-4">{product.description}</p>

  <div className="d-flex flex-wrap align-items-center gap-3 mt-4">

  {/* Counter with rounded design */}
  
<div
  className="d-flex align-items-center rounded-pill px-2"
  style={{
    height: "45px",
    maxWidth: "fit-content",
    backgroundColor: "#f0f2f5",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
  }}
>
  <button
    onClick={decreaseQty}
    className="btn d-flex justify-content-center align-items-center rounded-circle"
    style={{
      width: "38px",
      height: "38px",
      border: "none",
      backgroundColor: "white",
      boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
      fontSize: "1.5rem",
      color: "#555",
      cursor: "pointer",
      transition: "background-color 0.3s, color 0.3s",
      userSelect: "none",
    }}
    onMouseEnter={e => {
      e.currentTarget.style.backgroundColor = "#2070d2";
      e.currentTarget.style.color = "white";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.backgroundColor = "white";
      e.currentTarget.style.color = "#555";
    }}
  >
    −
  </button>

  <input
    dir="ltr"
    type="text"
    onChange={handelquantitychange}
    value={quantity}
    min={1}
    className="text-center mx-3"
    style={{
      width: "50px",
      fontWeight: "600",
      fontSize: "1.25rem",
      border: "none",
      backgroundColor: "transparent",
      userSelect: "none",
    }}
  />

  <button
    onClick={increaseQty}
    className="btn d-flex justify-content-center align-items-center rounded-circle"
    style={{
      width: "38px",
      height: "38px",
      border: "none",
      backgroundColor: "white",
      boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
      fontSize: "1.5rem",
      color: "#555",
      cursor: "pointer",
      transition: "background-color 0.3s, color 0.3s",
      userSelect: "none",
    }}
    onMouseEnter={e => {
      e.currentTarget.style.backgroundColor = "#2070d2";
      e.currentTarget.style.color = "white";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.backgroundColor = "white";
      e.currentTarget.style.color = "#555";
    }}
  >
    +
  </button>
</div>



  {/* Modern Add to Cart Button */}
<div className="d-flex flex-wrap gap-2 ">
  {/* زر Add to Cart */}
  <button
    className=" ms-auto  btn custom-btn-cart flex-grow-1 flex-md-grow-0"
    onClick={handleAddToCart}
  >
    <i className="bi bi-cart-plus-fill fs-5 me-2"></i>
    Add to Cart
  </button>

  {/* زر Buy Now */}
  <button
    className=" btn custom-btn-buy flex-grow-1 flex-md-grow-0"
    onClick={handleBuyNow}
  >
    <i className="bi bi-bag-check-fill fs-5 me-2"></i>
    Buy Now
  </button>
</div>


</div>

</div>

      </div>


      <div className="mt-5 p-0 p-sm-4">
 

<h4 className="mb-3">الوصف</h4>
<div className="mb-4 border rounded shadow-sm overflow-hidden p-3 ">
<div className="">
      <p className="">{product.description}</p>
</div>
</div>
{(product.metadata && Object.keys(product.metadata).length >0 )&&
   ( <><h4 className="mb-3">المواصفات</h4>
    <div className="table-responsive">
        <div className="border rounded shadow-sm overflow-hidden p-3">
        <table className="table   align-middle m-0">
            <tbody>
            {Object.entries(product.metadata).map(([key, value]) => (
                <tr key={key}>
                <th className="text-capitalize bg-light text-secondary" style={{ width: "35%" }}>
                    {key.replace(/_/g, " ")}
                </th>
                <td className="bg-light">{value}</td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>
    </div></>)
    }





      </div>

      {/* Reviews */}
      {/* <div className="mt-5">
        <h5>Reviews</h5>
        {product.reviews.map((review, index) => (
          <div key={index} className="border p-2 mb-2">
            <strong>{review.user}</strong>{" "}
            <span className="text-warning">{"★".repeat(review.rating)}</span>
            <p className="mb-0">{review.comment}</p>
          </div>
        ))}
      </div> */}
        <div className="mt-5">
        <h5 className="mb-3">التقييمات</h5>
        {(product.reviews && product.reviews.length > 0) ?
            (<>
                {product.reviews.map((review, index) => (
                    <div
                    key={index}
                    className="d-flex gap-3 align-items-start border rounded shadow-sm p-3 mb-3 bg-white"
                    >
                    {/* Avatar or Initials */}
                    <div className="bg-primary text-white rounded-circle d-flex justify-content-center align-items-center" style={{ minWidth: 45, minHeight: 45 }}>
                        {review.user?.charAt(0).toUpperCase()}
                    </div>

                    {/* Review Content */}
                    <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-center">
                        <strong>{review.user}</strong>
                        <span className="text-warning small fs-5">
                            {"★".repeat(review.rating)}{" "}
                            {"☆".repeat(5 - review.rating)}
                        </span>
                        </div>
                        <p className="mb-0 text-muted">{review.comment}</p>
                    </div>
                    </div>
                ))}
            </>)
            :(<>
                <div className="d-flex align-items-center justify-content-center flex-column text-center border rounded py-4 px-3 shadow-sm bg-light-subtle mt-4">
                    <i className="bi bi-chat-left-text fs-1 text-secondary mb-3"></i>
                    <h6 className="text-muted">لا توجد مراجعات بعد</h6>
                    <p className="text-secondary small mb-0">كن أول من يشارك رأيه حول هذا المنتج!</p>
                </div>
            </>)
        }
        </div>

       {/* Add New Review */}
    {auth ? (<>
    
      <form className="mt-4" >
        <h6>Add a Review</h6>
        <div className="mb-2">
          <select
            name="rating"
            className="form-select"
            onChange={handleChangereveiw}
            value={newReview.rating}
          >
            <option value="5">★★★★★ - ممتاز جداً</option>
            <option value="4">★★★★☆ - جيد</option>
            <option value="3">★★★☆☆ - متوسط</option>
            <option value="2">★★☆☆☆ - ضعيف</option>
            <option value="1">★☆☆☆☆ - سيئ جداً</option>
          </select>
        </div>

        <div className="mb-2">
          <textarea
            name="comment"
            className="form-control"
            rows="3"
            placeholder="Your comment..."
            onChange={handleChangereveiw}
            value={newReview.comment}
          ></textarea>
        </div>

        <button className="btn btn-primary" type="submit">
          Submit Review
        </button>
      </form>
    
    </>):(<>
 <div className="alert alert-warning mt-3" role="alert">
  يجب عليك <Link to="/log" className="alert-link">تسجيل الدخول</Link> لترك تعليق.
</div>

    
    </>)}
    </div>
  );
}
