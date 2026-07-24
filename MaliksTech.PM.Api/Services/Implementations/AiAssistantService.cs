using System.Text;
using System.Text.Json;
using MaliksTech.PM.Api.DTOs.AI;
using MaliksTech.PM.Api.Services.Interfaces;

namespace MaliksTech.PM.Api.Services.Implementations
{
    public class AiAssistantService : IAiAssistantService
    {
        private readonly string _apiKey;
        private readonly string _modelId = "gemini-flash-latest"; // نعود للنموذج الأحدث والأسرع
        private readonly HttpClient _httpClient;

        public AiAssistantService(IConfiguration config)
        {
            // جلب المفتاح من ملف الإعدادات
            _apiKey = config["Gemini:ApiKey"] ?? throw new Exception("API Key is missing!");
            _httpClient = new HttpClient();
        }

        public async Task<List<AiGeneratedTaskDto>> BreakDownProjectAsync(string projectDescription)
        {
            string prompt = $@"
        أنت مدير مشاريع برمجية محترف (Scrum Master).
        قم بتقسيم المشروع التالي إلى مهام (Tasks).
        الوصف: {projectDescription}

        يجب أن يكون الرد عبارة عن مصفوفة JSON فقط تطابق هذا الهيكل:
        [
          {{
            ""Title"": ""اسم المهمة"",
            ""Description"": ""وصف"",
            ""EstimatedHours"": 10,
            ""Priority"": ""High"",
            ""AiInsights"": ""ملاحظة سريعة""
          }}
        ]
    ";

            var requestBody = new
            {
                contents = new[] { new { parts = new[] { new { text = prompt } } } }
            };

            string jsonBody = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(jsonBody, System.Text.Encoding.UTF8, "application/json");

            // نستخدم الرابط الذي جربناه
            string url = $"https://generativelanguage.googleapis.com/v1beta/models/{_modelId}:generateContent?key={_apiKey}";

            try
            {
                var response = await _httpClient.PostAsync(url, content);
                string responseText = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"\n!!! خطأ من جوجل: {responseText} !!!\n");

                    // --- السحر هنا: دعنا نسأل جوجل عن النماذج المتاحة ---
                    Console.WriteLine("جارٍ جلب النماذج المدعومة لمفتاحك...");
                    var modelsResponse = await _httpClient.GetAsync($"https://generativelanguage.googleapis.com/v1beta/models?key={_apiKey}");
                    string modelsText = await modelsResponse.Content.ReadAsStringAsync();
                    Console.WriteLine("\n=== النماذج المدعومة فعلياً هي ===");
                    Console.WriteLine(modelsText);
                    Console.WriteLine("=====================================\n");
                    // -----------------------------------------------------

                    return new List<AiGeneratedTaskDto>();
                }

                using var jsonDoc = JsonDocument.Parse(responseText);
                string aiText = jsonDoc.RootElement
                    .GetProperty("candidates")[0]
                    .GetProperty("content")
                    .GetProperty("parts")[0]
                    .GetProperty("text")
                    .GetString() ?? "";

                int startIndex = aiText.IndexOf('[');
                int endIndex = aiText.LastIndexOf(']');

                if (startIndex != -1 && endIndex != -1)
                {
                    string cleanJson = aiText.Substring(startIndex, endIndex - startIndex + 1);
                    var tasks = JsonSerializer.Deserialize<List<AiGeneratedTaskDto>>(cleanJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    return tasks ?? new List<AiGeneratedTaskDto>();
                }

                return new List<AiGeneratedTaskDto>();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"\n!!! خطأ برمجي: {ex.Message} !!!\n");
                return new List<AiGeneratedTaskDto>();
            }
        }
    }
}