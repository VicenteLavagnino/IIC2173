import { useAuth0 } from "@auth0/auth0-react";
import React from "react";

export const Login = () => {
  const { loginWithRedirect } = useAuth0();

  const handleLogin = async () => {
    // console.log("REACT_APP_AUTH0_AUDIENCE:", process.env.REACT_APP_AUTH0_AUDIENCE);
    await loginWithRedirect({
      appState: {
        returnTo: "/callback",
      },
      audience: process.env.REACT_APP_AUTH0_AUDIENCE,
      scope: "openid profile email create:users read:users",
    });
  };

  return (
    <button className="login-button" onClick={handleLogin}>
      Log In
    </button>
  );
};

export default Login;
