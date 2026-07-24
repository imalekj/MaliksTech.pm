using FluentValidation;
using MaliksTech.PM.Api.DTOs.Projects;

public class ProjectValidator : AbstractValidator<ProjectCreateDto>
{
	public ProjectValidator()
	{
		RuleFor(p => p.Title).NotEmpty().MaximumLength(100);
		RuleFor(p => p.Description).NotEmpty().MinimumLength(10);
		RuleFor(p => p.TargetEndDate).GreaterThan(DateTime.UtcNow).WithMessage("تاريخ الانتهاء يجب أن يكون في المستقبل");
	}
}