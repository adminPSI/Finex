import React, { useEffect, useState } from "react";
import axiosInstance from "../../core/HttpInterceptor";

import { Grid, GridColumn as Column } from "@progress/kendo-react-grid";

const FunctionalDemoResourceData = () => {
  const [resourceData, setResourceData] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      const resourceDataAPI = await axiosInstance({
        method: "GET",
        url: "http://192.168.68.53:5051/api/Authorization/Resources",
      });

      const responses = await Promise.allSettled([resourceDataAPI]);

      setResourceData(responses[0].value.data);

      setIsLoading(false);
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <p>Loading.......</p>;
  }

  return (
    <div>
      <div
        style={{
          border: "1px solid black",
          borderRadius: "15px",
          padding: "30px",
          margin: "30px",
        }}
      >
        <h1>Resource Data</h1>
        <Grid resizable={true} data={resourceData}>
          <Column field="resourceS_ID" title="resourceS_ID" />
          <Column field="resourceS_TYPE" title="resourceS_TYPE" />
          <Column field="resourceS_KEY" title="resourceS_KEY" />
          <Column field="resourceS_NAME" title="resourceS_NAME" />
          <Column field="resourceS_URI" title="resourceS_URI" />
          <Column field="parenT_RESOURCES_ID" title="parenT_RESOURCES_ID" />
          <Column field="sorT_KEY" title="sorT_KEY" />
          <Column field="applicationS_ID" title="applicationS_ID" />
          <Column field="icon" title="icon" />
          <Column field="resourceS_LEVEL" title="resourceS_LEVEL" />
        </Grid>
      </div>
    </div>
  );
};

export default FunctionalDemoResourceData;
