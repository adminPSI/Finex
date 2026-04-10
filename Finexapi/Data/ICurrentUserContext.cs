namespace FinexAPI.Data
{
    public interface ICurrentUserContext
    {
        public int OrgAccountId { get; }
        public int UserId { get; }
    }
}
