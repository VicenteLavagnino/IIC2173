import React, { Component } from "react";
import MyNavbar from "../components/navbar";
import MyPagination from "../components/pagination";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Button, Spinner } from "reactstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import { withAuth0 } from "@auth0/auth0-react";
import Match from "./Match";

class Matches extends Component {
  state = {
    data: [],
    page: 1,
    count: 5,
    total: 0,
    loading: false,
    error: null,
  };

  componentDidMount() {
    this.getRequest();
  }

  getRequest = async () => {
    const { page, count } = this.state;
    const { getAccessTokenSilently } = this.props.auth0;

    const params = { page, count };

    this.setState({ loading: true, error: null });

    try {
      const token = await getAccessTokenSilently({
        audience: process.env.REACT_APP_AUTH0_AUDIENCE,
        scope: "read:fixtures",
      });

      const response = await axios.get(`${process.env.REACT_APP_URL_API}/fixtures`, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(response.data);
      this.setState({
        data: response.data.fixtures,
        total: response.data.total,
        loading: false,
      });
    } catch (error) {
      console.error("Error al obtener los partidos:", error);
      this.setState({
        loading: false,
        error: "No se pudieron obtener los partidos. Por favor, intente de nuevo más tarde.",
      });
    }
  };

  handlePageChange = (newPage) => {
    this.setState({ page: newPage }, this.getRequest);
  };

  render() {
    const { data, page, count, total, loading, error } = this.state;
    const totalPages = Math.ceil(total / count);

    return (
      <Container>
        <div className="container">
          <MyNavbar />
        </div>
        <div>
          <h1>Partidos</h1>
          <div style={{ marginBottom: "20px" }}>
            <Link to="/matchesbydate">
              <Button color="primary">Filtrar por fecha</Button>
            </Link>
          </div>
        </div>
        <div>
          {loading && <Spinner color="primary" />}
          {error && <p className="text-danger">{error}</p>}
          {!loading && !error && data.length > 0 ? (
            data.map((matchData) => (
              <Match
                key={matchData.fixture.id}
                id={matchData.fixture.id}
                league={matchData.league}
                teams={matchData.teams}
                odds={matchData.odds}
                fixture={matchData.fixture}
                goals={matchData.goals}
              />
            ))
          ) : (
            !loading && !error && <p>No hay partidos disponibles.</p>
          )}
        </div>
        {totalPages > 1 && (
          <MyPagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={this.handlePageChange}
          />
        )}
      </Container>
    );
  }
}

export default withAuth0(Matches);