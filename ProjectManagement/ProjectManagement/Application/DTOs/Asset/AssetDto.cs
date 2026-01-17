using ProjectManagement.Domain.Entities;

namespace ProjectManagement.Application.DTOs.Asset
{
    public class AssetDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public AssetCategory Category { get; set; }
        public AssetType Type { get; set; }
        public string Version { get; set; }
        public string Specifications { get; set; }
    }
}
