const isRunningInDiscord = () => {
  // Check if running in a browser and the specific query param exists
  if (typeof window !== 'undefined') {
    const queryParams = new URLSearchParams(window.location.search);
    return queryParams.get('frame_id') != null;
  }
  // Default to false if not running in a browser
  return false;
}

export default isRunningInDiscord;