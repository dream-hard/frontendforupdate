// React component for managing multi-JSON operations (Option C: items are { "slug": "uuid" } )
import React, { useEffect, useState } from "react";
import axios from "../../../api/fetch";
import useNotification from "../../../Hooks/useNotification";

export default function MultiJsonAdmin() {
  const { showNotification } = useNotification();

  const [fileName, setFileName] = useState("");
  const [jsonData, setJsonData] = useState(null);
  const [loading, setLoading] = useState(false);

  // add form
  const [addType, setAddType] = useState("auto"); // auto | flat | categories
  const [addSlug, setAddSlug] = useState("");
  const [addUuid, setAddUuid] = useState("");
  const [addCategory, setAddCategory] = useState("");

  // remove form
  const [removeType, setRemoveType] = useState("auto");
  const [removeSlug, setRemoveSlug] = useState("");
  const [removeCategory, setRemoveCategory] = useState("");

  useEffect(() => {
    // nothing yet
  }, []);

  const detectTypeFromData = (data) => {
    if (!data || typeof data !== "object") return "flat";
    const vals = Object.values(data);
    if (vals.length === 0) return "flat"; // default to flat
    const allArrays = vals.every((v) => Array.isArray(v));
    return allArrays ? "categories" : "flat";
  };

  const fetchJson = async () => {
    if (!fileName) return showNotification("error", "Enter file name first");
    setLoading(true);
    try {
      const res = await axios.get(`/json/${fileName}`);
      const data = res.data && res.data.data ? res.data.data : res.data;
      setJsonData(data);
      // auto-select type
      setAddType(detectTypeFromData(data));
      setRemoveType(detectTypeFromData(data));
      showNotification("success", "JSON loaded");
    } catch (err) {
      console.error(err);
      showNotification("error", err?.response?.data?.error || err?.message || "Failed to load JSON");
      setJsonData(null);
    } finally {
      setLoading(false);
    }
  };

  // ---------- ADD (Option C) ----------
  const addItem = async () => {
    if (!fileName) return showNotification("error", "fileName required");
    if (!addSlug || !addUuid) return showNotification("error", "slug and uuid required");

    try {
      let body = { items: {} };

      if (addType === "flat") {
        // { items: { "slug": "uuid" } }
        body.items[addSlug] = addUuid;
      } else {
        // categories: { items: { category: [ { "slug": "uuid" } ] } }
        const cat = addCategory || "default";
        const obj = {};
        obj[addSlug] = addUuid;
        body.items[cat] = [obj];
      }

      await axios.put(`/json/modify/Adding/${fileName}`, body);
      showNotification("success", "Added successfully");
      // reset
      setAddSlug("");
      setAddUuid("");
      setAddCategory("");
      fetchJson();
    } catch (err) {
      console.error(err);
      showNotification("error", err?.response?.data?.error || err?.message || "Add failed");
    }
  };

  // ---------- REMOVE (Option 1: remove by slug only) ----------
  const removeItem = async () => {
    if (!fileName) return showNotification("error", "fileName required");
    if (!removeSlug) return showNotification("error", "slug required");

    try {
      let body = { items: {} };

      if (removeType === "flat") {
        // { items: { "slug": true } }
        body.items[removeSlug] = true;
      } else {
        // categories: { items: { category: [ { "slug": true } ] } }
        const cat = removeCategory || "default";
        const obj = {};
        obj[removeSlug] = true;
        body.items[cat] = [obj];
      }

      await axios.put(`/json/modify/Removing/${fileName}`, body);
      showNotification("success", "Removed successfully (matched by slug)");
      setRemoveSlug("");
      setRemoveCategory("");
      fetchJson();
    } catch (err) {
      console.error(err);
      showNotification("error", err?.response?.data?.error || err?.message || "Remove failed");
    }
  };

  const clearFile = async (def = "array") => {
    if (!fileName) return showNotification("error", "fileName required");
    try {
      await axios.post(`/json/${fileName}/clear?default=${def}`);
      showNotification("success", "File cleared");
      fetchJson();
    } catch (err) {
      showNotification("error", err?.response?.data?.error || err?.message || "Clear failed");
    }
  };

  const fetchProductsView = async () => {
    if (!fileName) return showNotification("error", "fileName required");
    try {
      const res = await axios.get(`/json/fetch/${fileName}`);

      if (res.data && res.data) {
        // show the enriched view
        setJsonData(res.data.data);
        showNotification("success", "Fetched products (with category info)");
      } else {
        showNotification("error", "No data returned");
      }
    } catch (err) {
      console.error(err);
      showNotification("error", err?.response?.data?.error || err?.message || "fetch failed");
    }
  };

  return (
    <div className="container-fluid py-4">
      <h3>Multi JSON Manager (Option C)</h3>

      <div className="d-flex gap-2 align-items-center mt-3 mb-3">
        <input
          type="text"
          placeholder="Enter file name (e.g. home)"
          className="form-control w-25"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
        />
        <button className="btn btn-primary" onClick={fetchJson}>Load JSON</button>
        <button className="btn btn-outline-secondary" onClick={() => fetchProductsView()}>Fetch products view</button>
        <button className="btn btn-outline-danger" onClick={() => clearFile('array')}>Clear  array</button>
        <button className="btn btn-outline-danger" onClick={() => clearFile('object')}>Clear object</button>
      </div>

      {loading && <div className="mb-3">Loading...</div>}

      {jsonData && (
        <>
          <div className="mb-4">
            <h5>Current JSON Content</h5>
            <pre className="bg-dark text-white p-3 rounded" style={{ maxHeight: 300, overflow: "auto" }}>{JSON.stringify(jsonData, null, 2)}</pre>
          </div>

          {/* Add section */}
          <div className="card p-3 mb-3">
            <h5>Add Item</h5>
            <div className="row g-2 align-items-end">
              <div className="col-auto">
                <label className="form-label">Type</label>
                <select className="form-select" value={addType} onChange={(e) => setAddType(e.target.value)}>
                  <option value="auto">Auto (detected)</option>
                  <option value="flat">Flat (slug: uuid)</option>
                  <option value="categories">Categories (category  array)</option>
                </select>
              </div>

              {addType === "categories" && (
                <div className="col-auto">
                  <label className="form-label">Category slug</label>
                  <input className="form-control" value={addCategory} onChange={(e) => setAddCategory(e.target.value)} placeholder="e.g. view" />
                </div>
              )}

              <div className="col-auto">
                <label className="form-label">Product slug</label>
                <input className="form-control" value={addSlug} onChange={(e) => setAddSlug(e.target.value)} placeholder="product-slug" />
              </div>
              <div className="col-auto">
                <label className="form-label">UUID</label>
                <input className="form-control" value={addUuid} onChange={(e) => setAddUuid(e.target.value)} placeholder="uuid" />
              </div>

              <div className="col-auto">
                <button className="btn btn-success" onClick={addItem}>Add</button>
              </div>
            </div>
            <small className="text-muted">Note: each category item will be added as an object with single key  (Option C).</small>
          </div>

          {/* Remove section */}
          <div className="card p-3 mb-3">
            <h5>Remove Item (match by slug only)</h5>
            <div className="row g-2 align-items-end">
              <div className="col-auto">
                <label className="form-label">Type</label>
                <select className="form-select" value={removeType} onChange={(e) => setRemoveType(e.target.value)}>
                  <option value="auto">Auto (detected)</option>
                  <option value="flat">Flat (slug)</option>
                  <option value="categories">Categories (category  array)</option>
                </select>
              </div>

              {removeType === "categories" && (
                <div className="col-auto">
                  <label className="form-label">Category slug</label>
                  <input className="form-control" value={removeCategory} onChange={(e) => setRemoveCategory(e.target.value)} placeholder="e.g. view" />
                </div>
              )}

              <div className="col-auto">
                <label className="form-label">Product slug</label>
                <input className="form-control" value={removeSlug} onChange={(e) => setRemoveSlug(e.target.value)} placeholder="product-slug" />
              </div>

              <div className="col-auto">
                <button className="btn btn-danger" onClick={removeItem}>Remove</button>
              </div>
            </div>
            <small className="text-muted">Removal will match objects by product slug only (Option 1).</small>
          </div>

        </>
      )}

      {!jsonData && !loading && <div className="text-muted">No file loaded yet.</div>}

    </div>
  );
}
