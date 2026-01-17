using ProjectManagement.Application.DTOs.Leave;
using ProjectManagement.Application.Interfaces;
using ProjectManagement.Domain.Entities;
using ProjectManagement.Domain.Interfaces;

public class LeavePlanService : ILeavePlanService
{
    private readonly IUserDetailsRepository _userRepo;
    private readonly ILeavePlanRepository _leaveRepo;

    public LeavePlanService(IUserDetailsRepository userRepo, ILeavePlanRepository leaveRepo)
    {
        _userRepo = userRepo;
        _leaveRepo = leaveRepo;
    }

    // Mapping entity -> Response DTO
    private LeavePlanResponseDto MapToResponseDto(LeavePlan leave, string userName)
    {
        decimal pl = leave.Breakdown.Where(b => b.Type == "PL").Sum(b => b.Days);
        decimal ul = leave.Breakdown.Where(b => b.Type == "UL").Sum(b => b.Days);
        decimal fl = leave.Breakdown.Where(b => b.Type == "FL").Sum(b => b.Days);

        return new LeavePlanResponseDto
        {
            Id = leave.Id,
            Email = leave.Email,
            Name = userName,
            DateFrom = leave.DateFrom,
            DateTo = leave.DateTo,
            TotalDays = pl + ul + fl,
            Breakdown = leave.Breakdown
                            .Select(b => new LeavePlanBreakdownDto
                            {
                                Type = b.Type,
                                Days = b.Days
                            }).ToList(),
            LeavesInHandPL = userName != null ? 0 : 0, // placeholder, calculate if needed
            LeavesInHandUL = userName != null ? 0 : 0,
            LeavesInHandFL = userName != null ? 0 : 0
        };
    }

    // APPLY LEAVE
    public async Task<string> ApplyLeaveAsync(LeavePlanRequestDto dto)
    {// Special case for  Holiday

        if (dto.Email.Equals(" Holiday", StringComparison.OrdinalIgnoreCase))
        {
            var totalDays = (dto.DateTo - dto.DateFrom).TotalDays + 1; // inclusive

            var Cyleave = new LeavePlan
            {
                Email = dto.Email,
                DateFrom = dto.DateFrom,
                DateTo = dto.DateTo,
                Breakdown = new List<LeavePlanBreakdown>
            {
                new LeavePlanBreakdown
                {
                    Type = "HOLIDAY",
                    Days = (decimal)totalDays
                }
            },
                TotalDays = (decimal)totalDays
            };

            await _leaveRepo.AddAsync(Cyleave);

            return $" Holiday applied for {totalDays} day(s)";
        }
        var user = await _userRepo.GetByEmailAsync(dto.Email);
        if (user == null) return "User not found";

        // Validate balance
        foreach (var b in dto.Breakdowns)
        {
            if (b.Type == "PL" && user.PL < b.Days) return "Not enough PL balance";
            if (b.Type == "UL" && user.UL < b.Days) return "Not enough UL balance";
            if (b.Type == "FL" && user.FL < b.Days) return "Not enough FL balance";
        }

        // Deduct balances
        foreach (var b in dto.Breakdowns)
        {
            if (b.Type == "PL") user.PL -= b.Days;
            if (b.Type == "UL") user.UL -= b.Days;
            if (b.Type == "FL") user.FL -= b.Days;
        }

        var leave = new LeavePlan
        {
            Email = dto.Email,
            DateFrom = dto.DateFrom,
            DateTo = dto.DateTo,
            Breakdown = dto.Breakdowns.Select(x => new LeavePlanBreakdown
            {
                Type = x.Type,
                Days = x.Days
            }).ToList()
        };

        await _leaveRepo.AddAsync(leave);
        await _userRepo.UpdateAsync(user);

        return "Leave applied successfully";
    }

    // UPDATE LEAVE
    public async Task<string> UpdateLeaveAsync(int id, LeavePlanRequestDto dto)
    {
        var leave = await _leaveRepo.GetByIdAsync(id);
        if (leave == null) return "Leave not found";

        var user = await _userRepo.GetByEmailAsync(leave.Email);
        if (user == null) return "User not found";

        // Restore old balance
        foreach (var old in leave.Breakdown)
        {
            if (old.Type == "PL") user.PL += old.Days;
            if (old.Type == "UL") user.UL += old.Days;
            if (old.Type == "FL") user.FL += old.Days;
        }

        // Validate new requested days
        foreach (var b in dto.Breakdowns)
        {
            if (b.Type == "PL" && user.PL < b.Days) return "Not enough PL balance";
            if (b.Type == "UL" && user.UL < b.Days) return "Not enough UL balance";
            if (b.Type == "FL" && user.FL < b.Days) return "Not enough FL balance";
        }

        // Deduct new
        foreach (var b in dto.Breakdowns)
        {
            if (b.Type == "PL") user.PL -= b.Days;
            if (b.Type == "UL") user.UL -= b.Days;
            if (b.Type == "FL") user.FL -= b.Days;
        }

        leave.Breakdown.Clear();
        leave.Breakdown = dto.Breakdowns.Select(x => new LeavePlanBreakdown
        {
            Type = x.Type,
            Days = x.Days
        }).ToList();

        leave.DateFrom = dto.DateFrom;
        leave.DateTo = dto.DateTo;

        await _leaveRepo.UpdateAsync(leave);
        await _userRepo.UpdateAsync(user);

        return "Leave updated successfully";
    }

    // DELETE LEAVE
    public async Task<string> DeleteLeaveAsync(int id)
    {
        var leave = await _leaveRepo.GetByIdAsync(id);
        if (leave == null) return "Leave not found";

        var user = await _userRepo.GetByEmailAsync(leave.Email);
        if (user == null) return "User not found";

        foreach (var b in leave.Breakdown)
        {
            if (b.Type == "PL") user.PL += b.Days;
            if (b.Type == "UL") user.UL += b.Days;
            if (b.Type == "FL") user.FL += b.Days;
        }

        await _userRepo.UpdateAsync(user);
        await _leaveRepo.DeleteAsync(leave);

        return "Leave deleted successfully";
    }

    // GET LEAVES BY MONTH/YEAR
    public async Task<List<LeavePlanResponseDto>> GetLeavePlanByMonthYearAsync(int month, int year)
    {
        var data = await _leaveRepo.GetByMonthYearAsync(month, year);
        var response = new List<LeavePlanResponseDto>();

        foreach (var leave in data)
        {
            var user = await _userRepo.GetByEmailAsync(leave.Email);

            response.Add(new LeavePlanResponseDto
            {
                Id = leave.Id,
                Email = leave.Email,
                Name = user?.Name ?? "",
                DateFrom = leave.DateFrom,
                DateTo = leave.DateTo,
                Breakdown = leave.Breakdown
                    .Select(b => new LeavePlanBreakdownDto
                    {
                        Type = b.Type,
                        Days = b.Days
                    }).ToList(),
                TotalDays = leave.Breakdown.Sum(b => b.Days),
                LeavesInHandPL = user?.PL ?? 0,
                LeavesInHandUL = user?.UL ?? 0,
                LeavesInHandFL = user?.FL ?? 0
            });
        }

        return response;
    }
}
