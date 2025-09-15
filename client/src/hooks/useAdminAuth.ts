import { useState, useEffect } from "react";

export interface TwoFactorSettings {
  enabled: boolean;
  method: 'sms' | 'email' | 'totp';
  contact?: string;
  secret?: string;
}

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [needsTwoFactor, setNeedsTwoFactor] = useState(false);
  const [twoFactorSettings, setTwoFactorSettings] = useState<TwoFactorSettings>({
    enabled: false,
    method: 'totp'
  });

  useEffect(() => {
    const initAuth = async () => {
      await checkAuthStatus();
      loadTwoFactorSettings();
    };
    initAuth();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem("zolo_admin_token");
    const loginTime = localStorage.getItem("zolo_admin_login_time");
    const twoFactorVerified = localStorage.getItem("zolo_admin_2fa_verified") === "true";
    
    if (token && loginTime) {
      const now = Date.now();
      const loginTimestamp = parseInt(loginTime);
      const sessionDuration = 8 * 60 * 60 * 1000; // 8 hours (matches JWT expiry)
      
      if (now - loginTimestamp < sessionDuration) {
        try {
          // Verify token with server
          const response = await fetch('/api/admin/verify', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              if (twoFactorSettings.enabled && !twoFactorVerified) {
                setNeedsTwoFactor(true);
                setIsAuthenticated(false);
              } else {
                setIsAuthenticated(true);
                setNeedsTwoFactor(false);
              }
            } else {
              logout();
            }
          } else {
            // Token is invalid
            logout();
          }
        } catch (error) {
          console.error('Auth verification error:', error);
          logout();
        }
      } else {
        // Session expired
        logout();
      }
    } else {
      setIsAuthenticated(false);
      setNeedsTwoFactor(false);
    }
    
    setIsLoading(false);
  };

  const loadTwoFactorSettings = () => {
    const settings = localStorage.getItem("zolo_admin_2fa_settings");
    if (settings) {
      setTwoFactorSettings(JSON.parse(settings));
    }
  };

  const saveTwoFactorSettings = (settings: TwoFactorSettings) => {
    localStorage.setItem("zolo_admin_2fa_settings", JSON.stringify(settings));
    setTwoFactorSettings(settings);
  };

  const completeTwoFactorSetup = (method: 'sms' | 'email' | 'totp', contact?: string, secret?: string) => {
    const settings: TwoFactorSettings = {
      enabled: true,
      method,
      contact,
      secret
    };
    saveTwoFactorSettings(settings);
    setNeedsTwoFactor(false);
    setIsAuthenticated(true);
  };

  const verifyTwoFactor = () => {
    localStorage.setItem("zolo_admin_2fa_verified", "true");
    setNeedsTwoFactor(false);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    const token = localStorage.getItem("zolo_admin_token");
    
    // Call server logout endpoint if token exists
    if (token) {
      try {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    // Clear all local storage
    localStorage.removeItem("zolo_admin_token");
    localStorage.removeItem("zolo_admin_user");
    localStorage.removeItem("zolo_admin_authenticated");
    localStorage.removeItem("zolo_admin_login_time");
    localStorage.removeItem("zolo_admin_2fa_verified");
    setIsAuthenticated(false);
    setNeedsTwoFactor(false);
  };

  const requireAuth = () => {
    if (!isAuthenticated && !isLoading) {
      window.location.href = "/admin-login";
      return false;
    }
    return true;
  };

  const disableTwoFactor = () => {
    const settings: TwoFactorSettings = {
      enabled: false,
      method: 'totp'
    };
    saveTwoFactorSettings(settings);
    localStorage.removeItem("zolo_admin_2fa_verified");
  };

  return {
    isAuthenticated,
    isLoading,
    needsTwoFactor,
    twoFactorSettings,
    logout,
    requireAuth,
    checkAuthStatus,
    completeTwoFactorSetup,
    verifyTwoFactor,
    disableTwoFactor,
    saveTwoFactorSettings
  };
}