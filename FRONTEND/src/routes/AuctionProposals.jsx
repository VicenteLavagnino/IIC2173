import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, CardTitle, CardText, Spinner, Alert } from "reactstrap";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import MyNavbar from "../components/navbar"; 

const AuctionProposals = () => {
    const [exchangeProposals, setExchangeProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
    const { getAccessTokenSilently } = useAuth0();

    useEffect(() => {
        const fetchMatchingFixtures = async () => {
        try {
            const token = await getAccessTokenSilently({
            audience: process.env.REACT_APP_AUTH0_AUDIENCE,
            });

            const exchangeProposalsResponse = await axios.get(
            `${process.env.REACT_APP_URL_API}/bonds/proposed`,
            {
                headers: {
                Authorization: `Bearer ${token}`,
                },
            }
            );
            
            setExchangeProposals(exchangeProposalsResponse.data);
            setLoading(false);

        } catch (err) {
            console.error("Error fetching matching fixtures:", err);
            setError("No se pudieron obtener los partidos relacionados.");
            setLoading(false);
        }
        };

        fetchMatchingFixtures();
    }, [getAccessTokenSilently]);

    useEffect(() => {
        console.log(exchangeProposals);
    }, [exchangeProposals]);

    const handleDecision = async ( auction_id, proposal_id, proposal_decision ) => {
        console.log(auction_id, proposal_id, proposal_decision);
        setLoading(true);
        try {
            const token = await getAccessTokenSilently({
                audience: process.env.REACT_APP_AUTH0_AUDIENCE,
            });

            const response = await axios.post(
                `${process.env.REACT_APP_URL_API}/bonds/proposed`,
                {
                    auction_id: auction_id,
                    proposal_id: proposal_id,
                    proposal_decision: proposal_decision,
                },
                {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                }
            );
            setSuccess(response.data.message);

        } catch (error) {
            console.error("Error al mandar decisión:", error);
            setError("No se pudo ejecutar el intercambio de bonos. Por favor, intenta de nuevo más tarde.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
        <MyNavbar />
        <Container style={{ marginTop: "80px", borderRadius: "10px", padding: "20px" }}>
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#007bff" }}>
                Propuestas de Intercambio
            </h1>
            <p style={{ fontSize: "1.25rem", color: "#6c757d" }}>
                Acepta o rechaza propuestas
            </p>
            </div>

            {error && <Alert color="danger">{error}</Alert>}
            {success && <Alert color="success">{success}</Alert>}

            {loading ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px" }}>
                <Spinner color="primary" style={{ width: "3rem", height: "3rem" }} />
            </div>
            ) : error ? (
            <p className="text-danger">{error}</p>
            ) : exchangeProposals.length > 0 ? (
            exchangeProposals.map((proposal, index) => {
                const [bond, bondFixture] = proposal[0]; 
                const [associatedBond, associatedBondFixture] = proposal[1];

                return (
                <div key={index} style={{ marginBottom: "40px" }}>
                    <Row className="align-items-center" style={{ marginBottom: "20px" }}>
                    <Col sm="8">
                        <h2 style={{ fontSize: "1.75rem", color: "#007bff" }}>
                        Propuesta {index + 1}
                        </h2>
                    </Col>
                    <Col sm="4" className="text-end">
                        {bond.status === 'pending' && (
                            <>
                            <button
                                style={{
                                marginRight: "10px",
                                padding: "10px 20px",
                                backgroundColor: "#28a745",
                                color: "#fff",
                                border: "none",
                                borderRadius: "5px",
                                cursor: "pointer",
                                }}
                                onClick={() => handleDecision(bond.auction_id, bond.proposal_id, "acceptance")}
                            >
                                Aceptar
                            </button>
                            <button
                                style={{
                                padding: "10px 20px",
                                backgroundColor: "#dc3545",
                                color: "#fff",
                                border: "none",
                                borderRadius: "5px",
                                cursor: "pointer",
                                }}
                                onClick={() => handleDecision(bond.auction_id, bond.proposal_id, "rejection")}
                            >
                                Rechazar
                            </button>
                            </>
                        )}
                    </Col>
                    </Row>
                    <Row>
                    {/* Propuesta */}
                    <Col sm="6">
                        <Card
                        body
                        style={{
                            border: "1px solid #ddd",
                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                            borderRadius: "10px",
                        }}
                        >
                        <CardTitle
                            style={{
                            fontSize: "1.25rem",
                            fontWeight: "600",
                            color: "#343a40",
                            marginBottom: "15px",
                            }}
                        >
                            Propuesta: {bond?.league_name || "Sin información"} - {bond?.round || "Sin información"}
                        </CardTitle>
                        <CardText style={{ color: "#495057", marginBottom: "10px" }}>
                            Equipo:{" "}
                            <strong>
                            {bondFixture?.teams?.home?.name || "Equipo no disponible"} vs{" "}
                            {bondFixture?.teams?.away?.name || "Equipo no disponible"}
                            </strong>
                        </CardText>
                        <CardText style={{ color: "#495057", marginBottom: "10px" }}>
                            Fecha:{" "}
                            <strong>
                            {bondFixture?.fixture?.date
                                ? new Date(bondFixture.fixture.date).toLocaleString()
                                : "Date not available"}
                            </strong>
                        </CardText>
                        <CardText style={{ color: "#6c757d", marginBottom: "15px" }}>
                            Estado: <strong>{bondFixture?.fixture?.status?.long || "Estado no disponible"}</strong>
                        </CardText>
                        <CardText style={{ color: "#6c757d", marginBottom: "15px" }}>
                            Apuesta:{" "}
                            <strong>
                            {bond.result === "away"
                                ? bondFixture?.teams?.away.name
                                : bond.result === "home"
                                ? bondFixture?.teams?.home.name
                                : "draw"}
                            </strong>
                        </CardText>
                        <CardText style={{ color: "#6c757d", marginBottom: "15px" }}>
                            Cantidad: <strong>{bond.quantity}</strong>
                        </CardText>
                        </Card>
                    </Col>

                    {/* Intercambio */}
                    <Col sm="6">
                        <Card
                        body
                        style={{
                            border: "1px solid #ddd",
                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                            borderRadius: "10px",
                        }}
                        >
                        <CardTitle
                            style={{
                            fontSize: "1.25rem",
                            fontWeight: "600",
                            color: "#343a40",
                            marginBottom: "15px",
                            }}
                        >
                            Intercambio: {associatedBond?.league_name || "Sin información"} - {associatedBond?.round || "Sin información"}
                        </CardTitle>
                        <CardText style={{ color: "#495057", marginBottom: "10px" }}>
                            Equipo:{" "}
                            <strong>
                            {associatedBondFixture?.teams?.home?.name || "Equipo no disponible"} vs{" "}
                            {associatedBondFixture?.teams?.away?.name || "Equipo no disponible"}
                            </strong>
                        </CardText>
                        <CardText style={{ color: "#495057", marginBottom: "10px" }}>
                            Fecha:{" "}
                            <strong>
                            {associatedBondFixture?.fixture?.date
                                ? new Date(associatedBondFixture.fixture.date).toLocaleString()
                                : "Date not available"}
                            </strong>
                        </CardText>
                        <CardText style={{ color: "#6c757d", marginBottom: "15px" }}>
                            Estado: <strong>{associatedBondFixture?.fixture?.status?.long || "Estado no disponible"}</strong>
                        </CardText>
                        <CardText style={{ color: "#6c757d", marginBottom: "15px" }}>
                            Apuesta:{" "}
                            <strong>
                            {associatedBond.result === "away"
                                ? associatedBondFixture?.teams?.away.name
                                : associatedBond.result === "home"
                                ? associatedBondFixture?.teams?.home.name
                                : "draw"}
                            </strong>
                        </CardText>
                        <CardText style={{ color: "#6c757d", marginBottom: "15px" }}>
                            Cantidad: <strong>{associatedBond.quantity}</strong>
                        </CardText>
                        </Card>
                    </Col>
                    </Row>
                </div>
                );
            })
            ) : (
            <p className="text-muted text-center">No hay datos disponibles en este momento.</p>
            )}
        </Container>
        </>
    );
};

export default AuctionProposals;