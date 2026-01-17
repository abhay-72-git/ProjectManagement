using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectManagement.Application.DTOs;
using ProjectManagement.Application.DTOs.Detail;
using ProjectManagement.Application.Interfaces;
using ProjectManagement.Application.Services;
using ProjectManagement.Infrastructure.Persistence;

namespace ProjectManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserDetailsController : ControllerBase
    {
        private readonly IUserDetailsService _service;
        private readonly AppDbContext _context;
        public UserDetailsController(IUserDetailsService service, AppDbContext context)
        {
            _service = service;
            _context = context;
        }

        [HttpPost("add-or-update")]
        public async Task<IActionResult> AddOrUpdate(UserDetailsRequestDto request)
        {
            var result = await _service.AddOrUpdateDetailsAsync(request);
            return Ok(result);
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _service.GetAllUserDetailsAsync();
            return Ok(result);
        }

        [HttpDelete("{email}")]
        public async Task<IActionResult> Delete(string email)
        {
            var result = await _service.DeleteAsync(email);
            return Ok(new { message = result });
        }

        [HttpPut("admin/{email}")]
        public async Task<IActionResult> UpdateByAdmin(string email, UserDetailsRequestDto request)
        {
            var result = await _service.UpdateUserDetailsByAdminAsync(email, request);
            return Ok(new { message = result });
        }

        [HttpGet("{email}")]
        public async Task<IActionResult> GetByEmail(string email)
        {
            var user = await _service.GetByEmailAsync(email);
            if (user == null)
                return NotFound("User not found");

            return Ok(user);
        }

        [HttpGet("dropdown")]
        public async Task<IActionResult> GetUsers()
        {
            return Ok(await _context.UserDetails
                .Select(x => new { x.Id, x.Name })
                .ToListAsync());
        }

    }
}
