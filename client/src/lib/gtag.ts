declare global {
  interface Window {
    gtag: (event: string, action: string, options: Record<string, any>) => void;
  }
}

export const GA_TRACKING_ID = 'G-TB0SDCXYQY'

export const pageview = (url: string): void => {
  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  });
};

export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label: string;
  value: string;
}): void => {
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};
