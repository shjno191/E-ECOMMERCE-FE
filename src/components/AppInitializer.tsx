import { useInitializeData } from '@/hooks/useInitializeData';

/**
 * Component wrapper that initializes app data
 * This component should be rendered inside BrowserRouter
 */
export const AppInitializer = ({ children }: { children: React.ReactNode }) => {
  useInitializeData();
  return <>{children}</>;
};
