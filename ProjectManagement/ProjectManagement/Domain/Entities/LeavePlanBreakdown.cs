public class LeavePlanBreakdown
{
    public int Id { get; set; }
    public int LeavePlanId { get; set; }

    public string Type { get; set; } = string.Empty;  // PL / UL / FL
    public decimal Days { get; set; }

    public LeavePlan LeavePlan { get; set; }
}
