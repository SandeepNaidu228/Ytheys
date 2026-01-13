'use client';

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { Send, Sparkles, ExternalLink, Star, Briefcase, TrendingUp } from 'lucide-react';
import YC from "@/lib/YC.json";

// --- SERVICE DEFINITIONS ---

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

interface Agency {
  agency_name: string;
  domain: string;
  services?: string[];
  rating_count: number;
  projects_count: number;
  imgUrl?: string;
  popularity?: "legendary" | "famous" | "popular" | "rising";
  html_url: string;
  description?: string;
  repoLink?: string;
  websiteUrl?: string; // Added for redirect
  matchScore?: number;
}

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  agencies?: Agency[];
  timestamp: Date;
}

const getPopularity = (ratings: number): "legendary" | "famous" | "popular" | "rising" => {
  if (ratings >= 4.8) return 'legendary';
  if (ratings >= 4.5) return 'famous';
  if (ratings >= 4.0) return 'popular';
  return 'rising';
};

const formatNumber = (n: number) =>
  n >= 1e6 ? `${+(n / 1e6).toFixed(1)}M` :
    n >= 1e3 ? `${+(n / 1e3).toFixed(1)}k` :
      n.toString();

// AI Matching Algorithm
const matchAgenciesToPrompt = (prompt: string, agencies: Agency[]): Agency[] => {
  const lowerPrompt = prompt.toLowerCase();
  const keywords = lowerPrompt.split(/\s+/).filter(word => word.length > 3);

  const scoredAgencies = agencies.map(agency => {
    let score = 0;
    if (lowerPrompt.includes(agency.domain.toLowerCase())) score += 30;
    agency.services?.forEach(service => {
      if (lowerPrompt.includes(service.toLowerCase())) score += 20;
    });
    if (agency.description) {
      keywords.forEach(keyword => {
        if (agency.description!.toLowerCase().includes(keyword)) score += 5;
      });
    }
    keywords.forEach(keyword => {
      if (agency.domain.toLowerCase().includes(keyword)) score += 10;
      agency.services?.forEach(service => {
        if (service.toLowerCase().includes(keyword)) score += 8;
      });
    });
    if (agency.popularity === 'legendary') score += 5;
    else if (agency.popularity === 'famous') score += 3;
    if (agency.projects_count > 1000) score += 5;
    return { ...agency, matchScore: score };
  });

  return scoredAgencies
    .filter(a => a.matchScore! > 0)
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
    .slice(0, 3);
};

export default function AIAgencyMatcher() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchAgencyData = async () => {
      setIsInitializing(true);
      const agencyData = YC as unknown as any[];

      try {
        const fetched = await Promise.all(
          agencyData.map(async (agency) => {
            const res = await fetch(`/api/githubOverview?repo=${agency.repo}`);
            const raw = res.ok ? await res.json() : {};

            const industryDomain = mapLanguageToDomain(raw.language);
            const assignedServices = getRandomServices(industryDomain);

            // PRIORITY: JSON Values (Decimals, Projects, Website)
            const finalRating = agency.rating_count ?? 4.0;
            const finalProjects = agency.projects_count ?? (raw.forks_count || 0);

            return {
              agency_name: agency.company,
              domain: industryDomain,
              services: assignedServices,
              rating_count: finalRating,
              projects_count: finalProjects,
              imgUrl: agency.logo,
              repoLink: agency.repo,
              websiteUrl: agency.website,
              description: raw.description || "Specialized engineering and design solutions.",
              popularity: getPopularity(finalRating),
              html_url: raw.html_url || `https://github.com/${agency.repo}`,
            } as Agency;
          })
        );

        setAgencies(fetched.filter(Boolean));
      } catch (err) {
        console.error("Fetch error", err);
      } finally {
        setIsInitializing(false);
      }
    };

    fetchAgencyData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    setTimeout(() => {
      const matchedAgencies = matchAgenciesToPrompt(userMessage.content, agencies);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: matchedAgencies.length > 0
          ? `Based on your project requirements, I've found ${matchedAgencies.length} highly suitable agencies for you:`
          : "I couldn't find any agencies that closely match your requirements. Try being more specific about the technologies or services you need.",
        agencies: matchedAgencies,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  return (
    <div className="relative w-full h-screen flex flex-col bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-yellow-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-pink-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative border-b border-neutral-800/50 bg-black/40 backdrop-blur-xl sticky top-0 z-10 shadow-2xl">
        <div className="max-w-5xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="inline-flex font-instrument items-center font-mono text-white text-[1.9rem] sm:text-[2.5rem] font-medium leading-none tracking-tight">
                <span className="text-white">Yth</span>
                <span className="text-neutral-500">eys</span>
              </Link>
            </div>
            {!isInitializing && agencies.length > 0 && (
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-neutral-800/30 border border-neutral-700/30 rounded-lg">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-sm text-neutral-300">{agencies.length} agencies loaded</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="relative flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {isInitializing ? (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 rounded-full blur-xl opacity-30" />
                <div className="relative w-16 h-16 border-4 border-transparent border-t-yellow-400 border-r-orange-500 rounded-full animate-spin" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-neutral-300 text-lg font-medium">Initializing AI matcher</p>
                <p className="text-neutral-500 text-sm">Loading agency database...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-8">
              <div className="text-center space-y-3 max-w-2xl">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
                  What are you building today?
                </h2>
                <p className="text-neutral-400 text-lg">
                  Describe your project, tech stack, or the services you need. Our AI will match you with the perfect agencies.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-3xl mt-4">
                {[
                  { text: "I need a mobile app for iOS and Android", icon: "📱" },
                  { text: "Looking for AI/ML integration help", icon: "🤖" },
                  { text: "Need help with cloud infrastructure", icon: "☁️" },
                  { text: "Want to build an e-commerce platform", icon: "🛒" }
                ].map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(suggestion.text)}
                    className="group px-5 py-4 bg-neutral-900/30 hover:bg-neutral-800/50 border border-neutral-800/50 hover:border-neutral-700/50 rounded-xl text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{suggestion.icon}</span>
                      <span className="text-sm text-neutral-300 group-hover:text-white transition-colors">
                        {suggestion.text}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {messages.map((message) => (
                <div key={message.id} className={`flex gap-4 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.type === 'assistant' && (
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 rounded-2xl blur-md opacity-40" />
                      <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 flex items-center justify-center shadow-lg">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  )}

                  <div className={`flex flex-col gap-4 max-w-3xl ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`px-5 py-3 rounded-2xl shadow-lg ${message.type === 'user' ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white' : 'bg-neutral-900/60 border border-neutral-800/50 text-neutral-200 backdrop-blur-sm'}`}>
                      {message.content}
                    </div>

                    {message.agencies && message.agencies.length > 0 && (
                      <div className="w-full space-y-4 mt-2">
                        {message.agencies.map((agency, idx) => (
                          <div key={idx} className="relative bg-neutral-900/60 border border-neutral-800/50 rounded-2xl p-6 hover:border-neutral-700/50 transition-all group backdrop-blur-sm hover:shadow-2xl hover:shadow-yellow-500/5">
                            <div className="absolute -top-3 -left-3 w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg font-bold text-white">
                              #{idx + 1}
                            </div>

                            <div className="flex items-start gap-5">
                              {agency.imgUrl && (
                                <div className="relative flex-shrink-0">
                                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-pink-500/20 rounded-xl blur-md" />
                                  <Image src={agency.imgUrl} alt={agency.agency_name} width={64} height={64} className="relative rounded-xl border border-neutral-800/50" unoptimized />
                                </div>
                              )}

                              <div className="flex-1 min-w-0">
                                <div className="mb-3">
                                  <h3 className="text-xl font-bold text-white group-hover:text-yellow-300 transition-colors mb-2">{agency.agency_name}</h3>
                                  <p className="text-sm text-neutral-400 leading-relaxed">{agency.description}</p>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-4">
                                  <span className="px-3 py-1.5 bg-blue-500/15 text-blue-400 border border-blue-400/30 rounded-lg text-xs font-semibold">🎯 {agency.domain}</span>
                                  {agency.services?.slice(0, 3).map((service, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-neutral-800/60 text-neutral-300 border border-neutral-700/40 rounded-lg text-xs font-medium">{service}</span>
                                  ))}
                                </div>

                                <div className="flex items-center justify-between flex-wrap gap-4">
                                  <div className="flex items-center gap-5 text-sm">
                                    <div className="flex items-center gap-2 text-neutral-400">
                                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                      <span className="font-mono font-semibold text-white">{agency.rating_count.toFixed(1)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-neutral-400">
                                      <Briefcase className="w-4 h-4 text-blue-400" />
                                      <span className="font-mono font-semibold text-white">{formatNumber(agency.projects_count)}</span>
                                    </div>
                                    <span className={`capitalize text-xs px-3 py-1 rounded-lg font-semibold ${agency.popularity === 'legendary' ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border border-yellow-400/30' : 'bg-green-500/15 text-green-400 border border-green-400/30'}`}>{agency.popularity}</span>
                                  </div>

                                  <Link href={agency.websiteUrl || `https://github.com/${agency.repoLink}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 hover:from-yellow-500/20 hover:to-orange-500/20 text-yellow-400 border border-yellow-400/30 rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95">
                                    View Agency <ExternalLink className="w-4 h-4" />
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {message.type === 'user' && (
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <span className="text-white text-xs font-bold">You</span>
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 rounded-2xl blur-md opacity-40" />
                    <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white animate-pulse" />
                    </div>
                  </div>
                  <div className="bg-neutral-900/60 border border-neutral-800/50 rounded-2xl px-5 py-3 backdrop-blur-sm">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      <div className="relative border-t border-neutral-800/50 bg-black/40 backdrop-blur-xl sticky bottom-0 shadow-2xl">
        <div className="max-w-5xl mx-auto px-6 py-5">
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-orange-500/10 to-pink-500/10 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your project needs... (Press Enter to send)"
                disabled={isInitializing || isLoading}
                className="relative w-full px-6 py-4 pr-14 bg-neutral-900/60 border border-neutral-800/50 rounded-2xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 resize-none max-h-32 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm transition-all"
                rows={1}
              />
              <button
                type="submit"
                disabled={!input.trim() || isInitializing || isLoading}
                className="absolute right-3 bottom-3 p-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:from-neutral-700 disabled:to-neutral-700 disabled:cursor-not-allowed rounded-xl transition-all hover:scale-110 active:scale-95 shadow-lg"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
          </form>
          <p className="text-xs text-neutral-500 mt-3 text-center">
            ✨ AI-powered matching • Analyzing {agencies.length}+ agencies • Results in seconds
          </p>
        </div>
      </div>
    </div>
  );
}