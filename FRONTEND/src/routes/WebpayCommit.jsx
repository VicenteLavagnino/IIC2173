import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Alert } from "reactstrap";

const WebpayCommit = () => {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token_ws = params.get("token_ws");

    const commitTransaction = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_URL_API}/webpay/commit?token_ws=${token_ws}`
        );
        if (response.data.status === "AUTHORIZED") {
          setSuccess("Transaction confirmed successfully.");
          setTimeout(() => {
            navigate("/matches");
          }, 3000);
        } else {
          setError(`Transaction failed: ${response.data.message}`);
          setTimeout(() => {
            navigate("/matches");
          }, 3000);
        }
      } catch (error) {
        setError("An error occurred while committing the transaction.");
      }
    };

    if (token_ws) {
      commitTransaction();
    } else {
      setError("No transaction token found.");
    }
  }, [navigate]); // Agrega 'navigate' en el array de dependencias

  return (
    <div>
      {error && <Alert color="danger">{error}</Alert>}
      {success && <Alert color="success">{success}</Alert>}
    </div>
  );
};

export default WebpayCommit;
