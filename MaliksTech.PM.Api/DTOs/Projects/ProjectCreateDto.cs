using System.ComponentModel.DataAnnotations;

namespace MaliksTech.PM.Api.DTOs.Projects
{
    public class ProjectCreateDto
    {
        
        [Required(ErrorMessage = "عنوان المشروع مطلوب")]
        [MaxLength(100, ErrorMessage = "العنوان يجب ألا يتجاوز 100 حرف")]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime TargetEndDate { get; set; }
    }
}