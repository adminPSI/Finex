export const endDateCell = (props) => {
    var myDate = props.dataItem.trans_Date;
    if (myDate) {
      const [year, month, day] = myDate.split("T")[0].split("-");
      return <td>{`${month}/${day}/${year}`}</td>;
    } else {
      return <td></td>;
    }
  };