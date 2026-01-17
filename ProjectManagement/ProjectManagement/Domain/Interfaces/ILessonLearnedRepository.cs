using ProjectManagement.Domain.Entities;

namespace ProjectManagement.Domain.Interfaces
{
    public interface ILessonLearnedRepository
    {
        Task<LessonLearned> AddAsync(LessonLearned entity);
        Task<LessonLearned?> GetByIdAsync(int id);
        Task<List<LessonLearned>> GetAllAsync();
        Task UpdateAsync(LessonLearned entity);
        Task DeleteAsync(LessonLearned entity);
    }

}
