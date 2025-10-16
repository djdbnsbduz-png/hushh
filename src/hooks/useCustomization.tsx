import { createContext, useContext, useEffect, useState } from 'react';
import { useProfile } from './useProfile';

interface CustomizationSettings {
  theme: 'light' | 'dark' | 'auto';
  font_family: 'Inter' | 'Roboto' | 'Open Sans' | 'Poppins' | 'Montserrat' | string;
  font_size: 'small' | 'medium' | 'large';
  background_type: 'default' | 'gradient' | 'image' | 'color';
  background_value: string | null;
  accent_color: string;
  message_bubble_style: 'rounded' | 'square' | 'minimal';
  sidebar_width: 'narrow' | 'normal' | 'wide';
  custom_css: string | null;
  border_radius: 'none' | 'small' | 'medium' | 'large';
  card_shadow: 'none' | 'small' | 'medium' | 'large';
  spacing: 'compact' | 'normal' | 'spacious';
  animation_speed: 'none' | 'fast' | 'normal' | 'slow';
  hover_effects: boolean;
}

interface CustomizationContextType {
  settings: CustomizationSettings;
  updateCustomization: (newSettings: Partial<CustomizationSettings>) => Promise<void>;
  applyTheme: () => void;
  resetToDefaults: () => Promise<void>;
}

const defaultSettings: CustomizationSettings = {
  theme: 'dark',
  font_family: 'Inter',
  font_size: 'medium',
  background_type: 'default',
  background_value: null,
  accent_color: '#6B7280',
  message_bubble_style: 'rounded',
  sidebar_width: 'normal',
  custom_css: null,
  border_radius: 'medium',
  card_shadow: 'medium',
  spacing: 'normal',
  animation_speed: 'normal',
  hover_effects: true,
};

const CustomizationContext = createContext<CustomizationContextType>({
  settings: defaultSettings,
  updateCustomization: async () => {},
  applyTheme: () => {},
  resetToDefaults: async () => {},
});

export const useCustomization = () => {
  const context = useContext(CustomizationContext);
  if (!context) {
    throw new Error('useCustomization must be used within a CustomizationProvider');
  }
  return context;
};

interface CustomizationProviderProps {
  children: React.ReactNode;
}

export const CustomizationProvider = ({ children }: CustomizationProviderProps) => {
  const { profile, updateProfile } = useProfile();
  const [settings, setSettings] = useState<CustomizationSettings>(defaultSettings);

  // Load settings from profile when available
  useEffect(() => {
    if (profile?.customization) {
      setSettings({
        ...defaultSettings,
        ...profile.customization,
      });
    }
  }, [profile?.customization]);

  // Apply theme changes to document
  useEffect(() => {
    applyTheme();
  }, [settings]);

  const updateCustomization = async (newSettings: Partial<CustomizationSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    // Save to profile
    await updateProfile({
      customization: updatedSettings,
    });
  };

  const applyTheme = () => {
    const root = document.documentElement;
    
    // Apply font family
    if (settings.font_family && settings.font_family !== 'Inter') {
      root.style.setProperty('--font-family', settings.font_family);
      document.body.style.fontFamily = settings.font_family;
    }
    
    // Apply font size
    const fontSizeMap = {
      small: '0.875rem',
      medium: '1rem',
      large: '1.125rem',
    };
    root.style.setProperty('--base-font-size', fontSizeMap[settings.font_size]);
    
    // Apply accent color
    if (settings.accent_color !== '#6B7280') {
      const hsl = hexToHsl(settings.accent_color);
      root.style.setProperty('--primary', hsl);
      root.style.setProperty('--telegram-blue', hsl);
    }
    
    // Apply background
    if (settings.background_type !== 'default' && settings.background_value) {
      switch (settings.background_type) {
        case 'color':
          // Convert color to HSL for the CSS variable
          const hslColor = settings.background_value.startsWith('#') 
            ? hexToHsl(settings.background_value) 
            : settings.background_value;
          root.style.setProperty('--background', hslColor);
          document.body.style.backgroundColor = settings.background_value;
          break;
        case 'gradient':
          document.body.style.background = settings.background_value;
          root.style.setProperty('--background', '0 0% 0%'); // Set to transparent for gradients
          break;
        case 'image':
          document.body.style.backgroundImage = `url(${settings.background_value})`;
          document.body.style.backgroundSize = 'cover';
          document.body.style.backgroundPosition = 'center';
          document.body.style.backgroundAttachment = 'fixed';
          root.style.setProperty('--background', '0 0% 0%'); // Set to transparent for images
          break;
      }
    } else {
      // Reset to default when background type is default
      root.style.removeProperty('--background');
    }
    
    // Apply message bubble style
    const bubbleStyleMap = {
      rounded: '0.75rem',
      square: '0.25rem',
      minimal: '0.5rem',
    };
    root.style.setProperty('--message-border-radius', bubbleStyleMap[settings.message_bubble_style]);
    
    // Apply sidebar width
    const sidebarWidthMap = {
      narrow: '240px',
      normal: '320px',
      wide: '400px',
    };
    root.style.setProperty('--sidebar-width', sidebarWidthMap[settings.sidebar_width]);
    
    // Apply border radius
    const borderRadiusMap = {
      none: '0',
      small: '0.25rem',
      medium: '0.5rem',
      large: '1rem',
    };
    root.style.setProperty('--global-border-radius', borderRadiusMap[settings.border_radius]);
    
    // Apply card shadows
    const shadowMap = {
      none: 'none',
      small: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      large: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    };
    root.style.setProperty('--card-shadow', shadowMap[settings.card_shadow]);
    
    // Apply spacing
    const spacingMap = {
      compact: '0.75',
      normal: '1',
      spacious: '1.5',
    };
    root.style.setProperty('--spacing-scale', spacingMap[settings.spacing]);
    
    // Apply animation speed
    const animationSpeedMap = {
      none: '0s',
      fast: '0.15s',
      normal: '0.3s',
      slow: '0.5s',
    };
    root.style.setProperty('--animation-duration', animationSpeedMap[settings.animation_speed]);
    
    // Apply hover effects
    root.style.setProperty('--hover-scale', settings.hover_effects ? '1.05' : '1');
    
    // Apply custom CSS
    if (settings.custom_css) {
      let customStyleElement = document.getElementById('custom-user-styles');
      if (!customStyleElement) {
        customStyleElement = document.createElement('style');
        customStyleElement.id = 'custom-user-styles';
        document.head.appendChild(customStyleElement);
      }
      customStyleElement.textContent = settings.custom_css;
    }
    
    // Apply theme class
    if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      // Auto theme based on system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  const resetToDefaults = async () => {
    setSettings(defaultSettings);
    await updateProfile({
      customization: defaultSettings,
    });
    
    // Reset DOM styles
    const root = document.documentElement;
    root.style.removeProperty('--font-family');
    root.style.removeProperty('--base-font-size');
    root.style.removeProperty('--primary');
    root.style.removeProperty('--telegram-blue');
    root.style.removeProperty('--background-custom');
    root.style.removeProperty('--message-border-radius');
    root.style.removeProperty('--sidebar-width');
    root.style.removeProperty('--global-border-radius');
    root.style.removeProperty('--card-shadow');
    root.style.removeProperty('--spacing-scale');
    root.style.removeProperty('--animation-duration');
    root.style.removeProperty('--hover-scale');
    
    document.body.style.fontFamily = '';
    document.body.style.backgroundColor = '';
    document.body.style.background = '';
    document.body.style.backgroundImage = '';
    
    const customStyleElement = document.getElementById('custom-user-styles');
    if (customStyleElement) {
      customStyleElement.remove();
    }
  };

  const value = {
    settings,
    updateCustomization,
    applyTheme,
    resetToDefaults,
  };

  return (
    <CustomizationContext.Provider value={value}>
      {children}
    </CustomizationContext.Provider>
  );
};

// Helper function to convert hex to hsl
function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}