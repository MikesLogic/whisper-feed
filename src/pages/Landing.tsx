import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const Landing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        toast({
          title: "Welcome!",
          description: "You have successfully signed in.",
        });
        navigate("/");
      } else if (event === "SIGNED_OUT") {
        toast({
          title: "Signed out",
          description: "You have been signed out.",
        });
      } else if (event === "USER_UPDATED") {
        toast({
          title: "Account updated",
          description: "Your account has been updated.",
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center text-primary mb-6">Welcome to Anomo World</h1>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#00BFB3',
                  brandAccent: '#00A89D',
                },
                radii: {
                  borderRadiusButton: '0.5rem',
                  inputBorderRadius: '0.5rem',
                }
              }
            },
            className: {
              container: 'auth-container',
              button: 'auth-button',
              input: 'auth-input',
            }
          }}
          providers={[]}
          redirectTo={window.location.origin}
          localization={{
            variables: {
              sign_in: {
                email_label: 'Email',
                password_label: 'Password',
                button_label: 'Sign in',
                loading_button_label: 'Signing in...',
                social_provider_text: 'Sign in with {{provider}}',
                link_text: "Don't have an account? Sign up",
              },
              sign_up: {
                email_label: 'Email',
                password_label: 'Password',
                button_label: 'Sign up',
                loading_button_label: 'Signing up...',
                social_provider_text: 'Sign up with {{provider}}',
                link_text: 'Already have an account? Sign in',
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default Landing;