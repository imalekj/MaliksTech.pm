namespace MaliksTech.PM.Api.DTOs.Comments
{
    public class CommentResponseDto
    {
        public int Id { get; set; }
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int AuthorId { get; set; }
        public string AuthorName { get; set; } = string.Empty;
    }
}
