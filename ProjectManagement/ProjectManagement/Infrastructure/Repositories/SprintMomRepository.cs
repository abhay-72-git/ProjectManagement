using Microsoft.EntityFrameworkCore;
using ProjectManagement.Domain.Entities;
using ProjectManagement.Domain.Interfaces;
using ProjectManagement.Infrastructure.Persistence;

namespace ProjectManagement.Infrastructure.Repositories
{
    public class SprintMomRepository: ISprintMomRepository
    {
        private readonly AppDbContext _context;

        public SprintMomRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<SprintMom> AddAsync(SprintMom sprintMom)
        {
            _context.SprintMoms.Add(sprintMom);
            await _context.SaveChangesAsync();
            return sprintMom;
        }

        public async Task<List<SprintMom>> GetAllAsync()
        {
            return await _context.SprintMoms.ToListAsync();
        }

        public async Task<SprintMom> GetByIdAsync(int id)
        {
            return await _context.SprintMoms.FindAsync(id);
        }

        public async Task<SprintMom> UpdateAsync(SprintMom sprintMom)
        {
            _context.SprintMoms.Update(sprintMom);
            await _context.SaveChangesAsync();
            return sprintMom;
        }

        public async Task DeleteAsync(int id)
        {
            var sprintMom = await _context.SprintMoms.FindAsync(id);
            if (sprintMom != null)
            {
                _context.SprintMoms.Remove(sprintMom);
                await _context.SaveChangesAsync();
            }
        }
    }
}

