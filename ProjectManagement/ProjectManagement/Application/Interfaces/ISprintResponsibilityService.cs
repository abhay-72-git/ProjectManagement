using ProjectManagement.Application.DTOs.SprintResponsibility;

namespace ProjectManagement.Application.Interfaces
{
    public interface ISprintResponsibilityService
    {
        Task<List<SprintResponsibilityResponseDto>> GetAllAsync();
        Task<SprintResponsibilityResponseDto?> GetByIdAsync(int id);
        Task<int> CreateAsync(SprintResponsibilityRequestDto dto);
        Task<bool> UpdateAsync(int id, SprintResponsibilityRequestDto dto);
        Task<bool> DeleteAsync(int id);
    }

}
