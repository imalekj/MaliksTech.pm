using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MaliksTech.PM.Api.Data;
using MaliksTech.PM.Api.DTOs.Comments;
using MaliksTech.PM.Api.Models;
using System.Security.Claims;

namespace MaliksTech.PM.Api.Controllers
{
    [ApiController]
    [Authorize]
    public class CommentsController : ControllerBase
    {
        private readonly AppDbContext _context;
        public CommentsController(AppDbContext context) => _context = context;

        private static CommentResponseDto ToDto(Comment c) => new CommentResponseDto
        {
            Id = c.Id,
            Content = c.Content,
            CreatedAt = c.CreatedAt,
            AuthorId = c.AuthorId,
            AuthorName = c.Author.FullName
        };

        private int CurrentUserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        private bool IsAdmin => User.IsInRole(nameof(UserRole.Admin));

        [HttpGet("api/tasks/{taskId}/comments")]
        public async Task<ActionResult<List<CommentResponseDto>>> GetForTask(int taskId)
        {
            var taskExists = await _context.Tasks.AnyAsync(t => t.Id == taskId);
            if (!taskExists) return NotFound(new { Message = "المهمة غير موجودة" });

            var comments = await _context.Comments
                .Include(c => c.Author)
                .Where(c => c.TaskId == taskId)
                .OrderBy(c => c.CreatedAt)
                .ToListAsync();

            return Ok(comments.Select(ToDto).ToList());
        }

        [HttpPost("api/tasks/{taskId}/comments")]
        public async Task<ActionResult<CommentResponseDto>> Create(int taskId, [FromBody] CommentCreateDto dto)
        {
            var taskExists = await _context.Tasks.AnyAsync(t => t.Id == taskId);
            if (!taskExists) return NotFound(new { Message = "المهمة غير موجودة" });

            var comment = new Comment
            {
                Content = dto.Content,
                TaskId = taskId,
                AuthorId = CurrentUserId
            };

            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();

            await _context.Entry(comment).Reference(c => c.Author).LoadAsync();

            return Ok(ToDto(comment));
        }

        [HttpDelete("api/comments/{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var comment = await _context.Comments.FindAsync(id);
            if (comment == null) return NotFound(new { Message = "التعليق غير موجود" });
            if (comment.AuthorId != CurrentUserId && !IsAdmin) return Forbid();

            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
