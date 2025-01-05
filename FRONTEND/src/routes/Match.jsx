import "bootstrap/dist/css/bootstrap.min.css";
import {
  Card,
  CardText,
  CardImg,
  ListGroup,
  ListGroupItem,
  Col,
  Row,
  CardTitle,
  // eslint-disable-next-line
  CardLink,
} from "reactstrap";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { useState, useEffect, useCallback } from "react";
import BuyBond from "../components/buybond";
import React from "react";
// impor fetchAvailableBonds

const url = "{process.env.REACT_APP_URL_API}/users";

function Match({ id, fixture, league, odds, teams }) {
  const { getAccessTokenSilently } = useAuth0(); // Obtener Auth0 hook
  // eslint-disable-next-line
  const [matchDetail, setMatchDetail] = useState(null); // Estado para guardar el detalle del partido
  // eslint-disable-next-line
  const [error, setError] = useState(null); // Estado para guardar errores
  const [availableBonds, setAvailableBonds] = useState(0); // Estado para bonos disponibles, inicializado en 40

  const matchOdds = odds.length > 0 ? odds[0] : null;

  const displayOdds =
    matchOdds && matchOdds.name === "Match Winner"
      ? matchOdds.values
      : [
          { odd: "-" }, // Home
          { odd: "-" }, // Draw
          { odd: "-" }, // Away
        ];

  // eslint-disable-next-line
  const fetchMatchDetail = async () => {
    try {
      const token = await getAccessTokenSilently({
        audience: process.env.REACT_APP_AUTH0_AUDIENCE,
      });

      const response = await axios.get(`${url}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMatchDetail(response.data); // Guardar el detalle del partido
      setError(null);
    } catch (error) {
      console.error("Error fetching match detail:", error);
      setError("No se pudo obtener el detalle del partido.");
    }
  };

  // Función para obtener los bonos disponibles
  const fetchAvailableBonds = useCallback(async () => {
    try {
      const token = await getAccessTokenSilently({
        audience: process.env.REACT_APP_AUTH0_AUDIENCE,
      });

      const response = await axios.get(
        `${process.env.REACT_APP_URL_API}/fixtures/${fixture.id}/available_bonds`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Si se encuentran bonos disponibles, actualiza el estado
      setAvailableBonds(response.data.available_bonds || 0); // Si no se encuentran bonos, establece 0 por defecto
      setError(null);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.error("Bonos no encontrados para este partido");
        setAvailableBonds(0); // Si no se encuentran bonos, establece 0 por defecto
      } else {
        console.error("Error fetching available bonds:", error);
        setError("No se pudieron obtener los bonos disponibles.");
      }
    }
  }, [getAccessTokenSilently, fixture.id]); // Include all dependencies used inside the callback

  useEffect(() => {
    fetchAvailableBonds(); // Llama a la función para obtener los bonos disponibles cuando se monte el componente
  }, [fetchAvailableBonds]);

  return (
    <Row className="mb-4">
      <Col sm="3">
        <Card body>
          <CardTitle>{league.name}</CardTitle>
          <CardText>
            Fecha del partido: {new Date(fixture.date).toLocaleString()}
          </CardText>
          <ListGroup flush>
            <ListGroupItem className="d-flex align-items-center">
              <CardText className="d-flex align-items-center">Local :</CardText>
              <CardImg
                alt={`Logo of ${teams.home.name}`}
                src={teams.home.logo}
                style={{
                  height: 25,
                  width: 25,
                  marginRight: 10,
                }}
              />
              <CardText>{teams.home.name}</CardText>
            </ListGroupItem>
            <ListGroupItem className="d-flex align-items-center">
              <CardText className="d-flex align-items-center">
                Visita :
              </CardText>
              <CardImg
                alt={`Logo of ${teams.away.name}`}
                src={teams.away.logo}
                style={{
                  height: 25,
                  width: 25,
                  marginRight: 10,
                }}
              />
              <CardText>{teams.away.name}</CardText>
            </ListGroupItem>
            <ListGroupItem>
              <CardText>Bonos disponibles: {availableBonds}</CardText>{" "}
              {/* Mostrar bonos disponibles */}
            </ListGroupItem>
            <ListGroupItem>
              <BuyBond
                fixtureId={fixture.id}
                homeTeam={teams.home}
                awayTeam={teams.away}
              />
            </ListGroupItem>
          </ListGroup>
        </Card>
      </Col>

      <Col sm="3">
        <Card body>
          <CardText>Victoria Local: {displayOdds[0].odd}</CardText>
        </Card>
      </Col>

      <Col sm="3">
        <Card body>
          <CardText>Empate: {displayOdds[1].odd}</CardText>
        </Card>
      </Col>

      <Col sm="3">
        <Card body>
          <CardText>Victoria Visitante: {displayOdds[2].odd}</CardText>
        </Card>
      </Col>
    </Row>
  );
}

export default Match;
