//-----------------------------------------
//PrivateRoute.jsx
//------------------------------------------

import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const user = localStorage.getItem("user_id");

  return user ? children : <Navigate to="/" />;
};

export default PrivateRoute;