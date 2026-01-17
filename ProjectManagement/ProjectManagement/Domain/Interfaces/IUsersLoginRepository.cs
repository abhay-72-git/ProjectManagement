using ProjectManagement.Domain.Entities;

namespace ProjectManagement.Domain.Interfaces
{
    public interface IUsersLoginRepository
    {
        Task<UsersLogin?> GetByEmailAsync(string email);
        Task AddAsync(UsersLogin usersLogin);

        
    }
}
