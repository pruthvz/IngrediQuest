import React, { ReactNode } from 'react';
import { Platform } from 'react-native';

// This component will only be used on web platform
interface WebAuthProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export default function WebAuth({ children, title, subtitle }: WebAuthProps) {
  // Only render the web-specific layout on web platform
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  // Inline styles to ensure styling works regardless of CSS loading
  const styles = {
    container: {
      display: 'flex',
      minHeight: '100vh',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem',
      backgroundColor: '#FFFFFF',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    leftPanel: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'space-between',
      padding: '3rem',
      background: 'linear-gradient(135deg, #4F46E5 0%, #818CF8 100%)',
      borderRadius: '0.5rem',
      color: 'white',
      marginRight: '2rem',
      position: 'relative' as const,
      overflow: 'hidden',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },
    leftPanelBg: {
      content: "''",
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: "url('https://images.unsplash.com/photo-1543353071-873f17a7a088?q=80&w=1000')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      opacity: 0.15,
      zIndex: 0,
    },
    rightPanel: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'center',
      padding: '3rem',
      backgroundColor: '#FFFFFF',
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      maxWidth: '480px',
      marginLeft: 'auto',
    },
    title: {
      position: 'relative' as const,
      zIndex: 1,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontSize: '2.5rem',
      fontWeight: 700,
      marginBottom: '1rem',
      background: 'linear-gradient(135deg, #FFFFFF 0%, rgba(255, 255, 255, 0.8) 100%)',
      WebkitBackgroundClip: 'text' as const,
      backgroundClip: 'text' as const,
      color: 'transparent',
    },
    subtitle: {
      position: 'relative' as const,
      zIndex: 1,
      fontSize: '1.1rem',
      marginBottom: '3rem',
      opacity: 0.9,
      maxWidth: '90%',
    },
    features: {
      position: 'relative' as const,
      zIndex: 1,
      marginTop: 'auto',
    },
    featureItem: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '1.5rem',
      position: 'relative' as const,
      zIndex: 1,
    },
    featureIcon: {
      width: '2.5rem',
      height: '2.5rem',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: '1rem',
      flexShrink: 0,
    },
    featureTitle: {
      fontWeight: 600,
      marginBottom: '0.25rem',
      fontSize: '1rem',
    },
    featureText: {
      opacity: 0.8,
      fontSize: '0.875rem',
      marginBottom: 0,
    },
    rightTitle: {
      fontSize: '2rem',
      fontWeight: 700,
      marginBottom: '1.5rem',
      color: '#1F2937',
    },
    formGroup: {
      marginBottom: '1.25rem',
    },
    formLabel: {
      display: 'block',
      marginBottom: '0.5rem',
      fontWeight: 500,
      fontSize: '0.875rem',
      color: '#4B5563',
    },
    formInputWrapper: {
      position: 'relative' as const,
    },
    formInputIcon: {
      position: 'absolute' as const,
      left: '1rem',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#9CA3AF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    formInput: {
      width: '100%',
      padding: '0.75rem 1rem',
      paddingLeft: '2.75rem',
      borderRadius: '0.5rem',
      border: '1px solid #E5E7EB',
      fontSize: '0.95rem',
      transition: 'all 0.2s ease-in-out',
      backgroundColor: '#FFFFFF',
      color: '#1F2937',
    },
    button: {
      width: '100%',
      padding: '0.75rem 1rem',
      borderRadius: '0.5rem',
      border: 'none',
      background: 'linear-gradient(135deg, #4F46E5 0%, #818CF8 100%)',
      color: 'white',
      fontWeight: 600,
      fontSize: '0.95rem',
      cursor: 'pointer',
      transition: 'all 0.2s ease-in-out',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      position: 'relative' as const,
      overflow: 'hidden',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    },
    divider: {
      display: 'flex',
      alignItems: 'center',
      textAlign: 'center' as const,
      margin: '1.5rem 0',
      color: '#9CA3AF',
      fontSize: '0.875rem',
      position: 'relative' as const,
    },
    dividerLine: {
      flex: 1,
      height: '1px',
      backgroundColor: '#E5E7EB',
    },
    dividerText: {
      padding: '0 1rem',
    },
    socialButtons: {
      display: 'flex',
      gap: '0.75rem',
      marginTop: '1.25rem',
    },
    socialButton: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      padding: '0.75rem',
      borderRadius: '0.5rem',
      backgroundColor: '#F9FAFB',
      border: '1px solid #E5E7EB',
      cursor: 'pointer',
      transition: 'all 0.2s ease-in-out',
      fontWeight: 500,
      fontSize: '0.875rem',
      color: '#1F2937',
    },
    textCenter: {
      textAlign: 'center' as const,
    },
    mt4: {
      marginTop: '1rem',
    },
    mt6: {
      marginTop: '1.5rem',
    },
    mb4: {
      marginBottom: '1rem',
    },
    link: {
      color: '#4F46E5',
      fontWeight: 600,
      textDecoration: 'none',
    },
    formError: {
      backgroundColor: 'rgba(248, 113, 113, 0.1)',
      borderRadius: '0.5rem',
      padding: '0.75rem',
      marginBottom: '1.25rem',
      display: 'flex',
      alignItems: 'center',
      color: '#EF4444',
      fontSize: '0.875rem',
    },
    formErrorIcon: {
      marginRight: '0.5rem',
      width: '1.25rem',
      height: '1.25rem',
      backgroundColor: 'rgba(248, 113, 113, 0.2)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    formHelperText: {
      display: 'flex',
      alignItems: 'center',
      marginTop: '0.5rem',
      fontSize: '0.75rem',
      color: '#9CA3AF',
    },
  };

  // Apply dark mode styles if user prefers dark mode
  const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (prefersDarkMode) {
    styles.container.backgroundColor = '#111827';
    styles.rightPanel.backgroundColor = '#111827';
    styles.rightTitle.color = '#F9FAFB';
    styles.formLabel.color = '#E5E7EB';
    styles.formInput.backgroundColor = '#1F2937';
    styles.formInput.color = '#F9FAFB';
    styles.formInput.border = '1px solid #374151';
    styles.socialButton.backgroundColor = '#1F2937';
    styles.socialButton.border = '1px solid #374151';
    styles.socialButton.color = '#F9FAFB';
    styles.dividerLine.backgroundColor = '#374151';
  }

  return (
    <div style={styles.container}>
      <div style={styles.leftPanel}>
        <div style={styles.leftPanelBg}></div>
        <h1 style={styles.title}>IngrediQuest</h1>
        <p style={styles.subtitle}>{subtitle}</p>
        
        <div style={styles.features}>
          <div style={styles.featureItem}>
            <div style={styles.featureIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <div>
              <h3 style={styles.featureTitle}>Discover Recipes</h3>
              <p style={styles.featureText}>Find recipes that match your preferences and dietary needs</p>
            </div>
          </div>
          
          <div style={styles.featureItem}>
            <div style={styles.featureIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <div>
              <h3 style={styles.featureTitle}>Plan Your Meals</h3>
              <p style={styles.featureText}>Organize your weekly meal schedule effortlessly</p>
            </div>
          </div>
          
          <div style={styles.featureItem}>
            <div style={styles.featureIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
            </div>
            <div>
              <h3 style={styles.featureTitle}>Smart Shopping Lists</h3>
              <p style={styles.featureText}>Generate shopping lists based on your meal plans</p>
            </div>
          </div>
        </div>
      </div>
      
      <div style={styles.rightPanel}>
        <h2 style={styles.rightTitle}>{title}</h2>
        
        {/* Children will be rendered directly with their own inline styles */}
        {children}
      </div>
    </div>
  );
}
