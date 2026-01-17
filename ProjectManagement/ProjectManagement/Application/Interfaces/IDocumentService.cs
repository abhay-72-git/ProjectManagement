using ProjectManagement.Application.DTOs.Document;

namespace ProjectManagement.Application.Interfaces
{
    public interface IDocumentService
    {
        Task<int> CreateAsync(DocumentRequestDto dto);
        Task<List<DocumentResponseDto>> GetAllAsync();
        Task UpdateAsync(int id, DocumentRequestDto dto);
        Task DeleteAsync(int id);
    }

}
