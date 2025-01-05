import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  CardText,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  FormGroup,
  Label,
} from "reactstrap";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";

const MyWallet = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [saldo, setSaldo] = useState(0);
  const [modal, setModal] = useState(false);
  const [monto, setMonto] = useState("");
  const [error, setError] = useState(null);

  const toggle = () => setModal(!modal);

  const obtenerSaldo = useCallback(async () => {
    console.log("Obteniendo saldo...");
    console.log("API URL:", process.env.REACT_APP_URL_API);
    try {
      const token = await getAccessTokenSilently({
        audience: process.env.REACT_APP_AUTH0_AUDIENCE,
        scope: "read:wallet",
      });

      console.log("Token obtenido");

      const response = await axios.get(
        `${process.env.REACT_APP_URL_API}/users/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Respuesta del servidor:", response.data);
      setSaldo(response.data.wallet);
    } catch (error) {
      console.error("Error al obtener el saldo:", error);
      setError("No se pudo obtener el saldo.");
    }
  }, [getAccessTokenSilently]); // Agrega getAccessTokenSilently como dependencia

  useEffect(() => {
    obtenerSaldo();
  }, [obtenerSaldo]);

  const manejarCargar = async () => {
    const montoNumerico = parseFloat(monto);
    if (isNaN(montoNumerico) || montoNumerico <= 0) {
      alert("Por favor, ingresa un monto válido.");
      return;
    }

    try {
      const token = await getAccessTokenSilently({
        audience: process.env.REACT_APP_AUTH0_AUDIENCE,
        scope: "add:funds",
      });

      console.log("Enviando solicitud para agregar fondos...");
      const response = await axios.post(
        `${process.env.REACT_APP_URL_API}/add_funds`,
        { amount: montoNumerico },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Respuesta al agregar fondos:", response.data);
      await obtenerSaldo();
      setMonto("");
      toggle();
      setError(null);
    } catch (error) {
      console.error("Error al cargar fondos:", error);
      setError("No se pudo cargar el monto en la billetera.");
    }
  };

  return (
    <Card className="my-2" style={{ width: "18rem" }}>
      <CardHeader>Mi Billetera</CardHeader>
      <CardBody>
        <CardTitle tag="h5">Saldo:</CardTitle>
        <CardText>${saldo.toFixed(2)}</CardText>
        <Button color="primary" onClick={toggle}>
          Cargar
        </Button>
      </CardBody>

      {error && <p className="text-danger">{error}</p>}

      <Modal isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle}>Cargar Fondos</ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label for="monto">Monto</Label>
            <Input
              type="number"
              name="monto"
              id="monto"
              placeholder="Ingresa el monto a cargar"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              min="0"
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={manejarCargar}>
            Cargar
          </Button>{" "}
          <Button color="secondary" onClick={toggle}>
            Cancelar
          </Button>
        </ModalFooter>
      </Modal>
    </Card>
  );
};

export default MyWallet;
