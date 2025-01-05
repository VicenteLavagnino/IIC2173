import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, CardTitle, CardText, Spinner } from "reactstrap";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import MyNavbar from "../components/navbar"; 
import BuyGroupBond from "../components/buygroupbond";

const OurBonds = () => {
  const [bondsFixture, setBondsFixture] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const fetchMatchingFixtures = async () => {
      try {
        const token = await getAccessTokenSilently({
          audience: process.env.REACT_APP_AUTH0_AUDIENCE,
        });

        const groupBondsResponse = await axios.get(
          `${process.env.REACT_APP_URL_API}/bonds/group`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const groupBonds = groupBondsResponse.data;
        const fixtureIds = Array.from(new Set(groupBonds.map((bond) => bond.fixture_id)));

        const fixtureRequests = fixtureIds.map((id) =>
            axios
              .get(`${process.env.REACT_APP_URL_API}/fixtures/${id}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              })
              .catch(() => null)
          );

        const fixturesResponses = await Promise.all(fixtureRequests);

        const fixtureMap = fixturesResponses
          .filter((res) => res && res.data)
          .map((res) => res.data);

        const fixtureGroupBonds = groupBonds.map((bond) => {
            const fixture = fixtureMap.find((f) => Number(f.fixture.id) === Number(bond.fixture_id));
            return {
            ...bond,
            fixture, 
            };
        });
        setBondsFixture(fixtureGroupBonds);
        console.log(fixtureGroupBonds)
        setLoading(false);

      } catch (err) {
        console.error("Error fetching matching fixtures:", err);
        setError("No se pudieron obtener los partidos relacionados.");
        setLoading(false);
      }
    };

    fetchMatchingFixtures();
  }, [getAccessTokenSilently]);


  return (
    <>
      <MyNavbar />
      <Container style={{ marginTop: "80px", borderRadius: "10px", padding: "20px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#007bff" }}>
            Ofertas para nuestro grupo
          </h1>
          <p style={{ fontSize: "1.25rem", color: "#6c757d" }}>
            ¡Aprovecha el 10% de descuento exclusivo para tu grupo!
          </p>
        </div>
  
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px" }}>
            <Spinner color="primary" style={{ width: "3rem", height: "3rem" }} />
          </div>
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : bondsFixture.length > 0 ? (
          <Row>
            {bondsFixture.map((bondfixture) => (
              <Col key={bondfixture._id} sm="4" className="mb-4">
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
                    {bondfixture.fixture?.teams?.home?.name || "Home team not available"} vs {bondfixture.fixture?.teams?.away?.name || "Away team not available"}
                  </CardTitle>
                  <CardText style={{ color: "#495057", marginBottom: "10px" }}>
                    Fecha: <strong>{new Date(bondfixture.fixture?.fixture?.date).toLocaleString() || "Date not available"}</strong>
                  </CardText>
                  <CardText style={{ color: "#495057", marginBottom: "10px" }}>
                    Liga: <strong>{bondfixture.fixture?.league?.name || "League not available"}</strong>
                  </CardText>
                  <CardText style={{ color: "#6c757d", marginBottom: "15px" }}>
                    Estado: <strong>{bondfixture.fixture?.fixture?.status?.long || "Status not available"}</strong>
                  </CardText>
                  <CardText style={{ color: "#6c757d", marginBottom: "15px" }}>
                    Apuesta: <strong>
                        {
                        bondfixture.result === 'away' ? bondfixture.fixture?.teams?.away.name : bondfixture.result === 'home' ? bondfixture.fixture?.teams?.home.name : 'draw'
                        }
                  </strong>
                  </CardText>
                  <CardText style={{ color: "#6c757d", marginBottom: "15px" }}>
                    Disponibles: <strong>{bondfixture.restantes}</strong>
                  </CardText>
  
                  <BuyGroupBond
                    fixtureId={bondfixture.fixture?.fixture?.id}
                    bond_result={bondfixture.result}
                    bond_result_team={bondfixture.result === 'away' ? bondfixture.fixture?.teams?.away.name : bondfixture.result === 'home' ? bondfixture.fixture?.teams?.home.name : 'draw'}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <p className="text-muted text-center">No hay datos disponibles en este momento.</p>
        )}
      </Container>
    </>
  );
};

export default OurBonds;