const footerLinks = {
  Product: ["Features", "Pricing", "Updates"],
  Resources: ["Docs", "Blog"],
  Company: ["About", "Contact"],
  Legal: ["Privacy", "Terms"],
};

export default function Footer() {
  return (
    <footer className="relative pt-16 pb-10 px-6" style={{ background: "hsl(216, 89%, 86%)", borderTop: "1px solid rgba(147,197,253,0.65)" }}>
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#2563eb" }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="2" width="5" height="5" rx="1" fill="white" opacity="0.9" />
                  <rect x="9" y="2" width="5" height="5" rx="1" fill="white" opacity="0.6" />
                  <rect x="2" y="9" width="5" height="5" rx="1" fill="white" opacity="0.6" />
                  <path d="M11.5 9.5 L11.5 13.5 M9.5 11.5 L13.5 11.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-blue-950">SyncSpace</span>
            </div>
            <p className="text-sm text-blue-900/70 leading-relaxed max-w-[200px]">Built for thinkers. Powered by AI.</p>
            <div className="flex items-center gap-3 mt-5">
              {[
                <svg key="x" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M12.6 2H14.8L9.9 7.6L15.7 14H11.1L7.5 9.7L3.3 14H1.1L6.3 8L0.7 2H5.4L8.7 5.9L12.6 2ZM11.9 12.7H13.1L4.6 3.3H3.3L11.9 12.7Z" fill="currentColor"/></svg>,
                <svg key="gh" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12C2 16.42 4.87 20.17 8.84 21.5C9.34 21.58 9.5 21.27 9.5 21C9.5 20.77 9.5 20.14 9.5 19.31C6.73 19.91 6.14 17.97 6.14 17.97C5.68 16.81 5.03 16.5 5.03 16.5C4.12 15.88 5.1 15.9 5.1 15.9C6.1 15.97 6.63 16.93 6.63 16.93C7.5 18.45 8.97 18 9.54 17.76C9.63 17.11 9.89 16.67 10.17 16.42C7.95 16.17 5.62 15.31 5.62 11.5C5.62 10.39 6.01 9.49 6.65 8.79C6.55 8.54 6.2 7.5 6.75 6.15C6.75 6.15 7.59 5.88 9.5 7.17C10.29 6.95 11.15 6.84 12 6.84C12.85 6.84 13.71 6.95 14.5 7.17C16.41 5.88 17.25 6.15 17.25 6.15C17.8 7.5 17.45 8.54 17.35 8.79C17.99 9.49 18.38 10.39 18.38 11.5C18.38 15.32 16.04 16.16 13.81 16.41C14.17 16.72 14.5 17.33 14.5 18.26C14.5 19.6 14.5 20.68 14.5 21C14.5 21.27 14.66 21.59 15.17 21.5C19.14 20.16 22 16.42 22 12C22 6.48 17.52 2 12 2Z" fill="currentColor"/></svg>,
                <svg key="li" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="4" cy="4" r="2" stroke="currentColor" strokeWidth="1.8"/></svg>,
              ].map((icon, i) => (
                <a key={i} href="#" className="text-blue-900/55 hover:text-blue-900 transition-colors duration-200">
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <p className="text-xs font-semibold tracking-widest uppercase text-blue-900/60 mb-4">{group}</p>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-blue-900/70 hover:text-blue-950 transition-colors duration-200">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      </div>
    </footer>
  );
}
