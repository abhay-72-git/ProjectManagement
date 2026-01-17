namespace ProjectManagement.Application.DTOs.Document
{
    public class DocumentRequestDto
    {
        public string Name { get; set; } = null!;
        public string Type { get; set; } = null!;
        public int UploadedById { get; set; }
        public string DocumentLink { get; set; } = null!;
    }

}
