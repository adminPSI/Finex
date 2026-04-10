namespace FinexAPI.Helper
{
    public class IHPOWorkflowEmailMetaData
    {
        public string IhpoReqNumber { get; set; }
        public int? pONumber { get; set; }
        public string Role { get; set; }
        public string status { get; set; }

        public string SendTo { get; set; }
    }
}
