import React from "react";

function Footer() {
  return (
    <>
      <footer className="fixed start-0 bottom-0 w-full footer footer-center bg-base-300 text-base-content p-4">
        <aside>
          <p>
            Copyright © {new Date().getFullYear()} - All right reserved by ACME
            Industries Ltd
          </p>
        </aside>
      </footer>
    </>
  );
}

export default Footer;
