import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import Login from "./components/Login.jsx";
import Dashboard from "./components/Dashboard.jsx";
import EmployeeList from "./components/EmployeeList.jsx";
import { refreshAccessToken, logoutUser } from "./utils/api.js";
import CreateEmployee from "./components/CreateEmployee.jsx";
import EditEmployee from "./components/EditEmployee.jsx";

export default function App() {
  const [user, setUser] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedRefreshToken = localStorage.getItem("refreshToken");
    if (storedUser && storedRefreshToken) {
      setUser(JSON.parse(storedUser));
      setRefreshToken(storedRefreshToken);
    }
  }, []);

  useEffect(() => {
    if (refreshToken) {
      const refreshTokenInterval = setInterval(async () => {
        try {
          await refreshAccessToken(refreshToken,{
            withCredentials: true
          });
        } catch (error) {
          console.error("Failed to refresh token:", error);
          handleLogout();
        }
      }, 2*24*60 * 60 * 1000);

      return () => {
        clearInterval(refreshTokenInterval);
      };
    }
  }, [refreshToken]);

  const handleLogin = (username, newRefreshToken) => {
    const userData = { username };
    setUser(userData);
    setRefreshToken(newRefreshToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("refreshToken", newRefreshToken);
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setRefreshToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("refreshToken");
  };

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/dashboard" />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            user ? (
              <Dashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        >
          <Route
            index
            element={
              <h1 className="text-5xl  font-bold my-5 p-4">
                Welcome to the <span className="text-primary">Dashboard </span>
              </h1>
            }
          />
          <Route path="employees" element={<EmployeeList />} />
          <Route path="editEmployee/:id" element={<EditEmployee />} />
          <Route path="createEmployee" element={<CreateEmployee />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}
