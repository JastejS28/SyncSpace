'use client';

import { useStackApp } from "@stackframe/stack";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const app = useStackApp();
  const [isClient, setIsClient] = useState(false);

  // Prevent hydration mismatch errors in Next.js
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <div className="flex h-screen w-full bg-white">
      {/* Left Column: StackAuth Component */}
      <div className="flex w-full flex-col justify-center items-center lg:w-1/2 p-8">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-900">Login</h1>
          {/* StackAuth's pre-built, secure login widget */}
          <div className="border border-gray-200 rounded-xl p-6 shadow-sm">
            {app.urls.signIn && (
              <a 
                href={app.urls.signIn} 
                className="block w-full text-center bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors"
              >
                Continue to Sign In
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Branding (Hidden on mobile, visible on lg screens) */}
      <div className="hidden lg:flex w-1/2 bg-gray-100 flex-col justify-center items-center border-l border-gray-200">
        <div className="text-center">
          {/* Placeholder for your geometric logo from the wireframe */}
          <div className="w-64 h-48 border-2 border-black mb-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-px bg-black rotate-45 transform origin-top-left"></div>
            <div className="absolute bottom-0 right-0 w-full h-px bg-black -rotate-45 transform origin-bottom-right"></div>
            <div className="absolute top-1/2 left-0 w-full h-px bg-black"></div>
            <div className="absolute top-0 left-1/2 w-px h-full bg-black"></div>
          </div>
          <h2 className="text-4xl font-extrabold tracking-widest text-black">SYNCSPACE</h2>
        </div>
      </div>
    </div>
  );
}