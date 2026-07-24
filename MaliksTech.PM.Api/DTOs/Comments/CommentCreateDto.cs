using System.ComponentModel.DataAnnotations;

namespace MaliksTech.PM.Api.DTOs.Comments
{
    public class CommentCreateDto
    {
        [Required(ErrorMessage = "محتوى التعليق مطلوب")]
        [MaxLength(2000)]
        public string Content { get; set; } = string.Empty;
    }
}
