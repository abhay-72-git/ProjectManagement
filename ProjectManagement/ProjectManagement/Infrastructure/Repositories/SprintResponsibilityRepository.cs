using Microsoft.EntityFrameworkCore;
using ProjectManagement.Domain.Entities;
using ProjectManagement.Domain.Interfaces;
using ProjectManagement.Infrastructure.Persistence;

namespace ProjectManagement.Infrastructure.Repositories
{
    public class SprintResponsibilityRepository : ISprintResponsibilityRepository
    {
        private readonly AppDbContext _context;

        public SprintResponsibilityRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<SprintResponsibility>> GetAllAsync()
        {
            return await _context.SprintResponsibilities
                .Include(x => x.Sprint)
                .Include(x => x.DsrSendingUser)
                .Include(x => x.DataMatrixUser)
                .Include(x => x.ScrumMasterUser)
                .ToListAsync();
        }

        public async Task<SprintResponsibility?> GetByIdAsync(int id)
        {
            return await _context.SprintResponsibilities
                .Include(x => x.Sprint)
                .Include(x => x.DsrSendingUser)
                .Include(x => x.DataMatrixUser)
                .Include(x => x.ScrumMasterUser)
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task AddAsync(SprintResponsibility entity)
        {
            await _context.SprintResponsibilities.AddAsync(entity);
        }

        public void Update(SprintResponsibility entity)
        {
            _context.SprintResponsibilities.Update(entity);
        }

        public void Delete(SprintResponsibility entity)
        {
            _context.SprintResponsibilities.Remove(entity);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
