namespace ProjectManagement.Application.DTOs.Leave
{
    public class LeavePlanResponseDto
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public string Name { get; set; }

        public DateTime DateFrom { get; set; }
        public DateTime DateTo { get; set; }

        public decimal TotalDays { get; set; }

        public List<LeavePlanBreakdownDto> Breakdown { get; set; }

        public decimal LeavesInHandPL { get; set; }
        public decimal LeavesInHandUL { get; set; }
        public decimal LeavesInHandFL { get; set; }
    }
}
