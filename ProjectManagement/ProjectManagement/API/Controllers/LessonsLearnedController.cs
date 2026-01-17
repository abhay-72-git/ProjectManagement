using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ProjectManagement.Application.DTOs.Learning;
using ProjectManagement.Application.Interfaces;

namespace ProjectManagement.API.Controllers
{
    [Route("api/lessons-learned")]
    [ApiController]
    public class LessonsLearnedController : ControllerBase
    {
        private readonly ILessonLearnedService _service;

        public LessonsLearnedController(ILessonLearnedService service)
        {
            _service = service;
        }

        // POST
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] LessonLearnedRequestDto dto)
        {
            var id = await _service.CreateAsync(dto);
            return Ok(new { Id = id });
        }

        // GET
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data = await _service.GetAllAsync();
            return Ok(data);
        }

        // PUT
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] LessonLearnedRequestDto dto)
        {
            await _service.UpdateAsync(id, dto);
            return NoContent();
        }

        // DELETE
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }
    }
}
