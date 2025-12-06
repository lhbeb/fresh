import React, { useState, useEffect } from 'react';

interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * ClientOnly component that prevents SSR rendering of its children.
 * Only renders children after client-side hydration is complete.
 * 
 * This prevents hydration mismatches by ensuring server renders
 * only the fallback (or null), while client renders the actual content.
 */
const ClientOnly: React.FC<ClientOnlyProps> = ({ children, fallback = null }) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // During SSR and before hydration, show fallback
  if (!hasMounted) {
    return <>{fallback}</>;
  }

  // After hydration, show actual content
  return <>{children}</>;
};

export default ClientOnly; 