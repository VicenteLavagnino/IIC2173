import React, { useState, useEffect, useCallback } from "react";
import { Container, CardText, Spinner } from "reactstrap";
import MyNavbar from "../components/navbar";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import OfferCard from "./OfferCard";

const AuctionOffers = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [bonds, setBonds] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchOfferedBonds = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getAccessTokenSilently({
        audience: process.env.REACT_APP_AUTH0_AUDIENCE,
      });

      const response = await axios.get(
        `${process.env.REACT_APP_URL_API}/bonds/offered`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setBonds(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching offered bonds:", error);
      setError("No se pudo obtener la lista de bonos ofrecidos.");
    } finally {
      setLoading(false);
    }
  }, [getAccessTokenSilently]);

  useEffect(() => {
    fetchOfferedBonds();
  }, [fetchOfferedBonds]);

  return (
    <Container>
      <div>
        <MyNavbar />
      </div>
      <h1>Intercambios Posibles</h1>
      <div>
        {loading && <Spinner color="primary" />}
        {error && <p className="text-danger">{error}</p>}
        {!loading && !error && bonds.length === 0 ? (
          <CardText>El grupo no tiene bonos aún.</CardText>
        ) : (
          bonds.map((bond) => (
            <OfferCard
              auction_id={bond.auction_id}
              fixture_id={bond.fixture_id}
              league_name={bond.league_name}
              round={bond.round}
              result={bond.result}
              quantity={bond.quantity}
              group_id={bond.group_id}
              status={bond.status}
            />
          ))
        )}
      </div>
    </Container>

  );
};

export default AuctionOffers;