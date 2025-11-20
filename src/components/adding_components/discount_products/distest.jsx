// MultiJsonAdmin.Merged.jsx
import React, { useEffect, useState, useMemo } from "react";
import axios from "../../../api/fetch";
import useNotification from "../../../Hooks/useNotification";
import SearchableSelect from "../../supplier/searchselectforediting";

const fileNames = [
  "NewProducts",
  "LatestProducts",
  "DiscountProducts",
  "UpcomingProducts",
  "BestCategoriesProducts",
  "MyPickUp"
];

export default function MultiJsonAdminMerged() {
  const { showNotification } = useNotification();

  const [selectedFile, setSelectedFile] = useState(fileNames[0]);
  const [jsonData, setJsonData] = useState(null); // current JSON from backend
  const [loading, setLoading] = useState(false);

  const [searchword,setSearchword]=useState("");
  const [searchloading,setSearchloading]=useState(false);
  const [searchresult,setSearchreslut]=useState([]);
  const [added,setAdded]=useState([]);


  const fetchsearch= async()=>{
    if(searchword ==="" ||!searchword)return;
    try {
        setSearchloading(true);
        const body={page:1,limit:10000,title:searchword}
        const res=await axios.post('/product/filterproducts',body);
        const data =res?.data?.products;
        setSearchreslut(data || []);
        
    } catch (error) {
        setSearchreslut([]);
    }finally{
        setSearchloading(false);
    }
  }
  const [selectedcategory,setSelectedcategory]=useState({});
  const handelselectecategory= (cat)=>{
    console.log(cat)
    setSelectedcategory(cat);
    return
}
  const handelremoveselectecategory=()=>{
    setSelectedcategory({});
    return
  }

  const [fileitems,setFileitems]=useState([]);
  const [fileitemsloading,setFileitemsloading]=useState(false);

  // staging adds/removes
  const [adds, setAdds] = useState({});
  const [removes, setRemoves] = useState({});

  // add/remove form
  const [addSlug, setAddSlug] = useState("");
  const [addUuid, setAddUuid] = useState("");
  const [addCategory, setAddCategory] = useState("");

  const [removeSlug, setRemoveSlug] = useState("");
  const [removeCategory, setRemoveCategory] = useState("");

  const [detectedType, setDetectedType] = useState("flat"); // flat | categories

  // ---------- Load JSON ----------
  const fetchJson = async () => {
    if (!selectedFile) return showNotification("error", "Select a file");
    setLoading(true);
    setJsonData(null);
    setAdds({});
    setRemoves({});
    try {
      const res = await axios.get(`/json/${selectedFile}`);
      const data = res.data?.data ?? res.data;
      setJsonData(data);
      setDetectedType(detectTypeFromData(data));
      showNotification("success", `Loaded ${selectedFile}`);
    } catch (err) {
      console.error(err);
      showNotification("error", err?.response?.data?.error || err?.message || "Failed to load JSON");
    } finally {
      setLoading(false);
    }
  };

  

  const fetchfileitems=async ()=>{
    if(!selectedFile) return;
    try {
        setFileitemsloading(true);
        const res = await axios.get(`/json/fetch/${selectedFile}`);
        if(res?.data?.data){
            
            if(Array.isArray(res.data.data.products)){
                setFileitems(res.data.data.products);
            }else{
                setFileitems(Object.values(res.data.data));
            }
        }else { setFileitems([]); }
        
    } catch (error) {
        setFileitems([]);
    }finally{
        setFileitemsloading(false)
    }
  }

  useEffect(()=>{
    setRemoves({});
    setAdds({});
    
    handelremoveselectecategory();
    setSearchloading(false);
    setSearchreslut([]);
    setSearchword('');
    fetchJson();
    fetchfileitems();
    return
  },[selectedFile])

  // ---------- Detect type ----------
  const detectTypeFromData = (data) => {
    if (!data || typeof data !== "object") return "flat";
    const vals = Object.values(data);
    if (vals.length === 0) return "flat";
    const allArrays = vals.every((v) => Array.isArray(v));
    return allArrays ? "categories" : "flat";
  };

  // ---------- Stage Add ----------
  const stageAdd = (category,uuid,slug) => {
    if ((!addSlug || !addUuid) &&(!uuid||!slug)) return showNotification("error", "slug and uuid required");
    setAdds((prev) => {
      const copy = JSON.parse(JSON.stringify(prev || {}));
      if (detectedType === "flat") {
        copy[slug||addSlug] = uuid ?? addUuid;
      } else {
        const cat = category||addCategory || "default";
        copy[cat] = copy[cat] || [];
        const obj = {};
        obj[slug||addSlug] = uuid||addUuid;
        if (!copy[cat].some((i) => Object.keys(i)[0] === slug||addSlug)) copy[cat].push(obj);
      }
      return copy;
    });
    setAddSlug("");
    setAddUuid("");
  };

  // ---------- Stage Remove ----------
  const stageRemove = (categroy,slug) => {
    if (!removeSlug && !( slug)) return showNotification("error", "slug required");
    setRemoves((prev) => {
      const copy = JSON.parse(JSON.stringify(prev || {}));
      if (detectedType === "flat") {
        copy[slug ||removeSlug] = true;
      } else {
        const cat =  categroy;
        copy[cat] = copy[cat] || [];
        const obj = {};
        obj[ slug] = true;
        if (!copy[cat].some((i) => Object.keys(i)[0] === slug)) copy[cat].push(obj);
      }
      return copy;
    });
    setRemoveSlug("");
    setRemoveCategory("");
  };

  // ---------- Commit ----------
  const commitAdds = async () => {
    if (!selectedFile) return showNotification("error", "file required");
    if (!Object.keys(adds || {}).length) return showNotification("info", "no adds staged");
    try {
      await axios.put(`/json/modify/Adding/${selectedFile}`, { items: adds });
      showNotification("success", "Adds committed");
      setAdded([]);
      setSearchword('');
      setSearchreslut([]);
      setAdds({});
      fetchJson();
      fetchfileitems();
      
    } catch (err) {
      console.error(err);
      showNotification("error", err?.response?.data?.error || err?.message || "Add commit failed");
    }
  };

  const commitRemoves = async () => {
    if (!selectedFile) return showNotification("error", "file required");
    if (!Object.keys(removes || {}).length) return showNotification("info", "no removes staged");
    try {
      await axios.put(`/json/modify/Removing/${selectedFile}`, { items: removes });
      showNotification("success", "Removes committed");
      setRemoves({});
      fetchJson();
      fetchfileitems();
    } catch (err) {
      showNotification("error", err?.response?.data?.error || err?.message || "Remove commit failed");
    }
  };
  const commitremoveCategory=async(category)=>{
    if(!category) return  showNotification("error", "categroy slug required");
    try {
        await axios.put(`/json/modify/Removing/${selectedFile}`, { reqcategory: category });
      showNotification("success", "Removes Category committed");
      setRemoves({});
      fetchJson();
      fetchfileitems();
    } catch (error) {
              showNotification("error", error?.response?.data?.error || error?.message || "Remove Category commit failed")
    }
  }
  // ---------- Preview ----------
  const preview = useMemo(() => {
    if (!jsonData) return {};
    try {
      const base = JSON.parse(JSON.stringify(jsonData));
      if (detectedType === "flat") {
        const map = { ...base };
        Object.keys(removes || {}).forEach((r) => delete map[r]);
        Object.entries(adds || {}).forEach(([k, v]) => { map[k] = v; });
        return map;
      } else {
        const clone = { ...base };
        // remove
        for (const [cat, arr] of Object.entries(removes || {})) {
          if (!Array.isArray(arr) || !clone[cat]) continue;
          const toRemove = new Set(arr.map((i) => Object.keys(i)[0]));
          clone[cat] = clone[cat].filter((i) => !toRemove.has(Object.keys(i)[0]));
        }
        // add
        for (const [cat, arr] of Object.entries(adds || {})) {
          clone[cat] = clone[cat] || [];
          arr.forEach((obj) => {
            const slug = Object.keys(obj)[0];
            if (!clone[cat].some((i) => Object.keys(i)[0] === slug)) clone[cat].push(obj);
          });
        }
        return clone;
      }
    } catch (e) {
      return {};
    }
  }, [jsonData, adds, removes, detectedType]);

  return (
    <div className="container-fluid py-4">
      <div className="row">

        <div className="col-md-2">
          <div className="card p-2 mb-3">
            <h6>Files</h6>
            <div className="list-group">
              {fileNames.map((f) => (
                <button
                  key={f}
                  className={`list-group-item list-group-item-action ${selectedFile === f ? "active" : ""}`}
                  onClick={() => setSelectedFile(f)}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="mt-2 d-grid gap-2">
              <button className="btn btn-sm btn-outline-secondary" onClick={()=>{fetchJson();fetchfileitems()}}>إعادة تحميل </button>
              <button className="btn btn-sm btn-outline-primary" onClick={() => { setAdds({}); setRemoves({}); showNotification("info", "Staging cleared"); }}>Clear Staging</button>
            </div>
          </div>

          <div className="card p-2">
            <h6>Staging</h6>
            <small className="text-muted">Adds</small>
            <pre className="bg-light p-2" style={{ maxHeight: 140, overflow: "auto" }}>{JSON.stringify(adds, null, 2)}</pre>
            <small className="text-muted">Removes</small>
            <pre className="bg-light p-2" style={{ maxHeight: 140, overflow: "auto" }}>{JSON.stringify(removes, null, 2)}</pre>
            <div className="d-flex gap-2 mt-2">
              <button className="btn btn-success btn-sm" onClick={commitAdds} disabled={!Object.keys(adds || {}).length}>Commit Adds</button>
              <button className="btn btn-danger btn-sm" onClick={commitRemoves} disabled={!Object.keys(removes || {}).length}>Commit Removes</button>
            </div>
          </div>
        </div>

        <div className="col-md-10">
        {!fileitemsloading? (
          <div className=" card p-3 mt-1 mb-3">
              {detectedType==='categories'? (
                <>
                <div className="row">
                    <div className="col-md-3 ">
                        <div className=" rounded m-1  p-3">
                            {fileitems.map((item) => (
                            <div className="my-1" key={item.category.slug}>
                                <div
                                className={`d-flex justify-content-evenly align-items-center border p-3 text-center shadow-sm rounded-3 ${
                                    selectedcategory?.category?.slug=== item.category.slug ? "bg-primary text-white" : ""
                                }`}
                                style={{ cursor: "pointer" }}
                                onClick={() => handelselectecategory(item)}
                                >
                                <h6 className="m-0  ">{item.category.slug ||item.category.name }</h6>
                                <button onClick={()=>commitremoveCategory(item.category.slug)} className="btn btn-sm btn-danger">حذف</button>
                                </div>
                            </div>
                                    ))}
                        </div>
                    </div>
                    <div className="col-md-9 pt-4">
                        {selectedcategory.products ? (
                            selectedcategory?.products?.length > 0 ? (
                            <div className="row g-3">
  {selectedcategory.products.map((product, index) => (
    <div key={index} className="col-12 col-sm-6 col-md-4 col-lg-3">
      <div
        className="card h-100 shadow rounded-4 overflow-hidden"
        style={{ cursor: "pointer", transition: "transform 0.2s" }}
        onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.03)")}
        onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
      >
        {/* صورة المنتج إذا موجودة */}
        {product.image && (
          <img
            src={product.image}
            alt={product.name}
            className="card-img-top"
            style={{ height: "120px", objectFit: "cover" }}
          />
        )}

        <div className="card-body d-flex flex-column">
          <h6 className="fs-5 fw-bold">{product.title}</h6>
          <p className="text-muted flex-grow-1">{product.description}</p>
          <button className="btn btn-primary mt-3" onClick={()=>{stageRemove(selectedcategory.category.slug,product.slug)}}>حذف</button>
        </div>
      </div>
    </div>
  ))}

                            </div>
                        ) : (
                            <div className="text-center border rounded shadow  py-5 position-relative">

                            <button
                                className="btn-close position-absolute top-0 end-0 m-3"
                                onClick={() => setSelectedcategory({})}
                                style={{ cursor: "pointer" }}
                                aria-label="Close"
                            ></button>

                            <i className="bi bi-box-seam fs-1 text-secondary"></i>
                            <h4 className="mt-3">لا يوجد منتجات بعد</h4>
                            <p className="text-muted">
                                لم تتم إضافة أي منتجات في هذا القسم حتى الآن.
                            </p>
                            </div>

                        )
                    ) : (
                            <div className="text-center py-5">
                            <i className="bi bi-hand-index fs-1 text-info"></i>
                            <h4 className="mt-3">اختر قسمًا لعرض المنتجات</h4>
                            </div>
                    )}
                    </div>

                </div>
                </>
              ):(
                <>
                                 {fileitems?.length > 0 ? (
                            <div className="row g-3">
  {fileitems.map((product, index) => (
    <div key={index} className="col-12 col-sm-6 col-md-4 col-lg-3">
      <div
        className="card h-100 shadow rounded-4 overflow-hidden"
        style={{  transition: "transform 0.2s" }}
        onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.03)")}
        onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
      >
        {product.Product_images && (
          <img
            src={product?.Product_images[0]?.filename}
            alt={product.title}
            className="card-img-top"
            style={{ height: "120px", objectFit: "cover" }}
          />
        )}

        <div className="card-body d-flex flex-column">
          <h6 className="fs-5 fw-bold">{product.title}</h6>
          <p className="text-muted flex-grow-1">{product.description}</p>
          <button className="btn btn-primary mt-3" onClick={()=>{stageRemove("", product?.slug)}}>حذف</button>
        </div>
      </div>
    </div>
  ))}

                            </div>
                        ) : (
                            <div className="text-center border rounded shadow  py-5 position-relative">

                  

                            <i className="bi bi-box-seam fs-1 text-secondary"></i>
                            <h4 className="mt-3">لا يوجد منتجات بعد</h4>
                            <p className="text-muted">
                                لم تتم إضافة أي منتجات في هذا القسم حتى الآن.
                            </p>
                            </div>

                        )}
                
                </>
              )}

          </div>):<></>}
          {detectedType==="flat" ?(
          <div className=" container border rounded shadow p-3 mb-3">
            <h5 className="">إضافة منتجات</h5>
            <div className=" rounded my-2 p-2 row g-3">
              {added?.length>0 ? (<>{added.map((item)=>(<div className="col-12 col-sm-6 col-lg-4"><div className="card shadow-sm p-3"><h6 className="fs-5">{item.title}</h6><p className="text-muted">{item.description}</p></div></div>))}</>):(<></>)}

            </div>
<div className="p-2 row">
  <div className="col-md-4">
    <div className="input-group">
      <input value={searchword} onChange={e=>setSearchword(e.target.value)} type="text" className="form-control" placeholder="..." />
      <button onClick={fetchsearch} className="btn btn-primary">بحث</button>
    </div>
  </div>

  <div className="col-md-6">
    <SearchableSelect
      options={searchresult}
      value={searchword}
      onChange={(val) => {const item=searchresult.find(x=>x.uuid===val); stageAdd("",item.uuid,item.slug); setAdded((prev)=>prev.some(x=>x.uuid===item.uuid)?prev:[...prev,{...item}]) }}
      placeholder="اختر منتجاً"
      valueField="uuid"
      displayField="title"
    />
  </div>
</div>


          </div>
          ):(
                 <div className=" container border rounded shadow p-3 mb-3">
            <h5 className="">إضافة منتجات</h5>
            <div className=" rounded my-2 p-2 row g-3">
              {added?.length>0 ? (<>{added.map((item)=>(<div className="col-12 col-sm-6 col-lg-4"><div className="card shadow-sm p-3"><h6 className="fs-5">{item.title}</h6><p className="text-muted">{item.description}</p></div></div>))}</>):(<></>)}

            </div>
<div className="p-2 row">
  <div className="col-md-4">
    <div className="input-group">
      <input value={searchword} onChange={e=>setSearchword(e.target.value)} type="text" className="form-control" placeholder="..." />
      <button onClick={fetchsearch} className="btn btn-primary">بحث</button>
    </div>
  </div>

  <div className="col-md-6">
    <SearchableSelect
      options={searchresult}
      value={searchword}
      onChange={(val) => {const item=searchresult.find(x=>x.uuid===val); stageAdd(item?.Category?.slug,item.uuid,item.slug); setAdded((prev)=>prev.some(x=>x.uuid===item.uuid)?prev:[...prev,{...item}]) }}
      placeholder="اختر منتجاً"
      valueField="uuid"
      displayField="title"
    />
  </div>
</div>

        </div>  )}
          <div className="card p-3 mb-3">
            <h5>Add Item</h5>
            <div className="row g-2 align-items-end">
              {detectedType === "categories" && (
                <div className="col-auto">
                  <label className="form-label">Category slug</label>
                  <input className="form-control" value={addCategory} onChange={(e) => setAddCategory(e.target.value)} placeholder="category-slug" />
                </div>
              )}
              <div className="col-auto">
                <label className="form-label">Slug</label>
                <input className="form-control" value={addSlug} onChange={(e) => setAddSlug(e.target.value)} />
              </div>
              <div className="col-auto">
                <label className="form-label">UUID</label>
                <input className="form-control" value={addUuid} onChange={(e) => setAddUuid(e.target.value)} />
              </div>
              <div className="col-auto">
                <button className="btn btn-success" onClick={stageAdd}>Stage Add</button>
              </div>
            </div>
          </div>

          {/* Remove form */}
          <div className="card p-3 mb-3">
            <h5>Remove Item</h5>
            <div className="row g-2 align-items-end">
              {detectedType === "categories" && (
                <div className="col-auto">
                  <label className="form-label">Category slug</label>
                  <input className="form-control" value={removeCategory} onChange={(e) => setRemoveCategory(e.target.value)} />
                </div>
              )}
              <div className="col-auto">
                <label className="form-label">Slug</label>
                <input className="form-control" value={removeSlug} onChange={(e) => setRemoveSlug(e.target.value)} />
              </div>
              <div className="col-auto">
                <button className="btn btn-danger" onClick={stageRemove}>Stage Remove</button>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="card p-3 mb-3">
            <h6>Preview (client-side)</h6>
            <div className=" p-3 mb-3">
                {loading && <div>Loading...</div>}
                {jsonData && (
                <pre className="bg-dark text-white p-3 rounded" style={{ maxHeight: 300, overflow: "auto" }}>{JSON.stringify(jsonData, null, 2)}</pre>
                )}
                {!jsonData && !loading && <div className="text-muted">No file loaded yet.</div>}
            </div>         
          </div>
        </div>
      </div>
    </div>
  );
}
