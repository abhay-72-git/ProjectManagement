using ProjectManagement.Domain.Entities;

public class LeavePlan
{
    public int Id { get; set; }

    public string Email { get; set; } = string.Empty;

    public DateTime DateFrom { get; set; }
    public DateTime DateTo { get; set; }

    // Total = Sum of breakdowns
    public decimal TotalDays { get; set; }

    public List<LeavePlanBreakdown> Breakdown { get; set; } = new();
}
