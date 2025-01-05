import React, { Component } from "react";
import axios from "axios";
import {
  Container,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Spinner,
} from "reactstrap";
import Match from "./Match";
import MyNavbar from "../components/navbar";
import MyPagination from "../components/pagination";
import { withAuth0 } from "@auth0/auth0-react"; // Importar Auth0

const url = `${process.env.REACT_APP_URL_API}/fixtures`;
class MatchesByDate extends Component {
  state = {
    data: [],
    selectedDate: "",
    page: 1,
    count: 5,
    total: 0,
    loading: false,
    error: null,
  };

  handleDateChange = (e) => {
    this.setState({ selectedDate: e.target.value });
  };

  getRequest = async () => {
    const { selectedDate, page, count } = this.state;
    const { getAccessTokenSilently } = this.props.auth0; // Obtener la función para acceder al token

    const params = {
      page,
      count,
    };

    if (selectedDate) {
      params.date = selectedDate;
    }

    this.setState({ loading: true, error: null });

    try {
      // Obtener el token de acceso
      const token = await getAccessTokenSilently({
        audience: process.env.REACT_APP_AUTH0_AUDIENCE,
        scope: "read:fixtures", // Asegúrate de que el scope esté configurado correctamente
      });

      // Hacer la solicitud al backend con el token
      const response = await axios.get(url, {
        params,
        headers: {
          Authorization: `Bearer ${token}`, // Incluir el token en la cabecera
        },
      });
      console.log(response.data);
      this.setState({
        data: response.data.fixtures,
        total: response.data.total,
        loading: false,
      });
    } catch (error) {
      console.error(
        "Error al obtener los partidos filtrados por fecha:",
        error
      );
      this.setState({
        loading: false,
        error: "No se pudieron obtener los partidos.",
      });
    }
  };

  handleSubmit = (e) => {
    e.preventDefault();
    this.setState({ page: 1 }, this.getRequest);
  };

  handlePageChange = (newPage) => {
    this.setState({ page: newPage }, this.getRequest);
  };

  componentDidMount() {
    this.getRequest();
  }

  render() {
    const { data, selectedDate, page, count, total, loading, error } =
      this.state;
    const totalPages = Math.ceil(total / count);

    return (
      <Container>
        <div className="container">
          <MyNavbar />
        </div>
        <div>
          <h1>Filtrar Partidos por Fecha</h1>
          <Form onSubmit={this.handleSubmit}>
            <FormGroup>
              <Label for="date">Selecciona una Fecha</Label>
              <Input
                type="date"
                name="date"
                id="date"
                value={selectedDate}
                onChange={this.handleDateChange}
                required
              />
            </FormGroup>
            <Button color="primary" type="submit" disabled={loading}>
              {loading ? <Spinner size="sm" /> : "Filtrar"}
            </Button>
          </Form>
        </div>
        <br></br>
        <div>
          {loading && <Spinner color="primary" />}
          {error && <p className="text-danger">{error}</p>}
          {!loading && !error && data.length > 0
            ? data.map((matchData) => (
                <Match
                  key={matchData._id} // Asegúrate de agregar una key única aquí
                  id={matchData._id}
                  league={matchData.league}
                  teams={matchData.teams}
                  odds={matchData.odds}
                  fixture={matchData.fixture}
                />
              ))
            : !loading &&
              !error && (
                <p>No se encontraron partidos para la fecha seleccionada.</p>
              )}
        </div>
        {totalPages > 1 && (
          <MyPagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={this.handlePageChange}
            disabled={loading}
          />
        )}
      </Container>
    );
  }
}

export default withAuth0(MatchesByDate); // Envolver el componente con Auth0
