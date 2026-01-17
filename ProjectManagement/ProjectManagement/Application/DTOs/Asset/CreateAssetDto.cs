using ProjectManagement.Domain.Entities;

namespace ProjectManagement.Application.DTOs.Asset
{
    public class CreateAssetDto
    {
        public string Name { get; set; }
        public AssetCategory Category { get; set; }
        public AssetType Type { get; set; }
        public string? Version { get; set; }
        public string? Specifications { get; set; }
    }
}
