import React from "react";
import ReactDOM from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";

import "./index.css";
import Matches from "./routes/Matches";
import MatchesByDate from "./routes/MatchesByDate";
import SignUp from "./routes/SignUpForm";
import Root from "./routes/root";
import ErrorPage from "./routes/error-page";
import Callback from "./routes/callback";
import Wallet from "./routes/Wallet";
import WebpayCommit from "./routes/WebpayCommit";
import MyBondsPage from "./routes/MyBonds";
import RecomendationPage from "./routes/MyRecomendations";
import GroupBonds from "./routes/GroupBonds";
import AuctionOffers from "./routes/AuctionOffers";
import OurBonds from "./routes/OurBonds";
import AuctionProposals from "./routes/AuctionProposals";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/matches",
    element: <Matches />,
  },
  {
    path: "/matchesbydate",
    element: <MatchesByDate />,
  },
  {
    path: "/callback",
    element: <Callback />,
  },
  {
    path: "/mywallet",
    element: <Wallet />,
  },
  {
    path: "/webpay/commit",
    element: <WebpayCommit />,
  },
  {
    path: "/mybonds",
    element: <MyBondsPage />,
  },
  {
    path: "/myrecomendations",
    element: <RecomendationPage />,
  },
  {
    path: "/groupbonds",
    element: <GroupBonds />,
  },
  {
    path: "/propose",
    element: <AuctionOffers />,
  },
  {
    path: "/our-bonds",
    element: <OurBonds />,
  },
  {
    path: "/proposals",
    element: <AuctionProposals />,
  },
]);

// Configuración de Auth0Provider con tu dominio y clientId
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Auth0Provider
      domain={process.env.REACT_APP_AUTH0_DOMAIN}
      clientId={process.env.REACT_APP_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin + "/callback",
        audience: process.env.REACT_APP_AUTH0_AUDIENCE,
        scope: "openid profile email create:users read:users",
      }}
    >
      <RouterProvider router={router} />
    </Auth0Provider>
  </React.StrictMode>
);
