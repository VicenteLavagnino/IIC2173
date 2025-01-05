import React, { useState, useEffect, useCallback } from "react";
import { Container, CardText, Spinner } from "reactstrap";
import MyNavbar from "../components/navbar";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import BondCard from "./BondCard";

const GroupBonds = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [bonds, setBonds] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchGroupBonds = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getAccessTokenSilently({
        audience: process.env.REACT_APP_AUTH0_AUDIENCE,
      });

      const response = await axios.get(
        `${process.env.REACT_APP_URL_API}/bonds/group`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setBonds(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching group bonds:", error);
      setError("No se pudo obtener la lista de bonos del grupo.");
    } finally {
      setLoading(false);
    }
  }, [getAccessTokenSilently]);

  useEffect(() => {
    fetchGroupBonds();
  }, [fetchGroupBonds]);

  return (
    <Container>
      <div>
        <MyNavbar />
      </div>
      <h1>Bonos del grupo</h1>
      <div>
        {loading && <Spinner color="primary" />}
        {error && <p className="text-danger">{error}</p>}
        {!loading && !error && bonds.length === 0 ? (
          <CardText>El grupo no tiene bonos aún.</CardText>
        ) : (
          bonds.map((bond) => (
            <BondCard
              key={bond.request_id}
              fixture_id={bond.fixture_id}
              league_name={bond.league_name}
              round={bond.round}
              result={bond.result}
              restantes={bond.restantes}
              ofrecidos={bond.ofrecidos}
              status={bond.status}
            />
          ))
        )}
      </div>
    </Container>

  );
};

export default GroupBonds;