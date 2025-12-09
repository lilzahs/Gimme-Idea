'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { LoadingLightbulb } from '@/components/LoadingLightbulb';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          router.push('/home');
          return;
        }

        // Redirect to idea page after successful login
        // The AuthContext will handle showing the wallet popup if needed
        router.push('/idea');
      } catch (err) {
        console.error('Auth callback error:', err);
        router.push('/home');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <LoadingLightbulb text="Signing in..." />
    </div>
  );
}
