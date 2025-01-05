// import React, { useState, useEffect } from "react";
// import "bootstrap/dist/css/bootstrap.min.css";
// import logo from "../images/logo.png";
// import {
//   Collapse,
//   Navbar,
//   NavbarToggler,
//   NavbarBrand,
//   Nav,
//   NavItem,
//   NavLink,
//   Alert,
// } from "reactstrap";
// import { Link } from "react-router-dom";
// import styled from "styled-components";
// import SignUpForm from "../components/singupForm";
// import Login from "../components/loginForm";
// import Logout from "../components/logoutForm";
// import { useAuth0 } from "@auth0/auth0-react";

// const StyledNavbarContainer = styled.div`
//   margin: 5%;
// `;

// function MyNavbar() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [showRecommendations, setShowRecommendations] = useState(false);
//   const [alertVisible, setAlertVisible] = useState(false);
//   const { isAuthenticated } = useAuth0();

//   const toggle = () => setIsOpen(!isOpen);

//   useEffect(() => {
//     const checkHeartbeat = async () => {
//       try {
//         const response = await fetch("/heartbeat");
//         const data = await response.json();

//         if (data.status === "operational") {
//           setShowRecommendations(true);
//         } else {
//           throw new Error("Service not operational");
//         }
//       } catch (error) {
//         setShowRecommendations(false);
//         setAlertVisible(true);
//       }
//     };
//     checkHeartbeat();
//   }, []);

//   return (
//     <StyledNavbarContainer>
//       {alertVisible && (
//         <Alert color="danger" toggle={() => setAlertVisible(false)}>
//           El servicio no está operativo. No se pueden cargar las
//           recomendaciones.
//         </Alert>
//       )}
//       <Navbar color="light" fixed="top" expand="sm">
//         <NavbarBrand tag={Link} to="/">
//           <img
//             alt="logo"
//             src={logo}
//             style={{
//               height: 30,
//               width: 30,
//               marginRight: "10px",
//             }}
//           />
//           G8 Gambling
//         </NavbarBrand>
//         <NavbarToggler onClick={toggle} aria-label="Toggle navigation" />
//         <Collapse isOpen={isOpen} navbar>
//           <Nav className="me-auto" navbar>
//             <NavItem>
//               <NavLink tag={Link} to="/matches">
//                 Partidos
//               </NavLink>
//             </NavItem>
//           </Nav>
//           <Nav className="ms-auto" navbar>
//             {isAuthenticated ? (
//               <>
//                 <NavItem>
//                   <NavLink href="/mybonds">Mis Bonos</NavLink>
//                 </NavItem>
//                 {showRecommendations && (
//                   <NavItem>
//                     <NavLink href="/myrecomendations">Recomendaciones</NavLink>
//                   </NavItem>
//                 )}
//                 <NavItem>
//                   <NavLink href="/mywallet">Billetera</NavLink>
//                 </NavItem>
//                 <NavItem>
//                   <Logout />
//                 </NavItem>
//               </>
//             ) : (
//               <>
//                 <NavItem>
//                   <Login />
//                 </NavItem>
//                 <NavItem>
//                   <SignUpForm />
//                 </NavItem>
//               </>
//             )}
//           </Nav>
//         </Collapse>
//       </Navbar>
//     </StyledNavbarContainer>
//   );
// }

// export default MyNavbar;
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import logo from "../images/logo.png";
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  Alert,
} from "reactstrap";
import { Link } from "react-router-dom";
import styled from "styled-components";
import SignUpForm from "../components/singupForm";
import Login from "../components/loginForm";
import Logout from "../components/logoutForm";
import { useAuth0 } from "@auth0/auth0-react";

const StyledNavbarContainer = styled.div`
  margin: 5%;
`;

function MyNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  const toggle = () => setIsOpen(!isOpen);

  useEffect(() => {
    const checkHeartbeat = async () => {
      try {
        // Obtener el token de Auth0
        const token = await getAccessTokenSilently();

        // Realizar la solicitud a /heartbeat
        const response = await axios.get(
          `${process.env.REACT_APP_URL_API}/heartbeat`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.status === "operational") {
          setShowRecommendations(true);
        } else {
          throw new Error("El servicio no está operativo.");
        }
      } catch (error) {
        setAlertVisible(true);
      }
    };
    checkHeartbeat();
  }, [getAccessTokenSilently]);

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
    }
  }, [getAccessTokenSilently]);

  useEffect(() => {
    obtenerAdmin();
  }, [obtenerAdmin]);

  return (
    <StyledNavbarContainer>
      {alertVisible && (
        <Alert color="danger" toggle={() => setAlertVisible(false)}>
          No se pudo cargar las recomendaciones.
        </Alert>
      )}
      <Navbar color="light" fixed="top" expand="sm">
        <NavbarBrand tag={Link} to="/">
          <img
            alt="logo"
            src={logo}
            style={{
              height: 30,
              width: 30,
              marginRight: "10px",
            }}
          />
          G8 Gambling
        </NavbarBrand>
        <NavbarToggler onClick={toggle} aria-label="Toggle navigation" />
        <Collapse isOpen={isOpen} navbar>
          <Nav className="me-auto" navbar>
            <NavItem>
              <NavLink tag={Link} to="/matches">
                Partidos
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={Link} to="/our-bonds">
                Ofertas
              </NavLink>
            </NavItem>
          </Nav>
          <Nav className="ms-auto" navbar>
            {isAuthenticated ? (
              <>
                {admin && (
                    <NavItem>
                      <NavLink href="/proposals">Propuestas</NavLink>
                    </NavItem>
                  )}
                {admin && (
                  <NavItem>
                    <NavLink href="/propose">Intercambio</NavLink>
                  </NavItem>
                )}
                {admin && (
                  <NavItem>
                    <NavLink href="/groupbonds">Bonos Grupo</NavLink>
                  </NavItem>
                )}
                <NavItem>
                  <NavLink href="/mybonds">Mis Bonos</NavLink>
                </NavItem>
                {showRecommendations && (
                  <NavItem>
                    <NavLink href="/myrecomendations">Recomendaciones</NavLink>
                  </NavItem>
                )}
                <NavItem>
                  <NavLink href="/mywallet">Billetera</NavLink>
                </NavItem>
                <NavItem>
                  <Logout />
                </NavItem>
              </>
            ) : (
              <>
                <NavItem>
                  <Login />
                </NavItem>
                <NavItem>
                  <SignUpForm />
                </NavItem>
              </>
            )}
          </Nav>
        </Collapse>
      </Navbar>
    </StyledNavbarContainer>
  );
}

export default MyNavbar;
