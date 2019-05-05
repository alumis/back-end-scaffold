using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.NodeServices;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Alumis.App
{
    class SpaCrawlerMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly SpaCrawlerOptions _options;

        public SpaCrawlerMiddleware(RequestDelegate next, IOptions<SpaCrawlerOptions> options)
        {
            _next = next;
            _options = options.Value;
        }

        static string _indexHtml = File.ReadAllText("./wwwroot/index.html");

        public async Task Invoke(HttpContext context)
        {
            var request = context.Request;

            if (IsGetOrHeadMethod(request.Method))
            {
                var path = request.Path;

                if (_options.RequestPaths.Contains(path))
                {
                    var userAgent = request.Headers["User-Agent"];

                    foreach (var s in userAgent)
                    {
                        if (s.Contains("googlebot", StringComparison.InvariantCultureIgnoreCase))
                        {
                            var html = await GenerateHTMLFromUrlAsync(_indexHtml);
                            int z = 1;
                        }
                    }
                }
            }

            await _next(context);
        }

        static bool IsGetOrHeadMethod(string method)
        {
            return HttpMethods.IsGet(method) || HttpMethods.IsHead(method);
        }

        static Task<string> GenerateHTMLFromUrlAsync(string url)
        {
            return Program.Services.GetRequiredService<INodeServices>().InvokeExportAsync<string>("./Node/jsdom", "generateHTML", url);
        }
    }

    class SpaCrawlerOptions
    {
        public HashSet<string> RequestPaths;
    }

    static class SpaCrawlerMiddlewareExtension
    {
        public static IApplicationBuilder UseSpaCrawler(this IApplicationBuilder builder, params string[] requestPaths)
        {
            return builder.UseMiddleware<SpaCrawlerMiddleware>(Options.Create(new SpaCrawlerOptions() { RequestPaths = new HashSet<string>(requestPaths) }));
        }
    }


}