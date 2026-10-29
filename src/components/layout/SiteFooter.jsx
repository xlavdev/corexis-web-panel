import { Link } from 'react-router-dom';

export default function SiteFooter() {
  return (
    <div id="footer" className="relative z-10">
      <footer className="border-t border-[#1a1a1a] bg-[#121212] py-12 mt-2">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-4">
            <div className="space-y-4">
              <Link to="/" className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white">COREXIS</span>
              </Link>
              <p className="text-gray-400">
                Secure, scalable, and game-changing authentication for your applications.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Product</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/#features" className="text-gray-400 hover:text-white transition-colors">Features</a>
                </li>
                <li>
                  <a href="/#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a>
                </li>
                <li>
                  <a href="https://docs.keyauth.cc/" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors">Documentation</a>
                </li>
                <li>
                  <a href="https://github.com/keyauth" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors">API Examples</a>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Company</h3>
              <ul className="space-y-2">
                <li>
                  <a href="https://www.trustpilot.com/review/keyauth.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors">Reviews</a>
                </li>
                <li>
                  <a href="https://keyauth.cc/blog/" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors">Blog</a>
                </li>
                <li>
                  <a href="#" aria-disabled="true" className="pointer-events-none text-gray-400 cursor-not-allowed transition-colors" tabIndex={-1}><s>Careers</s></a>
                </li>
                <li>
                  <a href="https://keyauth.tawk.help" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors">Support</a>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <a href="https://keyauth.cc/privacy/" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
                </li>
                <li>
                  <a href="https://keyauth.cc/terms/" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors">Terms</a>
                </li>
                <li>
                  <a href="https://keyauth.cc/gdpr/" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors">GDPR</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800 text-center">
            <p className="text-sm text-gray-400">
              © 2020 - {new Date().getFullYear()}{' '}
              <Link to="/" className="hover:underline">KeyAuth LLC</Link>. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
