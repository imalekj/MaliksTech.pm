namespace MaliksTech.PM.Api.Models
{
        public enum ProjectTaskStatus
        {
            Todo,
            InProgress,
            Done
        }
  

    public enum PriorityLevel
    {
        Low,
        Medium,
        High,
        Critical
    }

    public enum ProjectRiskLevel
    {
        Safe,       // يسير حسب الجدول
        AtRisk,     // توقع تأخير بنسبة معينة
        OffTrack    // متأخر بالفعل ويحتاج تدخل
    }

    public enum UserRole
    {
        Member,
        Manager,
        Admin
    }
}