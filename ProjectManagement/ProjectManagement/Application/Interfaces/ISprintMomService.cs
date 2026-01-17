using ProjectManagement.Application.DTOs.SprintMom;

namespace ProjectManagement.Application.Interfaces
{
    public interface ISprintMomService
    {
        Task<SprintMomResponseDto> CreateAsync(SprintMomRequestDto dto);
        Task<List<SprintMomResponseDto>> GetAllAsync();
        Task<SprintMomResponseDto> GetByIdAsync(int id);
        Task<SprintMomResponseDto> UpdateAsync(int id, SprintMomRequestDto dto);
        Task DeleteAsync(int id);
    }
}
