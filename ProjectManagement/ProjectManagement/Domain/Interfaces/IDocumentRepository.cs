using ProjectManagement.Domain.Entities;

namespace ProjectManagement.Domain.Interfaces
{
    public interface IDocumentRepository
    {
        Task<Document> AddAsync(Document entity);
        Task<Document?> GetByIdAsync(int id);
        Task<List<Document>> GetAllAsync();
        Task UpdateAsync(Document entity);
        Task DeleteAsync(Document entity);
    }
}
