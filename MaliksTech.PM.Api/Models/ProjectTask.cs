namespace MaliksTech.PM.Api.Models
{
    public class ProjectTask
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }

        public ProjectTaskStatus Status { get; set; } = ProjectTaskStatus.Todo;
        public PriorityLevel Priority { get; set; } = PriorityLevel.Medium;

        
        public int EstimatedHours { get; set; }
        public int ActualHours { get; set; }
        public string? AiInsights { get; set; } 

        public DateTime? DueDate { get; set; }

        public int ProjectId { get; set; }
        public Project Project { get; set; } = null!;

        public int? AssigneeId { get; set; }
        public ApplicationUser? Assignee { get; set; }

        
        public int? ParentTaskId { get; set; }
        public ProjectTask? ParentTask { get; set; }
        public ICollection<ProjectTask> SubTasks { get; set; } = new List<ProjectTask>();

        public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    }
}