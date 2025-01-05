import React from "react";
import { Container } from "reactstrap";
import MyNavbar from "../components/navbar";
import PurchasedBonds from "../components/purchasedBonds";

function MyBondsPage() {
  return (
    <Container>
      <div>
        <MyNavbar />
      </div>
      <div>
        <PurchasedBonds />
      </div>
      <br></br>
    </Container>
  );
}

export default MyBondsPage;
