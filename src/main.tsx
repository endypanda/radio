import React from 'react'
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from './App.tsx'
import './index.css'
import Host from "./pages/host";
import Listen from "./pages/listen";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
    },
    {
        path: "/host",
        element: <Host />,
    },
    {
        path: "/listen",
        element: <Listen />,
    },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
      <RouterProvider router={router} />
  </React.StrictMode>,
)
