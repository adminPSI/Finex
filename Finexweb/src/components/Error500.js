import React from "react";
import Image500 from "../img/error500.jpg";

export default function Error500() {
  return (
    <>
      <center>
        <img src={Image500} height={500} width={500}></img> <br />
        <a href="/" className="btn btn-primary btn-rounded">
          Go Home
        </a>
      </center>
    </>
  );
}
