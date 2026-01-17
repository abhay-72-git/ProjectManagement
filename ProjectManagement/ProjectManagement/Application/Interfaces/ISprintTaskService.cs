using ProjectManagement.Application.DTOs.SprintResponsibility;
using ProjectManagement.Application.DTOs.SprintTask;
using ProjectManagement.Domain.Entities;

namespace ProjectManagement.Application.Interfaces
{
    public interface ISprintTaskService
    {
        Task<SprintTaskDto> CreateAsync(SprintTaskDto dto);

        // UPDATE
        Task<bool> UpdateAsync(int id, SprintTaskDto dto);

        // DELETE
        Task<bool> DeleteAsync(int id);

        // GET
        Task<IEnumerable<SprintTaskDto>> GetAllAsync();
        Task<SprintTaskDto?> GetByIdAsync(int id);

        // SUMMARY
        Task<SprintStoryPointSummaryDto> GetStoryPointSummaryAsync(int sprintVelocityId);
    }

}
