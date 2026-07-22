import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, FolderKanban, FileText, Search,
  FileSpreadsheet, ShoppingBag, Truck, CalendarDays,
  ShieldCheck, Award, AlertTriangle, BarChart3, Bot,
  ChevronLeft, ChevronRight, Activity
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface NavGroup {
  title: string;
  items: {
    label: string;
    path: string;
    icon: React.ReactNode;
    badge?: string;
    badgeStyle?: React.CSSProperties;
  }[];
}

const navGroups: NavGroup[] = [
  {
    title: 'OVERVIEW',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: 'Projects', path: '/projects', icon: <FolderKanban className="w-4 h-4" /> },
    ],
  },
  {
    title: 'INTELLIGENCE & RAG',
    items: [
      { label: 'Document Specs', path: '/documents', icon: <FileText className="w-4 h-4" /> },
      {
        label: 'AI RAG Search', path: '/search', icon: <Search className="w-4 h-4" />,
        badge: 'AI',
        badgeStyle: { background: 'rgba(90,145,120,0.15)', color: '#2D6B4A', border: '1px solid rgba(90,145,120,0.35)' }
      },
      {
        label: 'AI Copilot', path: '/copilot', icon: <Bot className="w-4 h-4" />,
        badge: 'LIVE',
        badgeStyle: { background: 'rgba(74,138,106,0.15)', color: '#2D6B4A', border: '1px solid rgba(74,138,106,0.3)' }
      },
    ],
  },
  {
    title: 'PROCUREMENT & OPS',
    items: [
      { label: 'RFQs', path: '/rfqs', icon: <FileSpreadsheet className="w-4 h-4" /> },
      { label: 'Purchase Orders', path: '/purchase-orders', icon: <ShoppingBag className="w-4 h-4" /> },
      { label: 'Procurement Items', path: '/procurement', icon: <Truck className="w-4 h-4" /> },
      { label: 'Timeline Gantt', path: '/timeline', icon: <CalendarDays className="w-4 h-4" /> },
    ],
  },
  {
    title: 'ANALYTICS & RISK',
    items: [
      { label: 'Spec Compliance', path: '/compliance', icon: <ShieldCheck className="w-4 h-4" /> },
      { label: 'Vendor Evaluation', path: '/vendor-evaluation', icon: <Award className="w-4 h-4" /> },
      { label: 'Risk Intelligence', path: '/risk', icon: <AlertTriangle className="w-4 h-4" /> },
      { label: 'Executive Insights', path: '/executive-insights', icon: <BarChart3 className="w-4 h-4" /> },
    ],
  },
];

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 z-40 flex flex-col transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} relative`}
      style={{
        background: 'rgba(245, 248, 245, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(196, 212, 201, 0.8)',
        boxShadow: '2px 0 20px rgba(74,99,85,0.08)'
      }}
    >
      {/* Absolute Toggle Button */}
      <button
        onClick={onToggle}
        className="hidden md:flex absolute -right-3.5 top-[18px] z-50 p-1 rounded-full transition-all duration-300 shadow-md hover:scale-110 active:scale-95"
        style={{
          background: '#FFFFFF',
          border: '1px solid rgba(196,212,201,0.9)',
          color: '#5A9178',
          boxShadow: '0 2px 10px rgba(74,99,85,0.15)'
        }}
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Brand Header */}
      <div
        className={`h-16 flex items-center ${collapsed ? 'justify-center' : 'justify-start px-5'}`}
        style={{ borderBottom: '1px solid rgba(196, 212, 201, 0.7)' }}
      >
        {!collapsed ? (
          <div className="flex items-center justify-center w-[205px] h-[60px] flex-shrink-0">
            <img
              src="/logo.png?v=8"
              alt="NEXORA Logo"
              className="w-full h-full object-contain transition-all duration-300 hover:scale-105"
            />
          </div>
        ) : (
          <img
            src="/favicon.png?v=8"
            alt="NEXORA"
            className="w-12 h-12 object-contain float-icon flex-shrink-0"
          />
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-2.5 space-y-5">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-0.5">
            {!collapsed && (
              <h3
                className="px-3 text-[10px] font-bold tracking-[0.15em] uppercase mb-1.5"
                style={{ color: '#7A9B89' }}
              >
                {group.title}
              </h3>
            )}
            {group.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }: { isActive: boolean }) =>
                  `relative flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                    isActive ? 'nav-active' : 'text-obsidian-text-secondary hover:text-obsidian-text-primary hover:bg-sage-50'
                  } ${collapsed ? 'justify-center px-0' : ''}`
                }
                style={({ isActive }) => isActive ? {} : { ':hover': { background: 'rgba(90,145,120,0.06)' } }}
              >
                {({ isActive }) => (
                  <>
                    <span
                      className="flex-shrink-0 transition-all duration-200"
                      style={isActive ? { color: '#2D6B4A' } : {}}
                    >
                      {item.icon}
                    </span>
                    {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                    {!collapsed && item.badge && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md" style={item.badgeStyle}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      {/* Footer Status */}
      {!collapsed && (
        <div className="p-4" style={{ borderTop: '1px solid rgba(196,212,201,0.7)' }}>
          <div
            className="p-3 rounded-xl"
            style={{
              background: 'rgba(90,145,120,0.08)',
              border: '1px solid rgba(196,212,201,0.8)'
            }}
          >
            <div className="flex items-center space-x-2 mb-0.5">
              <Activity className="w-3 h-3" style={{ color: '#4A8A6A' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <p className="text-[10px] font-bold" style={{ color: '#2D6B4A' }}>SYSTEM ONLINE</p>
            </div>
            <p className="text-[9px]" style={{ color: '#7A9B89' }}>EPC Node · Python Backend</p>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
