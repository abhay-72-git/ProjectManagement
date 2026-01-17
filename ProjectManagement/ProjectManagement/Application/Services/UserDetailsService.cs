using ProjectManagement.Application.DTOs.Detail;
using ProjectManagement.Application.Interfaces;
using ProjectManagement.Domain.Entities;
using ProjectManagement.Domain.Interfaces;

namespace ProjectManagement.Application.Services
{
    public class UserDetailsService : IUserDetailsService
    {
        private readonly IUserDetailsRepository _repository;
        private readonly IUsersLoginRepository _loginRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UserDetailsService(
            IUserDetailsRepository repository,
            IUsersLoginRepository loginRepository,
            IHttpContextAccessor httpContextAccessor)
        {
            _repository = repository;
            _loginRepository = loginRepository;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<string> AddOrUpdateDetailsAsync(UserDetailsRequestDto request)
        {
            var email = _httpContextAccessor.HttpContext!.Session.GetString("UserEmail");

            if (string.IsNullOrEmpty(email))
                return "Session expired, please login again";

            var user = await _loginRepository.GetByEmailAsync(email);
            if (user == null) return "User not found";

            var existing = await _repository.GetByEmailAsync(email);

            // ADD NEW
            if (existing == null)
            {
                var details = new UserDetails
                {
                   // Email = email,
                    UserLoginId = user.LoginId,
                    Name = request.Name,
                    EmpId = request.EmpId,
                    MachineIpAddress = request.MachineIpAddress,
                    DeviceHostName = request.DeviceHostName,
                    ClientVpnUsername = request.ClientVpnUsername,
                    AssetId = request.AssetId,
                    ContactNo = request.ContactNo,
                    BitLockerPassword = request.BitLockerPassword,
                    Location = request.Location,
                    VdiPhysicalMachineLocation = request.VdiPhysicalMachineLocation,
                    HwfhPwfH = request.HwfhPwfH,
                    PL = request.PL,
                    UL = request.UL,
                    FL = request.FL
                };

                await _repository.AddAsync(details);
                return "User details added successfully";
            }

            // UPDATE EXISTING
            existing.Name = request.Name;
            existing.EmpId = request.EmpId;
            existing.MachineIpAddress = request.MachineIpAddress;
            existing.DeviceHostName = request.DeviceHostName;
            existing.ClientVpnUsername = request.ClientVpnUsername;
            existing.AssetId = request.AssetId;
            existing.ContactNo = request.ContactNo;
            existing.BitLockerPassword = request.BitLockerPassword;
            existing.Location = request.Location;
            existing.VdiPhysicalMachineLocation = request.VdiPhysicalMachineLocation;
            existing.HwfhPwfH = request.HwfhPwfH;
            existing.PL = request.PL;
            existing.UL = request.UL;
            existing.FL = request.FL;

            await _repository.UpdateAsync(existing);
            return "User details updated successfully";
        }

        public async Task<List<UserDetailsResponseDto>> GetAllUserDetailsAsync()
        {
            var result = await _repository.GetAllAsync();

            return result.Select(u => new UserDetailsResponseDto
            {
                Email = u.UsersLogin.Email,
                Name = u.Name,
                EmpId = u.EmpId,
                MachineIpAddress = u.MachineIpAddress,
                DeviceHostName = u.DeviceHostName,
                ClientVpnUsername = u.ClientVpnUsername,
                AssetId = u.AssetId,
                ContactNo = u.ContactNo,
                BitLockerPassword = u.BitLockerPassword,
                Location = u.Location,
                VdiPhysicalMachineLocation = u.VdiPhysicalMachineLocation,
                HwfhPwfH = u.HwfhPwfH,
                PL = u.PL,
                UL = u.UL,
                FL = u.FL
            }).ToList();
        }

        public async Task<string> DeleteAsync(string email)
        {
            var existing = await _repository.GetByEmailAsync(email);

            if (existing == null)
                return "User details not found";

            await _repository.DeleteAsync(existing);
            return "User deleted successfully";
        }

        public async Task<string> UpdateUserDetailsByAdminAsync(string email, UserDetailsRequestDto request)
        {
            var existing = await _repository.GetByEmailAsync(email);

            if (existing == null)
                return "User details not found";

            existing.Name = request.Name;
            existing.EmpId = request.EmpId;
            existing.MachineIpAddress = request.MachineIpAddress;
            existing.DeviceHostName = request.DeviceHostName;
            existing.ClientVpnUsername = request.ClientVpnUsername;
            existing.AssetId = request.AssetId;
            existing.ContactNo = request.ContactNo;
            existing.BitLockerPassword = request.BitLockerPassword;
            existing.Location = request.Location;
            existing.VdiPhysicalMachineLocation = request.VdiPhysicalMachineLocation;
            existing.HwfhPwfH = request.HwfhPwfH;
            existing.PL = request.PL;
            existing.UL = request.UL;
            existing.FL = request.FL;

            await _repository.UpdateAsync(existing);

            return "User details updated successfully";
        }

        public async Task<UserDetailsResponseDto?> GetByEmailAsync(string email)
        {
            var user = await _repository.GetByEmailAsync(email);

            if (user == null)
                return null;

            return new UserDetailsResponseDto
            {
                Email = user.UsersLogin.Email,
                Name = user.Name,
                EmpId = user.EmpId,
                MachineIpAddress = user.MachineIpAddress,
                DeviceHostName = user.DeviceHostName,
                ClientVpnUsername = user.ClientVpnUsername,
                AssetId = user.AssetId,
                ContactNo = user.ContactNo,
                BitLockerPassword = user.BitLockerPassword,
                Location = user.Location,
                VdiPhysicalMachineLocation = user.VdiPhysicalMachineLocation,
                HwfhPwfH = user.HwfhPwfH,
                PL = user.PL,
                UL = user.UL,
                FL = user.FL
            };
        }
    }
}
