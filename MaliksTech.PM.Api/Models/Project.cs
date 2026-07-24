namespace MaliksTech.PM.Api.Models
{
    public class Project
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }

        public DateTime StartDate { get; set; }
        public DateTime TargetEndDate { get; set; }

        // الحقل الخاص بتقييم الذكاء الاصطناعي
        public ProjectRiskLevel RiskLevel { get; set; } = ProjectRiskLevel.Safe;

        public int OwnerId { get; set; }
        public ApplicationUser Owner { get; set; } = null!;

        public ICollection<ProjectTask> Tasks { get; set; } = new List<ProjectTask>();
    }
}