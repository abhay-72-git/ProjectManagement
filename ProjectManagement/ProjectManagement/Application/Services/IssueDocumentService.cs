using ProjectManagement.Application.DTOs.Issues;
using ProjectManagement.Application.Interfaces;
using ProjectManagement.Domain.Entities;
using ProjectManagement.Domain.Interfaces;

namespace ProjectManagement.Application.Services
{
    public class IssueDocumentService : IIssueDocumentService
    {
        private readonly IIssueDocumentRepository _repository;

        public IssueDocumentService(IIssueDocumentRepository repository)
        {
            _repository = repository;
        }

        public async Task<int> CreateAsync(IssueDocumentRequestDto dto)
        {
            if (dto.DidDelayClientDelivery)
            {
                if (string.IsNullOrWhiteSpace(dto.IssueDetails) ||
                    string.IsNullOrWhiteSpace(dto.ApproachToSolve) ||
                    string.IsNullOrWhiteSpace(dto.TechnicalInvestigation) ||
                    string.IsNullOrWhiteSpace(dto.FixImplementation))
                {
                    throw new ArgumentException("All delay-related fields are required.");
                }
            }

            var entity = new IssueDocument
            {
                IssueDate = dto.IssueDate,
                TeamMemberId = dto.TeamMemberId,
                Type = dto.Type,
                Comments = dto.Comments,
                DidDelayClientDelivery = dto.DidDelayClientDelivery,

                IssueDetails = dto.DidDelayClientDelivery ? dto.IssueDetails : null,
                ApproachToSolve = dto.DidDelayClientDelivery ? dto.ApproachToSolve : null,
                TechnicalInvestigation = dto.DidDelayClientDelivery ? dto.TechnicalInvestigation : null,
                FixImplementation = dto.DidDelayClientDelivery ? dto.FixImplementation : null,

                DocumentLink = dto.DocumentLink
            };

            var result = await _repository.AddAsync(entity);
            return result.Id;
        }

        public async Task<List<IssueDocumentResponseDto>> GetAllAsync()
        {
            var data = await _repository.GetAllAsync();

            return data.Select(x => new IssueDocumentResponseDto
            {
                Id = x.Id,
                IssueDate = x.IssueDate,
                TeamMemberId = x.TeamMemberId,
                TeamMemberName = x.TeamMember.Name,
                Type = x.Type,
                Comments = x.Comments,
                DidDelayClientDelivery = x.DidDelayClientDelivery,
                IssueDetails = x.IssueDetails,
                ApproachToSolve = x.ApproachToSolve,
                TechnicalInvestigation = x.TechnicalInvestigation,
                FixImplementation = x.FixImplementation,
                DocumentLink = x.DocumentLink
            }).ToList();
        }

        public async Task UpdateAsync(int id, IssueDocumentRequestDto dto)
        {
            var entity = await _repository.GetByIdAsync(id)
                         ?? throw new KeyNotFoundException("Issue document not found");

            entity.IssueDate = dto.IssueDate;
            entity.TeamMemberId = dto.TeamMemberId;
            entity.Type = dto.Type;
            entity.Comments = dto.Comments;
            entity.DidDelayClientDelivery = dto.DidDelayClientDelivery;

            if (dto.DidDelayClientDelivery)
            {
                entity.IssueDetails = dto.IssueDetails;
                entity.ApproachToSolve = dto.ApproachToSolve;
                entity.TechnicalInvestigation = dto.TechnicalInvestigation;
                entity.FixImplementation = dto.FixImplementation;
            }
            else
            {
                entity.IssueDetails = null;
                entity.ApproachToSolve = null;
                entity.TechnicalInvestigation = null;
                entity.FixImplementation = null;
            }

            entity.DocumentLink = dto.DocumentLink;

            await _repository.UpdateAsync(entity);
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await _repository.GetByIdAsync(id)
                         ?? throw new KeyNotFoundException("Issue document not found");

            await _repository.DeleteAsync(entity);
        }
    }

}
