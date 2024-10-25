import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <>
      <div className="navbar bg-sky-300 rounded-b-xl mb-2">
        <div className="flex-1">
          <a className="text-2xl font-bold ps-4">Badminton Club</a>
        </div>
        <div className="flex-none">
          <ul className="menu menu-horizontal px-1">
            <li>
              <Link to={"/Report"}>Report</Link>
            </li>
            <li>
              <Link to={"/Record"}>Record</Link>
            </li>
            <li>
              <Link to={"/Member"}>Member</Link>
            </li>
            <li>
              <Link to={"/Account"}>Account</Link>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}

export default Navbar;
