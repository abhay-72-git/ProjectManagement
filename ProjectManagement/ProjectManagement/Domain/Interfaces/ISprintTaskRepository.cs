using ProjectManagement.Application.DTOs.SprintResponsibility;
using ProjectManagement.Domain.Entities;

namespace ProjectManagement.Domain.Interfaces
{
    public interface ISprintTaskRepository
    {
        Task<IEnumerable<SprintTask>> GetAllWithRelationsAsync();
        Task<SprintTask?> GetByIdWithRelationsAsync(int id);
        Task AddAsync(SprintTask task);
        Task UpdateAsync(SprintTask task);
        Task DeleteAsync(SprintTask task);
        Task<SprintStoryPointSummaryDto> GetStoryPointSummaryAsync(int sprintVelocityId);
    }

}
