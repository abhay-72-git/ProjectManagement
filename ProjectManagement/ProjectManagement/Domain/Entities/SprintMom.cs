namespace ProjectManagement.Domain.Entities
{
    public class SprintMom
    {
        public int Id { get; set; }
        public string MomInput { get; set; } = null!;  // Stores HTML content
        public DateTime MomMonth { get; set; }
    }
}
