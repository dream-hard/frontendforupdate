import React, { useEffect, useState } from "react";
import axios from "../../../api/fetch";

export default function AdminAds() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAd, setSelectedAd] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const [form, setForm] = useState({
    id: "",
    name: "",
    title: "",
    link_path: "/",
    isvalid: false,
    file: null,
    preview: null
  });

  // ******************************
  // GET ADS
  // ******************************
  const getAds = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `/banners/getAds?page=${page}&limit=${limit}`
      );
      setAds(res.data.ads);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    getAds();
  }, [page]);

  // ******************************
  // HANDLE INPUTS
  // ******************************
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    setForm((p) => ({
      ...p,
      file,
      preview: file ? URL.createObjectURL(file) : null
    }));
  };

  // ******************************
  // OPEN EDIT MODAL
  // ******************************
  const openEdit = (ad) => {
    setSelectedAd(ad);
    setForm({
      id: ad.id,
      name: ad.name,
      title: ad.title,
      link_path: ad.link_path,
      isvalid: ad.isvalid,
      file: null,
      preview: ad.photo_path
    });
  };

  // ******************************
  // CREATE OR UPDATE AD
  // ******************************
  const saveAd = async () => {
    const fd = new FormData();
    fd.append("id", form.id);
    fd.append("name", form.name);
    fd.append("title", form.title);
    fd.append("link_path", form.link_path);
    fd.append("isvalid", form.isvalid);
    if (form.file) fd.append("files", form.file);

    try {
      let res;
      if (selectedAd)
        res = await axios.patch("/banners/update/adupdate", fd);
      else
        res = await axios.post("/banners/create/addad", fd);

      getAds();
      setSelectedAd(null);
      setForm({
        id: "",
        name: "",
        title: "",
        link_path: "/",
        isvalid: false,
        file: null,
        preview: null
      });
    } catch (err) {
      console.log(err);
    }
  };

  // ******************************
  // DELETE
  // ******************************
  const deleteAd = async (id) => {
    console.log(id);
    if (!window.confirm("Are you sure you want to delete this banner?")) return;
    try {
      await axios.delete(`/banners/delete/remove?id=${id}`);
      getAds();
    } catch (err) {
      console.log(err);
    }
  };

  // ******************************
  // TOGGLE VALID
  // ******************************
  const toggleValid = async (id) => {
    try {
      await axios.post(`/banners/toggle-valid/${id}`);
      getAds();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="container-fluid py-4">

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">🎛️ Banner Manager</h2>
        <button
          className="btn btn-primary"
          data-bs-toggle="modal"
          data-bs-target="#adModal"
          onClick={() => {
            setSelectedAd(null);
            setForm({
              id: "",
              name: "",
              title: "",
              link_path: "/",
              isvalid: false,
              file: null,
              preview: null
            });
          }}
        >
          + Add Banner
        </button>
      </div>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search by name..."
        className="form-control mb-3"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* TABLE */}
      <div className="table-responsive shadow rounded">
        <table className="table table-hover align-middle">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Preview</th>
              <th>Name</th>
              <th>Title</th>
              <th>Link</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="text-center py-4">Loading...</td></tr>
            ) : ads.length === 0 ? (
              <tr><td colSpan="7" className="text-center py-4">No ads found</td></tr>
            ) : (
              ads
                .filter((a) => a.name.toLowerCase().includes(search.toLowerCase()))
                .map((ad) => (
                  <tr key={ad.id}>
                    <td>{ad.id}</td>
                    <td>
                      <img
                        src={ad.photo_path}
                        alt=""
                        style={{ height: "55px", borderRadius: "6px" }}
                      />
                    </td>
                    <td>{ad.name}</td>
                    <td>{ad.title}</td>
                    <td>
                      <a href={ad.link_path} target="_blank" rel="noreferrer">
                        {ad.link_path}
                      </a>
                    </td>

                    <td>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={ad.isvalid}
                          onChange={() => toggleValid(ad.id)}
                        />
                      </div>
                    </td>

                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-warning me-2"
                        data-bs-toggle="modal"
                        data-bs-target="#adModal"
                        onClick={() => openEdit(ad)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => deleteAd(ad.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="d-flex justify-content-center mt-3">
        <button
          className="btn btn-outline-dark me-2"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          ⬅ Prev
        </button>
        <button
          className="btn btn-outline-dark"
          onClick={() => setPage(page + 1)}
        >
          Next ➡
        </button>
      </div>

      {/* MODAL */}
      <div className="modal fade" id="adModal" tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content p-3">

            <div className="modal-header">
              <h5 className="modal-title fw-bold">
                {selectedAd ? "Edit Banner" : "Create Banner"}
              </h5>
              <button className="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div className="modal-body">

              <div className="row">
                <div className="col-md-8">

                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                      name="name"
                      className="form-control"
                      value={form.name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input
                      name="title"
                      className="form-control"
                      value={form.title}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Link</label>
                    <input
                      name="link_path"
                      className="form-control"
                      value={form.link_path}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Image</label>
                    <input
                      type="file"
                      className="form-control"
                      onChange={handleFile}
                    />
                  </div>

                </div>

                <div className="col-md-4">
                  {form.preview && (
                    <img
                      src={form.preview}
                      className="img-fluid rounded shadow-sm"
                      alt=""
                    />
                  )}
                </div>

              </div>

            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">
                Close
              </button>
              <button className="btn btn-success" onClick={saveAd}>
                Save
              </button>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
