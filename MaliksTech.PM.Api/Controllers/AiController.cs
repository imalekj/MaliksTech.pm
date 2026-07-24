using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MaliksTech.PM.Api.Data;
using MaliksTech.PM.Api.DTOs.AI;
using MaliksTech.PM.Api.Models;
using MaliksTech.PM.Api.Services.Interfaces;
using System.Security.Claims;

namespace MaliksTech.PM.Api.Controllers
{
    public class AiRequestDto
    {
        public string Description { get; set; } = string.Empty;
    }

    public class AiProjectRequestDto
    {
        public string ProjectName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AiController : ControllerBase
    {
        private readonly IAiAssistantService _aiService;
        private readonly AppDbContext _context;

        public AiController(IAiAssistantService aiService, AppDbContext context)
        {
            _aiService = aiService;
            _context = context;
        }

        private int CurrentUserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpPost("breakdown")]
        public async Task<ActionResult<List<AiGeneratedTaskDto>>> BreakDownProject([FromBody] AiRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Description))
                return BadRequest("يرجى إدخال وصف للمشروع.");

            var tasks = await _aiService.BreakDownProjectAsync(request.Description);

            return Ok(tasks);
        }

        [HttpPost("generate-and-save-project")]
        public async Task<ActionResult> GenerateAndSaveProject([FromBody] AiProjectRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Description) || string.IsNullOrWhiteSpace(request.ProjectName))
                return BadRequest("يرجى إدخال اسم المشروع ووصفه.");

            var aiTasks = await _aiService.BreakDownProjectAsync(request.Description);

            if (aiTasks == null || !aiTasks.Any())
                return StatusCode(500, "فشل الذكاء الاصطناعي في توليد المهام. يرجى المحاولة مرة أخرى.");

            var newProject = new Project
            {
                Title = request.ProjectName,
                Description = request.Description,
                StartDate = DateTime.UtcNow,
                TargetEndDate = DateTime.UtcNow.AddDays(30),
                RiskLevel = ProjectRiskLevel.Safe,
                OwnerId = CurrentUserId
            };

            _context.Projects.Add(newProject);
            await _context.SaveChangesAsync();

            var dbTasks = aiTasks.Select(aiTask => {
                if (!Enum.TryParse<PriorityLevel>(aiTask.Priority, true, out var priorityResult))
                {
                    priorityResult = PriorityLevel.Medium;
                }

                return new ProjectTask
                {
                    Title = aiTask.Title,
                    Description = aiTask.Description,
                    Status = Models.ProjectTaskStatus.Todo,
                    Priority = priorityResult,
                    EstimatedHours = aiTask.EstimatedHours,
                    AiInsights = aiTask.AiInsights,
                    ProjectId = newProject.Id
                };
            }).ToList();

            _context.Tasks.AddRange(dbTasks);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "تم إنشاء المشروع ومهامه بنجاح!", ProjectId = newProject.Id, TaskCount = dbTasks.Count });
        }
    }
}