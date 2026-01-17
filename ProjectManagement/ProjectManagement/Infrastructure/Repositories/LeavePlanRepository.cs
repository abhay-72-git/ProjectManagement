using Microsoft.EntityFrameworkCore;
using ProjectManagement.Domain.Entities;
using ProjectManagement.Domain.Interfaces;
using ProjectManagement.Infrastructure.Persistence;

public class LeavePlanRepository : ILeavePlanRepository
{
    private readonly AppDbContext _context;

    public LeavePlanRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(LeavePlan leavePlan)
    {
        await _context.LeavePlans.AddAsync(leavePlan);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(LeavePlan leavePlan)
    {
        _context.LeavePlans.Update(leavePlan);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(LeavePlan leavePlan)
    {
        _context.LeavePlans.Remove(leavePlan);
        await _context.SaveChangesAsync();
    }

    public async Task<LeavePlan?> GetByIdAsync(int id)
    {
        return await _context.LeavePlans
            .Include(x => x.Breakdown)
            .FirstOrDefaultAsync(x => x.Id == id);
    }

    public async Task<List<LeavePlan>> GetByMonthYearAsync(int month, int year)
    {
        return await _context.LeavePlans
            .Include(x => x.Breakdown)
            .Where(x => x.DateFrom.Month == month && x.DateFrom.Year == year)
            .ToListAsync();
    }
}
