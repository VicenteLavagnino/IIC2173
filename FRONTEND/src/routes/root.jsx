import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

import MyNavbar from "../components/navbar";

export default function Root() {
  return (
    <div className="App">
      <div className="container">
        <MyNavbar />
      </div>
    </div>
  );
}
