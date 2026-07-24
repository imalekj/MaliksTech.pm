using System.ComponentModel.DataAnnotations;

namespace MaliksTech.PM.Api.DTOs.Users
{
    public class RegisterDto
    {
        [Required(ErrorMessage = "الاسم الكامل مطلوب")]
        [MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "البريد الإلكتروني مطلوب")]
        [EmailAddress(ErrorMessage = "صيغة البريد الإلكتروني غير صحيحة")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "كلمة المرور مطلوبة")]
        [MinLength(6, ErrorMessage = "كلمة المرور يجب أن تكون 6 أحرف على الأقل")]
        public string Password { get; set; } = string.Empty;
    }
}
