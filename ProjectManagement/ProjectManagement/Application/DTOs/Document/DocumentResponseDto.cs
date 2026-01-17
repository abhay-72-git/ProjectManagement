namespace ProjectManagement.Application.DTOs.Document
{
    public class DocumentResponseDto
    {
        public int Id { get; set; }

        public string Name { get; set; } = null!;
        public string Type { get; set; } = null!;

        public int UploadedById { get; set; }
        public string UploadedByName { get; set; } = null!;

        public string DocumentLink { get; set; } = null!;
    }

}
