import { Button } from "@progress/kendo-react-buttons";
import { eyedropperIcon, trashIcon } from "@progress/kendo-svg-icons";
import * as React from "react";
export const MyCommandCell = (props) => {
  const { dataItem } = props;
  const inEdit = dataItem[props.editField];
  const isNewItem = dataItem.id == undefined || dataItem.id == 0;
  return inEdit ? (
    <td className="k-command-cell">
      <Button
        disabled={dataItem.projectEnded}
        onClick={() =>
          isNewItem ? props.update(dataItem) : props.update(dataItem)
        }
      >
        {isNewItem ? "Add" : "Update"}
      </Button>
      {!isNewItem && (
        <Button
          disabled={dataItem.projectEnded}
          onClick={() =>
            isNewItem ? props.discard(dataItem) : props.cancel(dataItem)
          }
        >
          Cancel
        </Button>
      )}
    </td>
  ) : (
    <td className="k-command-cell">
      <Button
        disabled={dataItem.projectEnded}
        themeColor="primary"
        onClick={() => props.edit(dataItem)}
        svgIcon={eyedropperIcon}
      ></Button>
      <Button
        disabled={dataItem.projectEnded}
        themeColor="primary"
        onClick={() => props.remove(dataItem)}
        svgIcon={trashIcon}
      ></Button>
    </td>
  );
};
