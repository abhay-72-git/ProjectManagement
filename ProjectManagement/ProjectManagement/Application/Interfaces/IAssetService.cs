using ProjectManagement.Application.DTOs.Asset;
using ProjectManagement.Domain.Entities;

namespace ProjectManagement.Application.Interfaces
{
    public interface IAssetService
    {
        Task<List<AssetDto>> GetAllAsync();
        Task<List<AssetDto>> GetByCategoryAsync(AssetCategory category);
        Task<AssetDto> GetByIdAsync(int id);
        Task<AssetDto> AddAsync(CreateAssetDto dto);
        Task<AssetDto> UpdateAsync(int id, CreateAssetDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
