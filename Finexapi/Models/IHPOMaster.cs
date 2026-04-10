

using FinexAPI.Models.IHPOs;

namespace FinexAPI.Models
{
    public class IHPOMaster
    {
        public IHPO Ihpo { get; set; }
        public IHPODetails? details { get; set; }
        public IHPOApproval? approval { get; set; }
        public IHPOPricing? pricing { get; set; }
    }
}
