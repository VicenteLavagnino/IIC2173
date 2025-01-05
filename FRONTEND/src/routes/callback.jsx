import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Callback = () => {
  const { isAuthenticated, isLoading, getAccessTokenSilently, user } =
    useAuth0();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const createUser = async () => {
      console.log("Iniciando createUser");
      try {
        console.log("Obteniendo token");
        const token = await getAccessTokenSilently({
          audience: process.env.REACT_APP_AUTH0_AUDIENCE,
          scope: "create:users",
        });
        console.log("Token obtenido:", token);

        const userData = {
          email: user.email,
          wallet: 0,
        };
        console.log("Datos del usuario:", userData);

        console.log("Llamando al backend");
        const response = await axios.post(
          `${process.env.REACT_APP_URL_API}/users`, // Cambiado a HTTP
          userData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            timeout: 30000, // 5 segundos de timeout
          }
        );
        console.log("Respuesta del backend:", response.data);

        console.log("Redirigiendo al usuario");
        navigate("/");
      } catch (error) {
        console.error("Error creating user:", error);
        if (error.response) {
          // El servidor respondió con un estado fuera del rango de 2xx
          navigate("/");
          setError(
            `Error del servidor: ${error.response.status} - ${
              error.response.data.detail || error.response.data
            }`
          );
        } else if (error.request) {
          // La petición fue hecha pero no se recibió respuesta
          setError(
            "No se recibió respuesta del servidor. Verifica que el backend esté en ejecución."
          );
        } else {
          // Algo sucedió al configurar la petición que provocó un error
          setError(`Error de configuración: ${error.message}`);
        }
      }
    };

    if (!isLoading) {
      console.log("Auth0 cargado. isAuthenticated:", isAuthenticated);
      if (isAuthenticated) {
        createUser();
      } else {
        console.log("Usuario no autenticado. Redirigiendo...");
        navigate("/");
      }
    }
  }, [isAuthenticated, isLoading, getAccessTokenSilently, user, navigate]);

  if (isLoading) {
    return <div>Cargando autenticación...</div>;
  }

  if (error) {
    return (
      <div>
        <h2>Error:</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/")}>Volver al inicio</button>
      </div>
    );
  }

  return <div>Procesando callback...</div>;
};

export default Callback;
