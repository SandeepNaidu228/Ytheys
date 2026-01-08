'use client';

import Link from 'next/link';
// Assuming you will replace GithubButton with a general "Get Started" or "Contact" button later
// import GithubButton from '@/components/GithubButton'; 

// NOTE: I am removing the direct import of GithubButton here as the context has changed.
// You can replace this with a component like 'GetStartedButton' or a simple <a> tag.

export default function Navbar() {

    return (
        <nav className="w-full fixed h-16 sm:px-10 px-5 bg-black/40 backdrop-blur-sm border-b border-neutral-800/50 sm:flex hidden justify-between items-center z-50">

            {/* Rebranded Company Name: Ytheys */}
            <Link href="/" className="inline-flex font-instrument items-end font-mono text-white text-[1.9rem] sm:text-[2.5rem] font-medium leading-none tracking-tight">
                <span className="text-white">Yth</span>
                <span className="text-neutral-500">eys</span>
            </Link>
            
            {/* The primary navigation structure */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center z-10 w-full sm:w-auto">
                
                {/* 🟢 NAVIGATION LINKS (Future Home for Domain/Service Tags) 
                    You can add links like: 
                    <Link href="/agencies">Find Agencies</Link>
                    <Link href="/services">Services</Link>
                */}
                <div className='z-10 sm:flex hidden flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto'>
                    
                    {/* Placeholder for "Get Started" or "Contact" button */}
                    {/* You can re-enable your GithubButton here or replace it: */}
                    {/* <GithubButton /> */}
                    
                    {/* Placeholder for the main call to action */}
                    <Link 
                        href="/auth" // Assuming /auth is now the 'Get Started' route that redirects to home
                        className="bg-neutral-900/50 hover:bg-neutral-800/70 text-white font-semibold py-2 px-4 rounded-md transition duration-200 border border-neutral-700"
                    >
                        Profile
                    </Link>

                </div>
            </div>

        </nav>
    );
}