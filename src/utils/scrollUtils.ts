export const preventScrollOnClick = (callback: () => void, shouldScrollToTop: boolean = false) => {
  // Prevent focus and maintain scroll position
  const activeElement = document.activeElement as HTMLElement;
  if (activeElement) {
    activeElement.blur();
  }

  // Temporarily disable scrolling
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';

  // Execute the callback
  callback();

  // Re-enable scrolling and handle scroll position
  requestAnimationFrame(() => {
    document.body.style.overflow = 'unset';
    document.documentElement.style.overflow = 'unset';
    
    if (shouldScrollToTop) {
      // Force scroll to top of the page
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
    }
  });
}; 
