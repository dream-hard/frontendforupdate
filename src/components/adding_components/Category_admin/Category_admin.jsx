import React, { useEffect, useState, useCallback } from "react";
import axios from "../../../api/fetch";
import useNotification from "../../../Hooks/useNotification";

// Category Hybrid Admin (Tree + Table + Editor)
// - Style: Hybrid (tree left, table + editor right)
// - Drag & drop to change parent (native HTML5 DnD)
// - Shows category path
// - Shows softdeleted items with badge
// - Uses your backend routes (POST /category/getallnestedcategorieswithallchildren, /category/create/create, /category/updatedcategory, /category/delete/delete)

export default function CategoryHybridAdmin() {
  const { showNotification } = useNotification();

  const [tree, setTree] = useState(null);
  const [flatCategories, setFlatCategories] = useState([]);
  const [selected, setSelected] = useState(null); // selected category object
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // editor state
  const [form, setForm] = useState({ name: "", display_name: "", description: "", parentId: null, slug: "" ,softdelete:false});
  const [isNew, setIsNew] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // fetch nested tree
  const fetchTree = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.post("/category/getallnestedcategorieswithallchildren", { id: null });
      // controller returns array (root children) or object for a subtree
      setTree(res.data || res.data);
      console.log(res.data);
    } catch (err) {
      console.error(err);
      showNotification("error", err?.response?.data?.error || err?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const fetchFlat = useCallback(async () => {
    try {
      const res = await axios.get("/category/justgetall");
      setFlatCategories(res.data || []);
    } catch (err) {
      console.warn("failed to fetch flat categories", err?.message);
    }
  }, []);

  useEffect(() => {
    fetchTree();
    fetchFlat();
  }, [fetchTree, fetchFlat]);

  // helper to find a node in tree by uuid
  const findNode = (nodes, uuid) => {
    if (!nodes) return null;
    for (const n of nodes) {
      if (n.uuid === uuid) return n;
      const found = findNode(n.children, uuid);
      if (found) return found;
    }
    return null;
  };

  // when selecting
  const selectNode = (node) => {
    setSelected(node);
    setIsNew(false);
    setForm({
      name: node.name || "",
      display_name: node.display_name || "",
      description: node.description || "",
      parentId: node.parent_category_id || null,
      slug: node.slug || "",
      softdelete:node.softdelete||false,
    });
  };

  // create new root or child
  const startCreate = (parentId = null) => {
    setSelected(null);
    setIsNew(true);
    setForm({ name: "", display_name: "", description: "", parentId, slug: "" });
  };

  // save (create or update)
  const saveCategory = async () => {
    try {
      if (isNew) {
        const body = {
          parent_id: form.parentId || null,
          name: form.name,
          description: form.description,
          display_name: form.display_name,
          softdelete:form.softdelete
        };
        const res = await axios.post("/category/create/addcategory", body);
        showNotification("success", "Category created");
      } else if (selected) {
        const body = {
          id: selected.uuid,
          parent_id: form.parentId || null,
          name: form.name,
          description: form.description,
          display_name: form.display_name,
          softdelete:form.softdelete
        };
        await axios.patch("/category/update/updatedcategory", body);
        showNotification("success", "Category updated");
      }
      await fetchTree();
      await fetchFlat();
      setIsNew(false);
    } catch (err) {
      console.error(err);
      showNotification("error", err?.response?.data?.error || err?.message || "Save failed");
    }
  };

  // delete
  const doDelete = async () => {
    if (!selected) return;
    try {
      await axios.delete("/category/delete/delete", { data: { id: selected.uuid } });
      showNotification("success", "Category deleted");
      setSelected(null);
      setShowConfirmDelete(false);
      await fetchTree();
      await fetchFlat();
    } catch (err) {
      console.error(err);
      showNotification("error", err?.response?.data?.error || err?.message || "Delete failed");
    }
  };

  // drag & drop handlers (native HTML5)
  const onDragStart = (e, node) => {
    e.dataTransfer.setData("text/plain", node.uuid);
    e.dataTransfer.effectAllowed = "move";
  };
  const onDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };
  const onDrop = async (e, targetNode) => {
    e.preventDefault();
    const uuid = e.dataTransfer.getData("text/plain");
    if (!uuid || uuid === targetNode.uuid) return;

    // descendant protection
    const draggedNode = findNode(Array.isArray(tree) ? tree : [tree], uuid);
    const getDesc = (n) => {
      const res = [];
      (function walk(x){ if (!x?.children) return; x.children.forEach(c=>{res.push(c.uuid); walk(c);}); })(n);
      return res;
    };
    if (draggedNode) {
      const blocked = getDesc(draggedNode);
      if (blocked.includes(targetNode.uuid)) {
        alert("Cannot move a parent category into its own subtree.");
        return;
      }
    }
    try {
      // update parent via API
      await axios.patch("/category/update/updatedcategory", { id: uuid, parent_id: targetNode.uuid });
      showNotification("success", "Category moved");
      await fetchTree();
      await fetchFlat();
    } catch (err) {
      console.error(err);
      showNotification("error", err?.response?.data?.error || err?.message || "Move failed");
    }
  };

  // render tree recursively
  const TreeNode = ({ node }) => {
    const [open, setOpen] = useState(true);
    return (
      <div className="ms-2">
        <div
          className={`d-flex align-items-center gap-2 p-1 rounded ${selected && selected.uuid === node.uuid ? 'bg-primary text-white' : 'bg-light'}`}
          draggable
          onDragStart={(e) => onDragStart(e, node)}
          onDragOver={onDragOver}
          onDrop={(e) => onDrop(e, node)}
          style={{ cursor: 'grab' }}
        >
<button 
  className="btn btn-light btn-sm rounded-circle shadow-sm d-flex align-items-center justify-content-center"
  style={{ width: "28px", height: "28px" }}
  onClick={() => setOpen(o => !o)}
>
  <i className={`bi ${open ? "bi-chevron-down" : "bi-chevron-right"}`}></i>
</button>

          <div style={{ flex: 1 }} onClick={() => selectNode(node)}>
            <strong>{node.display_name || node.name}</strong>
            <div style={{ fontSize: 12 }} className="text-muted">{node.slug} {node.softdelete ? <span className="badge bg-warning text-dark ms-2">softdeleted</span> : null}</div>
            <div style={{ fontSize: 11 }} className="text-muted">Path: {node.link || computePath(node)}</div>
          </div>
        </div>
        {open && node.children && node.children.length > 0 && (
          <div className="ms-3 mt-1">
            {node.children.map(child => (
              <TreeNode key={child.uuid} node={child} />
            ))}
          </div>
        )}
      </div>
    );
  };

  // compute path fallback if server didn't provide
  const computePath = (node) => {
    // build by walking parents using flatCategories map
    if (!node) return '';
    const map = Object.fromEntries(flatCategories.map(c => [c.uuid, c]));
    const parts = [];
    let cur = node;
    while (cur) {
      parts.unshift(cur.slug);
      cur = map[cur.parent_category_id];
    }
    return '/' + parts.join('/');
  };

  // filtered list for table (children of selected or root)
  const childrenList = selected ? (selected.children || []) : (Array.isArray(tree) ? tree : []);

  // search helper
  const filteredFlat = flatCategories.filter(c => !search || (c.name || '').toLowerCase().includes(search.toLowerCase()) || (c.slug || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Categories —  Admin</h3>
        <div>
          <button className="btn btn-success me-2" onClick={() => startCreate(null)}>Add root category</button>
          <button className="btn btn-outline-secondary" onClick={() => fetchTree()}>Refresh</button>
        </div>
      </div>

      <div className="row">
        <div className="col-4" style={{ maxHeight: '75vh', overflow: 'auto' }}>
          <div className="card p-2">
            <div className="d-flex mb-2">
              <input className="form-control me-2" placeholder="Search categories..." value={search} onChange={e => setSearch(e.target.value)} />
              <button className="btn btn-sm btn-outline-primary" onClick={() => { setSearch(''); }}>Clear</button>
            </div>

            {loading && <div>Loading tree...</div>}
            {!loading && tree && (
              Array.isArray(tree) ? tree.map(node => <TreeNode key={node.uuid} node={node} />) : <TreeNode node={tree} />
            )}
          </div>
        </div>

        <div className="col-8">
          <div className="card p-3 mb-3">
            <h5>{isNew ? 'Create Category' : selected ? 'Edit Category' : 'Select a Category'}</h5>
            <div className="row g-2">
              <div className="col-md-6">
                <label className="form-label">Name</label>
                <input className="form-control" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Display Name</label>
                <input className="form-control" value={form.display_name} onChange={e => setForm({...form, display_name: e.target.value})} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Parent</label>
                <select className="form-select" value={form.parentId || ""} onChange={e => setForm({...form, parentId: e.target.value || null})}>
                  <option value="">(root)</option>
                  {flatCategories.map(c => <option key={c.uuid} value={c.uuid}>{c.display_name || c.name} ({c.slug})</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Slug (auto)</label>
                <input className="form-control" value={form.slug} readOnly disabled />
              </div>
              <div className="col-12">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>

              <div className="col-md-6">
                <label className="form-label">Soft Deleted</label>
                <select
                  className="form-select"
                  value={form.softdelete ? "1" : "0"}
                  onChange={e => setForm({ ...form, softdelete: e.target.value === "1" })}
                >
                  <option value="0">Active</option>
                  <option value="1">Soft Deleted</option>
                </select>
              </div>

              <div className="col-12 d-flex gap-2 mt-2">
                <button className="btn btn-primary" onClick={saveCategory}>{isNew ? 'Create' : 'Save'}</button>
                {!isNew && selected && <button className="btn btn-danger" onClick={() => setShowConfirmDelete(true)}>Delete</button>}
                {selected && <button className="btn btn-outline-secondary" onClick={() => startCreate(selected.uuid)}>Add child</button>}
                <button className="btn btn-outline-secondary" onClick={() => { setSelected(null); setIsNew(false); setForm({ name: '', display_name: '', description: '', parentId: null, slug: '' }) }}>Clear</button>
              </div>
            </div>
          </div>

          <div className="card p-3">
            <h5>Children / Siblings</h5>
            <div className="table-responsive" style={{ maxHeight: '50vh', overflow: 'auto' }}>
              <table className="table table-hover table-sm align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Slug</th>
                    <th>Path</th>
                    <th>التفعيل</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {childrenList.map(c => (
                    <tr key={c.uuid}>
                      <td>{c.display_name || c.name}</td>
                      <td>{c.slug}</td>
                      <td style={{maxWidth:260,overflow:'hidden',textOverflow:'ellipsis'}}>{c.link || computePath(c)}</td>
                      <td onClick={()=>{console.log(c)}}>{c.softdelete ? <span className="badge bg-warning text-dark">softdeleted</span> : <span className="badge bg-success">active</span>}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button className="btn btn-sm btn-outline-primary" onClick={() => selectNode(c)}>Edit</button>
                          <button className="btn btn-sm btn-outline-secondary" onClick={() => startCreate(c.uuid)}>Add child</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {/* Confirm delete modal (simple) */}
      {showConfirmDelete && selected && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button className="btn-close" onClick={() => setShowConfirmDelete(false)}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete category <strong>{selected.display_name || selected.name}</strong> ?</p>
                <p className="text-muted">This will remove the category. Child categories may be cascade-deleted depending on server logic.</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowConfirmDelete(false)}>Cancel</button>
                <button className="btn btn-danger" onClick={doDelete}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
