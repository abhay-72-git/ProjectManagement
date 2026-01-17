using ProjectManagement.Domain.Entities;

namespace ProjectManagement.Domain.Interfaces
{
    public interface IISTicketRepository
    {
        Task<ISTicket> AddAsync(ISTicket entity);
        Task<ISTicket?> GetByIdAsync(int ticketId);
        Task<List<ISTicket>> GetAllAsync();
        Task UpdateAsync(ISTicket entity);
        Task DeleteAsync(ISTicket entity);
    }

}
