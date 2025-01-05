// src/components/SignupForm.js
import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

const SignupForm = () => {
  const { loginWithRedirect } = useAuth0();

  const handleSignup = () => {
    loginWithRedirect({
      screen_hint: "signup",
      audience: process.env.REACT_APP_AUTH0_AUDIENCE,
      scope: "read:fixtures write:bonds write:funds read:users",
    });
  };

  return (
    <div>
      <button className="signup-button" onClick={handleSignup}>
        Regístrate
      </button>
    </div>
  );
};

export default SignupForm;
