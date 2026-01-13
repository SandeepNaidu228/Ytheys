'use client';

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from 'use-debounce';
import Select from "@/components/Select";
import { ChevronsLeft, ChevronsRight, TrendingUp, Star } from 'lucide-react';
import YC from "@/lib/YC.json";

// --- TYPES ---

interface YCData {
  logo: string;
  company: string;
  repo: string;
  rating_count: number;
  projects_count: number;
  website: string;
}

interface Agency {
  agency_name: string;
  domain: string;
  services?: string[];
  rating_count: number;
  projects_count: number;
  imgUrl?: string;
  popularity?: "legendary" | "famous" | "popular" | "rising";
  githubUrl?: string;
  owner?: { avatar_url: string };
  html_url: string;
  trendingScore?: number;
  description?: string;
  repoLink?: string;
  websiteUrl?: string;
}

type ColumnKey = keyof Pick<
  Agency,
  "agency_name" | "domain" | "services" | "rating_count" | "projects_count" | "popularity"
>;

// --- CONSTANTS ---

const DOMAINS = [
  'Web Development',
  'AI/Machine Learning',
  'Data & Analytics',
  'DevOps & Cloud',
  'Mobile App Development',
  'Marketing & SEO',
  'UI/UX Design',
];

const DOMAIN_SERVICES_MAP: { [key: string]: string[] } = {
  'Web Development': ['Frontend Engineering', 'E-commerce Solutions', 'CMS Integration', 'API Development'],
  'AI/Machine Learning': ['LLM Integration', 'Predictive Modeling', 'Computer Vision', 'Data Science'],
  'Data & Analytics': ['BI Dashboarding', 'Data Warehousing', 'ETL Pipelines', 'PostgreSQL Optimization'],
  'DevOps & Cloud': ['Cloud Migration (AWS/Azure)', 'Kubernetes Management', 'CI/CD Automation', 'Infrastructure as Code'],
  'Mobile App Development': ['iOS/Android Native', 'Cross-Platform Dev', 'App Store Optimization', 'QA & Testing'],
  'Marketing & SEO': ['SEO Optimization', 'Content Strategy', 'Performance Marketing', 'Conversion Rate Optimization'],
  'UI/UX Design': ['Figma Prototyping', 'User Research', 'Design System Dev', 'Interaction Design'],
  'Other': ['General Consulting', 'Security Audits', 'Compliance'],
};

// --- LOGIC ---

const mapLanguageToDomain = (language: string | null): string => {
  if (!language) return 'Unknown';
  const lang = language.toLowerCase();
  if (['typescript', 'javascript', 'html', 'css', 'php', 'ruby'].includes(lang)) return 'Web Development';
  if (['python', 'r'].includes(lang)) return 'AI/Machine Learning';
  if (['java', 'scala', 'c++', 'go', 'c#'].includes(lang)) return 'DevOps & Cloud';
  return 'Data & Analytics';
}

const getRandomServices = (domain: string): string[] => {
  const services = DOMAIN_SERVICES_MAP[domain] || DOMAIN_SERVICES_MAP.Other;
  return services.slice(0, 3);
}

const getPopularity = (ratings: number): "legendary" | "famous" | "popular" | "rising" => {
  if (ratings >= 4.8) return 'legendary';
  if (ratings >= 4.5) return 'famous';
  if (ratings >= 4.0) return 'popular';
  return 'rising';
};

const calculateTrendingScore = (agency: Agency): number => {
  const { rating_count, projects_count } = agency;
  const normalizedRatings = rating_count / 5;
  const normalizedProjects = Math.log10(projects_count + 1) / 5;
  const projectWeight = normalizedProjects * 0.6;
  const ratingWeight = normalizedRatings * 0.3;
  const momentumBonus = agency.popularity === 'rising' ? 0.1 : 0;
  return projectWeight + ratingWeight + momentumBonus;
};

const formatNumber = (n: number) =>
  n >= 1e6 ? `${+(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${+(n / 1e3).toFixed(1)}k` : n.toString();

const DOMAIN_COLORS = {
  'Web Development': 'bg-blue-500/10 text-blue-400 border-blue-400/20',
  'AI/Machine Learning': 'bg-emerald-500/10 text-emerald-400 border-emerald-400/20',
  'Data & Analytics': 'bg-cyan-500/10 text-cyan-400 border-cyan-400/20',
  'DevOps & Cloud': 'bg-red-500/10 text-red-400 border-red-400/20',
  'Mobile App Development': 'bg-purple-500/10 text-purple-400 border-purple-400/20',
  'Marketing & SEO': 'bg-yellow-500/10 text-yellow-400 border-yellow-400/20',
  'UI/UX Design': 'bg-pink-500/10 text-pink-400 border-pink-400/20',
  default: 'bg-neutral-500/10 text-neutral-400 border-neutral-400/20',
};

const columns: { key: ColumnKey; label: string }[] = [
  { key: "agency_name", label: "Agency" },
  { key: "domain", label: "Domain" },
  { key: "services", label: "Services" },
  { key: "rating_count", label: "Ratings" },
  { key: "projects_count", label: "Projects" },
  { key: "popularity", label: "Popularity" },
];

const renderCell = (
  record: Agency,
  key: ColumnKey,
  idx: number,
  repoLink?: string
) => {
  const value = record[key];

  switch (key) {
    case "agency_name":
      const destination = record.websiteUrl || `https://github.com/${repoLink}`;
      return (
        <div className="relative inline-block">
          <Link
            href={destination}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 group hover:text-yellow-300 transition"
          >
            {record.imgUrl && (
              <Image
                src={record.imgUrl}
                alt={`avatar`}
                width={24}
                height={24}
                className="rounded-full group-hover:opacity-80 transition"
                unoptimized
              />
            )}
            <span className="font-medium group">
              {value}
            </span>
            {idx < 5 && (
              <TrendingUp className="w-4 h-4 text-orange-400 animate-pulse" />
            )}
            <div className="absolute left-3/4 top-4 cursor-pointer mt-2 w-64 p-3 rounded-lg bg-gradient-to-br from-neutral-900/95 to-neutral-950/95 backdrop-blur-xl text-neutral-200 text-sm shadow-xl border border-neutral-700/40 opacity-0 scale-95 translate-y-1 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 transition-all duration-300 ease-out z-20 before:content-[''] before:absolute before:top-0 before:left-6 before:w-0 before:h-0 before:border-l-6 before:border-r-6 before:border-b-6 before:border-l-transparent before:border-r-transparent before:border-b-neutral-900/95 before:-translate-y-1.5">
              <div className="relative">
                <div className="absolute inset-0 rounded-md blur-md bg-gradient-to-r from-emerald-400/15 via-sky-400/10 to-purple-500/15 animate-pulse"></div>
                <div className="relative z-10 font-medium leading-relaxed tracking-wide">
                  {record.services?.length ? record.services.slice(0, 4).join(", ") : <span className="text-neutral-500 italic">No services description available</span>}
                </div>
                <div className="mt-2 h-px bg-gradient-to-r from-transparent via-neutral-700/70 to-transparent"></div>
              </div>
            </div>
          </Link>
        </div>
      );

    case "domain":
      if (!value) return <span className="text-neutral-400">-</span>;
      const colorClass = DOMAIN_COLORS[value as keyof typeof DOMAIN_COLORS] || DOMAIN_COLORS.default;
      return (
        <span className={`capitalize whitespace-nowrap font-semibold text-xs px-2.5 py-1 rounded-md border transition-all duration-200 w-fit hover:scale-105 hover:shadow-sm ${colorClass}`}>
          {value}
        </span>
      );

    case "popularity":
      return (
        <span
          className={`capitalize font-semibold w-fit text-xs px-2 py-1 rounded-md ${value === "legendary"
            ? "bg-yellow-500/10 text-yellow-400 border border-yellow-400/20"
            : value === "famous"
              ? "bg-purple-500/10 text-purple-400 border border-purple-400/20"
              : value === "popular"
                ? "bg-sky-500/10 text-sky-400 border border-sky-400/20"
                : "bg-green-500/10 text-green-400 border border-green-400/20"
            }`}
        >
          {value ?? "-"}
        </span>
      );

    case "services":
      if (Array.isArray(value) && value.length > 0) {
        return (
          <div className="flex flex-wrap gap-1">
            {value.slice(0, 3).map((tag, i) => (
              <span key={`${tag}-${i}`} className="bg-neutral-800/50 text-xs text-neutral-300 px-2 py-1 rounded-sm border border-neutral-700/30 font-medium hover:bg-neutral-700/50 transition-colors">
                {tag}
              </span>
            ))}
          </div>
        );
      }
      return <span className="bg-neutral-800/50 text-xs w-fit text-neutral-300 px-2 py-1 rounded-sm border border-neutral-700/30 font-medium">{record.domain || "-"}</span>;

    case "rating_count":
      return (
        <div className="flex items-center gap-1 text-yellow-400">
          <Star size={14} fill="currentColor" />
          <span className="font-mono font-bold tracking-wider text-sm">
            {typeof value === "number" ? value.toFixed(1) : "0.0"}
          </span>
        </div>
      );

    case "projects_count":
      return (
        <span className="font-mono font-medium tabular-nums tracking-wider text-sm text-neutral-300">
          {typeof value === "number" ? formatNumber(value) : "0"}
        </span>
      );

    default:
      return <span className="text-neutral-400 text-sm">{value ?? "-"}</span>;
  }
};

export default function TrendingAgencies() {
  const [results, setResults] = useState<Agency[]>([]);
  const [filtered, setFiltered] = useState<Agency[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [domain, setDomain] = useState('');
  const [popularity, setPopularity] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchAgencyData = async () => {
      setIsLoading(true);
      // 🟢 Fix: Use proper interface instead of any
      const agencyData = YC as unknown as YCData[];

      try {
        const fetched = await Promise.all(
          agencyData.map(async (agency) => {
            const res = await fetch(`/api/githubOverview?repo=${agency.repo}`);
            const raw = res.ok ? await res.json() : {};

            const industryDomain = mapLanguageToDomain(raw.language);
            const assignedServices = getRandomServices(industryDomain);

            const finalRating = agency.rating_count ?? 4.0;
            const finalProjects = agency.projects_count ?? (raw.forks_count || 0);

            const agencyItem: Agency = {
              agency_name: agency.company,
              domain: industryDomain,
              services: assignedServices,
              rating_count: finalRating,
              projects_count: finalProjects,
              imgUrl: agency.logo,
              repoLink: agency.repo,
              websiteUrl: agency.website,
              description: raw.description || "No service details available",
              popularity: getPopularity(finalRating),
              githubUrl: raw.html_url,
              html_url: raw.html_url || "",
            };

            agencyItem.trendingScore = calculateTrendingScore(agencyItem);
            return agencyItem;
          })
        );

        const clean = fetched.filter(Boolean) as Agency[];
        const sortedByTrending = clean.sort((a, b) => (b.trendingScore ?? 0) - (a.trendingScore ?? 0));

        setResults(sortedByTrending);
        setFiltered(sortedByTrending);
      } catch (err) {
        console.error("Fetch error", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgencyData();
  }, []);

  const debouncedFilter = useDebouncedCallback((q: string) => {
    const filteredAgencies = results.filter(r => {
      const matchQuery = !q || (
        r.agency_name.toLowerCase().includes(q) ||
        r.domain?.toLowerCase().includes(q) ||
        r.services?.some((t) => t.toLowerCase().includes(q))
      );
      const matchDomain = !domain || r.domain?.toLowerCase() === domain.toLowerCase();
      const matchPopularity = !popularity || r.popularity === popularity;
      return matchQuery && matchDomain && matchPopularity;
    });

    const sortedAgencies = filteredAgencies.sort((a, b) => (b.trendingScore ?? 0) - (a.trendingScore ?? 0));
    setFiltered(sortedAgencies);
  }, 300);

  useEffect(() => {
    debouncedFilter(query.toLowerCase().trim());
  }, [domain, popularity, debouncedFilter, query]);

  return (
    <div className="relative w-full min-h-full p-8 z-10">
      <div className="flex flex-col gap-5 w-full z-10 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex flex-col gap-5 w-full">
            <div className="text-2xl flex items-center gap-2 sm:text-3xl md:text-4xl lg:text-4xl font-medium leading-[100%] text-white">
              <TrendingUp className="w-8 h-8 text-orange-400" />
              <span>Trending</span>
              <span>Agencies</span>
            </div>
            <p className="text-sm text-neutral-400 max-w-2xl">
              Discover the hottest agencies based on recent project activity, community engagement, and growth momentum.
            </p>
            <div className="relative w-full max-w-[22rem]">
              <svg className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 font-medium text-neutral-500 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Find trending agencies"
                className="pl-8 pr-2 py-1 w-full text-sm text-neutral-500 tracking-tight border-[2px] bg-transparent focus:outline-none focus:ring-1 focus:ring-yellow-300 transition"
                style={{ borderImage: "conic-gradient(#d4d4d4 0deg, #171717 90deg, #d4d4d4 180deg, #171717 270deg, #d4d4d4 360deg) 1" }}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              options={DOMAINS.map(dom => ({ value: dom.toLowerCase(), label: dom }))}
              placeholder="All Domains"
            />
            <Select
              value={popularity}
              onChange={(e) => setPopularity(e.target.value)}
              options={[
                { value: "legendary", label: "Legendary" },
                { value: "famous", label: "Famous" },
                { value: "popular", label: "Popular" },
                { value: "rising", label: "Rising" },
              ]}
              placeholder="All Popularity"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <main className="min-h-screen flex flex-col gap-5 py-[10rem] items-center justify-start bg-transparent backdrop-blur-md text-white relative z-10" aria-busy="true">
          <div className="w-10 h-10 border-4 border-transparent border-t-yellow-300 rounded-full animate-spin" />
          <h1 className="text-base sm:text-lg font-medium text-neutral-300 tracking-tight">Finding Trending Agencies...</h1>
        </main>
      ) : filtered.length > 0 ? (
        <>
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full table-auto border-collapse bg-black/40 backdrop-blur-sm border border-neutral-800/50 overflow-hidden">
              <thead>
                <tr className="border-b border-neutral-800/50">
                  <th className="text-left py-4 px-6 text-sm font-medium text-neutral-400 bg-neutral-900/30 w-12">Rank</th>
                  {columns.map(({ key, label }) => (
                    <th key={key} className={`text-left py-4 px-6 text-sm font-medium text-neutral-400 bg-neutral-900/30`}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((agency, idx) => (
                  <tr key={idx} className="border-b border-neutral-800/30 group hover:bg-neutral-900/20 transition text-white">
                    <td className="py-4 px-6 text-sm">
                      <div className={`font-bold text-lg ${idx < 3 ? 'text-orange-400' : 'text-neutral-500'}`}>#{idx + 1}</div>
                    </td>
                    {columns.map(({ key }) => (
                      <td key={key} className="py-4 px-6 text-sm">
                        {renderCell(agency, key, idx, agency.repoLink)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-4">
            {filtered.map((agency, idx) => (
              <div key={idx} className="border border-neutral-800/50 p-4 bg-black/40 backdrop-blur-sm space-y-5 hover:border-neutral-700 transition relative">
                <div className="absolute top-2 right-2 font-bold text-lg text-orange-400">#{idx + 1}</div>
                <div className="flex flex-col gap-2 text-sm text-white font-medium">
                  {renderCell(agency, "agency_name", idx, agency.repoLink)}
                  {renderCell(agency, "domain", idx)}
                  {renderCell(agency, "services", idx)}
                  {renderCell(agency, "popularity", idx)}
                </div>
                <div className="border-t border-neutral-800/50" />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {columns.filter(({ key }) => ["rating_count", "projects_count"].includes(key)).map(({ key, label }) => (
                    <div key={key} className="flex flex-col gap-0.5">
                      <span className="text-neutral-400 font-medium">{label}</span>
                      <div className="text-white font-semibold">{renderCell(agency, key, idx)}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-8 justify-center">
            <button onClick={() => setPage(prev => Math.max(prev - 1, 1))} disabled={page === 1} className="hover:bg-neutral-900/20 cursor-pointer disabled:opacity-50 bg-black/40 border border-neutral-800/50 px-4 py-2 text-white transition-all"><ChevronsLeft /></button>
            <span className="bg-black/40 border border-neutral-800/50 px-4 py-2 text-white">{page}</span>
            <button onClick={() => setPage(prev => prev + 1)} className="hover:bg-neutral-900/20 cursor-pointer bg-black/40 border border-neutral-800/50 px-4 py-2 text-white transition-all"><ChevronsRight /></button>
          </div>
        </>
      ) : (
        <div className="text-center py-16"><div className="text-neutral-400 font-medium text-base text-white">No trending agencies found matching your criteria.</div></div>
      )}
    </div>
  );
}