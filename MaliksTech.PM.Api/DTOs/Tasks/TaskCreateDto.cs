using System.ComponentModel.DataAnnotations;
using MaliksTech.PM.Api.Models;

namespace MaliksTech.PM.Api.DTOs.Tasks
{
    public class TaskCreateDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }

        public PriorityLevel Priority { get; set; } = PriorityLevel.Medium;
        public int EstimatedHours { get; set; }
        public DateTime? DueDate { get; set; }

        [Required]
        public int ProjectId { get; set; }

        public int? AssigneeId { get; set; }
        public int? ParentTaskId { get; set; }   
    }
}