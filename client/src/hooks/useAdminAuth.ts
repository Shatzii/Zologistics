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
    checkAuthStatus();
    loadTwoFactorSettings();
  }, []);

  const checkAuthStatus = () => {
    const isAuth = localStorage.getItem("zolo_admin_authenticated") === "true";
    const loginTime = localStorage.getItem("zolo_admin_login_time");
    const twoFactorVerified = localStorage.getItem("zolo_admin_2fa_verified") === "true";
    
    if (isAuth && loginTime) {
      const now = Date.now();
      const loginTimestamp = parseInt(loginTime);
      const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours
      
      if (now - loginTimestamp < sessionDuration) {
        if (twoFactorSettings.enabled && !twoFactorVerified) {
          setNeedsTwoFactor(true);
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
          setNeedsTwoFactor(false);
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

  const logout = () => {
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