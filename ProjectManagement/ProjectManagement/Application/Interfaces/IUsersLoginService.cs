using ProjectManagement.Application.DTOs.Auth;
using ProjectManagement.Domain.Entities;


namespace ProjectManagement.Application.Interfaces
{
    public interface IUsersLoginService
    {
        Task<string> RegisterAsync(RegisterRequestDto request);
        Task<string> LoginAsync(LoginRequestDto request);
        Task<string> LogoutAsync();

    }
}
