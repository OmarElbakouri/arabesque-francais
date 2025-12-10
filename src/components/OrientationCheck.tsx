import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "@/lib/api";

interface OrientationCheckProps {
  children: React.ReactNode;
}

/**
 * Component that checks if user has completed the orientation test
 * Redirects to /orientation-test if not completed
 * Skips check for admin and commercial users
 */
export const OrientationCheck = ({ children }: OrientationCheckProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    const checkOrientation = async () => {
      try {
        // Get user info to check role
        const token = localStorage.getItem("token");
        if (!token) {
          setIsChecking(false);
          return;
        }

        // Check user role - skip for ADMIN and COMMERCIAL
        const userRole = localStorage.getItem("userRole");
        if (userRole === "ADMIN" || userRole === "COMMERCIAL") {
          setHasCompleted(true);
          setIsChecking(false);
          return;
        }

        // Check orientation status
        const response = await api.get("/orientation-test/status");
        
        if (!response.data.completed) {
          // Don't redirect if already on orientation test page
          if (location.pathname !== "/orientation-test") {
            navigate("/orientation-test", { replace: true });
          }
        } else {
          setHasCompleted(true);
        }
      } catch (error) {
        console.error("Failed to check orientation status:", error);
        // On error, let user continue (don't block the app)
        setHasCompleted(true);
      } finally {
        setIsChecking(false);
      }
    };

    checkOrientation();
  }, [navigate, location.pathname]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!hasCompleted && location.pathname !== "/orientation-test") {
    return null;
  }

  return <>{children}</>;
};

export default OrientationCheck;
