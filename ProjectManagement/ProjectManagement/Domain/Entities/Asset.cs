namespace ProjectManagement.Domain.Entities
{
    public enum AssetCategory
    {
        PhysicalMachine = 1,
        ClientVDI = 2
    }

    public enum AssetType
    {
        Hardware = 1,
        Software = 2
    }

    public class Asset
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public AssetCategory Category { get; set; }
        public AssetType Type { get; set; }
        public string? Version { get; set; } = string.Empty;
        public string? Specifications { get; set; } = string.Empty;
    }
}
