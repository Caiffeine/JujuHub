/**
 * Utility function to reset scroll position
 * Call this function when you need to ensure the page starts at the top
 */
export const resetScroll = () => {
  window.scrollTo(0, 0);
};

/**
 * Prevents the browser from restoring previous scroll position on refresh
 * Call this in your main layout or dashboard component's useEffect
 */
export const preventScrollRestore = () => {
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }
};
