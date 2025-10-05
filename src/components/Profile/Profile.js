import React, { useState ,useEffect,useRef} from "react";
import { Link,NavLink,Outlet } from "react-router-dom";
import axios,{originalAxios} from '../../api/fetch'
import "./Profile.css"

const UserProfile = () => {
const [user, setUser] = useState({});
  const controllerRef = useRef(null);
  const [loadingStage, setLoadingStage] = useState(true);
    
    const fetchUser= async (signal)=>{
      setLoadingStage(true);
      try {

        const res = await axios.get("/me", {
          signal
        });
        setUser(res.data);
      } catch (error) {
        if (originalAxios.isCancel(error)|| error.name === 'CanceledError') {
          console.log("Request canceled");
        } else {
          console.error("Failed to fetch user data:", error);

        }
      }finally{
        setLoadingStage(false)
      }
    }
    

  

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


  return (
    <div className="container-fluid col-12 mt-4">
      {/* Profile Header */}
      <div className="  mb-4 shadow-sm px-3">
         {loadingStage ? (
            <>
              {/* Avatar Placeholder */}
              <div
                className="rounded-circle bg-secondary placeholder-glow"
                style={{ width: 80, height: 80 }}
              ></div>
              <div className="ms-3 flex-grow-1">
                <h4 className="placeholder-glow">
                  <span className="placeholder col-6"></span>
                </h4>
                <h6 className="placeholder-glow">
                  <span className="placeholder col-4"></span>
                </h6>
                <small className="placeholder-glow">
                  <span className="placeholder col-8"></span>
                </small>
                <p className="placeholder-glow mt-2 mb-0">
                  <span className="placeholder col-10"></span>
                </p>
              </div>
            </>
          ) : (<>
          {/* <div className="d-flex align-items-center">
          <img
            src={user.profile_pic || `https://placehold.co/150?text=${user.username}`}
            className="rounded-circle me-3"
            alt="User Avatar"
          />
          <div>
            <h4 className="mb-0">{user.username}</h4>
            <h6 className="my-1">{user?.role_id}</h6>
            <small className="text-muted">حساب من : {new Date(user.createdAt).toLocaleDateString("en-GB")}</small>
            <p className="mt-2 mb-0">{user.bio || "No bio provided yet."}</p>
          </div>
        </div> */}
      <div className="  p-3 mb-3" style={{border:"0px solid transparent"}}>
  <div className="d-flex align-items-center">
    <img
      src={user.profile_pic || `https://placehold.co/150?text=${user.username}`}
      className="rounded-circle border me-3"
      alt="User Avatar"

    />
    <div>
      <h5 className="mb-1 text-primary fw-bold">{user.username}</h5>
      <span className="badge bg-secondary">{user?.role_id}</span>
      <div>
        <small className="text-muted">
          حساب من: {new Date(user.createdAt).toLocaleDateString("en-GB")}
        </small>
      </div>
    </div>
  </div>
  <p className="mt-3 mb-0 text-muted fst-italic">
    {user.bio || "No bio provided yet."}
  </p>
</div>
          </>)}
 
      </div>

      {/* Tabs */}
           <ul className="nav nav-tabs my-5">
        <li className="nav-item">
          <NavLink to="info" className="nav-link">Info</NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="products" className="nav-link">Products</NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="services" className="nav-link">Services</NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="courses" className="nav-link">Courses</NavLink>
        </li>
      </ul>

      {/* Tab Content */}
      <div className="container-fluid" >
        <Outlet></Outlet>
      </div>

      {/* <div className="modal fade" id="addModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add New Item</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <div className="d-grid gap-2">
                <Link to="add/product" className="btn btn-outline-primary">
                  Add Product
                </Link>
                <Link to="/add/service" className="btn btn-outline-success">
                  Add Service
                </Link>
                <Link to="/add/course" className="btn btn-outline-warning">
                  Add Course
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default UserProfile;
