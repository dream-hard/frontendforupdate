import axios from "axios"



const customAxios = axios.create({
   baseURL:`http://192.168.1.106:3001`,
   withCredentials:true,
});

export { axios as originalAxios };  // export original axios
export default customAxios;