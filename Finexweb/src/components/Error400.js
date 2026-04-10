import React from "react";
import Image400 from "../img/error404.jpg";

export default function Error400() {
  return (
    <>
      <center>
        <img src={Image400} height={500} width={500}></img> <br />
        <a href="/" className="btn btn-primary btn-rounded">
          Go Home
        </a>
      </center>
    </>
  );
}
