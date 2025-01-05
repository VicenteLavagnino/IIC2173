import React from "react";
import { Card, CardHeader, CardBody, CardText } from "reactstrap";
import OfferBond from "../components/offerbond";

const BondCard = ({
  fixture_id,
  league_name,
  round,
  result,
  restantes,
  ofrecidos,
  status,
}) => {
  return (
    <Card className="mb-3">
      <CardHeader>
        {fixture_id
          ? `Fixture ID: ${fixture_id}`
          : "Detalles del fixture no disponibles."}
      </CardHeader>
      <CardBody>
        <CardText>
          <strong>Resultado Apostado:</strong> {result}
        </CardText>
        <CardText>
          <strong>Liga:</strong> {league_name}
        </CardText>
        <CardText>
          <strong>Round:</strong> {round}
        </CardText>
        <CardText>
          <strong>Restantes:</strong> {restantes}
        </CardText>
        <CardText>
          <strong>Ofrecidos:</strong> {ofrecidos}
        </CardText>
        <CardText>
          <strong>Estado:</strong> {status}
        </CardText>
        <OfferBond
          fixture_id={fixture_id}
          league_name={league_name}
          round={round}
          result={result}
          restantes={restantes}
        />
      </CardBody>
    </Card>
  );
};

export default BondCard;
