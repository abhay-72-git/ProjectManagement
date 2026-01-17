using ProjectManagement.Application.DTOs.SprintResponsibility;
using ProjectManagement.Application.DTOs.SprintTask;
using ProjectManagement.Application.Interfaces;
using ProjectManagement.Domain.Entities;
using ProjectManagement.Domain.Interfaces;
using ProjectManagement.Infrastructure.Persistence;

namespace ProjectManagement.Application.Services
{
    public class SprintTaskService : ISprintTaskService
    {
        private readonly ISprintTaskRepository _repository;
        private readonly AppDbContext _context;

        public SprintTaskService(ISprintTaskRepository repository, AppDbContext context)
        {
            _repository = repository;
            _context = context;
        }

        // ===========================
        // CREATE
        // ===========================
        public async Task<SprintTaskDto> CreateAsync(SprintTaskDto dto)
        {
            SprintVelocity? sprint = null;

            if (dto.SprintVelocityId.HasValue)
            {
                sprint = await _context.SprintVelocities.FindAsync(dto.SprintVelocityId.Value)
                         ?? throw new Exception("Sprint not found");
            }

            var task = new SprintTask
            {
                SprintVelocityId = sprint?.Id,
                SprintStartDate = sprint?.StartDate,
                SprintEndDate = sprint?.EndDate,

                Epic = dto.Epic,
                Story = dto.Story,
                Task = dto.Task,

                StoryPoint = dto.StoryPoint,
                CoordinatorStoryPoint = dto.CoordinatorStoryPoint,

                ReviewerId = dto.ReviewerId,
                AssignedDate = dto.AssignedDate,
                CurrentStatus = dto.CurrentStatus,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,

                RequirementUnderstanding = dto.RequirementUnderstanding,
                Dependencies = dto.Dependencies,
                DefinitionOfDone = dto.DefinitionOfDone,
                Delivery = dto.Delivery,
                Comments = dto.Comments,
                TestEvidenceAttached = dto.TestEvidenceAttached,

                Owners = dto.OwnerIds?.Select(id => new SprintTaskOwner { OwnerId = id }).ToList()
                         ?? new List<SprintTaskOwner>(),

                Coordinators = dto.CoordinatorIds?.Select(id => new SprintTaskCoordinator { CoordinatorId = id }).ToList()
                               ?? new List<SprintTaskCoordinator>()
            };

            await _repository.AddAsync(task);

            return MapToDto(task);
        }

        // ===========================
        // UPDATE
        // ===========================
        public async Task<bool> UpdateAsync(int id, SprintTaskDto dto)
        {
            var task = await _repository.GetByIdWithRelationsAsync(id);
            if (task == null) return false;

            // --------------------
            // Scalar fields
            // --------------------
            task.Epic = dto.Epic ?? task.Epic;
            task.Story = dto.Story ?? task.Story;
            task.Task = dto.Task ?? task.Task;

            task.StoryPoint = dto.StoryPoint ?? task.StoryPoint;
            task.CoordinatorStoryPoint = dto.CoordinatorStoryPoint ?? task.CoordinatorStoryPoint;

            task.ReviewerId = dto.ReviewerId ?? task.ReviewerId;
            task.AssignedDate = dto.AssignedDate ?? task.AssignedDate;
            task.CurrentStatus = dto.CurrentStatus ?? task.CurrentStatus;
            task.StartDate = dto.StartDate ?? task.StartDate;
            task.EndDate = dto.EndDate ?? task.EndDate;

            task.RequirementUnderstanding = dto.RequirementUnderstanding ?? task.RequirementUnderstanding;
            task.Dependencies = dto.Dependencies ?? task.Dependencies;
            task.DefinitionOfDone = dto.DefinitionOfDone ?? task.DefinitionOfDone;
            task.Delivery = dto.Delivery ?? task.Delivery;
            task.Comments = dto.Comments ?? task.Comments;
            task.TestEvidenceAttached = dto.TestEvidenceAttached ?? task.TestEvidenceAttached;

            // --------------------
            // OWNERS (FIX)
            // --------------------
            if (dto.OwnerIds != null)
            {
                task.Owners.Clear();

                foreach (var ownerId in dto.OwnerIds.Distinct())
                {
                    task.Owners.Add(new SprintTaskOwner
                    {
                        OwnerId = ownerId
                    });
                }
            }

            // --------------------
            // COORDINATORS (FIX)
            // --------------------
            if (dto.CoordinatorIds != null)
            {
                task.Coordinators.Clear();

                foreach (var coordinatorId in dto.CoordinatorIds.Distinct())
                {
                    task.Coordinators.Add(new SprintTaskCoordinator
                    {
                        CoordinatorId = coordinatorId
                    });
                }
            }

            await _repository.UpdateAsync(task);
            return true;
        }


        // ===========================
        // DELETE
        // ===========================
        public async Task<bool> DeleteAsync(int id)
        {
            var task = await _repository.GetByIdWithRelationsAsync(id);
            if (task == null) return false;

            await _repository.DeleteAsync(task);
            return true;
        }

        // ===========================
        // GET ALL
        // ===========================
        public async Task<IEnumerable<SprintTaskDto>> GetAllAsync()
        {
            var tasks = await _repository.GetAllWithRelationsAsync();
            return tasks.Select(MapToDto);
        }

        // ===========================
        // GET BY ID
        // ===========================
        public async Task<SprintTaskDto?> GetByIdAsync(int id)
        {
            var task = await _repository.GetByIdWithRelationsAsync(id);
            return task == null ? null : MapToDto(task);
        }

        // ===========================
        // STORY POINT SUMMARY
        // ===========================
        public Task<SprintStoryPointSummaryDto> GetStoryPointSummaryAsync(int sprintVelocityId)
            => _repository.GetStoryPointSummaryAsync(sprintVelocityId);

        // ===========================
        // MAPPER
        // ===========================
        private static SprintTaskDto MapToDto(SprintTask t)
        {
            return new SprintTaskDto
            {
                Id = t.Id,
                SprintVelocityId = t.SprintVelocityId,
                Epic = t.Epic,
                Story = t.Story,
                Task = t.Task,
                StoryPoint = t.StoryPoint,
                CoordinatorStoryPoint = t.CoordinatorStoryPoint,
                OwnerIds = t.Owners.Select(o => o.OwnerId).ToList(),
                CoordinatorIds = t.Coordinators.Select(c => c.CoordinatorId).ToList(),
                ReviewerId = t.ReviewerId,
                AssignedDate = t.AssignedDate,
                CurrentStatus = t.CurrentStatus,
                StartDate = t.StartDate,
                EndDate = t.EndDate,
                 RequirementUnderstanding = t.RequirementUnderstanding,
                Dependencies = t.Dependencies,
                DefinitionOfDone = t.DefinitionOfDone,
                Delivery = t.Delivery,
                Comments = t.Comments,
                TestEvidenceAttached = t.TestEvidenceAttached
            };
        }
    }
}
