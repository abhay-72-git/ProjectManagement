using Microsoft.EntityFrameworkCore;
using ProjectManagement.Domain.Entities;
using ProjectManagement.Domain.Interfaces;
using ProjectManagement.Infrastructure.Persistence;

namespace ProjectManagement.Infrastructure.Repositories
{
    public class DocumentRepository : IDocumentRepository
    {
        private readonly AppDbContext _context;

        public DocumentRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Document> AddAsync(Document entity)
        {
            _context.Documents.Add(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<Document?> GetByIdAsync(int id)
        {
            return await _context.Documents
                .Include(x => x.UploadedBy)
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<List<Document>> GetAllAsync()
        {
            return await _context.Documents
                .Include(x => x.UploadedBy)
                .OrderByDescending(x => x.Id)
                .ToListAsync();
        }

        public async Task UpdateAsync(Document entity)
        {
            _context.Documents.Update(entity);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Document entity)
        {
            _context.Documents.Remove(entity);
            await _context.SaveChangesAsync();
        }
    }

}
