using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MaliksTech.PM.Api.Data;
using MaliksTech.PM.Api.DTOs.Users;
using MaliksTech.PM.Api.Models;
using MaliksTech.PM.Api.Services;

namespace MaliksTech.PM.Api.Controllers
{
	// DTO لتسجيل الدخول
	public class LoginDto
	{
		public string Email { get; set; } = string.Empty;
		public string Password { get; set; } = string.Empty;
	}

	[Route("api/[controller]")]
	[ApiController]
	public class AuthController : ControllerBase
	{
		private readonly AppDbContext _context;
		private readonly TokenService _tokenService;

		public AuthController(AppDbContext context, TokenService tokenService)
		{
			_context = context;
			_tokenService = tokenService;
		}

		[HttpPost("register")]
		public async Task<ActionResult> Register([FromBody] RegisterDto registerDto)
		{
			var emailExists = await _context.Users.AnyAsync(u => u.Email == registerDto.Email);
			if (emailExists)
				return Conflict("يوجد حساب مسجّل بهذا البريد الإلكتروني بالفعل.");

			var user = new ApplicationUser
			{
				FullName = registerDto.FullName,
				Email = registerDto.Email,
				Password = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
				Role = UserRole.Member
			};

			_context.Users.Add(user);
			await _context.SaveChangesAsync();

			var token = _tokenService.CreateToken(user);

			return Ok(new
			{
				Message = "تم إنشاء الحساب بنجاح",
				Token = token,
				User = new UserResponseDto
				{
					Id = user.Id,
					FullName = user.FullName,
					Email = user.Email,
					Role = user.Role.ToString()
				}
			});
		}

		[HttpPost("login")]
		public async Task<ActionResult> Login([FromBody] LoginDto loginDto)
		{
			// 1. البحث عن المستخدم
			var user = await _context.Users
				.FirstOrDefaultAsync(u => u.Email == loginDto.Email);

			if (user == null)
				return Unauthorized("البريد الإلكتروني أو كلمة المرور غير صحيحة.");

			// 2. التحقق من كلمة المرور المشفرة
			bool isPasswordValid = BCrypt.Net.BCrypt.Verify(loginDto.Password, user.Password);

			if (!isPasswordValid)
				return Unauthorized("البريد الإلكتروني أو كلمة المرور غير صحيحة.");

			// 3. توليد التوكن
			var token = _tokenService.CreateToken(user);

			return Ok(new
			{
				Message = "تم تسجيل الدخول بنجاح",
				Token = token,
				User = new UserResponseDto
				{
					Id = user.Id,
					FullName = user.FullName,
					Email = user.Email,
					Role = user.Role.ToString()
				}
			});
		}
	}
}
