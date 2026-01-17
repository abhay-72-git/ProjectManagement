using ProjectManagement.Application.DTOs.SprintMom;
using ProjectManagement.Application.Interfaces;
using ProjectManagement.Domain.Entities;
using ProjectManagement.Domain.Interfaces;

namespace ProjectManagement.Application.Services
{
    public class SprintMomService : ISprintMomService
    {
        private readonly ISprintMomRepository _repository;

        public SprintMomService(ISprintMomRepository repository)
        {
            _repository = repository;
        }

        public async Task<SprintMomResponseDto> CreateAsync(SprintMomRequestDto dto)
        {
            var entity = new SprintMom
            {
                MomInput = dto.MomInput,
                MomMonth = dto.MomMonth
            };

            var result = await _repository.AddAsync(entity);

            return new SprintMomResponseDto
            {
                Id = result.Id,
                MomInput = result.MomInput,
                MomMonth = result.MomMonth
            };
        }

        public async Task<List<SprintMomResponseDto>> GetAllAsync()
        {
            var list = await _repository.GetAllAsync();
            return list.Select(f => new SprintMomResponseDto
            {
                Id = f.Id,
                MomInput = f.MomInput,
                MomMonth = f.MomMonth
            }).ToList();
        }

        public async Task<SprintMomResponseDto> GetByIdAsync(int id)
        {
            var f = await _repository.GetByIdAsync(id);
            if (f == null) return null;

            return new SprintMomResponseDto
            {
                Id = f.Id,
                MomInput = f.MomInput,
                MomMonth = f.MomMonth
            };
        }

        public async Task<SprintMomResponseDto> UpdateAsync(int id, SprintMomRequestDto dto)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null) return null;

            entity.MomInput = dto.MomInput;
            entity.MomMonth = dto.MomMonth;

            var result = await _repository.UpdateAsync(entity);

            return new SprintMomResponseDto
            {
                Id = result.Id,
                MomInput = result.MomInput,
                MomMonth = result.MomMonth
            };
        }

        public async Task DeleteAsync(int id)
        {
            await _repository.DeleteAsync(id);
        }
    }
}


