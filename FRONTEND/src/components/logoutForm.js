import { useAuth0 } from "@auth0/auth0-react";
import React from "react";

export const Logout = () => {
  const { logout } = useAuth0();

  const handleLogout = async () => {
    await logout({
      appState: {
        returnTo: "/",
      },
      audience: process.env.REACT_APP_AUTH0_AUDIENCE,
      scope: "openid profile email",
    });
  };

  return (
    <button className="logout-button" onClick={handleLogout}>
      Log out
    </button>
  );
};

export default Logout;
