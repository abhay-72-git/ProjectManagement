using ProjectManagement.Domain.Entities;

namespace ProjectManagement.Domain.Interfaces
{
    public interface IIssueDocumentRepository
    {
        Task<IssueDocument> AddAsync(IssueDocument entity);
        Task<IssueDocument?> GetByIdAsync(int id);
        Task<List<IssueDocument>> GetAllAsync();
        Task UpdateAsync(IssueDocument entity);
        Task DeleteAsync(IssueDocument entity);
    }

}
