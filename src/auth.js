// import axios from "./api/fetch";
// import { createContext,useState ,useEffect, useLayoutEffect} from "react";


// const AuthContext= createContext({});

// function parseJwt(token) {
//   try {
//     const base64Payload = token;
//     const payload = atob(base64Payload); // Decode base64
//     return JSON.parse(payload);
//   } catch (e) {
//     return null;
//   }
// }


// export const AuthProvider= ({children})=>{

//     const [auth, Setauth] = useState(null);
//     const [claims, setClaims] = useState({roles:["guest"]});
//   const [loading, setLoading] = useState(true); // 👈 NEW


//     useLayoutEffect(()=>{

//         const iflogin=async ()=>{
//             try {
//                 const response=await axios("/iflogin",{
//                     method:"GET",
//                     withCredentials:true,
//                 });
//                 if(response?.data?.authtoken) Setauth(response.data.authtoken);
//             } catch (error) {
//                 Setauth(null);
//             }
//              finally {
//                 setLoading(false); // 👈 done checking
//              }
//         }
//          iflogin();

//          return;
//         ////////// maybe there is a problem
//     },[]);


//     useLayoutEffect(()=>{
  
//          const decoded = parseJwt(auth);setClaims(decoded);

//         const authInterceptor = axios.interceptors.request.use((config)=>{
//             config.headers.Authorization=
//             (!config._retry && auth)
//              ? `Bearer ${auth.authtoken}`
//             :config.headers.Authorization;

//         return config;
//         });

//         return ()=>{

//             axios.interceptors.request.eject(authInterceptor);
//         }
//     },[auth]);


//     useLayoutEffect(()=>{
//         const refreshInterceptor=axios.interceptors.response.use(
//             (response)=>response,
//             async (error)=>{

//                 const originresponse=error.config;
                
//                 if(error.code==="ERR_NETWORK"){
//                     Setauth(null);
//                 }else{
//                 if(error.response.status===403 &&
//                     error.response.data.msg==="Unauthorized"
//                 ){try {
//                     console.log("refresh token please and now");
//                     const response=await axios("/refresh",{
//                         method:"GET",
//                         headers:{
//                             "Content-Type": "application/x-www-form-urlencoded",
//                         },
                        
//                         withCredentials:true,
//                     });
//                     Setauth(response?.data);
//                     originresponse.headers.Authorization=`Bearer ${response?.data?.authtoken}`;
//                     originresponse._retry=true;

//                     return axios(originresponse);
                    
//                 } catch (error) {
//                     Setauth(null)
//                 }
//             }else{
//                 if(error.response.status >=400 && error.response.status!==405 )
//                     Setauth(null);
//             }
//         }
//         return Promise.reject(error)
//             },
//         );

//         return ()=>{
//             axios.interceptors.response.eject(refreshInterceptor)
//         }
//     },[]);

//     return (
//         <AuthContext.Provider value={{loading,auth,Setauth,claims,setClaims}}>
//             {children}
//         </AuthContext.Provider>
//     )
// }
// export default AuthContext;


//////////////////2
// // src/context/AuthContext.jsx
// import React, { createContext, useEffect, useLayoutEffect, useRef, useState } from "react";
// import axios from "./api/fetch"; // adjust path if needed

// const AuthContext = createContext({});

// // decode JWT payload safely (header.payload.signature)
// function parseJwt(token) {
//   if (!token) return null;
//   try {
//     const parts = token.split(".");
//     if (parts.length < 2) return null;
//     const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
//     const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");
//     const payload = atob(padded);
//     return JSON.parse(payload);
//   } catch (e) {
//     return null;
//   }
// }

// export const AuthProvider = ({ children }) => {
//   const [auth, Setauth] = useState(null); // expect object like { authtoken, ... }
//   const [claims, setClaims] = useState({ roles: ["guest"] });

//   // keep refs to avoid stale closures in interceptors
//   const authRef = useRef(auth);
//   useEffect(() => { authRef.current = auth; }, [auth]);

//   // INITIAL: check if already logged in
//   useLayoutEffect(() => {
//     let mounted = true;
//     const iflogin = async () => {
//       try {
//         const response = await axios("/iflogin", { method: "GET", withCredentials: true });
//         if (mounted && response?.data?.authtoken) {
//           Setauth(response.data);
//         }
//       } catch (err) {
//         if (mounted) Setauth(null);
//       }
//     };
//     iflogin();
//     return () => { mounted = false; };
//   }, []);

//   // update claims whenever token changes
//   useEffect(() => {
//     const decoded = auth?.authtoken ? parseJwt(auth.authtoken) : null;
//     setClaims(decoded || { roles: ["guest"] });
//   }, [auth]);

//   // Request interceptor (attach latest token)
//   const reqInterceptorId = useRef(null);
//   useEffect(() => {
//     reqInterceptorId.current = axios.interceptors.request.use(
//       (config) => {
//         const current = authRef.current;
//         if (current?.authtoken && (!config.headers || !config.headers.Authorization)) {
//           config.headers = { ...config.headers, Authorization: `Bearer ${current.authtoken}` };
//         }
//         return config;
//       },
//       (err) => Promise.reject(err)
//     );

//     return () => {
//       if (reqInterceptorId.current !== null) axios.interceptors.request.eject(reqInterceptorId.current);
//     };
//   }, []);

//   // Response interceptor with refresh queue
//   const respInterceptorId = useRef(null);
//   useLayoutEffect(() => {
//     let isRefreshing = false;
//     let failedQueue = [];

//     const processQueue = (error, token = null) => {
//       failedQueue.forEach(p => {
//         if (error) p.reject(error); else p.resolve(token);
//       });
//       failedQueue = [];
//     };

//     respInterceptorId.current = axios.interceptors.response.use(
//       (res) => res,
//       async (error) => {
//         const originalReq = error?.config;
//         // network error (no response)
//         if (!error?.response) {
//           // optionally: notify offline
//           return Promise.reject(error);
//         }

//         const status = error.response.status;
//         const body = error.response.data || {};

//         // Cases that indicate token expiry/invalidity -> try refresh
//         const isAuthError =
//           status === 401 ||
//           (status === 403 );

//         if (isAuthError && originalReq && !originalReq._retry) {
//           if (isRefreshing) {
//             // queue and wait for refresh
//             return new Promise((resolve, reject) => {
//               failedQueue.push({ resolve, reject });
//             }).then((token) => {
//               originalReq.headers.Authorization = `Bearer ${token}`;
//               originalReq._retry = true;
//               return axios(originalReq);
//             }).catch((err) => Promise.reject(err));
//           }

//           originalReq._retry = true;
//           isRefreshing = true;

//           try {
//             const refreshResp = await axios("/refresh", {
//               method: "GET",
//               withCredentials: true,
//               headers: { "Content-Type": "application/x-www-form-urlencoded" },
//             });

//             const newAuth = refreshResp?.data;
//             if (!newAuth?.authtoken) throw new Error("No token from refresh");

//             // update auth (state + ref will align)
//             Setauth(newAuth);

//             // resolve queued requests
//             processQueue(null, newAuth.authtoken);
//             isRefreshing = false;

//             // retry original request
//             originalReq.headers.Authorization = `Bearer ${newAuth.authtoken}`;
//             return axios(originalReq);
//           } catch (refreshErr) {
//             processQueue(refreshErr, null);
//             isRefreshing = false;
//             Setauth(null); // logout if refresh failed
//             return Promise.reject(refreshErr);
//           }
//         }

//         // For other 4xx/5xx: don't logout. Only optionally logout on specific server signals.
//         return Promise.reject(error);
//       }
//     );

//     return () => {
//       if (respInterceptorId.current !== null) axios.interceptors.response.eject(respInterceptorId.current);
//     };
//   }, []);

//   // helpers
//   const logout = async () => {
//     try {
//       await axios("/logout", { method: "POST", withCredentials: true });
//     } catch (e) {  }
//     Setauth(null);
//   };

//   const login = (newAuth) => {
//     Setauth(newAuth);
//   };

//   return (
//     <AuthContext.Provider value={{ auth, Setauth, claims, setClaims, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export default AuthContext;



//////////////version3 

// src/context/AuthContext.jsx
import React, { createContext, useEffect, useRef, useState } from "react";
import axios from "./api/fetch";

const AuthContext = createContext({});
 
async function  parseJwt(token) {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");
    const payload = atob(padded);
    return JSON.parse(payload);
  } catch (e) {
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [auth, Setauth] = useState(null); // { authtoken, ... }
  const [claims, setClaims] = useState({role:{uuid:"guest"}});
  const [loading, setLoading] = useState(true);

  // keep a ref to latest auth to avoid stale closures in interceptors
  const authRef = useRef(auth);
  useEffect(() => { authRef.current = auth; }, [auth]);

  // Initial login check
  useEffect(() => {
    let mounted = true;
    const iflogin = async () => {
      try {
        const resp = await axios("/iflogin", { method: "GET", withCredentials: true });
        if (mounted && resp?.data) {
          // Expect backend to return object like { authtoken, user, ... }
          Setauth(resp.data);
        }
      } catch (err) {
        if (mounted) Setauth(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    iflogin();
    return () => { mounted = false; };
  }, []);

  // Update claims whenever token changes
  useEffect(() => {
    const token = auth?.authtoken;
    const decoded =  token ?   decodeToken(token) : null;
    if(!decoded) return setClaims({role:{uuid:"guest"}});

    
    setClaims(decoded.result || {role:{uuid:"guest"}});
  }, [auth]);

  // Request interceptor: attach latest token
  const reqInterceptorId = useRef(null);
  useEffect(() => {
    reqInterceptorId.current = axios.interceptors.request.use(
      (config) => {
        const current = authRef.current;
        if (current?.authtoken) {
          config.headers = { ...config.headers, Authorization: `Bearer ${current.authtoken}` };
        }
        return config;
      },
      (err) => Promise.reject(err)
    );
    return () => {
      if (reqInterceptorId.current !== null) axios.interceptors.request.eject(reqInterceptorId.current);
    };
  }, []);

  // Response interceptor with refresh queue
  const respInterceptorId = useRef(null);
  useEffect(() => {
    let isRefreshing = false;
    let failedQueue = [];

    const processQueue = (error, token = null) => {
      failedQueue.forEach(p => {
        if (error) p.reject(error);
        else p.resolve(token);
      });
      failedQueue = [];
    };

    respInterceptorId.current = axios.interceptors.response.use(
      (res) => res,
      async (error) => {
        const originalReq = error?.config;
        // No response (network) -> bubble up or handle offline
        if (!error?.response || error.code === "ERR_NETWORK") {
            Setauth(null)
          return Promise.reject(error);
        }

        const status = error.response.status;
        const isAuthError = status === 401 ;

        if (isAuthError && originalReq && !originalReq._retry) {
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            }).then((token) => {
              originalReq.headers.Authorization = `Bearer ${token}`;
              originalReq._retry = true;
              return axios(originalReq);
            });
          }

          originalReq._retry = true;
          isRefreshing = true;

          try {
            const refreshResp = await axios("/refresh", {
              method: "GET",
              withCredentials: true,
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
            });

            const newAuth = refreshResp?.data;
            if (!newAuth?.authtoken) throw new Error("No token from refresh");

            Setauth(newAuth);
            processQueue(null, newAuth.authtoken);
            isRefreshing = false;

            originalReq.headers.Authorization = `Bearer ${newAuth.authtoken}`;
            return axios(originalReq);
          } catch (refreshErr) {
            processQueue(refreshErr, null);
            isRefreshing = false;
            Setauth(null);
            return Promise.reject(refreshErr);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      if (respInterceptorId.current !== null) axios.interceptors.response.eject(respInterceptorId.current);
    };
  }, []);

  // helpers
  const logout = async () => {
    try {
      await axios("/logout", { method: "POST", withCredentials: true });
    } catch (e) { /* ignore */ }
    Setauth(null);
  };

  const login = (newAuth) => {
    Setauth(newAuth);
  };

  return (
    <AuthContext.Provider value={{ loading, auth, Setauth, claims, setClaims, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

function decodeToken(token) {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    // base64url -> base64
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error("Failed to decode token", err);
    return null;
  }
}