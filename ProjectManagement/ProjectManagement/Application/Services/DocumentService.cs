using ProjectManagement.Application.DTOs.Document;
using ProjectManagement.Application.Interfaces;
using ProjectManagement.Domain.Entities;
using ProjectManagement.Domain.Interfaces;

namespace ProjectManagement.Application.Services
{
    public class DocumentService : IDocumentService
    {
        private readonly IDocumentRepository _repository;

        public DocumentService(IDocumentRepository repository)
        {
            _repository = repository;
        }

        public async Task<int> CreateAsync(DocumentRequestDto dto)
        {
            var entity = new Document
            {
                Name = dto.Name,
                Type = dto.Type,
                UploadedById = dto.UploadedById,
                DocumentLink = dto.DocumentLink
            };

            var result = await _repository.AddAsync(entity);
            return result.Id;
        }

        public async Task<List<DocumentResponseDto>> GetAllAsync()
        {
            var data = await _repository.GetAllAsync();

            return data.Select(x => new DocumentResponseDto
            {
                Id = x.Id,
                Name = x.Name,
                Type = x.Type,
                UploadedById = x.UploadedById,
                UploadedByName = x.UploadedBy.Name,
                DocumentLink = x.DocumentLink
            }).ToList();
        }

        public async Task UpdateAsync(int id, DocumentRequestDto dto)
        {
            var entity = await _repository.GetByIdAsync(id)
                         ?? throw new KeyNotFoundException("Document not found");

            entity.Name = dto.Name;
            entity.Type = dto.Type;
            entity.UploadedById = dto.UploadedById;
            entity.DocumentLink = dto.DocumentLink;

            await _repository.UpdateAsync(entity);
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await _repository.GetByIdAsync(id)
                         ?? throw new KeyNotFoundException("Document not found");

            await _repository.DeleteAsync(entity);
        }
    }

}
