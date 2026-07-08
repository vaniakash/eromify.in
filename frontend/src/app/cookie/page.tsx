"use client";

import { useEffect, useState } from "react";
import { Info, HelpCircle, Settings2, Cookie, Globe, RefreshCcw, Mail, MessageSquare, TerminalSquare } from "lucide-react";

export default function CookiePolicyPage() {
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("section[id]");
      let current = "";
      sections.forEach((section) => {
        const sectionTop = (section as HTMLElement).offsetTop;
        if (window.scrollY >= sectionTop - 120) {
          current = section.getAttribute("id") || "";
        }
      });
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { id: "intro", label: "Overview" },
    { id: "what-are-cookies", label: "1. What Are Cookies" },
    { id: "how-we-use", label: "2. How We Use Cookies" },
    { id: "types", label: "3. Types of Cookies" },
    { id: "third-party", label: "4. Third-Party Cookies" },
    { id: "updates", label: "5. Updates" },
    { id: "contact", label: "6. Contact Information" },
  ];

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100,
        behavior: "smooth",
      });
    }
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 font-sans transition-colors duration-200">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Navigation */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24">
              <nav className="space-y-1">
                <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                  On this page
                </p>
                {navLinks.map((link) => (
                  <a
                    key={link.id}
                    href={`#${link.id}`}
                    onClick={(e) => scrollToSection(e, link.id)}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeSection === link.id || (activeSection === "" && link.id === "intro")
                        ? "text-[#1736cf] bg-[#1736cf]/10 border-l-2 border-[#1736cf]"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 max-w-3xl">
            {/* Mobile Dropdown */}
            <div className="lg:hidden mb-8">
              <label
                className="block text-sm font-medium text-slate-700 mb-2"
                htmlFor="toc-select"
              >
                Jump to section
              </label>
              <select
                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-[#1736cf] focus:ring-[#1736cf] text-sm"
                id="toc-select"
                onChange={handleSelectChange}
                value={activeSection || "intro"}
              >
                {navLinks.map((link) => (
                  <option key={link.id} value={link.id}>
                    {link.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Page Header */}
            <div className="mb-12" id="intro">
              <nav aria-label="Breadcrumb" className="flex mb-4">
                <ol className="inline-flex items-center space-x-1 md:space-x-3 text-xs font-medium text-slate-500">
                  <li>Legal</li>
                  <li>
                    <span className="mx-1 text-[10px]">&gt;</span>
                  </li>
                  <li className="text-[#1736cf]">Cookie Policy</li>
                </ol>
              </nav>
              <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight sm:text-5xl">
                Cookie Policy
              </h1>
              <p className="text-slate-500">Last updated: March 13, 2026</p>

              <div className="mt-8 p-6 bg-[#1736cf]/5 border border-[#1736cf]/20 rounded-xl">
                <div className="flex gap-4">
                  <Info className="text-[#1736cf] shrink-0 h-6 w-6" />
                  <div className="space-y-2">
                    <h3 className="font-bold text-slate-900">
                      Privacy is our priority
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      This Cookie Policy explains how Eromify uses cookies and
                      similar technologies to recognize you when you visit our
                      website. It explains what these technologies are and why we
                      use them, as well as your rights to control our use of them.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 1 */}
            <section className="mb-16 scroll-mt-24" id="what-are-cookies">
              <div className="flex items-center gap-3 mb-4">
                <HelpCircle className="text-slate-400 h-6 w-6" />
                <h2 className="text-2xl font-bold text-slate-900">
                  1. What Are Cookies
                </h2>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-slate-600 leading-relaxed">
                  Cookies are small data files that are placed on your computer or
                  mobile device when you visit a website. Cookies are widely used by
                  website owners in order to make their websites work, or to work
                  more efficiently, as well as to provide reporting information.
                </p>
                <p className="mt-4 text-slate-600 leading-relaxed">
                  Cookies set by the website owner (in this case, Eromify) are
                  called &quot;first-party cookies&quot;. Cookies set by parties other than
                  the website owner are called &quot;third-party cookies&quot;.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section className="mb-16 scroll-mt-24" id="how-we-use">
              <div className="flex items-center gap-3 mb-4">
                <Settings2 className="text-slate-400 h-6 w-6" />
                <h2 className="text-2xl font-bold text-slate-900">
                  2. How We Use Cookies
                </h2>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-slate-600 leading-relaxed mb-4">
                  We use first-party and third-party cookies for several reasons.
                  Some cookies are required for technical reasons in order for our
                  Website to operate, and we refer to these as &quot;essential&quot; or
                  &quot;strictly necessary&quot; cookies. Other cookies also enable us to
                  track and target the interests of our users to enhance the
                  experience on our Online Properties.
                </p>
                <ul className="space-y-3">
                  <li className="flex gap-3 text-sm text-slate-600">
                    <svg className="text-[#1736cf] shrink-0 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><path d="m9 11 3 3L22 4"></path></svg>
                    To personalize your experience and remember your preferences.
                  </li>
                  <li className="flex gap-3 text-sm text-slate-600">
                    <svg className="text-[#1736cf] shrink-0 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><path d="m9 11 3 3L22 4"></path></svg>
                    To analyze how our services are used so we can improve them.
                  </li>
                  <li className="flex gap-3 text-sm text-slate-600">
                    <svg className="text-[#1736cf] shrink-0 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><path d="m9 11 3 3L22 4"></path></svg>
                    To help with security and fraud detection.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section className="mb-16 scroll-mt-24" id="types">
              <div className="flex items-center gap-3 mb-4">
                <Cookie className="text-slate-400 h-6 w-6" />
                <h2 className="text-2xl font-bold text-slate-900">
                  3. Types of Cookies
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="p-4 bg-white border border-slate-200 rounded-xl">
                  <div className="text-[#1736cf] mb-2 font-bold text-lg">🛡️</div>
                  <h4 className="font-bold text-slate-900 text-sm">Essential</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Required for core functionality.
                  </p>
                </div>
                <div className="p-4 bg-white border border-slate-200 rounded-xl">
                  <div className="text-blue-500 mb-2 font-bold text-lg">📊</div>
                  <h4 className="font-bold text-slate-900 text-sm">Analytics</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Helps us understand usage.
                  </p>
                </div>
                <div className="p-4 bg-white border border-slate-200 rounded-xl">
                  <div className="text-green-500 mb-2 font-bold text-lg">⚙️</div>
                  <h4 className="font-bold text-slate-900 text-sm">Preference</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Remembers your settings.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Cookie Name
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Purpose
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Duration
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                          _eromify_session
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          Maintains active session security
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          Session
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                          _ga_analytics
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          Tracks site performance metrics
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          2 years
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                          pref_theme
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          Saves dark/light mode preference
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          1 year
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Note: Section 4 (Managing Cookies) was removed based on user request. Numbering shifted. */}

            {/* Section 4  (was 5) */}
            <section className="mb-16 scroll-mt-24" id="third-party">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="text-slate-400 h-6 w-6" />
                <h2 className="text-2xl font-bold text-slate-900">
                  4. Third-Party Cookies
                </h2>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-slate-600 leading-relaxed">
                  In some special cases we also use cookies provided by trusted
                  third parties. The following section details which third party
                  cookies you might encounter through this site.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600">
                    Google Analytics
                  </span>
                  <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600">
                    Stripe Payments
                  </span>
                  <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600">
                    Intercom Support
                  </span>
                  <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600">
                    HubSpot CRM
                  </span>
                </div>
              </div>
            </section>

            {/* Section 5 (was 6) */}
            <section className="mb-16 scroll-mt-24" id="updates">
              <div className="flex items-center gap-3 mb-4">
                <RefreshCcw className="text-slate-400 h-6 w-6" />
                <h2 className="text-2xl font-bold text-slate-900">
                  5. Updates to Cookie Policy
                </h2>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-slate-600 leading-relaxed">
                  We may update this Cookie Policy from time to time in order to
                  reflect, for example, changes to the cookies we use or for other
                  operational, legal or regulatory reasons. Please therefore
                  re-visit this Cookie Policy regularly to stay informed about our
                  use of cookies and related technologies.
                </p>
              </div>
            </section>

            {/* Section 6 (was 7) */}
            <section className="mb-16 scroll-mt-24" id="contact">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="text-slate-400 h-6 w-6" />
                <h2 className="text-2xl font-bold text-slate-900">
                  6. Contact Information
                </h2>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-slate-600 mb-6">
                  If you have any questions about our use of cookies or other
                  technologies, please email us at:
                </p>
                <a
                  className="inline-flex items-center gap-2 text-[#1736cf] font-semibold hover:underline"
                  href="mailto:eromify.in@gmail.com"
                >
                  eromify.in@gmail.com
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                </a>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
