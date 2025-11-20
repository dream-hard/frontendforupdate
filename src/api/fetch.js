import axios from "axios"

// const customAxios = axios.create({
//    baseURL:`http://10.40.25.150:3001`,
//    withCredentials:true,
// });



const customAxios = axios.create({
   baseURL:`http://localhost:3001`,
   withCredentials:true,
});

// const customAxios = axios.create({
//    baseURL:"https://cortex-7.com/api",
//    withCredentials:true,
// });


export { axios as originalAxios };  // export original axios
export default customAxios;