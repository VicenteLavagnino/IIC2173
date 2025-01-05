// WalletPage.js
import React from "react";
import { Container } from "reactstrap";
import MyNavbar from "../components/navbar"; // Asegúrate de que la ruta sea correcta
import MyWallet from "../components/wallet"; // Asegúrate de que la ruta sea correcta

function WalletPage() {
  return (
    <Container>
      <div>
        <MyNavbar />
      </div>
      <div>
        <MyWallet />
      </div>
    </Container>
  );
}

export default WalletPage;
