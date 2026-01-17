using ProjectManagement.Application.DTOs.Detail;

namespace ProjectManagement.Application.Interfaces
{
    public interface IUserDetailsService
    {
        Task<string> AddOrUpdateDetailsAsync(UserDetailsRequestDto request);
        Task<List<UserDetailsResponseDto>> GetAllUserDetailsAsync();
        Task<string> DeleteAsync(string email);
        Task<string> UpdateUserDetailsByAdminAsync(string email, UserDetailsRequestDto request);

       Task<UserDetailsResponseDto?> GetByEmailAsync(string email);

    }
}
