using Microsoft.AspNetCore.Mvc;
using ProjectManagement.Application.DTOs.Asset;
using ProjectManagement.Application.Interfaces;
using ProjectManagement.Domain.Entities;

namespace ProjectManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AssetsController : ControllerBase
    {
        private readonly IAssetService _service;

        public AssetsController(IAssetService service)
        {
            _service = service;
        }

        // GET ALL
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _service.GetAllAsync());
        }

        // GET BY CATEGORY (Physical / VDI)
        [HttpGet("category/{category}")]
        public async Task<IActionResult> GetByCategory(AssetCategory category)
        {
            return Ok(await _service.GetByCategoryAsync(category));
        }

        // GET BY ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _service.GetByIdAsync(id);
            return result == null ? NotFound() : Ok(result);
        }

        // ADD
        [HttpPost]
        public async Task<IActionResult> Add([FromBody] CreateAssetDto dto)
        {
            var created = await _service.AddAsync(dto);
            return Ok(created);
        }

        // UPDATE
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateAssetDto dto)
        {
            var result = await _service.UpdateAsync(id, dto);
            return result == null ? NotFound() : Ok(result);
        }

        // DELETE
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _service.DeleteAsync(id);
            return deleted ? Ok("Deleted") : NotFound();
        }
    }

}
