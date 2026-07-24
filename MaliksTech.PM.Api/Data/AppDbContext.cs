using MaliksTech.PM.Api.Models;
using Microsoft.EntityFrameworkCore;
using System.Reflection.Emit;

namespace MaliksTech.PM.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

       
        public DbSet<ApplicationUser> Users { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<ProjectTask> Tasks { get; set; }
        public DbSet<Comment> Comments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 1. علاقة المهمة الرئيسية بالفرعية (تم منع الحذف العشوائي)
            modelBuilder.Entity<ProjectTask>()
                .HasOne(t => t.ParentTask)
                .WithMany(t => t.SubTasks)
                .HasForeignKey(t => t.ParentTaskId)
                .OnDelete(DeleteBehavior.Restrict);

            // 2. علاقة المستخدم بالمهمة (تم تغيير SetNull إلى Restrict)
            // الآن النظام سيمنع حذف مستخدم إذا كان مسؤولاً عن مهمة
            modelBuilder.Entity<ProjectTask>()
                .HasOne(t => t.Assignee)
                .WithMany(u => u.AssignedTasks)
                .HasForeignKey(t => t.AssigneeId)
                .OnDelete(DeleteBehavior.Restrict);

            // 3. علاقة المشروع بالمهام (نمنع حذف مشروع إذا كان يحتوي على مهام)
            modelBuilder.Entity<ProjectTask>()
                .HasOne(t => t.Project)
                .WithMany(p => p.Tasks)
                .HasForeignKey(t => t.ProjectId)
                .OnDelete(DeleteBehavior.Restrict);

            // 4. علاقة التعليق بالمهمة (حذف المهمة يحذف تعليقاتها)
            modelBuilder.Entity<Comment>()
                .HasOne(c => c.Task)
                .WithMany(t => t.Comments)
                .HasForeignKey(c => c.TaskId)
                .OnDelete(DeleteBehavior.Cascade);

            // 5. علاقة التعليق بالكاتب (نمنع حذف مستخدم كتب تعليقات)
            modelBuilder.Entity<Comment>()
                .HasOne(c => c.Author)
                .WithMany(u => u.Comments)
                .HasForeignKey(c => c.AuthorId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}