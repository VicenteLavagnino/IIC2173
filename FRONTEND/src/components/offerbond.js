import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  FormGroup,
  Label,
  Alert,
} from "reactstrap";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";

const OfferBond = ({ fixture_id, league_name, round, result, restantes }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [modal, setModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [admin, setAdmin] = useState(false);

  const obtenerAdmin = useCallback(async () => {
    console.log("Iniciando validación de admin...");
    try {
      const token = await getAccessTokenSilently({
        audience: process.env.REACT_APP_AUTH0_AUDIENCE,
        scope: "read:admin",
      });
  
      console.log("Token obtenido, haciendo validación de admin...");
      const response = await axios.get(`${process.env.REACT_APP_URL_API}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      console.log("Respuesta completa de /users/me:", response);
      setAdmin(response.data.admin);
      if (response.data.admin !== undefined) {
        setAdmin(response.data.admin);
      } else {
        setAdmin(false);
      }
    } catch (error) {
      console.error("Error detallado al obtener admin:", error);
      if (error.response) {
        console.error("Datos de la respuesta de error:", error.response.data);
        console.error("Estado de la respuesta de error:", error.response.status);
      }
      setError("No se pudo obtener verificar administrador. Por favor, intenta de nuevo más tarde.");
    }
  }, [getAccessTokenSilently]);

  useEffect(() => {
    obtenerAdmin();
  }, [obtenerAdmin]);

  const handleOffer = async () => {
    if (!amount) {
      setError("Por favor, ingresa la cantidad de bonos a ofrecer.");
      return;
    }
    if (amount > restantes) {
      setError("No puedes ofrecer más bonos de los que hay disponibles.");
      return;
    }

    setLoading(true);
    try {
      const token = await getAccessTokenSilently({
        audience: process.env.REACT_APP_AUTH0_AUDIENCE,
      });

      const response = await axios.post(
        `${process.env.REACT_APP_URL_API}/bonds/offer`,
        {
          fixture_id: fixture_id.toString(),
          league_name: league_name,
          fixture_round: round,
          result: result,
          quantity: amount,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccess(response.data.message);

    } catch (error) {
      console.error("Error al ofrecer bonos:", error);
      setError("No se pudo ofrecer los bonos. Por favor, intenta de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  const toggle = () => {
    setModal(!modal);
    if (modal) {
      setAmount("");
      setError(null);
      setSuccess(null);
    }
  };

  return (
    <div>
      <Button color="primary" onClick={toggle}>
        Ofrecer Bonos
      </Button>

      <Modal isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle}>Ofrecer Bonos</ModalHeader>
        <ModalBody>
          {error && <Alert color="danger">{error}</Alert>}
          {success && <Alert color="success">{success}</Alert>}
          <FormGroup>
            <Label for="amount">Cantidad de Bonos</Label>
            <Input
              type="number"
              name="amount"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="1"
              max={restantes}
            />
          </FormGroup>
          <p>Cantidad de bonos disponibles: {restantes}</p>
        </ModalBody>
        <ModalFooter>
          {admin && (
            <Button color="primary" onClick={handleOffer} disabled={loading}>
              {loading ? "Procesando..." : "Ofrecer"}
            </Button>
          )}
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default OfferBond;