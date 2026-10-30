import { Link } from 'react-router-dom';

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-[#09090d]/95 backdrop-blur border-b border-[#121212]">
      <nav className="px-4 lg:px-6 py-3">
        <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold tracking-tight text-white">COREXIS</span>
          </Link>

          <div className="flex items-center lg:order-2">
            <Link
              to="/login"
              className="text-gray-300 focus:ring-0 font-medium rounded-lg text-sm px-4 py-2 lg:px-5 lg:py-2.5 mr-2 hover:text-white transition duration-200"
            >
              Client Area
            </Link>
            <Link
              to="/login"
              className="text-white focus:ring-0 font-medium rounded-lg text-sm px-4 py-2 lg:px-5 lg:py-2.5 bg-blue-700 hover:opacity-50 transition duration-200"
            >
              Sign In
            </Link>
          </div>

          <div className="hidden justify-between items-center w-full lg:flex lg:w-auto lg:order-1">
            <ul className="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0">
              <li>
                <Link to="/" className="block py-2 pr-4 pl-3 lg:p-0 text-gray-400 hover:text-white transition duration-200">
                  Home
                </Link>
              </li>
              <li>
                <a href="/#features" className="block py-2 pr-4 pl-3 lg:p-0 text-gray-400 hover:text-white transition duration-200">
                  Features
                </a>
              </li>
              <li>
                <a href="/#pricing" className="block py-2 pr-4 pl-3 lg:p-0 text-gray-400 hover:text-white transition duration-200">
                  Plans
                </a>
              </li>
              <li>
                <a href="/#faq" className="block py-2 pr-4 pl-3 lg:p-0 text-gray-400 hover:text-white transition duration-200">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}
