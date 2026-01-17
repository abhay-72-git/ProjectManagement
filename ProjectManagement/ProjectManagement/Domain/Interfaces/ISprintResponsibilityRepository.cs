using ProjectManagement.Application.DTOs.SprintResponsibility;
using ProjectManagement.Domain.Entities;
using System.Threading.Tasks;

namespace ProjectManagement.Domain.Interfaces
{
        public interface ISprintResponsibilityRepository
        {
            Task<List<SprintResponsibility>> GetAllAsync();
            Task<SprintResponsibility?> GetByIdAsync(int id);
            Task AddAsync(SprintResponsibility entity);
            void Update(SprintResponsibility entity);
            void Delete(SprintResponsibility entity);
            Task SaveChangesAsync();
        }

}
