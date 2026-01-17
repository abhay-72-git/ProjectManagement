namespace ProjectManagement.Application.DTOs.Leave
{
    public class LeavePlanRequestDto
    {
        public string Email { get; set; } = string.Empty;

        public DateTime DateFrom { get; set; }
        public DateTime DateTo { get; set; }

        public List<LeavePlanBreakdownDto> Breakdowns { get; set; }
    }
}
