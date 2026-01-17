namespace ProjectManagement.Application.DTOs.ISTicket
{
    public class ISTicketResponseDto
    {
        public int TicketId { get; set; }
        public int TicketNo { get; set; }
        public int RaisedById { get; set; }
        public string RaisedByName { get; set; } = null!;

        public string Purpose { get; set; } = null!;
        public string TicketCategory { get; set; } = null!;
        public string TicketProblem { get; set; } = null!;
        public string RequiredDetails { get; set; } = null!;
        public string Comments { get; set; } = null!;
    }

}
