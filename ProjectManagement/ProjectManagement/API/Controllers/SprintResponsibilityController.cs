using Microsoft.AspNetCore.Mvc;
using ProjectManagement.Application.DTOs.SprintResponsibility;
using ProjectManagement.Application.Interfaces;

namespace ProjectManagement.API.Controllers
{
    [ApiController]
    [Route("api/sprint-responsibilities")]
    public class SprintResponsibilitiesController : ControllerBase
    {
        private readonly ISprintResponsibilityService _service;

        public SprintResponsibilitiesController(ISprintResponsibilityService service)
        {
            _service = service;
        }

        // GET: api/sprint-responsibilities
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _service.GetAllAsync());
        }

        // GET: api/sprint-responsibilities/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _service.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        // POST
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] SprintResponsibilityRequestDto dto)
        {
            var id = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id }, null);
        }

        // PUT
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] SprintResponsibilityRequestDto dto)
        {
            var success = await _service.UpdateAsync(id, dto);
            if (!success) return NotFound();
            return NoContent();
        }

        // DELETE
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _service.DeleteAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}
