using ProjectManagement.Application.DTOs.ISTicket;

namespace ProjectManagement.Application.Interfaces
{
    public interface IISTicketService
    {
        Task<int> CreateAsync(ISTicketRequestDto dto);
        Task<List<ISTicketResponseDto>> GetAllAsync();
        Task UpdateAsync(int ticketId, ISTicketRequestDto dto);
        Task DeleteAsync(int ticketId);
    }

}
