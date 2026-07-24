using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MaliksTech.PM.Api.Data;
using MaliksTech.PM.Api.DTOs.Common;
using MaliksTech.PM.Api.DTOs.Projects;
using MaliksTech.PM.Api.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace MaliksTech.PM.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProjectsController : ControllerBase
    {
        private readonly AppDbContext _context;
        public ProjectsController(AppDbContext context) => _context = context;

        private static ProjectResponseDto ToDto(Project p) => new ProjectResponseDto
        {
            Id = p.Id,
            Title = p.Title,
            Description = p.Description,
            StartDate = p.StartDate,
            TargetEndDate = p.TargetEndDate,
            RiskLevel = p.RiskLevel.ToString(),
            OwnerName = p.Owner.FullName
        };

        private int CurrentUserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        private bool IsAdmin => User.IsInRole(nameof(UserRole.Admin));

        [HttpGet]
        [Authorize]
        public async Task<ActionResult<PagedResultDto<ProjectResponseDto>>> GetAll(
            [FromQuery] string? search,
            [FromQuery] string? sortBy = "date",
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            page = Math.Max(page, 1);
            pageSize = Math.Clamp(pageSize, 1, 100);

            var query = _context.Projects.Include(p => p.Owner).AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(p => p.Title.Contains(search) || p.Description!.Contains(search));

            query = sortBy?.ToLower() == "title" ? query.OrderBy(p => p.Title) : query.OrderByDescending(p => p.StartDate);

            var totalCount = await query.CountAsync();
            var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

            return Ok(new PagedResultDto<ProjectResponseDto>
            {
                Items = items.Select(ToDto).ToList(),
                Page = page,
                PageSize = pageSize,
                TotalCount = totalCount
            });
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<ProjectResponseDto>> GetById(int id)
        {
            var project = await _context.Projects.Include(p => p.Owner).FirstOrDefaultAsync(p => p.Id == id);
            return project != null ? Ok(ToDto(project)) : NotFound();
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<ProjectResponseDto>> Create([FromBody] ProjectCreateDto dto)
        {
            var project = new Project
            {
                Title = dto.Title,
                Description = dto.Description,
                StartDate = dto.StartDate,
                TargetEndDate = dto.TargetEndDate,
                RiskLevel = ProjectRiskLevel.Safe,
                OwnerId = CurrentUserId
            };

            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            await _context.Entry(project).Reference(p => p.Owner).LoadAsync();

            return CreatedAtAction(nameof(GetById), new { id = project.Id }, ToDto(project));
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<ActionResult> Update(int id, [FromBody] ProjectCreateDto dto)
        {
            var p = await _context.Projects.FindAsync(id);
            if (p == null) return NotFound();
            if (p.OwnerId != CurrentUserId && !IsAdmin) return Forbid();

            p.Title = dto.Title;
            p.Description = dto.Description;
            p.TargetEndDate = dto.TargetEndDate;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<ActionResult> Delete(int id)
        {
            var p = await _context.Projects.FindAsync(id);
            if (p == null) return NotFound();
            if (p.OwnerId != CurrentUserId && !IsAdmin) return Forbid();

            _context.Projects.Remove(p);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
