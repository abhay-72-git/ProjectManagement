namespace ProjectManagement.Application.DTOs.SprintResponsibility
{
    public class SprintResponsibilityRequestDto
    {
        public int SprintId { get; set; }

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        public int DsrSendingUserId { get; set; }
        public int DataMatrixUserId { get; set; }
        public int ScrumMasterUserId { get; set; }
    }

}
