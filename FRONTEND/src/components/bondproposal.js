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
  Spinner,
} from "reactstrap";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";

const OfferBond = ({ auction_id }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [modal, setModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [bonds, setBonds] = useState([]);
  const [selectedBond, setSelectedBond] = useState(null);

  const obtenerAdmin = useCallback(async () => {
    try {
      const token = await getAccessTokenSilently({
        audience: process.env.REACT_APP_AUTH0_AUDIENCE,
        scope: "read:admin",
      });

      const response = await axios.get(
        `${process.env.REACT_APP_URL_API}/users/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAdmin(response.data.admin || false);
    } catch (error) {
      console.error("Error fetching admin status:", error);
      setError("No se pudo verificar si eres administrador.");
    }
  }, [getAccessTokenSilently]);

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
      // console.log(bonds);
      setError(null);
    } catch (error) {
      console.error("Error fetching group bonds:", error);
      setError("No se pudo obtener la lista de bonos del grupo.");
    } finally {
      setLoading(false);
    }
  }, [getAccessTokenSilently]);

  useEffect(() => {
    obtenerAdmin();
  }, [obtenerAdmin]);

  useEffect(() => {
    if (modal) {
      fetchGroupBonds();
    }
  }, [modal, fetchGroupBonds]);

  const handleProposal = async () => {
    if (!selectedBond) {
      setError("Por favor selecciona un bono antes de continuar.");
      return;
    }

    if (selectedBond.quantity < amount) {
      setError(
        "No hay suficientes bonos. Por favor, intenta con una cantidad menor."
      );
      return;
    }
    console.log(
      selectedBond.fixture_id,
      selectedBond.result,
      selectedBond.quantity
    );

    try {
      setLoading(true);
      const token = await getAccessTokenSilently({
        audience: process.env.REACT_APP_AUTH0_AUDIENCE,
      });

      await axios.post(
        `${process.env.REACT_APP_URL_API}/bonds/propose`,
        {
          auction_id: auction_id,
          fixture_id: selectedBond.fixture_id,
          league_name: selectedBond.league_name,
          fixture_round: selectedBond.round,
          result: selectedBond.result,
          quantity: amount,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccess("Intercambio propuesto exitosamente.");
      setError(null);
    } catch (error) {
      console.error("Error submitting bond offer:", error);
      setError(
        "No se pudo completar la oferta. Por favor, inténtalo nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const toggle = () => {
    setModal(!modal);
    if (!modal) {
      setAmount("");
      setError(null);
      setSuccess(null);
      setSelectedBond("");
    }
  };

  return (
    <div>
      <Button color="primary" onClick={toggle}>
        Proponer Intercambio
      </Button>

      <Modal isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle}>Intercambiar Bonos</ModalHeader>
        <ModalBody>
          {error && <Alert color="danger">{error}</Alert>}
          {success && <Alert color="success">{success}</Alert>}

          {loading ? (
            <Spinner color="primary" />
          ) : (
            <FormGroup>
              <Label for="bondSelect">Selecciona un Bono</Label>
              <Input
                type="select"
                id="bondSelect"
                value={selectedBond?.request_id || ""}
                onChange={(e) => {
                  const selected = bonds.find(
                    (bond) => bond.request_id === e.target.value
                  );
                  setSelectedBond(selected || null);
                }}
              >
                <option value="">Selecciona</option>
                {bonds.map((bond) => (
                  <option key={bond.request_id} value={bond.request_id}>
                    {bond.fixture_id} -{" "}
                    {bond.result === "---" ? "draw" : bond.result} -{" "}
                    {bond.restantes} restantes
                  </option>
                ))}
              </Input>
            </FormGroup>
          )}

          <FormGroup>
            <Label for="amountInput">Cantidad</Label>
            <Input
              type="number"
              id="amountInput"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              placeholder="Ingresa la cantidad"
              disabled={selectedBond === ""}
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          {admin && (
            <Button
              color="primary"
              onClick={handleProposal}
              disabled={selectedBond === ""}
            >
              {loading ? "Procesando..." : "Confirmar"}
            </Button>
          )}
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default OfferBond;
