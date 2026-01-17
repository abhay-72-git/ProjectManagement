namespace ProjectManagement.Domain.Entities
{
    public class ISTicket
    {
        public int TicketId { get; set; }
        public int TicketNo { get; set; }
        // FK from UserDetails
        public int RaisedById { get; set; }

        public string Purpose { get; set; } = null!;
        public string TicketCategory { get; set; } = null!;
        public string TicketProblem { get; set; } = null!;
        public string? RequiredDetails { get; set; } = null!;
        public string? Comments { get; set; } = null!;

        // Navigation
        public UserDetails RaisedBy { get; set; }
    }

}
