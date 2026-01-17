using ProjectManagement.Domain.Entities;

namespace ProjectManagement.Domain.Interfaces
{
    public interface IAssetRepository
    {
        Task<List<Asset>> GetAllAsync();
        Task<List<Asset>> GetByCategoryAsync(AssetCategory category);
        Task<Asset> GetByIdAsync(int id);
        Task<Asset> AddAsync(Asset asset);
        Task<Asset> UpdateAsync(Asset asset);
        Task<bool> DeleteAsync(int id);
    }
}
