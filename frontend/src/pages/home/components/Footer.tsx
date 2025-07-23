

const nav = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'API Documentation', href: '#' },
  ],
  Company: [
    { label: 'About Us', href: '#about' },
    { label: 'Careers', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Press Kit', href: '#' },
  ],
  Support: [
    { label: 'Help Center', href: '#' },
    { label: 'Contact Support', href: '#' },
    { label: 'System Status', href: '#' },
    { label: 'Security', href: '#security' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
    { label: 'Data Processing Agreement', href: '#' },
  ],
};

const Footer = () => (
  <footer className="bg-gray-50 border-t border-gray-200 mt-16">
    <div className="max-w-6xl mx-auto py-12 px-8 grid grid-cols-1 md:grid-cols-5 gap-10">
      <div className="md:col-span-2 flex flex-col gap-4">
        <div className="text-2xl font-bold text-violet-800">DevProposals.com</div>
        <div className="text-gray-700 text-sm">AI-Powered Proposal Analysis for Development Projects</div>
        <div className="text-gray-700 text-sm mt-2">
          Email: <a href="mailto:hello@devproposals.com" className="text-violet-700 underline">hello@devproposals.com</a><br/>
          Support: <a href="mailto:support@devproposals.com" className="text-violet-700 underline">support@devproposals.com</a><br/>
          Address: [Company Address]
        </div>
      </div>
      {Object.entries(nav).map(([section, links]) => (
        <div key={section}>
          <div className="font-bold text-violet-700 mb-2">{section}</div>
          <ul className="space-y-1">
            {links.map((l) => (
              <li key={l.label}><a href={l.href} className="text-gray-700 hover:text-violet-700 transition text-sm">{l.label}</a></li>
            ))}
          </ul>
        </div>
      ))}
    </div>
    <div className="text-center text-gray-500 text-xs py-4 border-t border-gray-100">© 2024 DevProposals.com. All rights reserved.</div>
  </footer>
);

export default Footer; 