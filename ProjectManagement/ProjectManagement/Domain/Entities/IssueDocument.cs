namespace ProjectManagement.Domain.Entities
{
    public class IssueDocument
    {
        public int Id { get; set; }

        public DateTime IssueDate { get; set; }

        // FK from UserDetails table
        public int TeamMemberId { get; set; }

        public string Type { get; set; } = null!;
        public string Comments { get; set; } = null!;

        public bool DidDelayClientDelivery { get; set; }

        // Only when delay = true
        public string? IssueDetails { get; set; }
        public string? ApproachToSolve { get; set; }
        public string? TechnicalInvestigation { get; set; }
        public string? FixImplementation { get; set; }

        // Allowed always
        public string? DocumentLink { get; set; }

        // Navigation
        public UserDetails TeamMember { get; set; }
    }
}
