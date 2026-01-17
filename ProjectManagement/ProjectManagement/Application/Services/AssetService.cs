using ProjectManagement.Application.DTOs.Asset;
using ProjectManagement.Application.Interfaces;
using ProjectManagement.Domain.Entities;
using ProjectManagement.Domain.Interfaces;

namespace ProjectManagement.Application.Services
{
    public class AssetService : IAssetService
    {
        private readonly IAssetRepository _repository;

        public AssetService(IAssetRepository repository)
        {
            _repository = repository;
        }

        public async Task<List<AssetDto>> GetAllAsync()
        {
            var assets = await _repository.GetAllAsync();
            return assets.Select(MapToDto).ToList();
        }

        public async Task<List<AssetDto>> GetByCategoryAsync(AssetCategory category)
        {
            var assets = await _repository.GetByCategoryAsync(category);
            return assets.Select(MapToDto).ToList();
        }

        public async Task<AssetDto> GetByIdAsync(int id)
        {
            var asset = await _repository.GetByIdAsync(id);
            return asset == null ? null : MapToDto(asset);
        }

        public async Task<AssetDto> AddAsync(CreateAssetDto dto)
        {
            var asset = new Asset
            {
                Name = dto.Name,
                Category = dto.Category,
                Type = dto.Type,
                Version = dto.Version,
                Specifications = dto.Specifications
            };

            var created = await _repository.AddAsync(asset);
            return MapToDto(created);
        }

        public async Task<AssetDto> UpdateAsync(int id, CreateAssetDto dto)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return null;

            existing.Name = dto.Name;
            existing.Category = dto.Category;
            existing.Type = dto.Type;
            existing.Version = dto.Version;
            existing.Specifications = dto.Specifications;

            var updated = await _repository.UpdateAsync(existing);
            return MapToDto(updated);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            return await _repository.DeleteAsync(id);
        }

        private AssetDto MapToDto(Asset asset)
        {
            return new AssetDto
            {
                Id = asset.Id,
                Name = asset.Name,
                Category = asset.Category,
                Type = asset.Type,
                Version = asset.Version,
                Specifications = asset.Specifications
            };
        }
    }

}
