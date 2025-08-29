import React, { useContext, useRef, useState } from 'react';
import './AuthFlip.css'; // Make sure you have the CSS from earlier
import useAuth from '../../Hooks/useAuth';

import { replace, useNavigate } from 'react-router-dom';
import axios ,{originalAxios}from '../../api/fetch'
import useNotification from '../../Hooks/useNotification';
import AuthContext from '../../auth';

export default function AuthFlip() {
  const [isSignup, setIsSignup] = useState(false);

  // Separate states for login and signup form data
  const [loginData, setLoginData] = useState({ email: '', password: '',phoneNumber:'' });
  const [signupData, setSignupData] = useState({ email: '', password: '', confirmPassword: '',bio:"",username:"",name:"",phoneNumber:"" });

  // Separate validation states
  const [loginValidated, setLoginValidated] = useState(false);
  const [signupValidated, setSignupValidated] = useState(false);

  // Separate number or email
  const [isEmail, setIsEmail]=useState(true);
  // Separate password visibility toggles
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const{Setauth,auth}=useContext(AuthContext);
  const{showNotification}=useNotification();
  const navigate=useNavigate();

  // Handlers for login form changes
  const handleLoginChange = (e) => {
    setLoginData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };
  // Handlers for signup form changes
  const handleSignupChange = (e) => {
    setSignupData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Login submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginValidated(true);
    if(isEmail){
      if (
        !loginData.email.trim() ||
        !loginData.password.trim() ||
        loginData.password.length < 6||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginData.email)
      ) return;
      
      setLoginData({...loginData,phoneNumber:""})
    }else{ setLoginData({...loginData,email:""})}
     

    controllerRef.current = new AbortController();
    

      try {

        const response = await axios.post("/login",
          loginData
          ,{
          signal:controllerRef.current.signal,
          showSuccessNotification: true,
        });
        Setauth(response.data.authtoken);


   
      } catch (error) {
        if (originalAxios.isCancel(error)|| error.name === 'CanceledError') {
          showNotification("warning","Request canceled");

        } else {
          showNotification("error",(error?.response?.data?.err||"Please Try Again")+'  '+error?.response?.data?.msg )
        }
        return;
      }

    setLoginValidated(false);
    setLoginData({ email: '', password: '' ,phone_number:""});
    setShowLoginPassword(false);
  // return navigate('/profile',{replace});
  };

  // Signup submit
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setSignupValidated(true);

    if (
      
      !signupData.password.trim() ||
      signupData.password.length < 6 ||
      signupData.password !== signupData.confirmPassword||
      !signupData.name.trim()||
      !signupData.phoneNumber.trim()
    )   {
      showNotification("error","Try To ReEnter Your Information"); 
 return;}

    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    controllerRef.current = new AbortController();


      try {

        const response = await axios.post("/signup",
          signupData
          ,{
          signal:controllerRef.current.signal,
          showSuccessNotification: true,
        });
                
        showNotification("success","لقد سجلت بنجاح")
      } catch (error) {
        if (originalAxios.isCancel(error)|| error.name === 'CanceledError') {
          showNotification("warning","Request canceled");

        } else {
          showNotification("error",error)
        }
        return;
      }

  
      
      
      
      showNotification("success","لقد سجلت بنجاح");
      setSignupValidated(false);
      setSignupData({ email: '', password: '', confirmPassword: '',bio:"",username:"",name:"",phoneNumber:"" });
      setShowSignupPassword(false);
      setShowConfirmPassword(false);
    return navigate('/log',{replace});
  };

  // Toggle between login and signup
  const toggleForm = () => {
    setIsSignup(!isSignup);
    // Reset all states when toggling
    setLoginValidated(false);
    setSignupValidated(false);
    setLoginData({ email: '', password: '' });
    setSignupData({ email: '', password: '', confirmPassword: '',bio:"",username:"",name:"",phoneNumber:"" });
    setShowLoginPassword(false);
    setShowSignupPassword(false);
    setShowConfirmPassword(false);
  };





   const controllerRef = useRef(null);


  return (
    <div className='oll'>
    <div className="flip-card">
      <div className={`flip-card-inner ${isSignup ? 'flipped' : ''}`}>

        {/* Login form */}
        <div className={`flip-card-front ${(!isSignup )? 'loginset' : "loginsetnull"}`}
        style={{display: (!isSignup)?"":"none"}}>
          <h3 className="auth-header">Login</h3>
          <form
            noValidate
            className={loginValidated ? 'was-validated' : ''}
            onSubmit={handleLoginSubmit}
          >
            {isEmail ? (
            <div className="mb-3">
              <label htmlFor="loginEmail " className="form-label" >Email</label>
              <input
                dir='ltr'
                type="email"
                className={`form-control ${
                  loginValidated && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginData.email)
                 ?    'is-invalid'
                    : ''
                    }`}                
                id="loginEmail"
                name="email"
                value={loginData.email}
                onChange={handleLoginChange}
                required
              />
                {loginValidated && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginData.email) && (
                    <div className="invalid-feedback">Please enter a valid email address.</div>
                )}            
            </div>

            ):(
            <div className=''>
              <label htmlFor="phonenumber" className='form-label'>Phone Number (Syria):</label>
              <div className='input-group'>

              <input
                type="tel"
                id="phonenumber"
                name="phoneNumber"
                value={loginData.phoneNumber}
                onKeyDown={(e) => {
                  const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab'];
                  if (!/^\d$/.test(e.key) && !allowedKeys.includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                onChange={ handleLoginChange}
                placeholder="09XXXXXXXX"
                className={`form-control ${
                  loginValidated && ! /^09\d{8}$/.test(loginData.phoneNumber)
                 ?    'is-invalid'
                    : ''
                    }`}  
                minLength={10}
                maxLength={10}
                />
                 <span
                   className="input-group-text "
                   style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                  963+   <img className='ms-2' src="//upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Emojione_1F1F8-1F1FE_New.svg/40px-Emojione_1F1F8-1F1FE_New.svg.png"  width="32" height="32"  ></img> 
                 </span>
              {loginValidated && !/^09\d{8}$/.test(loginData.phoneNumber) && <small className="text-danger">Please enter a valid Phone number.</small>}
              </div>
            </div>
            // <div className="">
            //   <label htmlFor="loginPassword" className="form-label">Password</label>
            //   <div className="input-group">
            //     <input
            //       type={showLoginPassword ? 'text' : 'password'}
            //       className={`form-control ${
            //         loginValidated && loginData.password.length < 6 ? 'is-invalid' : ''
            //       }`}
            //       id="loginPassword"
            //       name="password"
            //       value={loginData.password}
            //       onChange={handleLoginChange}
            //       required
            //       minLength={6}
            //     />
            //     <span
            //       className="input-group-text"
            //       onClick={() => setShowLoginPassword(!showLoginPassword)}
            //       style={{ cursor: 'pointer', userSelect: 'none' }}
            //     >
            //       <i className={`bi ${showLoginPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
            //     </span>
            //      {loginValidated && loginData.password.length < 6 && (
            //      <div className="invalid-feedback">Password must be at least 6 characters.</div>
            //     )}
            //   </div>
            // </div>

            )}

            <div className="mb-3">
              <label htmlFor="loginPassword" className="form-label">Password</label>
              <div className="input-group">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  className={`form-control ${
                    loginValidated && loginData.password.length < 6 ? 'is-invalid' : ''
                  }`}
                  dir='ltr'
                  id="loginPassword"
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  required
                  minLength={6}
                />
                <span
                  className="input-group-text"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  <i className={`bi ${showLoginPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </span>
                 {loginValidated && loginData.password.length < 6 && (
                 <div className="invalid-feedback">Password must be at least 6 characters.</div>
                )}
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-100 mt-3">Login</button>
          </form>
            <div className="mt-3 text-center">
            تسجيل الدخول بأستخدام ؟{' '}
            <button className="btn btn-link p-0" onClick={()=>{ setIsEmail((prev)=>!prev);  if(isEmail){setLoginData({...loginData,phoneNumber:""})}else{setLoginData({...loginData,email:""})}}} type="button">
            {!isEmail?"Email":"رقم الهاتف" }
            </button>
            </div>
        
          <div className="mt-3 text-center">
            Don't have an account?{' '}
            <button className="btn btn-link p-0" onClick={toggleForm} type="button">
              Sign up
            </button>
          </div>
        </div>

        {/* Signup form */}
        <div className={`flip-card-back ${(isSignup) ? "signupset" :'signupsetnull'}`}
        style={{display: (isSignup)?"":"none"}} >
          <h3 className="auth-header">Sign Up</h3>
          <form
            noValidate
            className={signupValidated ? 'was-validated' : ''}
            onSubmit={handleSignupSubmit}
          >
<div className="mb-3">
  <label htmlFor="signupName" className="form-label">Full Name</label>
  <input
    type="text"
    id="signupName"
    name="name"
    value={signupData.name}
    onChange={handleSignupChange}
    required
    className={`form-control ${
      signupValidated && signupData.name.trim() === '' ? 'is-invalid' : ''
    }`}
  />
  {signupValidated && signupData.name.trim() === '' && (
    <div className="invalid-feedback">Full name is required.</div>
  )}
</div>
{/* Username (Optional) */}
<div className="mb-3">
  <label htmlFor="signupUsername" className="form-label"> <strong>(اختباري)</strong> Username </label>
  <input
    type="text"
    id="signupUsername"
    name="username"
    value={signupData.username}
    onChange={handleSignupChange}
    className="form-control"
  />
</div>


             <div className=''>
              <label htmlFor="phonenumber" className='form-label'>Phone Number (Syria):</label>
              <div className='input-group'>

              <input
                type="tel"
                id="phonenumber"
                name="phoneNumber"
                value={signupData.phoneNumber}
                onKeyDown={(e) => {
                  const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab'];
                  if (!/^\d$/.test(e.key) && !allowedKeys.includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                onChange={ handleSignupChange}
                placeholder="09XXXXXXXX"
                className={`form-control ${
                  signupValidated && ! /^09\d{8}$/.test(signupData.phoneNumber)
                 ?    'is-invalid'
                    : ''
                    }`}  
                minLength={10}
                maxLength={10}
                />
                 <span
                   className="input-group-text "
                   style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                  963+   <img className='ms-2' src="//upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Emojione_1F1F8-1F1FE_New.svg/40px-Emojione_1F1F8-1F1FE_New.svg.png"  width="32" height="32"  ></img> 
                 </span>
              {signupValidated && !/^09\d{8}$/.test(signupData.phoneNumber) && <small className="text-danger">Please enter a valid Phone number.</small>}
              </div>
            </div>
           
            <div className="mb-3">
              <label htmlFor="signupEmail" className="form-label"> <strong>(اختباري)</strong>  Email </label>
              <input
              dir='ltr'
                type="email"
                id="signupEmail"
                name="email"
                value={signupData.email}
                onChange={handleSignupChange}
                required
                   className={`form-control ${
                    signupValidated && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupData.email)
                  ? 'is-invalid'
                 : ''
                     }`}
                
                
              />
               {signupValidated && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupData.email) && (
    <div className="invalid-feedback">Please enter a valid email address.</div>
  )}
            </div>


<div className="mb-3">
  <label htmlFor="signupBio" className="form-label"> <strong>(اختباري)</strong> Bio </label>
  <textarea
    id="signupBio"
    name="bio"
    value={signupData.bio}
    onChange={handleSignupChange}
    rows="3"
    className="form-control"
    placeholder="Tell us something about yourself..."
  />
</div>

            <div className="mb-3">
              <label htmlFor="signupPassword" className="form-label">Password</label>
              <div className="input-group">
                <input
                dir='ltr'
                  type={showSignupPassword ? 'text' : 'password'}
                  className={`form-control ${
                    signupValidated && signupData.password.length < 6 ? 'is-invalid' : ''
                  }`}
                  id="signupPassword"
                  name="password"
                  value={signupData.password}
                  onChange={handleSignupChange}
                  required
                  minLength={6}
                />
                <span
                  className="input-group-text"
                  onClick={() => setShowSignupPassword(!showSignupPassword)}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  <i className={`bi ${showSignupPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </span>
                  {signupValidated && signupData.password.length < 6 && (
                    <div className="invalid-feedback">Password must be at least 6 characters.</div>
                    )}
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <div className="input-group">
                <input
                dir='ltr'
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`form-control ${
                    signupValidated && signupData.confirmPassword !== signupData.password
                      ? 'is-invalid'
                      : ''
                  }`}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={signupData.confirmPassword}
                  onChange={handleSignupChange}
                  required
                  minLength={6}
                />
                <span
                  className="input-group-text"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </span>

                {signupValidated && signupData.confirmPassword !== signupData.password && (
                    <div className="invalid-feedback">Passwords do not match.</div>
                )}           
             </div>
            </div>

            <button type="submit" className="btn btn-primary w-100 mt-3">Sign Up</button>
          </form>
          <div className="mt-3 text-center">
            Already have an account?{' '}
            <button className="btn btn-link p-0" onClick={toggleForm} type="button">
              Log in
            </button>
          </div>
        </div>

      </div>
    </div>
    </div>
  );
}
