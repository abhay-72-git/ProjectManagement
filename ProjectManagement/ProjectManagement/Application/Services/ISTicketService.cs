using ProjectManagement.Application.DTOs.ISTicket;
using ProjectManagement.Application.Interfaces;
using ProjectManagement.Domain.Entities;
using ProjectManagement.Domain.Interfaces;

namespace ProjectManagement.Application.Services
{
    public class ISTicketService : IISTicketService
    {
        private readonly IISTicketRepository _repository;

        public ISTicketService(IISTicketRepository repository)
        {
            _repository = repository;
        }

        public async Task<int> CreateAsync(ISTicketRequestDto dto)
        {
            var entity = new ISTicket
            {
                TicketNo = dto.TicketNo,
                RaisedById = dto.RaisedById,
                Purpose = dto.Purpose,
                TicketCategory = dto.TicketCategory,
                TicketProblem = dto.TicketProblem,
                RequiredDetails = dto.RequiredDetails,
                Comments = dto.Comments
            };

            var result = await _repository.AddAsync(entity);
            return result.TicketId;
        }

        public async Task<List<ISTicketResponseDto>> GetAllAsync()
        {
            var data = await _repository.GetAllAsync();

            return data.Select(x => new ISTicketResponseDto
            {
                TicketNo = x.TicketNo,
                TicketId = x.TicketId,
                RaisedById = x.RaisedById,
                RaisedByName = x.RaisedBy.Name,
                Purpose = x.Purpose,
                TicketCategory = x.TicketCategory,
                TicketProblem = x.TicketProblem,
                RequiredDetails = x.RequiredDetails,
                Comments = x.Comments
            }).ToList();
        }

        public async Task UpdateAsync(int ticketId, ISTicketRequestDto dto)
        {
            var entity = await _repository.GetByIdAsync(ticketId)
                         ?? throw new KeyNotFoundException("IS Ticket not found");
            entity.TicketNo = dto.TicketNo;
            entity.RaisedById = dto.RaisedById;
            entity.Purpose = dto.Purpose;
            entity.TicketCategory = dto.TicketCategory;
            entity.TicketProblem = dto.TicketProblem;
            entity.RequiredDetails = dto.RequiredDetails;
            entity.Comments = dto.Comments;

            await _repository.UpdateAsync(entity);
        }

        public async Task DeleteAsync(int ticketId)
        {
            var entity = await _repository.GetByIdAsync(ticketId)
                         ?? throw new KeyNotFoundException("IS Ticket not found");

            await _repository.DeleteAsync(entity);
        }
    }

}
