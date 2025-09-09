
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { AppProvider } from "@core/contexts/AppContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <AppProvider>
    <RouterProvider router={router} />
  </AppProvider>
);
  
