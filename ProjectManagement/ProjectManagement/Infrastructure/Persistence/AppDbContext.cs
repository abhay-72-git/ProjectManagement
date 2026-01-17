using Microsoft.EntityFrameworkCore;
using ProjectManagement.Domain.Entities;

namespace ProjectManagement.Infrastructure.Persistence
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<UsersLogin> UsersLogin { get; set; }
        public DbSet<UserDetails> UserDetails { get; set; }

        public DbSet<LeavePlan> LeavePlans { get; set; }
        public DbSet<LeavePlanBreakdown> LeavePlanBreakdowns { get; set; }
        public DbSet<SprintVelocity> SprintVelocities { get; set; }
        public DbSet<SprintTask> SprintTasks { get; set; }
        public DbSet<SprintTaskOwner> SprintTaskOwners { get; set; }
        public DbSet<SprintTaskCoordinator> SprintTaskCoordinators { get; set; }

        public DbSet<IssueDocument> IssueDocuments { get; set; }
        public DbSet<Document> Documents { get; set; }
        public DbSet<LessonLearned> LessonLearneds { get; set; }
        public DbSet<ISTicket> ISTickets { get; set; }
        public DbSet<SprintResponsibility> SprintResponsibilities { get; set; }

        public DbSet<Asset> Assets { get; set; }

        public DbSet<SprintMom> SprintMoms { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // =======================================
            // USERS
            // =======================================
            modelBuilder.Entity<UsersLogin>()
                .HasKey(x => x.LoginId);

            modelBuilder.Entity<UserDetails>()
                .HasOne(x => x.UsersLogin)
                .WithOne()
                .HasForeignKey<UserDetails>(x => x.UserLoginId)
                .OnDelete(DeleteBehavior.Cascade);

            // =======================================
            // LEAVE PLAN
            // =======================================
            modelBuilder.Entity<LeavePlan>()
                .HasMany(lp => lp.Breakdown)
                .WithOne(b => b.LeavePlan)
                .HasForeignKey(b => b.LeavePlanId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<LeavePlanBreakdown>()
                .Property(b => b.Days)
                .HasColumnType("decimal(5,2)")
                .IsRequired();

            modelBuilder.Entity<LeavePlan>()
                .Property(lp => lp.TotalDays)
                .HasColumnType("decimal(5,2)")
                .IsRequired();

            modelBuilder.Entity<LeavePlan>().ToTable("LeavePlans");
            modelBuilder.Entity<LeavePlanBreakdown>().ToTable("LeavePlanBreakdowns");

            // =======================================
            // ASSETS (NEW)
            // =======================================
            modelBuilder.Entity<Asset>()
                .ToTable("Assets");

            // Store enums as strings (easy to read)
            modelBuilder.Entity<Asset>()
                .Property(a => a.Category)
                .HasConversion<string>();

            modelBuilder.Entity<Asset>()
                .Property(a => a.Type)
                .HasConversion<string>();

            // Optional: column sizes
            modelBuilder.Entity<Asset>()
                .Property(a => a.Name)
                .HasMaxLength(200)
                .IsRequired();

            modelBuilder.Entity<Asset>()
                .Property(a => a.Version)
                .HasMaxLength(50);

            modelBuilder.Entity<Asset>()
                .Property(a => a.Specifications)
                .HasMaxLength(500);
            ///////////////////////////////////////
            modelBuilder.Entity<IssueDocument>(entity =>
            {
                entity.HasKey(x => x.Id);

                entity.Property(x => x.Type)
                      .IsRequired()
                      .HasMaxLength(100);

                entity.Property(x => x.Comments)
                      .IsRequired()
                      .HasMaxLength(500);

                entity.HasOne(x => x.TeamMember)
                      .WithMany()
                      .HasForeignKey(x => x.TeamMemberId);
            });

            //////////////////////////////
            modelBuilder.Entity<Document>(entity =>
            {
                entity.HasKey(x => x.Id);

                entity.Property(x => x.Name)
                      .IsRequired()
                      .HasMaxLength(150);

                entity.Property(x => x.Type)
                      .IsRequired()
                      .HasMaxLength(100);

                entity.Property(x => x.DocumentLink)
                      .IsRequired();

                entity.HasOne(x => x.UploadedBy)
                      .WithMany()
                      .HasForeignKey(x => x.UploadedById);
            });
            ////////////////////////////////////
            modelBuilder.Entity<LessonLearned>(entity =>
            {
                entity.HasKey(x => x.Id);

                entity.Property(x => x.LessonLearnt)
                      .IsRequired()
                      .HasMaxLength(500);

                entity.Property(x => x.Comments)
                      .HasMaxLength(500);

                entity.Property(x => x.Source)
                      .HasMaxLength(200);
            });

            //////////////////////
            modelBuilder.Entity<ISTicket>(entity =>
            {
                entity.HasKey(x => x.TicketId);
                entity.Property(X => X.TicketNo).IsRequired();
                entity.Property(x => x.Purpose).IsRequired().HasMaxLength(200);
                entity.Property(x => x.TicketCategory).IsRequired().HasMaxLength(100);
                entity.Property(x => x.TicketProblem).IsRequired().HasMaxLength(300);
                entity.Property(x => x.RequiredDetails).HasMaxLength(500);
                entity.Property(x => x.Comments).HasMaxLength(500);

                entity.HasOne(x => x.RaisedBy)
                      .WithMany()
                      .HasForeignKey(x => x.RaisedById);
            });

            //////////////////

            modelBuilder.Entity<SprintResponsibility>(entity =>
            {
                entity.HasKey(x => x.Id);

                entity.HasOne(x => x.Sprint)
          .WithMany()
          .HasForeignKey(x => x.SprintId)
          .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(x => x.DsrSendingUser)
                      .WithMany()
                      .HasForeignKey(x => x.DsrSendingUserId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(x => x.DataMatrixUser)
                      .WithMany()
                      .HasForeignKey(x => x.DataMatrixUserId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(x => x.ScrumMasterUser)
                      .WithMany()
                      .HasForeignKey(x => x.ScrumMasterUserId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // =======================================
            // SPRINT MOM
            // =======================================
            modelBuilder.Entity<SprintMom>(entity =>
            {
                entity.ToTable("SprintMoms");

                entity.HasKey(x => x.Id);

                entity.Property(x => x.MomInput)
                      .IsRequired()
                      .HasColumnType("longtext");

                entity.Property(x => x.MomMonth)
                      .IsRequired();
            });

            // =======================================
            // SPRINT TASK - OWNERS (MANY TO MANY)
            // =======================================
            modelBuilder.Entity<SprintTaskOwner>(entity =>
            {
                entity.HasKey(x => new { x.SprintTaskId, x.OwnerId });

                entity.HasOne(x => x.SprintTask)
                      .WithMany(t => t.Owners)
                      .HasForeignKey(x => x.SprintTaskId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // =======================================
            // SPRINT TASK - COORDINATORS (MANY TO MANY)
            // =======================================
            modelBuilder.Entity<SprintTaskCoordinator>(entity =>
            {
                entity.HasKey(x => new { x.SprintTaskId, x.CoordinatorId });

                entity.HasOne(x => x.SprintTask)
                      .WithMany(t => t.Coordinators)
                      .HasForeignKey(x => x.SprintTaskId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

        }

    }

}
