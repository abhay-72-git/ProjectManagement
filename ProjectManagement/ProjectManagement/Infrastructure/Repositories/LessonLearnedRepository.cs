using Microsoft.EntityFrameworkCore;
using ProjectManagement.Domain.Entities;
using ProjectManagement.Domain.Interfaces;
using ProjectManagement.Infrastructure.Persistence;

namespace ProjectManagement.Infrastructure.Repositories
{
    public class LessonLearnedRepository : ILessonLearnedRepository
    {
        private readonly AppDbContext _context;

        public LessonLearnedRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<LessonLearned> AddAsync(LessonLearned entity)
        {
            _context.LessonLearneds.Add(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<LessonLearned?> GetByIdAsync(int id)
        {
            return await _context.LessonLearneds
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<List<LessonLearned>> GetAllAsync()
        {
            return await _context.LessonLearneds
                .OrderByDescending(x => x.Date)
                .ToListAsync();
        }

        public async Task UpdateAsync(LessonLearned entity)
        {
            _context.LessonLearneds.Update(entity);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(LessonLearned entity)
        {
            _context.LessonLearneds.Remove(entity);
            await _context.SaveChangesAsync();
        }
    }

}
