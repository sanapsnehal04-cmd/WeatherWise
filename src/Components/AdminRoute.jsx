import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

const AdminRoute = ({ children }) => {

  const role = localStorage.getItem("user_role");

  return role === "admin"
    ? children
    : <Navigate to="/weather" />;
};

export default AdminRoute;