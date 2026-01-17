using ProjectManagement.Domain.Entities;

namespace ProjectManagement.Domain.Interfaces
{
    public interface ISprintMomRepository
    {
        Task<SprintMom> AddAsync(SprintMom sprintMom);
        Task<List<SprintMom>> GetAllAsync();
        Task<SprintMom> GetByIdAsync(int id);
        Task<SprintMom> UpdateAsync(SprintMom sprintMom);
        Task DeleteAsync(int id);
    }
}
