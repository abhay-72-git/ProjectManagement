using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectManagement.Application.DTOs.SprintTask;
using ProjectManagement.Application.Interfaces;
using ProjectManagement.Infrastructure.Persistence;

namespace ProjectManagement.API.Controllers
{
    [ApiController]
    [Route("api/sprint-task")]
    public class SprintTaskController : ControllerBase
    {
        private readonly ISprintTaskService _service;
        private readonly AppDbContext _context;
        public SprintTaskController(ISprintTaskService service, AppDbContext context)
        {
            _service = service;
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> Create(SprintTaskDto dto)
            => Ok(await _service.CreateAsync(dto));

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, SprintTaskDto dto)
            => await _service.UpdateAsync(id, dto) ? NoContent() : NotFound();

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
            => await _service.DeleteAsync(id) ? NoContent() : NotFound();

        [HttpGet]
        public async Task<IActionResult> GetAll()
            => Ok(await _service.GetAllAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
            => Ok(await _service.GetByIdAsync(id));

        [HttpGet("sprint/{sprintVelocityId}/story-points")]
        public async Task<IActionResult> GetStoryPointSummary(int sprintVelocityId)
        {
            var result = await _service.GetStoryPointSummaryAsync(sprintVelocityId);
            return Ok(result);
        }


    }

}
