namespace MaliksTech.PM.Api.Models
{
    public class ApplicationUser
    {
        public int Id { get; set; }
        public string Password { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public UserRole Role { get; set; } = UserRole.Member;


        public ICollection<Project> OwnedProjects { get; set; } = new List<Project>();
        public ICollection<ProjectTask> AssignedTasks { get; set; } = new List<ProjectTask>();
        public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    }
}