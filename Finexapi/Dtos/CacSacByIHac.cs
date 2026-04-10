using FinexAPI.Models;
using FinexAPI.Models.SAC;

namespace FinexAPI.Dtos
{
    public class CacSacByIHacDto
    {
        public IHACCode? IHACCodeData { get; set; }
        public StateAccountCodeDetails? SACData { get; set; }
        public AccountingCode? CACData { get; set; }
    }
}
