namespace ProjectManagement.Application.DTOs.Learning
{
    public class LessonLearnedRequestDto
    {
        public DateTime Date { get; set; }
        public string LessonLearnt { get; set; } = null!;
        public string Comments { get; set; } = null!;
        public string Source { get; set; } = null!;
    }

}
