using Microsoft.EntityFrameworkCore;
using ProjectManagement.Application.DTOs.Auth;
using ProjectManagement.Application.Interfaces;
using ProjectManagement.Application.Services;
using ProjectManagement.Application.Validators;
using ProjectManagement.Domain.Interfaces;
using ProjectManagement.Infrastructure.Persistence;
using ProjectManagement.Infrastructure.Repositories;
using FluentValidation;
using FluentValidation.AspNetCore;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddControllers();
builder.Services.AddSession();   
builder.Services.AddHttpContextAccessor(); 
builder.Services.AddDistributedMemoryCache();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpContextAccessor();
builder.Services.AddDistributedMemoryCache();

builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()
            .WithOrigins(
                "http://localhost:3000",
                "http://172.27.57.78",          // add this
                "http://172.27.57.78:3000",     // add if needed
                "http://172.27.57.78:52000"     // add api origin
            );
    });
});

builder.Services.AddDbContext<AppDbContext>(options =>
   options.UseMySql(
       builder.Configuration.GetConnectionString("DefaultConnection"),
       ServerVersion.AutoDetect(builder.Configuration.GetConnectionString("DefaultConnection"))
            )
   );

builder.Services.AddScoped<IValidator<RegisterRequestDto>, RegisterRequestValidator>();
builder.Services.AddScoped<IValidator<LoginRequestDto>, LoginRequestValidator>();
builder.Services.AddScoped<IUsersLoginRepository, UserLoginRepository>();
builder.Services.AddScoped<IUsersLoginService, UserLoginService>();
builder.Services.AddScoped<IUserDetailsRepository, UserDetailsRepository>();
builder.Services.AddScoped<IUserDetailsService, UserDetailsService>();
builder.Services.AddScoped<ILeavePlanService, LeavePlanService>();
builder.Services.AddScoped<ILeavePlanRepository, LeavePlanRepository>();
builder.Services.AddScoped<IAssetRepository, AssetRepository>();
builder.Services.AddScoped<IAssetService, AssetService>();
builder.Services.AddScoped<ISprintVelocityRepository, SprintVelocityRepository>();
builder.Services.AddScoped<ISprintVelocityService, SprintVelocityService>();
builder.Services.AddScoped<ISprintTaskRepository, SprintTaskRepository>();
builder.Services.AddScoped<ISprintTaskService, SprintTaskService>();
builder.Services.AddScoped<IIssueDocumentRepository, IssueDocumentRepository>();
builder.Services.AddScoped<IIssueDocumentService, IssueDocumentService>();
builder.Services.AddScoped<IDocumentRepository, DocumentRepository>();
builder.Services.AddScoped<IDocumentService, DocumentService>();
builder.Services.AddScoped<ILessonLearnedRepository, LessonLearnedRepository>();
builder.Services.AddScoped<ILessonLearnedService,LessonLearnedService>();
builder.Services.AddScoped<IISTicketRepository, ISTicketRepository>();
builder.Services.AddScoped<IISTicketService, ISTicketService>();
builder.Services.AddScoped<ISprintResponsibilityRepository, SprintResponsibilityRepository>();
builder.Services.AddScoped<ISprintResponsibilityService, SprintResponsibilityService>();
builder.Services.AddScoped<ISprintMomRepository, SprintMomRepository>();
builder.Services.AddScoped<ISprintMomService, SprintMomService>();


var app = builder.Build();

if (app.Environment.IsDevelopment() || true)
{
    app.UseSwagger();
    app.UseSwaggerUI();
}


//app.UseHttpsRedirection();

app.UseCors("AllowReact");

app.UseSession();

app.UseAuthorization();

app.MapControllers();

app.Run();
