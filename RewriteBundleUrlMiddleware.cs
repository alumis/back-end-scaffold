using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Primitives;

namespace Alumis.App
{
    class RewriteBundleUrlMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger _logger;

        public RewriteBundleUrlMiddleware(RequestDelegate next, ILoggerFactory loggerFactory)
        {
            _next = next;
            _logger = loggerFactory.CreateLogger<RewriteBundleUrlMiddleware>();
        }

        public Task Invoke(HttpContext context)
        {
            var request = context.Request;

            if (IsGetOrHeadMethod(request.Method))
            {
                var path = request.Path;

                if (path == "/")
                {
                    var userAgent = request.Headers["User-Agent"];

                    if (TryGetBrowser(userAgent, out Browser browser) && BrowserRequestPaths.TryGetValue(browser.Type, out List<BrowserVersionRequestPaths> versions))
                    {
                        for (int i = 0, count = versions.Count; i < count; ++i)
                        {
                            var versionRequestPath = versions[i];

                            if (versionRequestPath.Version <= browser.Version)
                            {
                                if (versionRequestPath.RequestPaths.TryGetValue("/index.html", out string newPath))
                                    request.Path = new PathString(newPath);

                                return _next(context);
                            }
                        }
                    }

                    request.Path = new PathString("/index.html");
                }

                else if (path.HasValue && (path.Value.EndsWith(".html") || path.Value.EndsWith(".js") || path.Value.EndsWith(".css")))
                {
                    var userAgent = request.Headers["User-Agent"];

                    if (TryGetBrowser(userAgent, out Browser browser) && BrowserRequestPaths.TryGetValue(browser.Type, out List<BrowserVersionRequestPaths> versions))
                    {
                        for (int i = 0, count = versions.Count; i < count; ++i)
                        {
                            var versionRequestPath = versions[i];

                            if (versionRequestPath.Version <= browser.Version)
                            {
                                if (versionRequestPath.RequestPaths.TryGetValue(path, out string newPath))
                                    request.Path = new PathString(newPath);

                                break;
                            }
                        }
                    }
                }
            }

            return _next(context);
        }

        static bool IsGetOrHeadMethod(string method)
        {
            return HttpMethods.IsGet(method) || HttpMethods.IsHead(method);
        }

        struct Browser
        {
            public Browser(BrowserType type, BrowserVersion version)
            {
                Type = type;
                Version = version;
            }

            public BrowserType Type;
            public BrowserVersion Version;

            public override string ToString()
            {
                return $"{Type} {Version}";
            }
        }

        enum BrowserType
        {
            Edge,
            Firefox,
            Chrome,
            Safari,
            Opera,
            iOS,
        }

        struct BrowserVersion : IComparable<BrowserVersion>
        {
            public int Major;
            public int Minor;
            public int Build;

            public int CompareTo(BrowserVersion other)
            {
                var i = Major - other.Major;

                if (i != 0)
                    return i;

                i = Minor - other.Minor;

                if (i != 0)
                    return i;

                return Build - other.Build;
            }

            public static bool operator <(BrowserVersion a, BrowserVersion b)
            {
                var i = a.Major - b.Major;

                if (i != 0)
                    return a.Major < b.Major;

                i = a.Minor - b.Minor;

                if (i != 0)
                    return a.Minor < b.Minor;

                return a.Build < b.Build;
            }

            public static bool operator <=(BrowserVersion a, BrowserVersion b)
            {
                var i = a.Major - b.Major;

                if (i != 0)
                    return a.Major < b.Major;

                i = a.Minor - b.Minor;

                if (i != 0)
                    return a.Minor < b.Minor;

                return a.Build <= b.Build;
            }

            public static bool operator >(BrowserVersion a, BrowserVersion b)
            {
                var i = a.Major - b.Major;

                if (i != 0)
                    return a.Major > b.Major;

                i = a.Minor - b.Minor;

                if (i != 0)
                    return a.Minor > b.Minor;

                return a.Build > b.Build;
            }

            public static bool operator >=(BrowserVersion a, BrowserVersion b)
            {
                var i = a.Major - b.Major;

                if (i != 0)
                    return a.Major > b.Major;

                i = a.Minor - b.Minor;

                if (i != 0)
                    return a.Minor > b.Minor;

                return a.Build >= b.Build;
            }

            public override string ToString()
            {
                return $"{Major}.{Minor}.{Build}";
            }
        }

        static bool TryGetBrowser(StringValues stringValues, out Browser browser)
        {
            for (int i = 0, count = stringValues.Count; i < count; ++i)
            {
                var str = stringValues[i];

                int j;
                BrowserVersion version;

                if ((j = str.IndexOf("Firefox/")) != -1 && TryGetBrowserVersion(str, j + "Firefox/".Length, out version))
                {
                    browser = new Browser(BrowserType.Firefox, version);
                    return true;
                }

                if ((j = str.IndexOf("Edge/")) != -1 && TryGetBrowserVersion(str, j + "Edge/".Length, out version))
                {
                    browser = new Browser(BrowserType.Edge, version);
                    return true;
                }

                if ((j = str.IndexOf("Opera/")) != -1 && TryGetBrowserVersion(str, j + "Opera/".Length, out version))
                {
                    browser = new Browser(BrowserType.Opera, version);
                    return true;
                }

                if ((j = str.IndexOf("Chrome/")) != -1 && TryGetBrowserVersion(str, j + "Chrome/".Length, out version))
                {
                    browser = new Browser(BrowserType.Chrome, version);
                    return true;
                }

                // TODO: Check for Safari and iOS. Need to map WebKit version to Safari/iOS version. See https://en.wikipedia.org/wiki/Safari_version_history.
            }

            browser = default(Browser);
            return false;
        }

        static bool TryGetBrowserVersion(string str, int startIndex, out BrowserVersion version)
        {
            version = new BrowserVersion();

            for (var b = false; ;)
            {
                if (startIndex < str.Length)
                {
                    var c = str[startIndex];

                    if ('0' <= c && c <= '9')
                    {
                        version.Major *= 10;
                        version.Major += c - '0';

                        ++startIndex;

                        b = true;

                        continue;
                    }

                    if (c == '.')
                    {
                        for (++startIndex; ;)
                        {
                            if (startIndex < str.Length)
                            {
                                c = str[startIndex];

                                if ('0' <= c && c <= '9')
                                {
                                    version.Minor *= 10;
                                    version.Minor += c - '0';

                                    ++startIndex;

                                    b = true;

                                    continue;
                                }

                                if (c == '.')
                                {
                                    for (++startIndex; ;)
                                    {
                                        if (startIndex < str.Length)
                                        {
                                            c = str[startIndex];

                                            if ('0' <= c && c <= '9')
                                            {
                                                version.Build *= 10;
                                                version.Build += c - '0';

                                                ++startIndex;

                                                b = true;

                                                continue;
                                            }
                                        }

                                        return true;
                                    }
                                }
                            }

                            return true;
                        }
                    }
                }

                return b;
            }
        }

        struct BrowserVersionRequestPaths
        {
            public BrowserVersion Version;
            public Dictionary<string, string> RequestPaths;

            public override string ToString()
            {
                return Version.ToString();
            }
        }

        static Dictionary<BrowserType, List<BrowserVersionRequestPaths>> BrowserRequestPaths = new Dictionary<BrowserType, List<BrowserVersionRequestPaths>>();

        public static void Initialize()
        {
            foreach (var d in Directory.GetDirectories("./wwwroot"))
            {
                BrowserType browser;

                var directoryName = Path.GetFileName(d);

                switch (directoryName)
                {
                    case "chrome":
                        browser = BrowserType.Chrome;
                        break;
                    case "edge":
                        browser = BrowserType.Edge;
                        break;
                    case "firefox":
                        browser = BrowserType.Firefox;
                        break;
                    case "ios":
                        browser = BrowserType.iOS;
                        break;
                    case "opera":
                        browser = BrowserType.Opera;
                        break;
                    case "safari":
                        browser = BrowserType.Safari;
                        break;

                    default:
                        throw new NotSupportedException();
                }

                var requestPaths = new List<BrowserVersionRequestPaths>();

                foreach (var d2 in Directory.GetDirectories(d))
                {
                    if (TryGetBrowserVersion(Path.GetFileName(d2), 0, out BrowserVersion version))
                    {
                        var versionRequestPaths = new BrowserVersionRequestPaths() { Version = version, RequestPaths = new Dictionary<string, string>() };

                        foreach (var f in Directory.GetFiles(d2))
                            versionRequestPaths.RequestPaths[f.Substring(d2.Length)] = f.Substring("./wwwroot".Length);

                        requestPaths.Add(versionRequestPaths);
                    }

                    else throw new NotSupportedException();
                }

                BrowserRequestPaths[browser] = requestPaths.OrderByDescending(p => p.Version).ToList();
            }
        }
    }

    static class RewriteBundleUrlMiddlewareExtension
    {
        public static IApplicationBuilder UseRewriteBundleUrl(this IApplicationBuilder builder)
        {
            RewriteBundleUrlMiddleware.Initialize();

            return builder.UseMiddleware<RewriteBundleUrlMiddleware>();
        }
    }
}