import { Button } from "@progress/kendo-react-buttons";
import React from "react";

const CustomButton = ({ className, onClick, text, themeColor, fillMode }) => {
  return (
    <Button
      className={className || "buttons-container-button"}
      fillMode={fillMode || "outline"}
      themeColor={themeColor || "primary"}
      onClick={onClick}
    >
      {text}
    </Button>
  );
};

export default CustomButton;
