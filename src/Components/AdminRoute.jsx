import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const user = localStorage.getItem("user_id");
  const role = localStorage.getItem("user_role");

  if (!user) return <Navigate to="/login" />;
  if (role !== "admin") return <Navigate to="/weather" />;

  return children;
};

export default AdminRoute;