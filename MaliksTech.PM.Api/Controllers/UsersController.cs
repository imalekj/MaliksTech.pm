using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MaliksTech.PM.Api.Data;
using MaliksTech.PM.Api.DTOs.Users;
using MaliksTech.PM.Api.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;
    public UsersController(AppDbContext context) => _context = context;

    private static UserResponseDto ToDto(ApplicationUser u) => new UserResponseDto
    {
        Id = u.Id,
        FullName = u.FullName,
        Email = u.Email,
        Role = u.Role.ToString()
    };

    private int CurrentUserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    private bool IsAdmin => User.IsInRole(nameof(UserRole.Admin));

    // متاحة لأي مستخدم مسجّل دخوله (تُستخدم لقوائم تعيين المهام)، ولا تكشف كلمة المرور مطلقًا
    [HttpGet]
    public async Task<ActionResult<List<UserResponseDto>>> GetAll() =>
        Ok((await _context.Users.ToListAsync()).Select(ToDto).ToList());

    [HttpGet("{id}")]
    public async Task<ActionResult<UserResponseDto>> GetById(int id)
    {
        var user = await _context.Users.FindAsync(id);
        return user != null ? Ok(ToDto(user)) : NotFound();
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(int id, [FromBody] RegisterDto dto)
    {
        if (id != CurrentUserId && !IsAdmin) return Forbid();

        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound();

        user.FullName = dto.FullName;
        user.Email = dto.Email;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<ActionResult> Delete(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound();
        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
