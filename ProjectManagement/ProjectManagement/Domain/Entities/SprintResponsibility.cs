namespace ProjectManagement.Domain.Entities
{
    public class SprintResponsibility
    {
        public int Id { get; set; }

        public int SprintId { get; set; }

        public SprintVelocity Sprint { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        public int DsrSendingUserId { get; set; }
        public int DataMatrixUserId { get; set; }
        public int ScrumMasterUserId { get; set; }

        public UserDetails DsrSendingUser { get; set; }
        public UserDetails DataMatrixUser { get; set; }
        public UserDetails ScrumMasterUser { get; set; }
    }
    }
