import React from 'react';
import { 
  Info, 
  MapPin, 
  Search, 
  CloudSun, 
  Cpu, 
  Gauge, 
  ShieldAlert, 
  Zap, 
  CheckCircle2, 
  FileCode, 
  BookOpen,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

export const AboutAndWorkflow: React.FC = () => {
  return (
    <div className="space-y-6">
      
      {/* 19. Visual System Flow Diagram */}
      <section id="systemWorkflowDiagram" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="text-center space-y-1 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 text-xs font-bold border border-sky-200">
            System Architecture
          </div>
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
            How The AI Weather Risk & Power Safety Pipeline Operates
          </h3>
          <p className="text-xs text-slate-500">
            End-to-end dataflow from Indian location input to simulated feeder isolation advisory
          </p>
        </div>

        {/* 7-Step Sequential Workflow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2.5 pt-2">
          
          {/* Step 1 */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-center flex flex-col items-center justify-between gap-2 hover:border-sky-300 transition-all">
            <span className="text-[10px] font-black text-slate-400">STAGE 1</span>
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-base shadow-xs">
              🇮🇳
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Indian Location</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                User enters any Indian city, district, or town.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-center flex flex-col items-center justify-between gap-2 hover:border-sky-300 transition-all">
            <span className="text-[10px] font-black text-slate-400">STAGE 2</span>
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shadow-xs">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Geocoding API</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                Resolves exact lat & lon; enforces strictly country=IN.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-center flex flex-col items-center justify-between gap-2 hover:border-sky-300 transition-all">
            <span className="text-[10px] font-black text-slate-400">STAGE 3</span>
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-xs">
              <CloudSun className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Weather Data</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                Pulls real-time rain, wind, temp, humidity, and forecast.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-center flex flex-col items-center justify-between gap-2 hover:border-sky-300 transition-all">
            <span className="text-[10px] font-black text-slate-400">STAGE 4</span>
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shadow-xs">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">AI Risk Engine</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                Transparent rule matrix evaluates physical hazard points.
              </p>
            </div>
          </div>

          {/* Step 5 */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-center flex flex-col items-center justify-between gap-2 hover:border-sky-300 transition-all">
            <span className="text-[10px] font-black text-slate-400">STAGE 5</span>
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-xs">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Risk Score</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                Normalized index calculated strictly between 0 and 100.
              </p>
            </div>
          </div>

          {/* Step 6 */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-center flex flex-col items-center justify-between gap-2 hover:border-sky-300 transition-all">
            <span className="text-[10px] font-black text-slate-400">STAGE 6</span>
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Risk Level</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                Categorized into LOW (0-29), MEDIUM (30-59), or HIGH (60-100).
              </p>
            </div>
          </div>

          {/* Step 7 */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-center flex flex-col items-center justify-between gap-2 hover:border-sky-300 transition-all">
            <span className="text-[10px] font-black text-slate-400">STAGE 7</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Power Advisory</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                Outputs simulated POWER ON or POWER OFF recommendation.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 18. About This Project Card */}
      <section id="aboutProjectSection" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <BookOpen className="w-4 h-4 text-sky-600" />
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
            About This Project &bull; Academic Prototype
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-slate-700">
          
          <div className="space-y-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
                Project Title & Scope
              </span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                AI Weather Risk Detection & Power Safety System
              </p>
              <p className="text-slate-600 mt-1 leading-relaxed">
                An engineering college software demonstration exploring automated meteorological telemetry ingestion, explainable risk calculation, and simulated electrical feeder isolation during extreme weather events across India.
              </p>
            </div>

            <div>
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
                Academic Objective
              </span>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                To demonstrate how transparent computational rules and real-time open weather data can aid distribution grid dispatchers in preemptively identifying high-risk storm conditions and making timely decisions.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
                Technology Stack
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {[
                  'Python 3.11',
                  'Flask Backend (AI-Power-System)',
                  'OpenWeather Geocoding API',
                  'OpenWeather 5-Day Forecast API',
                  'Rule-Based AI Engine',
                  'React 18 & TypeScript',
                  'Tailwind CSS',
                  'Leaflet OpenStreetMap',
                  'Google Sheets Integration'
                ].map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-800 font-semibold text-[11px]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Academic Safety Disclaimer */}
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3.5 space-y-1 text-amber-950">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <span>🔒</span> Mandatory Academic Disclaimer
              </span>
              <p className="text-[11px] leading-relaxed">
                This project is a <strong>software-only prototype</strong> designed strictly for academic demonstration and viva examination. It outputs simulated recommendations and <strong>does NOT connect to or physically control real electrical power grids, substations, or physical breaker hardware</strong>.
              </p>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};
