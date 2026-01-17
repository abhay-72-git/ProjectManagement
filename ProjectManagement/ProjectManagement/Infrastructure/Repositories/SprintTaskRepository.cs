using Microsoft.EntityFrameworkCore;
using ProjectManagement.Application.DTOs.SprintResponsibility;
using ProjectManagement.Domain.Entities;
using ProjectManagement.Domain.Interfaces;
using ProjectManagement.Infrastructure.Persistence;

namespace ProjectManagement.Infrastructure.Repositories
{
    public class SprintTaskRepository : ISprintTaskRepository
    {
        private readonly AppDbContext _context;

        public SprintTaskRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<SprintTask>> GetAllWithRelationsAsync()
        {
            return await _context.SprintTasks
                .Include(t => t.SprintVelocity)
                .Include(t => t.Owners)
                .Include(t => t.Coordinators)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<SprintTask?> GetByIdWithRelationsAsync(int id)
        {
            return await _context.SprintTasks
                .Include(t => t.SprintVelocity)
                .Include(t => t.Owners)
                .Include(t => t.Coordinators)
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task AddAsync(SprintTask task)
        {
            _context.SprintTasks.Add(task);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(SprintTask task)
        {
            var existingTask = await _context.SprintTasks
                .Include(t => t.Coordinators)
                .Include(t => t.Owners)
                .FirstOrDefaultAsync(t => t.Id == task.Id);

            if (existingTask == null)
                throw new Exception("SprintTask not found");

            _context.Entry(existingTask).CurrentValues.SetValues(task);

            existingTask.Coordinators.Clear();

            foreach (var coordinator in task.Coordinators)
            {
                existingTask.Coordinators.Add(new SprintTaskCoordinator
                {
                    SprintTaskId = task.Id,
                    CoordinatorId = coordinator.CoordinatorId
                });
            }

            existingTask.Owners.Clear();

            
            foreach (var owner in task.Owners)
            {
                existingTask.Owners.Add(new SprintTaskOwner
                {
                    SprintTaskId = task.Id,
                    OwnerId = owner.OwnerId
                });
            }

            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(SprintTask task)
        {
            _context.SprintTasks.Remove(task);
            await _context.SaveChangesAsync();
        }

        public async Task<SprintStoryPointSummaryDto> GetStoryPointSummaryAsync(int sprintVelocityId)
        {
            var tasks = _context.SprintTasks
                .Where(t => t.SprintVelocityId == sprintVelocityId);

            return new SprintStoryPointSummaryDto
            {
                TotalStoryPoints = await tasks.SumAsync(t =>
                    (t.StoryPoint ?? 0) + (t.CoordinatorStoryPoint ?? 0)),

                InProgressStoryPoints = await tasks
                    .Where(t => t.CurrentStatus == "InProgress")
                    .SumAsync(t =>
                        (t.StoryPoint ?? 0) + (t.CoordinatorStoryPoint ?? 0)),

                CompletedStoryPoints = await tasks
                    .Where(t => t.CurrentStatus == "Completed")
                    .SumAsync(t =>
                        (t.StoryPoint ?? 0) + (t.CoordinatorStoryPoint ?? 0))
            };
        }

    }

}
