using FinexAPI.Models.PurchaseOrder;

namespace FinexAPI.Models
{
    public class PurchaseOrderMaster
    {
        public CountyPO countyPO { get; set; }
        public CountyPODetails? countyPODetails { get; set; }

        public CountyPOPricing? countyPOPricing { get; set; }


    }

}
