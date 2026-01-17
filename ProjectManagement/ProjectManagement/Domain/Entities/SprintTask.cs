namespace ProjectManagement.Domain.Entities
{
    public class SprintTask
    {
        public int Id { get; set; }

        // Sprint
        public int? SprintVelocityId { get; set; }
        public SprintVelocity? SprintVelocity { get; set; }

        public DateTime? SprintStartDate { get; set; }
        public DateTime? SprintEndDate { get; set; }

        public string? Epic { get; set; }
        public string? Story { get; set; }
        public string? Task { get; set; }

        // Story points
        public int? StoryPoint { get; set; }
        public int? CoordinatorStoryPoint { get; set; }   // ✅ HERE

        // Multiple users
        public ICollection<SprintTaskOwner> Owners { get; set; } = new List<SprintTaskOwner>();
        public ICollection<SprintTaskCoordinator> Coordinators { get; set; } = new List<SprintTaskCoordinator>();

        public int? ReviewerId { get; set; }

        public DateTime? AssignedDate { get; set; }
        public string? CurrentStatus { get; set; }

        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }

        public string? RequirementUnderstanding { get; set; }
        public string? Dependencies { get; set; }
        public string? DefinitionOfDone { get; set; }

        public string? Delivery { get; set; }
        public string? Comments { get; set; }

        public bool? TestEvidenceAttached { get; set; }
    }
}
