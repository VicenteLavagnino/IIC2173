import React from "react";
import { Card, CardHeader, CardBody, CardText } from "reactstrap";
import ProposeBond from "../components/bondproposal";

const OfferCard = ({ auction_id, fixture_id, league_name, round, result, quantity, group_id, status }) => {
  return (
    <Card className="mb-3">
      <CardHeader>{fixture_id ? `Fixture ID: ${fixture_id}` : "Detalles del fixture no disponibles."}</CardHeader>
      <CardBody>
        <CardText><strong>Resultado Apostado:</strong> {result}</CardText>
        <CardText><strong>Liga:</strong> {league_name}</CardText>
        <CardText><strong>Round:</strong> {round}</CardText>
        <CardText><strong>Ofrecidos:</strong> {quantity}</CardText>
        <CardText><strong>Grupo Oferente:</strong> {group_id}</CardText>
        <CardText><strong>Estado:</strong> {status}</CardText>
        <ProposeBond auction_id={auction_id} />
      </CardBody>
    </Card>
  );
};

export default OfferCard;