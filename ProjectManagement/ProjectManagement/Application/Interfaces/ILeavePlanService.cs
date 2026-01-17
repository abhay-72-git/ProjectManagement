using ProjectManagement.Application.DTOs.Leave;

public interface ILeavePlanService
{
    Task<string> ApplyLeaveAsync(LeavePlanRequestDto dto);
    Task<string> UpdateLeaveAsync(int id, LeavePlanRequestDto dto);
    Task<string> DeleteLeaveAsync(int id);
    Task<List<LeavePlanResponseDto>> GetLeavePlanByMonthYearAsync(int month, int year);
}
