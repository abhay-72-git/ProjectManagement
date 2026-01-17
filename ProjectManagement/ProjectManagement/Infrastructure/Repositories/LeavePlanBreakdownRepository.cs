using Microsoft.EntityFrameworkCore;
using ProjectManagement.Domain.Entities;
using ProjectManagement.Domain.Interfaces;
using ProjectManagement.Infrastructure.Persistence;

namespace ProjectManagement.Infrastructure.Repositories
{
    public class LeavePlanBreakdownRepository : ILeavePlanBreakdownRepository
    {
        private readonly AppDbContext _context;

        public LeavePlanBreakdownRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddRangeAsync(List<LeavePlanBreakdown> breakdowns)
        {
            await _context.LeavePlanBreakdowns.AddRangeAsync(breakdowns);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteByLeavePlanIdAsync(int leavePlanId)
        {
            var items = await _context.LeavePlanBreakdowns
                .Where(x => x.LeavePlanId == leavePlanId)
                .ToListAsync();

            _context.LeavePlanBreakdowns.RemoveRange(items);
            await _context.SaveChangesAsync();
        }

        public async Task<List<LeavePlanBreakdown>> GetByLeavePlanIdAsync(int leavePlanId)
        {
            return await _context.LeavePlanBreakdowns
                .Where(x => x.LeavePlanId == leavePlanId)
                .ToListAsync();
        }
    }
}
