using FluentValidation;
using MaliksTech.PM.Api.DTOs.Tasks;

public class ProjectTaskValidator : AbstractValidator<TaskCreateDto>
{
    public ProjectTaskValidator()
    {
        RuleFor(t => t.Title).NotEmpty();
        RuleFor(t => t.EstimatedHours).InclusiveBetween(1, 100).WithMessage("عدد الساعات يجب أن يكون بين 1 و 100");
    }
}