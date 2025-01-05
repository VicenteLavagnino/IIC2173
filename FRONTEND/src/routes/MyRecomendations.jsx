// WalletPage.js
import React from "react";
import { Container } from "reactstrap";
import MyNavbar from "../components/navbar"; // Asegúrate de que la ruta sea correcta
import MakePrediction from "../components/recomendation";
function RecomendationPage() {
  return (
    <Container>
      <div>
        <MyNavbar />
      </div>
      <div>
        <MakePrediction />
      </div>
    </Container>
  );
}

export default RecomendationPage;
