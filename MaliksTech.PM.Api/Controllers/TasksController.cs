using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MaliksTech.PM.Api.Data;
using MaliksTech.PM.Api.DTOs.Common;
using MaliksTech.PM.Api.DTOs.Tasks;
using MaliksTech.PM.Api.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace MaliksTech.PM.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TasksController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TasksController(AppDbContext context)
        {
            _context = context;
        }

        private static TaskResponseDto ToDto(ProjectTask t) => new TaskResponseDto
        {
            Id = t.Id,
            Title = t.Title,
            Description = t.Description,
            Status = t.Status.ToString(),
            Priority = t.Priority.ToString(),
            EstimatedHours = t.EstimatedHours,
            ActualHours = t.ActualHours,
            AiInsights = t.AiInsights,
            DueDate = t.DueDate,
            AssigneeName = t.Assignee?.FullName,
            SubTasks = t.SubTasks?.Select(ToDto).ToList() ?? new List<TaskResponseDto>()
        };

        private int CurrentUserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        private bool IsAdmin => User.IsInRole(nameof(UserRole.Admin));

        [HttpGet]
        [Authorize]
        public async Task<ActionResult<PagedResultDto<TaskResponseDto>>> GetAll(
            [FromQuery] int? projectId,
            [FromQuery] ProjectTaskStatus? status,
            [FromQuery] PriorityLevel? priority,
            [FromQuery] string? sortBy = "priority",
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            page = Math.Max(page, 1);
            pageSize = Math.Clamp(pageSize, 1, 200);

            var query = _context.Tasks
                .Include(t => t.Assignee)
                .Include(t => t.SubTasks)
                .Where(t => t.ParentTaskId == null)
                .AsQueryable();

            if (projectId.HasValue)
                query = query.Where(t => t.ProjectId == projectId.Value);

            if (status.HasValue)
                query = query.Where(t => t.Status == status.Value);

            if (priority.HasValue)
                query = query.Where(t => t.Priority == priority.Value);

            query = sortBy?.ToLower() switch
            {
                "duedate" => query.OrderBy(t => t.DueDate),
                "priority" => query.OrderByDescending(t => t.Priority),
                _ => query.OrderBy(t => t.Title)
            };

            var totalCount = await query.CountAsync();
            var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

            return Ok(new PagedResultDto<TaskResponseDto>
            {
                Items = items.Select(ToDto).ToList(),
                Page = page,
                PageSize = pageSize,
                TotalCount = totalCount
            });
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<TaskResponseDto>> GetById(int id)
        {
            var task = await _context.Tasks
                .Include(t => t.Assignee)
                .Include(t => t.SubTasks)
                .FirstOrDefaultAsync(t => t.Id == id);

            return task != null ? Ok(ToDto(task)) : NotFound(new { Message = "المهمة غير موجودة" });
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<TaskResponseDto>> Create([FromBody] TaskCreateDto dto)
        {
            var projectExists = await _context.Projects.AnyAsync(p => p.Id == dto.ProjectId);
            if (!projectExists) return BadRequest(new { Message = "المشروع المحدد غير موجود" });

            if (dto.AssigneeId.HasValue && !await _context.Users.AnyAsync(u => u.Id == dto.AssigneeId.Value))
                return BadRequest(new { Message = "المستخدم المحدد للتعيين غير موجود" });

            if (dto.ParentTaskId.HasValue && !await _context.Tasks.AnyAsync(t => t.Id == dto.ParentTaskId.Value))
                return BadRequest(new { Message = "المهمة الرئيسية المحددة غير موجودة" });

            var task = new ProjectTask
            {
                Title = dto.Title,
                Description = dto.Description,
                Priority = dto.Priority,
                EstimatedHours = dto.EstimatedHours,
                DueDate = dto.DueDate,
                ProjectId = dto.ProjectId,
                AssigneeId = dto.AssigneeId,
                ParentTaskId = dto.ParentTaskId,
                Status = ProjectTaskStatus.Todo
            };

            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();

            if (task.AssigneeId.HasValue)
                await _context.Entry(task).Reference(t => t.Assignee).LoadAsync();

            return CreatedAtAction(nameof(GetById), new { id = task.Id }, ToDto(task));
        }

        [HttpPatch("{id}/status")]
        [Authorize]
        public async Task<ActionResult> UpdateStatus(int id, [FromBody] ProjectTaskStatus newStatus)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null) return NotFound(new { Message = "المهمة غير موجودة" });

            task.Status = newStatus;
            await _context.SaveChangesAsync();

            return Ok(new { Message = "تم التحديث بنجاح", Status = newStatus.ToString() });
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<ActionResult> Update(int id, [FromBody] TaskCreateDto dto)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null) return NotFound(new { Message = "المهمة غير موجودة" });

            task.Title = dto.Title;
            task.Description = dto.Description;
            task.Priority = dto.Priority;
            task.EstimatedHours = dto.EstimatedHours;
            task.DueDate = dto.DueDate;
            task.AssigneeId = dto.AssigneeId;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<ActionResult> Delete(int id)
        {
            var task = await _context.Tasks.Include(t => t.Project).FirstOrDefaultAsync(t => t.Id == id);
            if (task == null) return NotFound(new { Message = "المهمة غير موجودة" });
            if (task.Project.OwnerId != CurrentUserId && !IsAdmin) return Forbid();

            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
