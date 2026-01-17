using Microsoft.AspNetCore.Mvc;
using ProjectManagement.Application.DTOs.Auth;
using ProjectManagement.Application.Interfaces;

namespace ProjectManagement.API.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IUsersLoginService _usersLoginService;

        public AuthController(IUsersLoginService usersLoginService)
        {
            _usersLoginService = usersLoginService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
        {
            var response = await _usersLoginService.RegisterAsync(request);
            return Ok(response);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            var response = await _usersLoginService.LoginAsync(request);

            if (response == "Login Successful")
            {
                HttpContext.Session.SetString("UserEmail", request.Email);
            }

            return Ok(response);
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var result = await _usersLoginService.LogoutAsync();
            return Ok(result);
        }
    }
}