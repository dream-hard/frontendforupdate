import react, { useEffect, useState,useRef } from "react";
import axios,{originalAxios} from '../../api/fetch'
import useAuth from "../../Hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function Info(){
  const [user, setUser] = useState({});
  const controllerRef = useRef(null);
  const {claims}=useAuth();
  const navigate=useNavigate();

    const fetchUser= async (signal)=>{
      try {
        setLoadingStage(LOADING_STAGES.FETCHING);

        const res = await axios.get("/me", {
          signal
        });
        setLoadingStage(LOADING_STAGES.PROCESSING);

        setUser(res.data);
        setLoadingStage(LOADING_STAGES.DONE);
      } catch (error) {
        if (originalAxios.isCancel(error)|| error.name === 'CanceledError') {
          console.log("Request canceled");
        } else {
          setLoadingStage(LOADING_STAGES.ERROR);
        }
      }
    }
    
    const LOADING_STAGES = {
    STARTING: "starting",
    FETCHING: "fetching",
    PROCESSING: "processing",
    DONE: "done",
    ERROR: "error",
    };
  
  const [loadingStage, setLoadingStage] = useState(LOADING_STAGES.DONE);

  useEffect(() => {
    controllerRef.current = new AbortController();

  const timeoutId = setTimeout(() => {
    fetchUser(controllerRef.current.signal);
  }, 300); // ← تأخير 300ms مثلًا
    return () => {
          clearTimeout(timeoutId); // 🧹 امسح التايمر لو الكومبوننت اتسكر

      controllerRef.current?.abort();
    };
  }, []);


  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    phone_number: user.phone_number || "",
    username: user.username || "",
    bio: user.bio || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDone = () => {
    // setUser((prev)=>({
    //     ...prev,
    //     ...formData
    // }))

    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    // Create a new AbortController for the new request
    controllerRef.current = new AbortController();

    // Start a new request
    fetchUser(controllerRef.current.signal);

    
    setEditMode(false);


  };

  const handleCancel = () => {
    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone_number: user.phone_number || "",
      username: user.username || "",
      bio: user.bio || "",
    });
    setEditMode(false);
  };


    if (
    loadingStage === LOADING_STAGES.STARTING ||
    loadingStage === LOADING_STAGES.FETCHING
    ) {
    return (
        <div className="text-center mt-5 text-primary">
        <i className="bi bi-cloud-download-fill display-4 mb-3 "></i> 
        <div className="ms-4 spinner-border text-primary" role="status"></div>
        <p className="mt-3 fw-semibold">Loading profile data...</p>
        </div>
    );
    }
    if (loadingStage === LOADING_STAGES.PROCESSING) {
    return (
        <div className="text-center mt-5 text-warning">
        <i className="bi bi-gear-fill display-4 mb-3 spin-slow"></i>
        <div className="spinner-border text-warning" role="status"></div>
        <p className="mt-3 fw-semibold">Processing user info...</p>
        </div>
    );
    }
    if (loadingStage === LOADING_STAGES.ERROR) {
    return (
        <div className="text-center mt-5 text-danger">
        <i className="bi bi-exclamation-triangle-fill display-4 mb-3"></i>
        <p className="fw-semibold">Something went wrong while loading profile.</p>
        <button className="btn btn-outline-danger btn-sm mt-2" onClick={() => {
        if (controllerRef.current) {
        controllerRef.current.abort();
        }
        controllerRef.current = new AbortController();
        fetchUser(controllerRef.current.signal);
        }}>
            Retry
        </button>
        </div>
    );
    }






    return(
            <>
            <div className="container-fluid mt-4">
            <div className="row">
                {/* Profile picture */}
                <div className="col-md-4 text-center mb-4">
                <img
                    src={user.profile_pic || `https://placehold.co/150?text=${user.name}`}
                    className="rounded-circle shadow"
                    alt="Profile"
                    width="150"
                    height="150"
                />
                {editMode ? (
                    <>
                        <h4 className="mt-3">{formData.name}</h4>
                        <small className="text-muted">@{formData.username}</small>
                    </>
                ) : (
                    <>
                        <h4 className="mt-3">{user.name}</h4>
                        <small className="text-muted">@{user.username}</small>
                    </>
            
                )}
                  {claims && (["admin","super_admin","Owner"].includes(claims?.role.uuid)) &&
                    <div className="col-md-12 text-center mt-3">
                      <div
                        className="card  shadow border-0 rounded-4 h-100 bg-gradient"
                        style={{ background: "linear-gradient(135deg, #6366F1, #9333EA)" }}
                      >
                        <div className="card-body d-flex flex-column justify-content-between">
                          <div>
                            <h5 className="card-title fw-bold">🚀 ابدأ الآن</h5>
                            <p className="card-text opacity-75">
                              استكشف الأدوات والتقارير لزيادة إنتاجيتك.
                            </p>
                          </div>
                          <button onClick={()=>navigate('/dashboard')} className="btn btn-light text-primary fw-semibold mt-3 rounded-pill">
                            الذهاب إلى لوحة التحكم
                          </button>
                        </div>
                      </div>
                    </div> 
                    }

                </div>

                {/* User Info */}
                <div className="col-md-8">
                <div className="card shadow-sm">
                    <div className="card-body">
                    <h5 className="card-title mb-3">User Information</h5>

                    <div className="row mb-2">
                        <div className="col-sm-4 fw-semibold">Email:</div>
                        <div className="col-sm-8">
                        {editMode ? (
                                    <input
                                    type="email"
                                    name="email"
                                    className="form-control form-control-sm text-center"
                                    value={formData.email}
                                    onChange={handleChange}
                                    />
                                ) : (
                                    user.email || <span className="text-muted">Not provided</span>
                        )}   
                        </div>
                    </div>

                    <div className="row mb-2">
                        <div className="col-sm-4 fw-semibold">Name:</div>
                                            
                        <div className="col-sm-8">
                        {editMode ? (
                                    <input
                                    type="text"
                                    name="name"
                                    className="form-control form-control-sm text-center"
                                    value={formData.name}
                                    onChange={handleChange}
                                    />
                                ) : (
                                    user.name || <span className="text-muted">Not provided</span>
                        )} 
                        </div>
                    </div>

                    <div className="row mb-2">
                        <div className="col-sm-4 fw-semibold">User Name:</div>
                        <div className="col-sm-8">
                        {editMode ? (
                                    <input
                                    type="text"
                                    name="username"
                                    className="form-control form-control-sm text-center"
                                    value={formData.username}
                                    onChange={handleChange}
                                    />
                                ) : (
                                    user.username || <span className="text-muted">Not provided</span>
                        )}                             
                        </div>
                    </div>


                    <div className="row mb-2">
                        <div className="col-sm-4 fw-semibold">Phone:</div>
                        <div className="col-sm-8">
                        {editMode ? (
                                    <input
                                    type="text"
                                    name="phone_number"
                                    className="form-control form-control-sm text-center"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    />
                                ) : (
                                    user.phone_number || <span className="text-muted">Not provided</span>
                        )}                     
                        </div>
                    </div>

                    <div className="row mb-2">
                        <div className="col-sm-4 fw-semibold">Role:</div>
                        <div className="col-sm-8">{user?.role_id || "User"}</div>
                    </div>

                    <div className="row mb-2">
                        <div className="col-sm-4 fw-semibold">Status:</div>
                        <div className="col-sm-8">
                        <span className={`badge ${user.status_id === "accepted" ? "bg-success" : "bg-secondary"}`}>
                            {user?.status_id || "Pending"}
                        </span>
                        </div>
                    </div>

                    <div className="row mb-2">
                        <div className="col-sm-4 fw-semibold">Joined:</div>
                        <div className="col-sm-8">
                        {new Date(user.createdAt).toLocaleDateString("en-GB")}
                        </div>
                    </div>

                    <div className="row mt-3">
                        <div className="col-sm-12">
                        <h6 className="fw-semibold">Bio:</h6>
                        {editMode ? (
                    <div class="mb-3">
                        <label for="" class="form-label"></label>
                        <textarea className="form-control"
                        name="bio"
                        id="" 
                        rows="3"
                        value={formData.bio}
                        onChange={handleChange}></textarea>
                    </div>
                                ) : (
                        <p className="text-muted">{user.bio || "No bio provided yet."}</p>
                        )}  
                        </div>
                    </div>

                    

                    <div className="text-end">
              {editMode ? (
                <>
                  <button
                    className="btn btn-success btn-sm me-2"
                    onClick={handleDone}
                  >
                    Done
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => setEditMode(true)}
                >
                  Edit Info
                </button>
              )}
                    </div>
      
                    </div>
                </div>
                </div>
            </div>
            </div>


                </>)
}



