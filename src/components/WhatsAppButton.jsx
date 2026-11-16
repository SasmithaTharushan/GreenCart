import { whatsappLink } from '../config';
import { track } from '../lib/analytics';

const WhatsAppButton = () => {
  const href = whatsappLink('Hi GreenCart! I have a question about my order.');
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      onClick={() => track('contact', { method: 'whatsapp' })}
      className="fixed bottom-5 right-5 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] shadow-lg hover:scale-105 transition"
    >
      <svg viewBox="0 0 32 32" width="30" height="30" fill="#fff" aria-hidden="true">
        <path d="M16.04 3C9.4 3 4 8.36 4 14.97c0 2.11.56 4.17 1.62 5.99L4 29l8.27-2.16a12.1 12.1 0 0 0 3.77.6C22.67 27.44 28 22.08 28 15.47 28 8.86 22.67 3 16.04 3Zm0 22.2c-1.2 0-2.38-.2-3.5-.6l-.25-.09-4.9 1.28 1.31-4.76-.16-.26a9.86 9.86 0 0 1-1.51-5.3c0-5.48 4.48-9.94 9.99-9.94 5.5 0 9.99 4.95 9.99 10.43 0 5.48-4.48 9.24-8.97 9.24Zm5.47-7.43c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.76-1.66-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.57-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.48.71.31 1.27.49 1.7.63.71.23 1.36.2 1.88.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z" />
      </svg>
    </a>
  );
};

export default WhatsAppButton;
