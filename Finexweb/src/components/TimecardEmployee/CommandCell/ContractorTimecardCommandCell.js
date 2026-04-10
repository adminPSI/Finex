import { Button } from "@progress/kendo-react-buttons";
import { useCallback } from "react";

export const ContractorTimecardCommandCell = (props) => {
  const { dataItem } = props;
  const isNewItem = dataItem.id == 0;

  const inEdit = dataItem.inEdit;

  const handleAddUpdate = useCallback(() => {
    isNewItem ? props.add(dataItem) : props.update(dataItem);
  }, [dataItem, isNewItem, props]);

  const handleDiscardCancel = useCallback(() => {
    isNewItem ? props.discard(dataItem) : props.cancel(dataItem);
  }, [dataItem, isNewItem, props]);

  const handleEdit = useCallback(() => {
    props.edit(dataItem);
  }, [dataItem, props]);

  if (props.rowType == "groupHeader") return null;

  return inEdit ? (
    <td className="k-command-cell">
      <Button onClick={handleAddUpdate}>{isNewItem ? "Add" : "Save"}</Button>
      {!isNewItem && <Button onClick={handleDiscardCancel}>Cancel</Button>}
    </td>
  ) : (
    <td className="k-command-cell">
      <Button themeColor="primary" onClick={handleEdit}>
        Edit
      </Button>
    </td>
  );
};
