import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import { ThemeProvider } from "./context/ThemeContext/ThemeContext";

import "./index.css";
import { AuthProvider } from "./context/authContext/authContext";
import { NotificationProvider } from "./context/NotiificationContext/NotificationContext";
import { MessageProvider } from "./context/MessageContext/MessageContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <MessageProvider>
            <App/>
          </MessageProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);