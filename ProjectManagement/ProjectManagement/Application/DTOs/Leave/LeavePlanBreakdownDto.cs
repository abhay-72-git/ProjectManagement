namespace ProjectManagement.Application.DTOs.Leave
{
    public class LeavePlanBreakdownDto
    {
        public string Type { get; set; } = string.Empty; // PL/UL/FL
        public decimal Days { get; set; }
    }
}


