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

  const checkAuthStatus = async () => {
    try {
      // Check authentication status with server using HttpOnly cookies
      const response = await fetch('/api/admin/verify', {
        method: 'GET',
        credentials: 'include', // Include HttpOnly cookies
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setIsAuthenticated(true);
          setNeedsTwoFactor(false);
        } else {
          setIsAuthenticated(false);
          setNeedsTwoFactor(false);
        }
      } else if (response.status === 401) {
        // Try to refresh token
        const refreshResponse = await fetch('/api/admin/refresh', {
          method: 'POST',
          credentials: 'include',
        });

        if (refreshResponse.ok) {
          // Token refreshed successfully, check auth again
          const verifyResponse = await fetch('/api/admin/verify', {
            method: 'GET',
            credentials: 'include',
          });

          if (verifyResponse.ok) {
            const data = await verifyResponse.json();
            setIsAuthenticated(data.success);
          } else {
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth verification error:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTwoFactorSettings = async () => {
    try {
      // Load 2FA settings from server instead of localStorage
      const response = await fetch('/api/admin/2fa/settings', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.settings) {
          setTwoFactorSettings(data.settings);
        }
      }
    } catch (error) {
      console.error('Failed to load 2FA settings:', error);
      // Fallback to localStorage for now (will be removed after server-side storage)
      const settings = localStorage.getItem("zolo_admin_2fa_settings");
      if (settings) {
        setTwoFactorSettings(JSON.parse(settings));
      }
    }
  };

  const saveTwoFactorSettings = async (settings: TwoFactorSettings) => {
    try {
      // Save 2FA settings to server
      const response = await fetch('/api/admin/2fa/settings', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings }),
      });

      if (response.ok) {
        setTwoFactorSettings(settings);
      }
    } catch (error) {
      console.error('Failed to save 2FA settings:', error);
      // Fallback to localStorage (will be removed)
      localStorage.setItem("zolo_admin_2fa_settings", JSON.stringify(settings));
      setTwoFactorSettings(settings);
    }
  };

  const completeTwoFactorSetup = async (method: 'sms' | 'email' | 'totp', contact?: string, secret?: string) => {
    const settings: TwoFactorSettings = {
      enabled: true,
      method,
      contact,
      secret
    };

    await saveTwoFactorSettings(settings);
    setNeedsTwoFactor(false);
    setIsAuthenticated(true);
  };

  const verifyTwoFactor = async (code: string) => {
    try {
      const response = await fetch('/api/admin/2fa/verify', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNeedsTwoFactor(false);
          setIsAuthenticated(true);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('2FA verification error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Call server logout endpoint
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    // Clear any remaining localStorage (for backward compatibility)
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

  const disableTwoFactor = async () => {
    const settings: TwoFactorSettings = {
      enabled: false,
      method: 'totp'
    };

    await saveTwoFactorSettings(settings);
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