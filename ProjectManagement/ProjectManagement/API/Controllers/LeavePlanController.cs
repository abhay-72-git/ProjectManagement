using Microsoft.AspNetCore.Mvc;
using ProjectManagement.Application.DTOs.Leave;
using ProjectManagement.Application.Interfaces;

namespace ProjectManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LeavePlanController : ControllerBase
    {
        private readonly ILeavePlanService _leavePlanService;

        public LeavePlanController(ILeavePlanService leavePlanService)
        {
            _leavePlanService = leavePlanService;
        }

        [HttpPost("apply")]
        public async Task<IActionResult> ApplyLeave([FromBody] LeavePlanRequestDto dto)
        {
            var result = await _leavePlanService.ApplyLeaveAsync(dto);
            if (result.Contains("success"))
                return Ok(new { message = result });

            return BadRequest(new { error = result });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateLeave(int id, [FromBody] LeavePlanRequestDto dto)
        {
            var result = await _leavePlanService.UpdateLeaveAsync(id, dto);
            if (result.Contains("success"))
                return Ok(new { message = result });

            return BadRequest(new { error = result });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLeave(int id)
        {
            var result = await _leavePlanService.DeleteLeaveAsync(id);
            if (result.Contains("success"))
                return Ok(new { message = result });

            return BadRequest(new { error = result });
        }

        [HttpGet]
        public async Task<IActionResult> GetByMonthYear(int month, int year)
        {
            var plans = await _leavePlanService.GetLeavePlanByMonthYearAsync(month, year);
            return Ok(plans);
        }
    }
}
