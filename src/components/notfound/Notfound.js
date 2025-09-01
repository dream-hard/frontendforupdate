import { useNavigate } from "react-router-dom";
import useNotification from "../../Hooks/useNotification";
import {  useEffect } from "react";
import useAuth from "../../Hooks/useAuth";
function Notfound(){

    const navigate=useNavigate();
      const { showNotification } = useNotification() // ← must match context exactly
    const {auth}=useAuth()
    useEffect(()=>{
      console.log(auth)

      showNotification('error', 'Oops, Not Found Page');
},[auth])
    return (
        <>
        <div className='conatiner '>
        <h1 style={{color:"black"}}>nothing is here 
          </h1>
            <button
          type="button"
          className="btn btn-primary  col-2 col-lg-1 ms-auto"
          onClick={()=>{navigate(-1)}}
           >
          go back
          </button>
          </div>
          </>
          )
}

export default Notfound;