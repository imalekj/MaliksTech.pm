namespace MaliksTech.PM.Api.DTOs.Projects
{
    public class ProjectResponseDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime TargetEndDate { get; set; }

        // هنا نرسل تقييم الـ AI كنص صريح ليسهل عرضه في الواجهة
        public string RiskLevel { get; set; } = string.Empty;

        // بدلاً من إرسال كائن المستخدم بالكامل، نرسل اسمه فقط
        public string OwnerName { get; set; } = string.Empty;
    }
}