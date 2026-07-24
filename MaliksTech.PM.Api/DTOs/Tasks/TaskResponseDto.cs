namespace MaliksTech.PM.Api.DTOs.Tasks
{
    public class TaskResponseDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }

        public string Status { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;

        public int EstimatedHours { get; set; }
        public int ActualHours { get; set; }

        public string? AiInsights { get; set; }

        public DateTime? DueDate { get; set; }

        public string? AssigneeName { get; set; }

        
        public List<TaskResponseDto> SubTasks { get; set; } = new List<TaskResponseDto>();
    }
}