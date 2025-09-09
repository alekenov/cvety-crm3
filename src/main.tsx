
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { AppProvider } from "@/src/contexts/AppContext";
import { QueryProvider } from "@/shared/providers";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <QueryProvider>
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  </QueryProvider>
);
  
