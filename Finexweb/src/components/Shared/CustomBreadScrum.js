import React from "react";
import { Link } from "react-router-dom";

const CustomBreadScrum = ({ data }) => {
  return (
    <nav aria-label="breadcrumb">
      <ol className="breadcrumb">
        {data.map((item, index) => {
          return (
            <li
              className="breadcrumb-item active"
              aria-current="page"
              key={index}
            >
              <Link to={item.link}>{item.title}</Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default CustomBreadScrum;
