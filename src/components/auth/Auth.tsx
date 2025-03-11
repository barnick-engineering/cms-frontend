// @ts-nocheck
import { useState, useEffect } from "react";
import { Navigate } from "react-router";
// ... your other imports

// Protected route component
function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("access"); // or any other auth method you use

    if (token) {
      setIsAuthenticated(true);
    }

    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Or your loading component
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" />;
  }

  return children;
}

export default ProtectedRoute;
