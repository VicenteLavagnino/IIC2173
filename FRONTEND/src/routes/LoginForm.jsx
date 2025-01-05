import React from "react";
import Login from "../components/loginForm";
import MyNavbar from "../components/navbar";
import { Container } from "reactstrap";

function LoginForm() {
  return (
    <>
      <MyNavbar />
      <Container>
        <Login />
      </Container>
    </>
  );
}

export default LoginForm;
