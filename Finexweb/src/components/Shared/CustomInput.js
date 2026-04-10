import { Input } from "@progress/kendo-react-inputs";
import React from "react";

const CustomInput = ({ onChange, buttonText }) => {
  return (
    <div className="input-group">
      <Input className="form-control border-end-0 border" onChange={onChange} />
      {buttonText && (
        <span className="input-group-append">
          <button
            className="btn btn-outline-secondary bg-white rounded-0 border-start-0 rounded-end-2 border ms-n5"
            type="button"
          >
            {buttonText}
          </button>
        </span>
      )}
    </div>
  );
};

export default CustomInput;
