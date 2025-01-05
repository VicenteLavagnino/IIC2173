import React from "react";
import MyNavbar from "../components/navbar";
import { Container } from "reactstrap";
import SignUpForm from "../components/singupForm";

function SignUp() {
  return (
    <Container>
      <MyNavbar />
      <SignUpForm />
    </Container>
  );
}

export default SignUp;
