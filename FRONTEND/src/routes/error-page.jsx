import { useRouteError } from "react-router-dom";
import MyNavbar from "../components/navbar";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, ModalBody, ModalHeader } from "reactstrap";
import React from 'react';


export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <Modal>
      <ModalHeader>
        <MyNavbar />
      </ModalHeader>
      <ModalBody>
        <div id="error-page">
          <h1>Oops!</h1>
          <p>Sorry, an unexpected error has occurred.</p>
          <p>
            <i>{error.statusText || error.message}</i>
          </p>
        </div>
      </ModalBody>
    </Modal>
  );
}
