import { useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Member from "./components/member/Member";
import Account from "./components/account/Account";
import Record from "./components/record/Record";
import RootLayout from "./components/layout/RootLayout";
import PageNotFound from "./components/layout/PageNotFound";
import Report from "./components/report/Report";


const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <PageNotFound />,
    children: [
      { path: "/Record", element: <Record /> },
      { path: "/Member", element: <Member /> },
      { path: "/Account", element: <Account /> },
      { path: "/Report", element: <Report /> },
    ],
  },
]);

function App() {
  return (
    <>
      <div className="container mx-auto md:px-2">
        <RouterProvider router={router} />
      </div>
    </>
  );
}

export default App;
