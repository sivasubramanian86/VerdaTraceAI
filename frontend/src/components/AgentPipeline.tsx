/* v8 ignore start */
import React from 'react';
import { Cpu, ShieldCheck, Database, Zap, Sparkles, Route } from 'lucide-react';
import { translations } from '../i18n/translations';

interface AgentStepProps {
  id: string;
  name: string;
  description: string;
  state: 'idle' | 'active' | 'done';
  icon: React.ReactNode;
}

const AgentStep: React.FC<AgentStepProps> = ({ name, description, state, icon }) => {
  const stateClasses = {
    idle: 'border-slate-800 text-slate-500 bg-slate-900/50',
    active: 'border-emerald-500 text-emerald-400 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]',
    done: 'border-cyan-500 text-cyan-400 bg-cyan-500/10'
  };

  return (
    <div className="flex flex-col items-center text-center p-4 relative group" role="listitem" aria-label={`${name}: ${description}`}>
      {/* Animated pulsing ring for active agent */}
      <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all duration-350 ${stateClasses[state]}`}>
        {state === 'active' && (
          <span className="absolute w-14 h-14 rounded-full border-2 border-emerald-400 animate-ping opacity-75" />
        )}
        {icon}
      </div>
      <h4 className="mt-3 font-semibold text-sm text-slate-200 group-hover:text-emerald-400 transition-colors">{name}</h4>
      <p className="mt-1 text-xs text-slate-400 max-w-[150px] leading-relaxed">{description}</p>
    </div>
  );
};

interface AgentPipelineProps {
  locale?: string;
}

export const AgentPipeline: React.FC<AgentPipelineProps> = ({ locale = 'en' }) => {
  // Simulated agent mesh state for local demo purposes
  const [activeStep, setActiveStep] = React.useState(0);

  const t = translations[locale]?.agentPipeline || translations["en"].agentPipeline;

  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 6);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    {
      id: 'orchestrator',
      name: t.orchestrator,
      description: t.orchestratorDesc,
      icon: <Route className="w-6 h-6" />
    },
    {
      id: 'ingestion',
      name: t.ingestion,
      description: t.ingestionDesc,
      icon: <Database className="w-6 h-6" />
    },
    {
      id: 'estimation',
      name: t.estimation,
      description: t.estimationDesc,
      icon: <Cpu className="w-6 h-6" />
    },
    {
      id: 'optimizer',
      name: t.optimizer,
      description: t.optimizerDesc,
      icon: <Zap className="w-6 h-6" />
    },
    {
      id: 'rag',
      name: t.rag,
      description: t.ragDesc,
      icon: <Sparkles className="w-6 h-6" />
    },
    {
      id: 'guardrail',
      name: t.guardrail,
      description: t.guardrailDesc,
      icon: <ShieldCheck className="w-6 h-6" />
    }
  ];

  return (
    <div className="glass-panel p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            {t.title}
          </h3>
          <p className="text-xs text-slate-400 mt-1">{t.subtitle}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono text-emerald-400">
          {t.stateLabel.replace("{name}", steps[activeStep].name)}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-4" role="list" aria-label="Agent execution pipeline">
        {steps.map((step, idx) => {
          let state: 'idle' | 'active' | 'done' = 'idle';
          if (idx === activeStep) state = 'active';
          else if (idx < activeStep) state = 'done';

          return (
            <React.Fragment key={step.id}>
              <AgentStep
                id={step.id}
                name={step.name}
                description={step.description}
                state={state}
                icon={step.icon}
              />
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

/* v8 ignore stop */
