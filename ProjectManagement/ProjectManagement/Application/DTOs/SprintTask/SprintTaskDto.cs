namespace ProjectManagement.Application.DTOs.SprintTask
{
    public class SprintTaskDto
    {
        public int Id { get; set; }
        public int? SprintVelocityId { get; set; }

        public string? Epic { get; set; }
        public string? Story { get; set; }
        public string? Task { get; set; }

        public int? StoryPoint { get; set; }
        public int? CoordinatorStoryPoint { get; set; }   // ✅ HERE

        public List<int>? OwnerIds { get; set; }
        public List<int>? CoordinatorIds { get; set; }

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
