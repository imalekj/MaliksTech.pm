namespace MaliksTech.PM.Api.DTOs.AI
{
    // هذا الكلاس يمثل الشكل الذي سنطلب من OpenAI أن يرجع البيانات به (JSON)
    public class AiGeneratedTaskDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int EstimatedHours { get; set; }
        public string Priority { get; set; } = "Medium"; // Low, Medium, High, Critical
        public string AiInsights { get; set; } = string.Empty; // لماذا اقترح الـ AI هذه المهمة؟
    }
}