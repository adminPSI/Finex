using FinexAPI.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using FinexAPI.Middleware;
using FinexAPI.Helper;
using FinexAPI.Services;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using FinexAPI.Authorization;
using Microsoft.AspNetCore.Authorization;
using FinexAPI.Utility;
using Microsoft.AspNetCore.SignalR;

var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("newinfal");
var connStrFinexMDB = builder.Configuration.GetConnectionString("FinexMDB");
// Add services to the container.
builder.Services.AddExceptionHandler<FinexAppExceptionHandler>();
builder.Services.AddProblemDetails();

//var ErrorLogPath = builder.Configuration.GetConnectionString("ErrorLogPath");
builder.Services.AddLogging(builder =>
{
    builder.ClearProviders();
    builder.AddProvider(new CustomLoggerProvider(LogLevel.Error, "LogFiles/ErrorLogs.txt"));
});




builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;

}).AddJwtBearer(options =>
{
    options.SaveToken = true;
    options.RequireHttpsMetadata = false;
    options.TokenValidationParameters = new TokenValidationParameters()
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidAudience = builder.Configuration["JWT:ValidAudience"],
        ValidIssuer = builder.Configuration["JWT:ValidIssuer"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JWT:Secret"]))
    };
});

builder.Services.AddControllers().AddNewtonsoftJson(options =>
options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore);
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddScoped<ICurrentUserContext, CurrentUserContext>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddMemoryCache();
builder.Services.AddSwaggerGen(x =>
{
    x.SwaggerDoc("v1", new OpenApiInfo { Title = "Auth API", Version = "v1" });
    x.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Please Enter a Valid Token",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        BearerFormat = "JWT",
        Scheme = "Bearer"
    });
    x.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[]{}
        }
    });
    x.ResolveConflictingActions(a => a.First());
});

var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

//builder.Services.AddCors(p => p.AddPolicy("crosapp", builder =>
//{
//    builder.WithOrigins("*").AllowAnyMethod().AllowAnyHeader();
//}));

//builder.Services.AddCors(options =>
//{
//    options.AddPolicy(name: MyAllowSpecificOrigins,
//                      policy =>
//                      {
//                          policy.WithOrigins("http://localhost:51539/",
//                                              "http://localhost:44460/");
//                      });
//});
//builder.Services.AddCors(option =>
//                option.AddDefaultPolicy(policy =>
//                        policy
//                            .AllowAnyOrigin()
//                            .AllowAnyMethod()
//                            .AllowAnyHeader()
//                        ));

builder.Services.AddScoped<IEmail, Email>();
builder.Services.AddScoped<IWorkflowEmail, WorkflowEmail>();
builder.Services.AddDbContext<FinexAppContext>(options => options.UseSqlServer(connectionString));
builder.Services.AddDbContext<UserLoginContext>(options => options.UseSqlServer(connectionString));

builder.Services.AddDbContext<UserManagementContext>(options => options.UseSqlServer(connStrFinexMDB));

builder.Services.AddScoped<IAuthorizationHandler, UserPermissionHandler>();
builder.Services.AddScoped<IAppUser, AppUser>();
builder.Services.AddScoped<EmailNotification>();

builder.Services.AddHttpClient();

var app = builder.Build();

// Configure the HTTP request pipeline.
//if (app.Environment.IsDevelopment())
//{    app.UseSwagger();
//  app.UseSwaggerUI();
//}
app.UseSwagger();
app.UseSwaggerUI();

app.UseExceptionHandler();

app.UseHttpsRedirection();

app.UseCors(x => x
    .AllowAnyMethod()
    .AllowAnyHeader()
    .SetIsOriginAllowed(origin => true)
    .AllowCredentials());

app.UseAuthorization();

app.MapControllers();

app.UseMiddleware<TenantMiddleware>();
app.UseMiddleware<CustomAuthorizationMiddleware>();

app.Run();
