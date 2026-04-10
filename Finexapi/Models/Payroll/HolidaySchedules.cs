using System.ComponentModel.DataAnnotations.Schema;

namespace FinexAPI.Models.Payroll
{
    [Table("HOLIDAY_SCHEDULES")]
    public class HolidaySchedules : Common
    {
        [Column("ID")]
        public int Id { get; set; }
        [Column("ORG_ACCOUNT_ID")]
        public int ORG_ID { get; set; }
        [Column("DESCRIPTION")]
        public string Description { get; set; }
        [Column("ACTIVE_IND")]
        public string Inactive { get; set; }
    }
}

/*
 * [
    {
        "employeeId": 8,
        "dayOfWeek": 1,
        "dayOfMonth": null,
        "startDateTime": "0001-01-01T16:00:00.000Z",
        "endDateTime": "0001-01-01T18:00:00.000Z",
        "createdDate": "2023-11-16T12:13:09.724Z",
        "createdBy": "string",
        "lastModifiedDate": "2023-11-16T12:13:09.724Z",
        "lastModifiedBy": "string"
    },
    {
        "employeeId": 8,
        "dayOfWeek": 2,
        "dayOfMonth": null,
        "startDateTime": "0001-01-01T16:00:00.000Z",
        "endDateTime": "0001-01-01T18:00:00.000Z",
        "createdDate": "2023-11-16T12:13:09.724Z",
        "createdBy": "string",
        "lastModifiedDate": "2023-11-16T12:13:09.724Z",
        "lastModifiedBy": "string"
    },
    {
        "employeeId": 8,
        "dayOfWeek": 3,
        "dayOfMonth": null,
        "startDateTime": "0001-01-01T16:00:00.000Z",
        "endDateTime": "0001-01-01T18:00:00.000Z",
        "createdDate": "2023-11-16T12:13:09.724Z",
        "createdBy": "string",
        "lastModifiedDate": "2023-11-16T12:13:09.724Z",
        "lastModifiedBy": "string"
    },
    {
        "employeeId": 8,
        "dayOfWeek": 4,
        "dayOfMonth": null,
        "startDateTime": "0001-01-01T16:00:00.000Z",
        "endDateTime": "0001-01-01T18:00:00.000Z",
        "createdDate": "2023-11-16T12:13:09.724Z",
        "createdBy": "string",
        "lastModifiedDate": "2023-11-16T12:13:09.724Z",
        "lastModifiedBy": "string"
    },
    {
        "employeeId": 8,
        "dayOfWeek": 5,
        "dayOfMonth": null,
        "startDateTime": "0001-01-01T16:00:00.000Z",
        "endDateTime": "0001-01-01T18:00:00.000Z",
        "createdDate": "2023-11-16T12:13:09.724Z",
        "createdBy": "string",
        "lastModifiedDate": "2023-11-16T12:13:09.724Z",
        "lastModifiedBy": "string"
    }
]
*/