using ProjectManagement.Application.DTOs.SprintVelocity;
using ProjectManagement.Domain.Entities;

namespace ProjectManagement.Application.Interfaces
{
    public interface ISprintVelocityService
    {
        Task<IEnumerable<SprintVelocity>> GetAllAsync();
        Task<SprintVelocity?> GetByIdAsync(int id);
        Task<SprintVelocity> CreateAsync(SprintVelocityDto dto);
        Task<bool> UpdateAsync(int id, SprintVelocityDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
