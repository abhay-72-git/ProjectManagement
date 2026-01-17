using Microsoft.EntityFrameworkCore;
using ProjectManagement.Domain.Entities;
using ProjectManagement.Domain.Interfaces;
using ProjectManagement.Infrastructure.Persistence;


namespace ProjectManagement.Infrastructure.Repositories
{
    public class SprintVelocityRepository : ISprintVelocityRepository
    {
        private readonly AppDbContext _context;

        public SprintVelocityRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<SprintVelocity>> GetAllAsync()
        {
            return await _context.SprintVelocities.ToListAsync();
        }

        public async Task<SprintVelocity?> GetByIdAsync(int id)
        {
            return await _context.SprintVelocities.FindAsync(id);
        }

        public async Task AddAsync(SprintVelocity sprintVelocity)
        {
            _context.SprintVelocities.Add(sprintVelocity);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(SprintVelocity sprintVelocity)
        {
            _context.SprintVelocities.Update(sprintVelocity);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(SprintVelocity sprintVelocity)
        {
            _context.SprintVelocities.Remove(sprintVelocity);
            await _context.SaveChangesAsync();
        }
    }

}
