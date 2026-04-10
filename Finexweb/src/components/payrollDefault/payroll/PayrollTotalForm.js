import React, { useEffect, useState } from "react";
import { Form, Field, FormElement } from "@progress/kendo-react-form";

import { FormNumericTextBox } from "../../form-components";

const PayrollTotalForm = ({ payrollToatals }) => {
  const [formKey, setFormKey] = useState(1);

  useEffect(() => {
    setFormKey(formKey + 1);
  }, [payrollToatals]);

  return (
    <Form
      onSubmit={{}}
      initialValues={{
        cacTotal: payrollToatals.cacTotal ?? "$0",
        empTotal: payrollToatals.empTotal ?? "$0",
        payrollTotal: payrollToatals.payrollTotal ?? "0",
      }}
      key={formKey}
      render={(formRenderProps) => (
        <FormElement>
          <fieldset className={"k-form-fieldset"}>
            <div
              className="d-flex justify-content align-items-end m-0"
              style={{
                display: "flex",
                 justifyContent: "flex-end",
              }}
            >
              <Field
                id={"empTotal"}
                name={"empTotal"}
                label={"EMP Total"}
                format={"c"}
                step={0}
                spinners={false}
                component={FormNumericTextBox}
                wrapperstyle={{
                  width: "160px",
                  fontWeight: 600,
                  marginRight: "10px",
                }}
                disabled={true}
              />

              <Field
                id={"cacTotal"}
                name={"cacTotal"}
                label={"CAC Total"}
                format={"c"}
                step={0}
                spinners={false}
                component={FormNumericTextBox}
                wrapperstyle={{
                  width: "160px",
                  fontWeight: 600,
                  marginRight: "10px",
                }}
                disabled={true}
              />
              <Field
                id={"payrollTotal"}
                name={"payrollTotal"}
                label={"Payroll Total"}
                format={"c"}
                step={0}
                spinners={false}
                component={FormNumericTextBox}
                wrapperstyle={{
                  width: "160px",
                  fontWeight: 600,
                  marginRight: "10px",
                }}
                disabled={true}
              />
            </div>
          </fieldset>
        </FormElement>
      )}
    />
  );
};

export default PayrollTotalForm;
