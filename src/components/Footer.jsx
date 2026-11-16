import { Link } from 'react-router-dom';
import { assets, footerLinks } from '../assets/assets';
import { site, whatsappLink } from '../config';

const Footer = () => {
  const follow = [...site.social];
  if (site.whatsapp) follow.push({ text: 'WhatsApp', url: whatsappLink() });
  if (site.email) follow.push({ text: 'Email', url: `mailto:${site.email}` });
  const sections = follow.length ? [...footerLinks, { title: 'Follow Us', links: follow, external: true }] : footerLinks;

  return (
    <footer className="px-6 md:px-16 lg:px-24 xl:px-32 mt-24 bg-primary/10">
      <div className="flex flex-col md:flex-row items-start justify-between gap-10 py-10 border-b border-gray-500/30 text-gray-500">
        <div>
          <img className="w-34 md:w-32" src={assets.logo} alt="GreenCart" />
          <p className="max-w-[410px] mt-6">
            We deliver fresh groceries and snacks straight to your doorstep. Simple, affordable shopping with cash on delivery.
          </p>
        </div>
        <div className="flex flex-wrap justify-between w-full md:w-[50%] gap-5">
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-base text-gray-900 md:mb-5 mb-2">{section.title}</h3>
              <ul className="text-sm space-y-1">
                {section.links.map((link) => (
                  <li key={link.text}>
                    {section.external ? (
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:underline transition">{link.text}</a>
                    ) : (
                      <Link to={link.url} className="hover:underline transition">{link.text}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <p className="py-4 text-center text-sm md:text-base text-gray-500/80">
        Copyright {new Date().getFullYear()} © {site.name}. All Rights Reserved.
      </p>
    </footer>
  );
};

export default Footer;
