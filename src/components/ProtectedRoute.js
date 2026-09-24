"use client";

import { useEffect, useState } from "react";

const ProtectedRoute = ({ children }) => {

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {

    const token = localStorage.getItem("accessToken");

    console.log("Token:", token);

    if (!token) {
      window.location.href = "/login";
    } else {
      setIsAuthenticated(true);
    }

  }, []);

  if (!isAuthenticated) {
    return <p>Checking authentication...</p>;
  }

  return children;
};

export default ProtectedRoute;