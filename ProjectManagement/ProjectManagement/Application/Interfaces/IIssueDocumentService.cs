using ProjectManagement.Application.DTOs.Issues;

namespace ProjectManagement.Application.Interfaces
{
    public interface IIssueDocumentService
    {
        Task<int> CreateAsync(IssueDocumentRequestDto dto);
        Task<List<IssueDocumentResponseDto>> GetAllAsync();
        Task UpdateAsync(int id, IssueDocumentRequestDto dto);
        Task DeleteAsync(int id);
    }
}
