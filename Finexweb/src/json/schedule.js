export const customModelFields = {
  id: "TaskID",
  title: "Title",
  description: "Description",
  start: "Start",
  end: "End",
  recurrenceRule: "RecurrenceRule",
  recurrenceId: "RecurrenceID",
  recurrenceExceptions: "RecurrenceException",
};
const currentYear = new Date().getFullYear();
const currentDate = new Date().getDate();
const currentMonth = new Date().getMonth();
const parseAdjust = (eventDate) => {
  const date = new Date(eventDate);
  return date;
};
const parseTime = (eventDate) => {
  const date = new Date(eventDate);
  let time = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  return time;
};
export const displayDate = new Date(
  Date.UTC(currentYear, currentMonth, currentDate)
);
export const sampleData = (data) =>
  data.map((dataItem) => ({
    id: dataItem.id,
    start: parseAdjust(dataItem.startDateTime),
    startTimezone: "Etc/UTC",
    end: parseAdjust(dataItem.endDateTime),
    endTimezone: "Etc/UTC",
    isAllDay: false,
    title: `${parseTime(dataItem.startDateTime)} - ${parseTime(dataItem.endDateTime)}`,
    description: "",
    recurrenceRule: null,
    recurrenceId: null,
    recurrenceExceptions: null,
    ownerID: dataItem.employeeId,
  }));
