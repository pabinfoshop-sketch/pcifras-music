import { Link, useNavigate } from '@tanstack/react-router';
import { Crown, Lock, Star, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';

interface PaywallProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  title?: string;
  description?: string;
  icon?: 'lock' | 'star' | 'crown';
  showCloseButton?: boolean;
  onClose?: () => void;
}

export function Paywall({
  children,
  fallback,
  title = 'Conteúdo Premium',
  description = 'Este conteúdo está disponível apenas para assinantes Premium.',
  icon = 'crown',
  showCloseButton = false,
  onClose,
}: PaywallProps) {
  const { isPremium, isLoading } = useSubscription();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setIsAuthenticated(!!data.user);
    });
  }, []);

  // Show loading state
  if (isLoading || isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-[#f5c451] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Show content if user is premium
  if (isPremium) {
    return <>{children}</>;
  }

  // Show fallback if provided and user is not authenticated
  if (fallback && !isAuthenticated) {
    return <>{fallback}</>;
  }

  const IconComponent = icon === 'lock' ? Lock : icon === 'star' ? Star : Crown;

  return (
    <div className="relative">
      {/* Blurred content behind */}
      <div className="filter blur-md pointer-events-none select-none opacity-50">
        {children}
      </div>

      {/* Paywall overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-[#12141b]/95 backdrop-blur-sm rounded-2xl border border-white/10 p-6 sm:p-8 max-w-md w-full mx-4 shadow-2xl">
          {showCloseButton && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition"
            >
              <X size={18} />
            </button>
          )}

          <div className="text-center">
            {/* Icon */}
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#f5c451]/20 to-[#d4a017]/20 flex items-center justify-center">
              <IconComponent className="w-8 h-8 text-[#f5c451]" />
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>

            {/* Description */}
            <p className="text-white/60 text-sm mb-6">{description}</p>

            {/* CTA Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => navigate({ to: '/planos' })}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#f5c451] to-[#d4a017] text-[#1a1200] text-sm font-bold hover:brightness-110 transition shadow-lg"
              >
                Assinar Premium
              </button>

              {!isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => navigate({ to: '/auth', search: { next: window.location.pathname } } as any)}
                  className="w-full py-2.5 rounded-xl border border-white/10 text-white/80 text-sm hover:bg-white/5 transition"
                >
                  Fazer login
                </button>
              ) : (
                <Link
                  to="/minha-assinatura"
                  className="block w-full py-2.5 text-center rounded-xl border border-white/10 text-white/60 text-sm hover:bg-white/5 transition"
                >
                  Ver minha assinatura
                </Link>
              )}
            </div>

            {/* Benefits reminder */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <p className="text-xs text-white/40 mb-2">Com Premium você desbloqueia:</p>
              <ul className="text-xs text-white/60 space-y-1">
                <li>✓ Músicas ilimitadas</li>
                <li>✓ Repertórios ilimitados</li>
                <li>✓ Exportar para PDF</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Simpler paywall version that shows only a teaser
 */
export function PaywallTeaser({ message }: { message?: string }) {
  const { isPremium } = useSubscription();

  if (isPremium) return null;

  return (
    <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-[#f5c451]/10 border border-[#f5c451]/20">
      <Crown className="w-4 h-4 text-[#f5c451] shrink-0" />
      <span className="text-xs text-[#f5c451]">
        {message || 'Conteúdo Premium'}
      </span>
    </div>
  );
}

/**
 * Wrapper component that conditionally renders children or a paywall
 */
interface PaywallGateProps {
  requireAuth?: boolean;
  requirePremium?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  paywallTitle?: string;
  paywallDescription?: string;
}

export function PaywallGate({
  requireAuth = false,
  requirePremium = true,
  children,
  fallback,
  paywallTitle,
  paywallDescription,
}: PaywallGateProps) {
  const { isPremium, isLoading } = useSubscription();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setIsAuthenticated(!!data.user);
    });
  }, []);

  if (isLoading || isAuthenticated === null) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-white/10 rounded w-3/4" />
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return fallback ? <>{fallback}</> : null;
  }

  if (requirePremium && !isPremium) {
    return (
      <Paywall
        title={paywallTitle}
        description={paywallDescription}
      >
        <>{children}</>
      </Paywall>
    );
  }

  return <>{children}</>;
}

/**
 * Hook to check if user can access premium content
 */
export function usePremiumAccess() {
  const { isPremium, isLoading, status, expiresAt } = useSubscription();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setIsAuthenticated(!!data.user);
    });
  }, []);

  return {
    canAccessPremium: isPremium,
    isLoading: isLoading || isAuthenticated === null,
    isAuthenticated,
    isPremium,
    status,
    expiresAt,
    requiresAuth: !isAuthenticated,
    requiresUpgrade: isAuthenticated && !isPremium,
  };
}

export default Paywall;
