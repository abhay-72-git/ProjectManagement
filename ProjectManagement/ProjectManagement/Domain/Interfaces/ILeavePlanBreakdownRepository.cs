using ProjectManagement.Domain.Entities;

namespace ProjectManagement.Domain.Interfaces
{
    public interface ILeavePlanBreakdownRepository
    {
        Task AddRangeAsync(List<LeavePlanBreakdown> breakdowns);
        Task DeleteByLeavePlanIdAsync(int leavePlanId);
        Task<List<LeavePlanBreakdown>> GetByLeavePlanIdAsync(int leavePlanId);
    }
}
