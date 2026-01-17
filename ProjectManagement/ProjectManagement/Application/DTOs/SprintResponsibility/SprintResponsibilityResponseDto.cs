namespace ProjectManagement.Application.DTOs.SprintResponsibility
{
    public class SprintResponsibilityResponseDto
    {
        public int Id { get; set; }

        public int SprintId { get; set; }
        public string SprintNumber { get; set; }

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int DurationInDays { get; set; }

        public string DsrSendingUser { get; set; }
        public string DataMatrixUser { get; set; }
        public string ScrumMasterUser { get; set; }
    }

}
