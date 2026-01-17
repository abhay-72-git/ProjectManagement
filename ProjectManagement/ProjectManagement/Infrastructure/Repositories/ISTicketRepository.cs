using Microsoft.EntityFrameworkCore;
using ProjectManagement.Domain.Entities;
using ProjectManagement.Domain.Interfaces;
using ProjectManagement.Infrastructure.Persistence;

namespace ProjectManagement.Infrastructure.Repositories
{
    public class ISTicketRepository : IISTicketRepository
    {
        private readonly AppDbContext _context;

        public ISTicketRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ISTicket> AddAsync(ISTicket entity)
        {
            _context.ISTickets.Add(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<ISTicket?> GetByIdAsync(int ticketId)
        {
            return await _context.ISTickets
                .Include(x => x.RaisedBy)
                .FirstOrDefaultAsync(x => x.TicketId == ticketId);
        }

        public async Task<List<ISTicket>> GetAllAsync()
        {
            return await _context.ISTickets
                .Include(x => x.RaisedBy)
                .OrderByDescending(x => x.TicketId)
                .ToListAsync();
        }

        public async Task UpdateAsync(ISTicket entity)
        {
            _context.ISTickets.Update(entity);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(ISTicket entity)
        {
            _context.ISTickets.Remove(entity);
            await _context.SaveChangesAsync();
        }
    }

}
