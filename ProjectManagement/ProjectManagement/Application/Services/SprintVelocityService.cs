using Microsoft.EntityFrameworkCore;
using ProjectManagement.Application.DTOs.SprintVelocity;
using ProjectManagement.Application.Interfaces;
using ProjectManagement.Domain.Entities;
using ProjectManagement.Infrastructure.Persistence;

namespace ProjectManagement.Application.Services
{
    public class SprintVelocityService : ISprintVelocityService
    {
        private readonly AppDbContext _context;

        public SprintVelocityService(AppDbContext context)
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

        public async Task<SprintVelocity> CreateAsync(SprintVelocityDto dto)
        {
            var sprint = new SprintVelocity
            {
                SprintNumber = dto.SprintNumber,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                VelocityAchieved = dto.VelocityAchieved
            };

            _context.SprintVelocities.Add(sprint);
            await _context.SaveChangesAsync();

            return sprint;
        }

        public async Task<bool> UpdateAsync(int id, SprintVelocityDto dto)
        {
            var sprint = await _context.SprintVelocities.FindAsync(id);
            if (sprint == null) return false;

            sprint.SprintNumber = dto.SprintNumber;
            sprint.StartDate = dto.StartDate;
            sprint.EndDate = dto.EndDate;
            sprint.VelocityAchieved = dto.VelocityAchieved;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var sprint = await _context.SprintVelocities.FindAsync(id);
            if (sprint == null) return false;

            _context.SprintVelocities.Remove(sprint);
            await _context.SaveChangesAsync();
            return true;
        }
    }

}
