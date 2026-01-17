using System.Text.Json.Serialization;

namespace ProjectManagement.Domain.Entities
{
    public class SprintTaskCoordinator
    {
        public int SprintTaskId { get; set; }
        [JsonIgnore]
        public SprintTask SprintTask { get; set; } = null!;

        public int CoordinatorId { get; set; }
    }
}
