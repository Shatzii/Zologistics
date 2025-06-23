import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'es' | 'pt' | 'de';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  formatCurrency: (amount: number) => string;
  formatDate: (date: Date) => string;
  formatNumber: (num: number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Comprehensive translations for the entire site
const translations = {
  // Navigation & Layout
  'nav.dashboard': {
    'en': 'Dashboard',
    'es': 'Panel de Control',
    'pt': 'Painel de Controle',
    'de': 'Dashboard'
  },
  'nav.loads': {
    'en': 'Loads',
    'es': 'Cargas',
    'pt': 'Cargas',
    'de': 'Ladungen'
  },
  'nav.drivers': {
    'en': 'Drivers',
    'es': 'Conductores',
    'pt': 'Motoristas',
    'de': 'Fahrer'
  },
  'nav.analytics': {
    'en': 'Analytics',
    'es': 'Análisis',
    'pt': 'Análises',
    'de': 'Analytik'
  },
  'nav.ghost_loads': {
    'en': 'Ghost Loads',
    'es': 'Cargas Fantasma',
    'pt': 'Cargas Fantasma',
    'de': 'Geisterladungen'
  },
  'nav.settings': {
    'en': 'Settings',
    'es': 'Configuración',
    'pt': 'Configurações',
    'de': 'Einstellungen'
  },

  // Common Actions
  'action.save': {
    'en': 'Save',
    'es': 'Guardar',
    'pt': 'Salvar',
    'de': 'Speichern'
  },
  'action.cancel': {
    'en': 'Cancel',
    'es': 'Cancelar',
    'pt': 'Cancelar',
    'de': 'Abbrechen'
  },
  'action.edit': {
    'en': 'Edit',
    'es': 'Editar',
    'pt': 'Editar',
    'de': 'Bearbeiten'
  },
  'action.delete': {
    'en': 'Delete',
    'es': 'Eliminar',
    'pt': 'Excluir',
    'de': 'Löschen'
  },
  'action.create': {
    'en': 'Create',
    'es': 'Crear',
    'pt': 'Criar',
    'de': 'Erstellen'
  },
  'action.search': {
    'en': 'Search',
    'es': 'Buscar',
    'pt': 'Pesquisar',
    'de': 'Suchen'
  },

  // Ghost Loads Page
  'ghost_loads.title': {
    'en': 'Ghost Load Optimizer',
    'es': 'Optimizador de Cargas Fantasma',
    'pt': 'Otimizador de Cargas Fantasma',
    'de': 'Geisterladungs-Optimierer'
  },
  'ghost_loads.subtitle': {
    'en': 'Capturing lost loads and optimizing them for maximum profit',
    'es': 'Capturando cargas perdidas y optimizándolas para máximo beneficio',
    'pt': 'Capturando cargas perdidas e otimizando para máximo lucro',
    'de': 'Verlorene Ladungen erfassen und für maximalen Gewinn optimieren'
  },
  'ghost_loads.run_optimization': {
    'en': 'Run Optimization',
    'es': 'Ejecutar Optimización',
    'pt': 'Executar Otimização',
    'de': 'Optimierung Ausführen'
  },
  'ghost_loads.total_ghost_loads': {
    'en': 'Total Ghost Loads',
    'es': 'Total Cargas Fantasma',
    'pt': 'Total Cargas Fantasma',
    'de': 'Gesamte Geisterladungen'
  },
  'ghost_loads.potential_revenue': {
    'en': 'Potential Revenue',
    'es': 'Ingresos Potenciales',
    'pt': 'Receita Potencial',
    'de': 'Potentielle Einnahmen'
  },
  'ghost_loads.avg_margin': {
    'en': 'Avg Margin',
    'es': 'Margen Promedio',
    'pt': 'Margem Média',
    'de': 'Durchschnittl. Marge'
  },
  'ghost_loads.conversion_rate': {
    'en': 'Conversion Rate',
    'es': 'Tasa de Conversión',
    'pt': 'Taxa de Conversão',
    'de': 'Konversionsrate'
  },

  // Dashboard
  'dashboard.welcome': {
    'en': 'Welcome to TruckFlow AI',
    'es': 'Bienvenido a TruckFlow AI',
    'pt': 'Bem-vindo ao TruckFlow AI',
    'de': 'Willkommen bei TruckFlow AI'
  },
  'dashboard.active_loads': {
    'en': 'Active Loads',
    'es': 'Cargas Activas',
    'pt': 'Cargas Ativas',
    'de': 'Aktive Ladungen'
  },
  'dashboard.available_drivers': {
    'en': 'Available Drivers',
    'es': 'Conductores Disponibles',
    'pt': 'Motoristas Disponíveis',
    'de': 'Verfügbare Fahrer'
  },
  'dashboard.monthly_revenue': {
    'en': 'Monthly Revenue',
    'es': 'Ingresos Mensuales',
    'pt': 'Receita Mensal',
    'de': 'Monatlicher Umsatz'
  },

  // Regional Markets
  'region.north_america': {
    'en': 'North America',
    'es': 'América del Norte',
    'pt': 'América do Norte',
    'de': 'Nordamerika'
  },
  'region.central_america': {
    'en': 'Central America',
    'es': 'América Central',
    'pt': 'América Central',
    'de': 'Mittelamerika'
  },
  'region.european_union': {
    'en': 'European Union',
    'es': 'Unión Europea',
    'pt': 'União Europeia',
    'de': 'Europäische Union'
  },

  // Billion Dollar Market
  'market.billion_dollar_title': {
    'en': 'Billion Dollar Ghost Load Market',
    'es': 'Mercado de Cargas Fantasma de Miles de Millones',
    'pt': 'Mercado de Cargas Fantasma de Bilhões',
    'de': 'Milliarden-Dollar Geisterladungsmarkt'
  },
  'market.annual_lost_value': {
    'en': 'Annual Lost Value',
    'es': 'Valor Perdido Anual',
    'pt': 'Valor Perdido Anual',
    'de': 'Jährlicher Verlustwert'
  },
  'market.revenue_potential': {
    'en': 'Revenue Potential',
    'es': 'Potencial de Ingresos',
    'pt': 'Potencial de Receita',
    'de': 'Umsatzpotential'
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('truckflow-language');
    return (saved as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('truckflow-language', lang);
    document.documentElement.lang = lang;
  };

  const t = (key: string): string => {
    const translation = translations[key as keyof typeof translations];
    if (!translation) {
      return key;
    }
    return translation[language] || translation['en'] || key;
  };

  const formatCurrency = (amount: number): string => {
    const locale = {
      'en': 'en-US',
      'es': 'es-ES',
      'pt': 'pt-BR',
      'de': 'de-DE'
    }[language];

    const currency = {
      'en': 'USD',
      'es': 'USD',
      'pt': 'USD',
      'de': 'EUR'
    }[language];

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (date: Date): string => {
    const locale = {
      'en': 'en-US',
      'es': 'es-ES',
      'pt': 'pt-BR',
      'de': 'de-DE'
    }[language];

    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const formatNumber = (num: number): string => {
    const locale = {
      'en': 'en-US',
      'es': 'es-ES',
      'pt': 'pt-BR',
      'de': 'de-DE'
    }[language];

    return new Intl.NumberFormat(locale).format(num);
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    formatCurrency,
    formatDate,
    formatNumber
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}