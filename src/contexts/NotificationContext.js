import React, { createContext, useState, useCallback, useEffect } from 'react';
import axios ,{originalAxios} from '../api/fetch'
export const NotificationContext = createContext();

let idCounter = 0; // simple id generator

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Add new notification
  const showNotification = useCallback((type, message, duration = 3000) => {
    const id = idCounter++;
    setNotifications((prev) => [...prev, { id, type, message }]);

    // Remove notification after duration
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, duration);
  }, []);
  



  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}

      <div className="notification-container">
        {notifications.map(({ id, type, message }) => (
          <div key={id} className={`notification-popup ${type}`}>
            {message}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const attachNotificationInterceptor = (axios, showNotification) => {
  axios.interceptors.response.use(
    (response) => {
      if (response.status===200 ) {
        showNotification("success", response.data.msg || "تمت العملية بنجاح");
      }
      return response;
    },
    (error) => {
      const message =
        error.response?.data?.msg ||
        error.message ||
        "حدث خطأ ما أثناء الطلب";
      if(message!=="not loged in")
      showNotification("error", message);
      return Promise.reject(error);
    }
  );
};


export default NotificationContext;
