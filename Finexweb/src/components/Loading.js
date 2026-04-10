import React from "react";
import { Loader } from "@progress/kendo-react-indicators";

export default function Loading() {
  return (
    <>
      <center>
        <Loader size="large" type="converging-spinner" />
      </center>
    </>
  );
}
