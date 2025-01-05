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

const BuyGroupBond = ({ fixtureId, bond_result, bond_result_team }) => {
    const { getAccessTokenSilently } = useAuth0();
    const [modal, setModal] = useState(false);
    const [result, setResult] = useState("");
    const [amount, setAmount] = useState("");
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(false);

    const toggle = () => {
        setModal(!modal);
        if (modal) {
        setResult("");
        setAmount("");
        setError(null);
        setSuccess(null);
        }
    };

    const obtenerSaldo = useCallback(async () => {
        console.log("Iniciando obtención de saldo...");
        try {
        const token = await getAccessTokenSilently({
            audience: process.env.REACT_APP_AUTH0_AUDIENCE,
            scope: "read:wallet",
        });

        console.log("Token obtenido, haciendo solicitud de saldo...");
        const response = await axios.get(`${process.env.REACT_APP_URL_API}/users/me`, {
            headers: {
            Authorization: `Bearer ${token}`,
            },
        });

        console.log("Respuesta completa de /users/me:", response);
        console.log("Saldo recibido:", response.data.wallet);

        setBalance(Number(response.data.wallet));
        console.log("Saldo actualizado en el estado:", Number(response.data.wallet));
        } catch (error) {
        console.error("Error detallado al obtener el saldo:", error);
        if (error.response) {
            console.error("Datos de la respuesta de error:", error.response.data);
            console.error("Estado de la respuesta de error:", error.response.status);
        }
        setError("No se pudo obtener el saldo. Por favor, intenta de nuevo más tarde.");
        }
    }, [getAccessTokenSilently]);

    useEffect(() => {
        obtenerSaldo();
    }, [obtenerSaldo]);

    /* COMPRA BONOS WALLET */
    const handleBuyBondWallet = async () => {
        setError(null);
        setSuccess(null);
        const amountNumeric = parseFloat(amount);
        const paymentAmount = amountNumeric * 900;
        
        if (!result) {
        setError("Por favor, selecciona un resultado.");
        return;
        }
        
        if (isNaN(amountNumeric) || amountNumeric <= 0) {
        setError("Por favor, ingresa un monto válido mayor a cero.");
        return;
        }

        console.log("Saldo actual:", balance);
        console.log("Monto a comprar:", paymentAmount);

        if (paymentAmount > balance) {
        setError(`No tienes suficiente saldo para realizar esta compra. Tu saldo actual es: $${balance.toFixed(2)}`);
        return;
        }

        setLoading(true);
        try {
        const token = await getAccessTokenSilently({
            audience: process.env.REACT_APP_AUTH0_AUDIENCE,
            scope: "buy:bond",
        });

        console.log("Enviando solicitud de compra...");
        const response = await axios.post(
            `${process.env.REACT_APP_URL_API}/bonds/group/buy_bond`,
            {
            fixture_id: fixtureId.toString(),
            result: result,
            amount: amountNumeric,
            discount: 100,
            },
            {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            }
        );

        console.log("Respuesta completa del servidor:", response);
        console.log("Datos de la respuesta:", response.data);

        setSuccess(`Bono comprado exitosamente: ${response.data.message || 'Compra realizada'}`);
        setAmount("");
        setResult("");

        if (response.data.newBalance !== undefined) {
            setBalance(Number(response.data.newBalance));
            console.log("Nuevo saldo establecido:", response.data.newBalance);
        } else {
            console.log("Actualizando saldo...");
            await obtenerSaldo();
        }
        } catch (error) {
        console.error("Error al comprar el bono:", error);
        if (error.response) {
            setError(`Error al comprar el bono: ${error.response.data.detail || error.response.data.message || error.response.data}`);
        } else if (error.request) {
            setError("No se pudo conectar con el servidor. Por favor, intenta de nuevo más tarde.");
        } else {
            setError("Ocurrió un error al procesar tu solicitud. Por favor, intenta de nuevo.");
        }
        } finally {
        setLoading(false);
        }
    };

    /* COMPRA BONOS WEBPAY */
    const handleBuyBondWebpay = async () => {
        setError(null);
        setSuccess(null);
        const amountNumeric = parseFloat(amount);

        if (!result) {
        setError("Por favor, selecciona un resultado.");
        return;
        }
        if (isNaN(amountNumeric) || amountNumeric <= 0) {
        setError("Por favor, ingresa una cantidad válida mayor a cero.");
        return;
        }

        setLoading(true);
        try {
        const token = await getAccessTokenSilently({
            audience: process.env.REACT_APP_AUTH0_AUDIENCE,
            scope: "buy:bond",
        });

        console.log("Enviando solicitud de compra y creación de transacción en Webpay...");

        const webpayResponse = await axios.get(
            `${process.env.REACT_APP_URL_API}/webpay/create`,
            {
            params: {
                fixture_id: fixtureId.toString(),
                result: result,
                amount: amountNumeric,
                discount: 100,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
            }
        );

        const form = document.createElement("form");
        form.method = "POST";
        form.action = webpayResponse.data.url;

        const tokenInput = document.createElement("input");
        tokenInput.type = "hidden";
        tokenInput.name = "token_ws";
        tokenInput.value = webpayResponse.data.token;
        form.appendChild(tokenInput);

        document.body.appendChild(form);
        form.submit();
        
        } catch (error) {
        console.error("Error al crear la transacción:", error);
        if (error.response) {
            setError(`Error al crear la transacción: ${error.response.data.detail}`);
        } else if (error.request) {
            setError("No se pudo conectar con el servidor. Por favor, intenta de nuevo más tarde.");
        } else {
            setError("Ocurrió un error al procesar tu solicitud. Por favor, intenta de nuevo.");
        }
        } finally {
        setLoading(false);
        }
    };

    return (
        <div>
            <Button color="primary" onClick={toggle}>
                Comprar Bono
            </Button>

            <Modal isOpen={modal} toggle={toggle}>
                <ModalHeader toggle={toggle}>Comprar Bono</ModalHeader>
                <ModalBody>
                {error && <Alert color="danger">{error}</Alert>}
                {success && <Alert color="success">{success}</Alert>}
                <FormGroup>
                    <Label for="result">Selecciona el resultado</Label>
                    <Input
                    type="select"
                    name="result"
                    id="result"
                    value={result}
                    onChange={(e) => setResult(e.target.value)}
                    >
                        <option value="">Seleccione</option>
                        <option value={bond_result}>{bond_result_team}</option>
                    </Input>
                </FormGroup>
                <FormGroup>
                    <label htmlFor="amount">
                        Cantidad de bonos
                        <span> </span> 
                        <span style={{ textDecoration: "line-through", color: "gray" }}>$1000</span> 
                        <span style={{ color: "green", fontWeight: "bold" }}> $900</span> c/u
                    </label>
                    <Input
                        type="number"
                        name="amount"
                        id="amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min="0"
                        step="1"
                        />
                </FormGroup>
                <p>Saldo actual: ${balance.toFixed(2)}</p>
                </ModalBody>
                    <ModalFooter>
                    <Button color="primary" onClick={handleBuyBondWallet} disabled={loading}>
                        {loading ? "Comprando..." : "Comprar"}
                    </Button>{" "}
                    <Button className="webpay-button" onClick={handleBuyBondWebpay} disabled={loading}>
                        {loading ? "Comprando..." : "Webpay"}
                    </Button>{" "}
                    <Button color="secondary" onClick={toggle}>
                        Cancelar
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default BuyGroupBond;