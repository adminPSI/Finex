import React from "react";
import { Loader } from "@progress/kendo-react-indicators";

export default function Loaders() {
  return (
    <div className="loader-container">
      <Loader size="large" type="converging-spinner" />
    </div>
  );
}
