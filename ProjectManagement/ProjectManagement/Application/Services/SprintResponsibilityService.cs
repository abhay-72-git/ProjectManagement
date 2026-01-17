using ProjectManagement.Application.DTOs.SprintResponsibility;
using ProjectManagement.Application.Interfaces;
using ProjectManagement.Domain.Entities;
using ProjectManagement.Domain.Interfaces;

namespace ProjectManagement.Application.Services
{
    public class SprintResponsibilityService : ISprintResponsibilityService
    {
        private readonly ISprintResponsibilityRepository _repository;

        public SprintResponsibilityService(ISprintResponsibilityRepository repository)
        {
            _repository = repository;
        }

        public async Task<List<SprintResponsibilityResponseDto>> GetAllAsync()
        {
            var data = await _repository.GetAllAsync();

            return data.Select(x => new SprintResponsibilityResponseDto
            {
                Id = x.Id,
                SprintId = x.SprintId,
                SprintNumber = x.Sprint?.SprintNumber,
                StartDate = x.StartDate,
                EndDate = x.EndDate,
                DurationInDays = (x.EndDate - x.StartDate).Days + 1,
                DsrSendingUser = x.DsrSendingUser?.Name,
                DataMatrixUser = x.DataMatrixUser?.Name,
                ScrumMasterUser = x.ScrumMasterUser?.Name
            }).ToList();
        }

        public async Task<SprintResponsibilityResponseDto?> GetByIdAsync(int id)
        {
            var x = await _repository.GetByIdAsync(id);
            if (x == null) return null;

            return new SprintResponsibilityResponseDto
            {
                Id = x.Id,
                SprintId = x.SprintId,
                SprintNumber = x.Sprint?.SprintNumber,
                StartDate = x.StartDate,
                EndDate = x.EndDate,
                DurationInDays = (x.EndDate - x.StartDate).Days + 1,
                DsrSendingUser = x.DsrSendingUser?.Name,
                DataMatrixUser = x.DataMatrixUser?.Name,
                ScrumMasterUser = x.ScrumMasterUser?.Name
            };
        }

        public async Task<int> CreateAsync(SprintResponsibilityRequestDto dto)
        {
            var entity = new SprintResponsibility
            {
                SprintId = dto.SprintId,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                DsrSendingUserId = dto.DsrSendingUserId,
                DataMatrixUserId = dto.DataMatrixUserId,
                ScrumMasterUserId = dto.ScrumMasterUserId
            };

            await _repository.AddAsync(entity);
            await _repository.SaveChangesAsync();

            return entity.Id;
        }

        public async Task<bool> UpdateAsync(int id, SprintResponsibilityRequestDto dto)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null) return false;

            entity.SprintId = dto.SprintId;
            entity.StartDate = dto.StartDate;
            entity.EndDate = dto.EndDate;
            entity.DsrSendingUserId = dto.DsrSendingUserId;
            entity.DataMatrixUserId = dto.DataMatrixUserId;
            entity.ScrumMasterUserId = dto.ScrumMasterUserId;

            _repository.Update(entity);
            await _repository.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null) return false;

            _repository.Delete(entity);
            await _repository.SaveChangesAsync();

            return true;
        }
    }
}
