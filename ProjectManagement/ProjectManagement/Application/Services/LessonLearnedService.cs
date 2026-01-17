using ProjectManagement.Application.DTOs.Learning;
using ProjectManagement.Application.Interfaces;
using ProjectManagement.Domain.Entities;
using ProjectManagement.Domain.Interfaces;

namespace ProjectManagement.Application.Services
{
    public class LessonLearnedService : ILessonLearnedService
    {
        private readonly ILessonLearnedRepository _repository;

        public LessonLearnedService(ILessonLearnedRepository repository)
        {
            _repository = repository;
        }

        public async Task<int> CreateAsync(LessonLearnedRequestDto dto)
        {
            var entity = new LessonLearned
            {
                Date = dto.Date,
                LessonLearnt = dto.LessonLearnt,
                Comments = dto.Comments,
                Source = dto.Source
            };

            var result = await _repository.AddAsync(entity);
            return result.Id;
        }

        public async Task<List<LessonLearnedResponseDto>> GetAllAsync()
        {
            var data = await _repository.GetAllAsync();

            return data.Select(x => new LessonLearnedResponseDto
            {
                Id = x.Id,
                Date = x.Date,
                LessonLearnt = x.LessonLearnt,
                Comments = x.Comments,
                Source = x.Source
            }).ToList();
        }

        public async Task UpdateAsync(int id, LessonLearnedRequestDto dto)
        {
            var entity = await _repository.GetByIdAsync(id)
                         ?? throw new KeyNotFoundException("Lesson not found");

            entity.Date = dto.Date;
            entity.LessonLearnt = dto.LessonLearnt;
            entity.Comments = dto.Comments;
            entity.Source = dto.Source;

            await _repository.UpdateAsync(entity);
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await _repository.GetByIdAsync(id)
                         ?? throw new KeyNotFoundException("Lesson not found");

            await _repository.DeleteAsync(entity);
        }
    }

}
