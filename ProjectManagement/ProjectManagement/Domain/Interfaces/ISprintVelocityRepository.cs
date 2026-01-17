using ProjectManagement.Domain.Entities;

namespace ProjectManagement.Domain.Interfaces
{
    public interface ISprintVelocityRepository
    {
        Task<IEnumerable<SprintVelocity>> GetAllAsync();
        Task<SprintVelocity?> GetByIdAsync(int id);
        Task AddAsync(SprintVelocity sprintVelocity);
        Task UpdateAsync(SprintVelocity sprintVelocity);
        Task DeleteAsync(SprintVelocity sprintVelocity);
    }

}
