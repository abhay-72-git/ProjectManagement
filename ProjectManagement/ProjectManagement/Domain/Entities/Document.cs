namespace ProjectManagement.Domain.Entities
{
    public class Document
    {
        public int Id { get; set; }

        public string Name { get; set; } = null!;
        public string Type { get; set; } = null!;

        // FK from UserDetails
        public int UploadedById { get; set; }

        public string DocumentLink { get; set; } = null!;

        // Navigation
        public UserDetails UploadedBy { get; set; }
    }
}
