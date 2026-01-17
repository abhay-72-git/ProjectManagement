using Microsoft.EntityFrameworkCore;
using ProjectManagement.Domain.Entities;
using ProjectManagement.Domain.Interfaces;
using ProjectManagement.Infrastructure.Persistence;

namespace ProjectManagement.Infrastructure.Repositories
{
    public class IssueDocumentRepository : IIssueDocumentRepository
    {
        private readonly AppDbContext _context;

        public IssueDocumentRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IssueDocument> AddAsync(IssueDocument entity)
        {
            _context.IssueDocuments.Add(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<IssueDocument?> GetByIdAsync(int id)
        {
            return await _context.IssueDocuments
                .Include(x => x.TeamMember)
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<List<IssueDocument>> GetAllAsync()
        {
            return await _context.IssueDocuments
                .Include(x => x.TeamMember)
                .OrderByDescending(x => x.IssueDate)
                .ToListAsync();
        }

        public async Task UpdateAsync(IssueDocument entity)
        {
            _context.IssueDocuments.Update(entity);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(IssueDocument entity)
        {
            _context.IssueDocuments.Remove(entity);
            await _context.SaveChangesAsync();
        }
    }

}
