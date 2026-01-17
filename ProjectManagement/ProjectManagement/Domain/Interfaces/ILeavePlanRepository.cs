using ProjectManagement.Domain.Entities;

public interface ILeavePlanRepository
{
    Task AddAsync(LeavePlan plan);
    Task UpdateAsync(LeavePlan plan);
    Task DeleteAsync(LeavePlan plan);
    Task<LeavePlan> GetByIdAsync(int id);
    Task<List<LeavePlan>> GetByMonthYearAsync(int month, int year);
}
