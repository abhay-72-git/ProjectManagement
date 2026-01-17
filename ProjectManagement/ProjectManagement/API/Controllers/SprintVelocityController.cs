using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectManagement.Application.DTOs.SprintVelocity;
using ProjectManagement.Application.Interfaces;
using ProjectManagement.Infrastructure.Persistence;

namespace ProjectManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SprintVelocityController : ControllerBase
    {
        private readonly ISprintVelocityService _service;
        private readonly AppDbContext _context;
        public SprintVelocityController(ISprintVelocityService service,AppDbContext context)
        {
            _service = service;
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _service.GetAllAsync());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var sprint = await _service.GetByIdAsync(id);
            if (sprint == null) return NotFound();
            return Ok(sprint);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] SprintVelocityDto dto)
        {
            var sprint = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = sprint.Id }, sprint);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] SprintVelocityDto dto)
        {
            var updated = await _service.UpdateAsync(id, dto);
            if (!updated) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _service.DeleteAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }

        // Sprint dropdown
        [HttpGet("dropdown")]
        public async Task<IActionResult> GetSprints()
        {
            return Ok(await _context.SprintVelocities
                .Select(x => new { x.Id, x.SprintNumber })
                .ToListAsync());
        }

        // Auto-fetch sprint dates
        [HttpGet("{id}/dates")]
        public async Task<IActionResult> GetSprintDates(int id)
        {
            var sprint = await _context.SprintVelocities.FindAsync(id);
            if (sprint == null) return NotFound();

            return Ok(new
            {
                sprint.StartDate,
                sprint.EndDate
            });
        }
    }
}
