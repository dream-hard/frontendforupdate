import axios from "axios"

const customAxios = axios.create({
   baseURL:`http://192.168.1.103:3001`,
   withCredentials:true,
});


// const customAxios = axios.create({
//    baseURL:`https://192.168.0.158:3001`,
//    withCredentials:true,
// });

export { axios as originalAxios };  // export original axios
export default customAxios;