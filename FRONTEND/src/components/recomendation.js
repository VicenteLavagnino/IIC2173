import React, { useState, useEffect, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { Container, Card, CardBody, CardTitle, Alert } from "reactstrap";
import Match from "../routes/Match";

const MakePrediction = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [predictions, setPredictions] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPredictions = useCallback(async () => {
    try {
      const token = await getAccessTokenSilently({
        audience: process.env.REACT_APP_AUTH0_AUDIENCE,
        scope: "read:predictions",
      });

      const response = await axios.get(
        `${process.env.REACT_APP_URL_API}/recommendations`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPredictions(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching predictions:", err);
      setError("No se pudo obtener las predicciones.");
    } finally {
      setLoading(false);
    }
  }, [getAccessTokenSilently]);

  useEffect(() => {
    fetchPredictions();
  }, [fetchPredictions]);

  return (
    <Container>
      <Card className="my-4">
        <CardBody>
          <CardTitle tag="h4">Predicciones de Bonos</CardTitle>
          {loading && <p>Cargando predicciones...</p>}
          {error && <Alert color="danger">{error}</Alert>}
          {predictions.length > 0
            ? predictions.map((prediction, index) => (
                <div>
                  <Match
                    key={prediction._id}
                    id={prediction.fixture.id}
                    fixture={prediction.fixture}
                    league={prediction.league}
                    odds={prediction.odds}
                    teams={prediction.teams}
                  />
                </div>
              ))
            : !loading && <p>No se encontraron predicciones.</p>}
        </CardBody>
      </Card>
    </Container>
  );
};

export default MakePrediction;
