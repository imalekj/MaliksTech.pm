using MaliksTech.PM.Api.DTOs.AI;

namespace MaliksTech.PM.Api.Services.Interfaces
{
    public interface IAiAssistantService
    {
        // تأخذ وصفاً عاماً للمشروع، وتعيد قائمة بالمهام المقترحة
        Task<List<AiGeneratedTaskDto>> BreakDownProjectAsync(string projectDescription);
    }
}