namespace FinexAPI.Models
{
    public class Transfer
    {
        public int fromFundId { get; set; }
        public int toFundId { get; set; }
        public decimal amount { get; set; }
        public DateTime date { get; set; }
        public int transferTypeCode { get; set; }
        public string? notes { get; set; }


    }

    public class TransferExpenseAmount
    {
        public int fromExpenseId { get; set; }
        public int toExpenseId { get; set; }
        public decimal amount { get; set; }
        public DateTime date { get; set; }

        public int transferTypeCode { get; set; }
        public string? notes { get; set; }

    }

}
