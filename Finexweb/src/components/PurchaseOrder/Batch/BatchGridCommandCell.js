import { Button } from "@progress/kendo-react-buttons";

export const BatchGridCommandCell = ({
  props,
  setAddEditBatchData,
  batchOffset,
  setBatchShowContextMenu,
}) => {
  const handleBatchContextMenu = (e, data) => {
    e.preventDefault();
    setAddEditBatchData(data);
    batchOffset.current = {
      left: e.pageX,
      top: e.pageY,
    };
    setBatchShowContextMenu(true);
  };

  return (
    <>
      <td className="k-command-cell">
        <Button
          id={props.dataItem.id}
          onClick={(event) => handleBatchContextMenu(event, props.dataItem)}
          style={{
            backgroundColor: "transparent",
            border: "none",
          }}
        >
          <i className="fa-solid fa-ellipsis"></i>
        </Button>
      </td>
    </>
  );
};
