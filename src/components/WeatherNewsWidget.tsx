import React, { useState, useEffect } from "react";
import { CloudSun, Newspaper, Search, RefreshCw, ExternalLink, ArrowUpRight } from "lucide-react";
import { getMockWeather, getMockNews } from "../utils/localBrain";

interface NewsItem {
  title: string;
  link: string;
  desc: string;
}

export default function WeatherNewsWidget() {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState<string | null>(null);
  const [newsCategory, setNewsCategory] = useState("general");
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [loadingNews, setLoadingNews] = useState(false);

  // Fetch weather
  const fetchWeather = async (targetCity: string = "") => {
    setLoadingWeather(true);
    try {
      const response = await fetch(`/api/jarvis/weather?city=${encodeURIComponent(targetCity)}`);
      const data = await response.json();
      if (data && data.weather) {
        setWeatherData(data.weather);
      } else {
        throw new Error("Empty weather response");
      }
    } catch (err) {
      console.warn("Using offline weather satellite backup telemetry...");
      const backup = getMockWeather(targetCity);
      setWeatherData(backup);
    } finally {
      setLoadingWeather(false);
    }
  };

  // Fetch news
  const fetchNews = async (category: string) => {
    setLoadingNews(true);
    try {
      const response = await fetch(`/api/jarvis/news?category=${category}`);
      const data = await response.json();
      if (data && data.news && data.news.length > 0) {
        setNewsItems(data.news);
      } else {
        throw new Error("Empty news response");
      }
    } catch (err) {
      console.warn("Decrypting secure offline Stark Industries news bulletin backups...");
      const backup = getMockNews(category);
      setNewsItems(backup);
    } finally {
      setLoadingNews(false);
    }
  };

  useEffect(() => {
    fetchWeather(""); // Auto locate
    fetchNews("general");
  }, []);

  const handleWeatherSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) return;
    fetchWeather(city);
  };

  const handleCategoryChange = (category: string) => {
    setNewsCategory(category);
    fetchNews(category);
  };

  return (
    <div id="jarvis-weather-news-panel" className="flex flex-col h-full bg-slate-950/80 border border-slate-800 rounded-lg overflow-hidden backdrop-blur-md shadow-2xl p-4 space-y-4">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-2">
        <div className="flex items-center space-x-2">
          <CloudSun className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
            Weather & Global Headlines
          </span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              fetchWeather(city);
              fetchNews(newsCategory);
            }}
            title="Refresh satellite telemetry"
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Weather Subpanel */}
        <div className="space-y-3 bg-slate-900/30 border border-slate-905 p-3 rounded-lg flex flex-col justify-between">
          <div className="space-y-2">
            <h4 className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mr-2 animate-ping" />
              SATELLITE WEATHER SCAN
            </h4>

            {loadingWeather ? (
              <div className="flex items-center space-x-2 text-xs font-mono text-slate-500 py-6">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-500" />
                <span>Pinging weather sensors...</span>
              </div>
            ) : (
              <div className="bg-black/40 border border-slate-950 p-3 rounded text-xs font-mono text-emerald-400 min-h-[70px] flex items-center">
                {weatherData || "Scan initiated. Waiting for telemetry..."}
              </div>
            )}
          </div>

          <form onSubmit={handleWeatherSearch} className="relative flex items-center mt-2">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3" />
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Search city weather..."
              className="w-full bg-slate-950 border border-slate-850 pl-9 pr-12 py-1.5 text-[11px] rounded text-slate-300 focus:outline-none focus:border-cyan-500/40 placeholder-slate-500 font-mono"
            />
            <button
              type="submit"
              className="absolute right-1 text-[9px] font-mono bg-cyan-950 hover:bg-cyan-900 text-cyan-400 px-2 py-1 rounded transition-all"
            >
              SCAN
            </button>
          </form>
        </div>

        {/* News RSS Subpanel */}
        <div className="space-y-3 bg-slate-900/30 border border-slate-905 p-3 rounded-lg flex flex-col">
          <h4 className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center">
              <Newspaper className="w-3.5 h-3.5 mr-2 text-cyan-400" />
              GLOBAL NEWS FEEDS
            </span>
            <span className="text-[9px] text-slate-500 lowercase">via bbc feed</span>
          </h4>

          {/* Categories select pills */}
          <div className="flex gap-1 overflow-x-auto scrollbar-none py-1 border-b border-slate-900">
            {["general", "tech", "business", "sports"].map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded transition-all ${
                  newsCategory === cat
                    ? "bg-cyan-950/60 border border-cyan-800/40 text-cyan-400"
                    : "bg-transparent text-slate-500 hover:text-slate-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* News headlines render list */}
          <div className="flex-1 overflow-y-auto max-h-[140px] space-y-2 pr-1">
            {loadingNews ? (
              <div className="flex items-center space-x-2 text-xs font-mono text-slate-500 py-6 justify-center">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-500" />
                <span>Decrypting feed transmission...</span>
              </div>
            ) : newsItems.length === 0 ? (
              <p className="text-center text-[10px] font-mono text-slate-500 italic py-4">
                No active news entries found.
              </p>
            ) : (
              newsItems.map((item, idx) => (
                <a
                  key={idx}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-1.5 rounded hover:bg-slate-900/50 border border-transparent hover:border-slate-800 transition-all group"
                >
                  <h5 className="text-[11px] font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors line-clamp-1 flex items-center justify-between">
                    <span className="truncate">{item.title}</span>
                    <ArrowUpRight className="w-3 h-3 text-slate-600 group-hover:text-cyan-400 shrink-0 ml-1 opacity-0 group-hover:opacity-100 transition-all" />
                  </h5>
                  <p className="text-[9px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                    {item.desc}
                  </p>
                </a>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
