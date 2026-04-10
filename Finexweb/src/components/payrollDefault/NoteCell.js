import { GridCell } from "@progress/kendo-react-grid";
import { FormTextArea } from "../form-components";
import { alphaNumericWithSpaceValidator } from "../validators";
import { useEffect, useRef } from "react";

const NotesCell = ({ props, newPayrollData, setNewPayrollData }) => {
  const { inEdit } = props.dataItem;
  const textAreaRef = useRef(null);

  const handleChange = (e) => {
    if (props.onChange) {
      if (alphaNumericWithSpaceValidator(e.target.value)) {
        return;
      }

      const itemIndex = newPayrollData.findIndex(
        (item) => item.srNo == props.dataItem?.srNo
      );

      if (itemIndex !== -1) {
        const updateData = [...newPayrollData];
        updateData[itemIndex] = {
          ...updateData[itemIndex],
          Notes: e.target.value,
        };
        setNewPayrollData(updateData);

        setTimeout(() => {
          if (textAreaRef.current) {
            textAreaRef.current.focus();
          }
        }, 0);
      }
    }
  };
  const handelFocus = (element) => {
    if (element && inEdit) {
      setTimeout(() => {
        element.focus();
      }, 0);
    }
  };
  if (inEdit) {
    return (
      <td>
        <FormTextArea
          {...props}
          ref={handelFocus}
          value={props.dataItem[props.field] || ""}
          onChange={handleChange}
          validator={alphaNumericWithSpaceValidator}
        />
      </td>
    );
  }
};

export default NotesCell;
