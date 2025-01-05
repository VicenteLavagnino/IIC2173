import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  CardText,
  ListGroup,
  ListGroupItem,
} from "reactstrap";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";

const PurchasedBonds = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [bonds, setBonds] = useState([]);
  const [error, setError] = useState(null);

  const fetchPurchasedBonds = useCallback(async () => {
    try {
      const token = await getAccessTokenSilently({
        audience: process.env.REACT_APP_AUTH0_AUDIENCE,
        scope: "read:bonds",
      });

      const response = await axios.get(
        `${process.env.REACT_APP_URL_API}/users/me/purchased_bonds`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBonds(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching purchased bonds:", error);
      setError("No se pudo obtener la lista de bonos comprados.");
    }
  }, [getAccessTokenSilently]);

  useEffect(() => {
    fetchPurchasedBonds();
  }, [fetchPurchasedBonds]);

  return (
    <Card className="my-2">
      <CardHeader>Bonos Comprados</CardHeader>
      <CardBody>
        {error && <p className="text-danger">{error}</p>}
        {bonds.length === 0 && !error ? (
          <CardText>No has comprado ningún bono aún.</CardText>
        ) : (
          <ListGroup>
            {bonds.map((bond) => (
              <ListGroupItem key={bond.request_id}>
                <CardTitle tag="h6">
                  {bond.fixture_id ? `Fixture ID: ${bond.fixture_id}` : "Detalles del fixture no disponibles."}
                </CardTitle>
                <CardText>Resultado Apostado: {bond.result}</CardText>
                <CardText>Cantidad: {bond.quantity}</CardText>
                <CardText style={{ marginBottom: "10px" }}>Estado: {bond.status}</CardText>
              </ListGroupItem>
            ))}
          </ListGroup>
        )}
      </CardBody>
    </Card>
  );
};

export default PurchasedBonds;
