import React from 'react';
import { 
  Leaf, Activity, Zap, MessageSquare, Eye, Sparkles, Sun, Moon, Globe,
  Mail, ShoppingBag, Utensils, Car, Share2, ChevronRight
} from 'lucide-react';
import { translations, supportedLanguages } from '../i18n/translations';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDark: boolean;
  toggleTheme: () => void;
  locale: string;
  setLocale: (locale: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  isDark, 
  toggleTheme,
  locale,
  setLocale
}) => {
  const t = translations[locale]?.sidebar || translations["en"].sidebar;

  const renderSidebarButton = (
    tabId: string,
    label: string,
    icon: React.ReactNode,
    ariaLabel?: string
  ) => {
    const isActive = activeTab === tabId;
    return (
      <button
        key={tabId}
        onClick={() => setActiveTab(tabId)}
        aria-label={ariaLabel || `Navigate to ${label}`}
        aria-current={isActive ? 'page' : undefined}
        style={{
          position: 'relative',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          borderRadius: '10px',
          border: 'none',
          borderLeft: isActive ? '3px solid var(--accent-emerald)' : '3px solid transparent',
          background: isActive
            ? isDark
              ? 'linear-gradient(90deg, oklch(68% 0.18 160 / 0.18) 0%, transparent 100%)'
              : 'linear-gradient(90deg, oklch(68% 0.18 160 / 0.12) 0%, transparent 100%)'
            : 'transparent',
          color: isActive
            ? 'var(--accent-emerald)'
            : 'var(--text-secondary)',
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          textAlign: 'left',
          fontSize: '0.9375rem',
          fontWeight: isActive ? 700 : 500,
          letterSpacing: '0.005em',
          marginBottom: '3px',
          lineHeight: 1.3,
        }}
        onMouseEnter={e => {
          if (!isActive) {
            (e.currentTarget as HTMLButtonElement).style.background = isDark
              ? 'oklch(100% 0 0 / 0.05)'
              : 'oklch(0% 0 0 / 0.04)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateX(3px)';
          }
        }}
        onMouseLeave={e => {
          if (!isActive) {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateX(0)';
          }
        }}
      >
        <span style={{ 
          display: 'flex', 
          alignItems: 'center', 
          color: isActive ? 'var(--accent-emerald)' : 'inherit',
          flexShrink: 0
        }}>
          {icon}
        </span>
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {label}
        </span>
        {isActive && (
          <ChevronRight 
            style={{ width: 14, height: 14, opacity: 0.7, flexShrink: 0 }} 
            aria-hidden="true"
          />
        )}
      </button>
    );
  };

  const sectionLabel = (text: string) => (
    <span style={{
      display: 'block',
      padding: '18px 16px 8px',
      fontSize: '0.75rem',
      fontWeight: 800,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
    }}>
      {text}
    </span>
  );

  const currentLang = supportedLanguages.find(l => l.value === locale);

  return (
    <aside 
      className="glass-sidebar"
      style={{ 
        width: 284, 
        minWidth: 284,
        display: 'flex', 
        flexDirection: 'column',
        minHeight: '100dvh',
        transition: 'all 0.3s ease',
        position: 'relative',
        zIndex: 10,
        flexShrink: 0,
      }}
    >
      {/* Brand Header */}
      <div style={{
        padding: '20px 16px 16px',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{
            width: 40, height: 40,
            background: 'linear-gradient(135deg, oklch(68% 0.18 160), oklch(68% 0.16 195))',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px oklch(68% 0.18 160 / 0.4)',
            flexShrink: 0,
          }}>
            <Leaf style={{ width: 22, height: 22, color: '#fff' }} aria-hidden="true" />
          </div>
          <div>
            <h1 style={{
              fontSize: '1.125rem',
              fontWeight: 800,
              background: 'linear-gradient(90deg, oklch(68% 0.18 160), oklch(68% 0.16 195))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: 1.1,
              margin: 0,
            }}>
              VerdaTraceAI
            </h1>
            <p style={{ 
              fontSize: '0.6rem', 
              color: 'var(--text-muted)', 
              letterSpacing: '0.1em', 
              textTransform: 'uppercase',
              margin: '2px 0 0',
              fontWeight: 600,
            }}>
              Carbon Intelligence
            </p>
          </div>
        </div>

        {/* Language Selector */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 10px',
          background: isDark ? 'oklch(100% 0 0 / 0.05)' : 'oklch(0% 0 0 / 0.04)',
          borderRadius: 8,
          border: '1px solid var(--border-subtle)',
          transition: 'all 0.2s ease',
        }}>
          <Globe style={{ width: 14, height: 14, color: 'var(--accent-emerald)', flexShrink: 0 }} />
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            aria-label="Select Language"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {supportedLanguages.map((lang) => (
              <option key={lang.value} value={lang.value} style={{ background: '#1e293b', color: '#f1f5f9' }}>
                {lang.label}
              </option>
            ))}
          </select>
          {currentLang?.flag && (
            <span style={{ fontSize: '1rem', lineHeight: 1, flexShrink: 0 }}>
              {currentLang.flag}
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '6px 10px', overflowY: 'auto' }}>
        {/* AI Workloads Section */}
        {sectionLabel(t.aiSection)}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {renderSidebarButton('dashboard', t.dashboard, <Activity style={{ width: 18, height: 18 }} aria-hidden="true" />, 'View Carbon Dashboard')}
          {renderSidebarButton('simulator', t.simulator, <Zap style={{ width: 18, height: 18 }} aria-hidden="true" />, 'Open What-If Simulator')}
          {renderSidebarButton('recommendations', t.recommendations, <Sparkles style={{ width: 18, height: 18 }} aria-hidden="true" />, 'View Optimization Recommendations')}
        </div>

        {/* Local Loops Section */}
        {sectionLabel(t.loopsSection)}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {renderSidebarButton('digital', t.digital, <Mail style={{ width: 18, height: 18 }} aria-hidden="true" />)}
          {renderSidebarButton('commerce', t.commerce, <ShoppingBag style={{ width: 18, height: 18 }} aria-hidden="true" />)}
          {renderSidebarButton('food', t.food, <Utensils style={{ width: 18, height: 18 }} aria-hidden="true" />)}
          {renderSidebarButton('transit', t.transit, <Car style={{ width: 18, height: 18 }} aria-hidden="true" />)}
          {renderSidebarButton('circular', t.circular, <Share2 style={{ width: 18, height: 18 }} aria-hidden="true" />)}
        </div>

        {/* Coach & Judge Section */}
        {sectionLabel(t.coachSection)}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {renderSidebarButton('copilot', t.copilot, <MessageSquare style={{ width: 18, height: 18 }} aria-hidden="true" />, 'Open Green Copilot')}
          {renderSidebarButton('judge', t.judge, <Eye style={{ width: 18, height: 18 }} aria-hidden="true" />, 'View Judge Demo')}
        </div>
      </nav>

      {/* Footer Controls */}
      <div style={{
        padding: '12px 14px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}>
        {/* Live Audit Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          background: isDark 
            ? 'oklch(68% 0.18 160 / 0.08)' 
            : 'oklch(68% 0.18 160 / 0.06)',
          border: '1px solid oklch(68% 0.18 160 / 0.25)',
          borderRadius: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ position: 'relative', display: 'flex', width: 8, height: 8 }}>
              <span style={{
                position: 'absolute', inset: 0,
                borderRadius: '50%',
                background: 'oklch(68% 0.18 160)',
                animation: 'ping 1.5s ease-in-out infinite',
                opacity: 0.75,
              }} />
              <span style={{ 
                position: 'relative', 
                width: 8, height: 8, 
                borderRadius: '50%', 
                background: 'oklch(68% 0.18 160)',
                flexShrink: 0,
              }} />
            </span>
            <span style={{ 
              fontSize: '0.75rem', 
              fontWeight: 800, 
              letterSpacing: '0.08em', 
              textTransform: 'uppercase',
              color: 'var(--accent-emerald)',
            }}>
              {t.ready}
            </span>
          </div>
          <span style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            v3.0
          </span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '11px 14px',
            background: isDark ? 'oklch(100% 0 0 / 0.06)' : 'oklch(0% 0 0 / 0.05)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 8,
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: 'inherit',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = isDark 
              ? 'oklch(100% 0 0 / 0.1)' 
              : 'oklch(0% 0 0 / 0.08)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'oklch(68% 0.18 160 / 0.4)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = isDark 
              ? 'oklch(100% 0 0 / 0.06)' 
              : 'oklch(0% 0 0 / 0.05)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-subtle)';
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isDark
              ? <Sun style={{ width: 17, height: 17, color: 'oklch(75% 0.19 85)' }} aria-hidden="true" />
              : <Moon style={{ width: 17, height: 17, color: 'oklch(58% 0.25 295)' }} aria-hidden="true" />
            }
            {isDark ? t.themeLight : t.themeDark}
          </span>
        </button>

        {/* ADC Status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 4px',
        }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.03em' }}>
            ADC Connected
          </span>
          <span style={{ 
            width: 6, height: 6, 
            borderRadius: '50%', 
            background: 'oklch(68% 0.18 160)',
            display: 'inline-block',
          }} />
        </div>
      </div>
    </aside>
  );
};
