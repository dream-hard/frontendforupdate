import { useNavigate } from "react-router-dom";
import useNotification from "../../Hooks/useNotification";
import {  useEffect } from "react";
function Notfound(){

    const navigate=useNavigate();
      const { showNotification } = useNotification() // ← must match context exactly
    useEffect(()=>{

      showNotification('error', 'Oops, Not Found Page');
},[])
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