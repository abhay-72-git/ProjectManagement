namespace ProjectManagement.Application.DTOs.SprintVelocity
{
    public class SprintVelocityDto
    {
        public string SprintNumber { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int VelocityAchieved { get; set; }
    }
          
}
