import { useCallback, useContext } from "react";
import { Button } from "@progress/kendo-react-buttons";
import DataContext from "../../contexts/data-context";
import { eyedropperIcon, trashIcon } from "@progress/kendo-svg-icons";

function MyCommandCell(props) {
  const currentContext = useContext(DataContext);

  const { dataItem } = props;
  const isNewItem = dataItem.id == 0;

  const inEdit = dataItem.inEdit;

  const handleAddUpdate = useCallback(() => {
    isNewItem ? props.add(dataItem) : props.update(dataItem);
  }, [currentContext, dataItem, isNewItem]);

  const handleDiscardCancel = useCallback(() => {
    isNewItem ? props.discard(dataItem) : props.cancel(dataItem);
  }, [currentContext, dataItem, isNewItem]);

  const handleEdit = useCallback(() => {
    props.edit(dataItem);
  }, [currentContext, dataItem]);

  const handleDelete = useCallback(() => {
    props.remove(dataItem);
  }, [currentContext, dataItem]);

  if (props.rowType == "groupHeader") return null;

  return inEdit ? (
    <td className="k-command-cell">
      <Button type="button" onClick={handleAddUpdate}>
        {isNewItem ? "Add" : "Save"}
      </Button>
      {!isNewItem && (
        <Button type="button" onClick={handleDiscardCancel}>
          Cancel
        </Button>
      )}
    </td>
  ) : (
    <td className="k-command-cell">
      <Button
        themeColor="primary"
        onClick={handleEdit}
        svgIcon={eyedropperIcon}
      ></Button>
      <Button onClick={handleDelete} svgIcon={trashIcon}></Button>
    </td>
  );
}

export default MyCommandCell;
