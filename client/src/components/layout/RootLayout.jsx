import React from "react";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";
import Footer from "./Footer";

function RootLayout() {
  return (
    <div className="relative">
      <Navbar />
        <div className="p-2 rounded-lg">
            <Outlet />
        </div>
      {/* <Footer /> */}
    </div>
  );
}

export default RootLayout;
