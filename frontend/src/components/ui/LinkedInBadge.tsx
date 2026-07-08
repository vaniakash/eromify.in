"use client";

import { useEffect, useRef } from "react";

export function LinkedInBadge() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // LinkedIn script needs to be re-evaluated when the component mounts 
    // especially during client-side navigation in Next.js
    const script = document.createElement("script");
    script.src = "https://platform.linkedin.com/badges/js/profile.js";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      // Clean up the script when the component unmounts
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full flex justify-center md:justify-end">
      <div 
        className="badge-base LI-profile-badge" 
        data-locale="en_US" 
        data-size="medium" 
        data-theme="dark" 
        data-type="VERTICAL" 
        data-vanity="akash-rana-24478421b" 
        data-version="v1"
      >
        <a 
          className="badge-base__link LI-simple-link" 
          href="https://in.linkedin.com/in/akash-rana-24478421b?trk=profile-badge"
        >
          Akash Rana
        </a>
      </div>
    </div>
  );
}
