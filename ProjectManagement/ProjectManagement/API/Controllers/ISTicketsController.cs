using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ProjectManagement.Application.DTOs.ISTicket;
using ProjectManagement.Application.Interfaces;

namespace ProjectManagement.API.Controllers
{
    [Route("api/is-tickets")]
    [ApiController]
    public class ISTicketsController : ControllerBase
    {
        private readonly IISTicketService _service;

        public ISTicketsController(IISTicketService service)
        {
            _service = service;
        }

        // POST
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ISTicketRequestDto dto)
        {
            var ticketId = await _service.CreateAsync(dto);
            return Ok(new { TicketId = ticketId });
        }

        // GET
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data = await _service.GetAllAsync();
            return Ok(data);
        }

        // PUT
        [HttpPut("{ticketId}")]
        public async Task<IActionResult> Update(int ticketId, [FromBody] ISTicketRequestDto dto)
        {
            await _service.UpdateAsync(ticketId, dto);
            return NoContent();
        }

        // DELETE
        [HttpDelete("{ticketId}")]
        public async Task<IActionResult> Delete(int ticketId)
        {
            await _service.DeleteAsync(ticketId);
            return NoContent();
        }
    }
}
