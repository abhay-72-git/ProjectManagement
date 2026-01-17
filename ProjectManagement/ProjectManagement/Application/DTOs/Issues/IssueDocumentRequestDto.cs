namespace ProjectManagement.Application.DTOs.Issues
{
    public class IssueDocumentRequestDto
    {
        public DateTime IssueDate { get; set; }
        public int TeamMemberId { get; set; }
        public string Type { get; set; } = null!;
        public string Comments { get; set; } = null!;
        public bool DidDelayClientDelivery { get; set; }

        public string? IssueDetails { get; set; }
        public string? ApproachToSolve { get; set; }
        public string? TechnicalInvestigation { get; set; }
        public string? FixImplementation { get; set; }

        public string? DocumentLink { get; set; }
    }
}
