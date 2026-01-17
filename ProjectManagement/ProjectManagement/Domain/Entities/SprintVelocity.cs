namespace ProjectManagement.Domain.Entities
{
    public class SprintVelocity
    {
        public int Id { get; set; }

        public string SprintNumber { get; set; } = string.Empty;

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        public int VelocityAchieved { get; set; }
    }
}
