using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace ProjectManagement.Domain.Entities
{
    
    public class UserDetails
    {
        [Key]
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;

        public Guid UserLoginId { get; set; }    

        public string? Name { get; set; }
        public int? EmpId { get; set; }
        public string? MachineIpAddress { get; set; }
        public string? DeviceHostName { get; set; }
        public string? ClientVpnUsername { get; set; }
        public string? AssetId { get; set; }
        public long? ContactNo { get; set; }
        public string? BitLockerPassword { get; set; }
        public string? Location { get; set; }
        public string? VdiPhysicalMachineLocation { get; set; }
        public string? HwfhPwfH { get; set; }
        public decimal PL { get; set; }      
        public decimal UL { get; set; }    
        public decimal FL { get; set; }
        public UsersLogin? UsersLogin { get; set; }
    }
}
