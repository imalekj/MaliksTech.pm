namespace MaliksTech.PM.Api.Models
{
    public class Comment
    {
        public int Id { get; set; }
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int TaskId { get; set; }
        public ProjectTask Task { get; set; } = null!;

        public int AuthorId { get; set; }
        public ApplicationUser Author { get; set; } = null!;
    }
}
