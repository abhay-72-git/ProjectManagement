namespace ProjectManagement.Application.DTOs.SprintResponsibility
{
    public class SprintStoryPointSummaryDto
    {
        public int TotalStoryPoints { get; set; }
        public int InProgressStoryPoints { get; set; }
        public int CompletedStoryPoints { get; set; }
    }
}
