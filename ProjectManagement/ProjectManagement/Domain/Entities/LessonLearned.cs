namespace ProjectManagement.Domain.Entities
{
    public class LessonLearned
    {
        public int Id { get; set; }

        public DateTime Date { get; set; }

        public string LessonLearnt { get; set; } = null!;
        public string Comments { get; set; } = null!;
        public string Source { get; set; } = null!;
    }
}
