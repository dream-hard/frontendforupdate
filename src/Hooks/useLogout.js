import { useNavigate } from "react-router-dom";
import axios from "../api/fetch";
import useAuth from "./useAuth";
import useNotification from "./useNotification";

const useLogout=()=>{
    const {Setauth}=useAuth();
    const navigate=useNavigate();
    const {showNotification}=useNotification

    const logout=async()=>{
        try {
            const response=await axios('/logout',{
                method:"delete",
                headers:{
                    
                },
                withCredentials:true,
    
            });
            Setauth(null);
            navigate('/');
            return ;

        } catch (error) {

        }
    
    }
    return logout;
}

export default useLogout;