import { useState, useEffect } from "react";

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const isAuth = localStorage.getItem("zolo_admin_authenticated") === "true";
    const loginTime = localStorage.getItem("zolo_admin_login_time");
    
    if (isAuth && loginTime) {
      const now = Date.now();
      const loginTimestamp = parseInt(loginTime);
      const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours
      
      if (now - loginTimestamp < sessionDuration) {
        setIsAuthenticated(true);
      } else {
        // Session expired
        logout();
      }
    } else {
      setIsAuthenticated(false);
    }
    
    setIsLoading(false);
  };

  const logout = () => {
    localStorage.removeItem("zolo_admin_authenticated");
    localStorage.removeItem("zolo_admin_login_time");
    setIsAuthenticated(false);
  };

  const requireAuth = () => {
    if (!isAuthenticated && !isLoading) {
      window.location.href = "/admin-login";
      return false;
    }
    return true;
  };

  return {
    isAuthenticated,
    isLoading,
    logout,
    requireAuth,
    checkAuthStatus
  };
}