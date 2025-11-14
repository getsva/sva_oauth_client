import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { tokenService } from '@/lib/api';
import { exchangeOAuthCode } from '@/lib/oauth';
import { toast } from 'sonner';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { provider } = useParams<{ provider: string }>();
  const { refreshUser } = useAuth();
  const isProcessingRef = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      // Prevent duplicate processing
      if (isProcessingRef.current) {
        console.log('OAuth callback already processing, skipping...');
        return;
      }
      isProcessingRef.current = true;
      // Check for errors first
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (error) {
        let errorMessage = 'OAuth authentication failed. Please try again.';
        
        if (error === 'access_denied' || error === 'denied') {
          errorMessage = 'OAuth authentication was cancelled.';
        } else if (errorDescription) {
          errorMessage = errorDescription;
        }
        
        toast.error(errorMessage);
        navigate('/login');
        return;
      }

      // Validate provider
      if (!provider || (provider !== 'google' && provider !== 'github')) {
        toast.error('Invalid OAuth provider.');
        navigate('/login');
        return;
      }

      // Check if tokens are in session (new secure flow)
      const sessionParam = searchParams.get('session');
      if (sessionParam === 'true') {
        try {
          // Retrieve tokens from backend session
          const sessionTokensUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api/auth'}/oauth/session-tokens/`;
          const response = await fetch(sessionTokensUrl, {
            method: 'GET',
            credentials: 'include', // Include cookies for session
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error('Failed to retrieve tokens from session');
          }

          const result = await response.json();
          
          // Store tokens
          tokenService.setTokens(result.access, result.refresh);
          
          // Store user data if provided
          if (result.user) {
            tokenService.setUser(result.user);
          }
          
          // Refresh auth context to verify tokens
          try {
            await refreshUser();
            toast.success(`Successfully logged in with ${provider}!`);
            navigate('/dashboard');
          } catch (refreshError) {
            console.error('Failed to refresh user after OAuth:', refreshError);
            toast.error('Authentication successful but failed to load user data. Please try again.');
            navigate('/login');
          }
        } catch (error: any) {
          console.error('OAuth session token retrieval error:', error);
          toast.error(error.message || 'Failed to complete login. Please try again.');
          navigate('/login');
        } finally {
          isProcessingRef.current = false;
        }
        return;
      }

      // Legacy flow: Get code and state from URL (for backward compatibility)
      const code = searchParams.get('code');
      const state = searchParams.get('state');

      console.log('OAuth callback received:', { provider, code: code ? 'present' : 'missing', state: state ? 'present' : 'missing' });

      if (!code || !state) {
        console.error('Missing OAuth parameters:', { code: !!code, state: !!state, allParams: Object.fromEntries(searchParams.entries()) });
        toast.error('Invalid OAuth callback. Missing required parameters.');
        navigate('/login');
        return;
      }

      try {
        // Exchange code for tokens via backend
        const result = await exchangeOAuthCode(provider, code, state);
        
        // Store tokens
        tokenService.setTokens(result.access, result.refresh);
        
        // Store user data if provided
        if (result.user) {
          tokenService.setUser(result.user);
        }
        
        // Refresh auth context to verify tokens
        try {
          await refreshUser();
          toast.success(`Successfully logged in with ${provider}!`);
          navigate('/dashboard');
        } catch (refreshError) {
          // If refresh fails, tokens might be invalid
          console.error('Failed to refresh user after OAuth:', refreshError);
          toast.error('Authentication successful but failed to load user data. Please try again.');
          navigate('/login');
        }
      } catch (error: any) {
        console.error('OAuth callback error:', error);
        toast.error(error.message || 'Failed to complete login. Please try again.');
        navigate('/login');
      } finally {
        isProcessingRef.current = false;
      }
    };

    handleCallback();
  }, [searchParams, navigate, refreshUser, provider]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;

