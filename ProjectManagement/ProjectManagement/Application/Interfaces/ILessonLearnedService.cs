using ProjectManagement.Application.DTOs.Learning;

namespace ProjectManagement.Application.Interfaces
{
    public interface ILessonLearnedService
    {
        Task<int> CreateAsync(LessonLearnedRequestDto dto);
        Task<List<LessonLearnedResponseDto>> GetAllAsync();
        Task UpdateAsync(int id, LessonLearnedRequestDto dto);
        Task DeleteAsync(int id);
    }

}
