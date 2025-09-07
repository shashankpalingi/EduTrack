import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import SignInCard2 from '../components/ui/sign-in-card-2';
import SignUpCard2 from '../components/ui/sign-up-card-2';
import { useToast } from '../components/ui/use-toast';

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [role] = useState('student');
  const [tab, setTab] = useState<'login' | 'register'>('login');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: role, // Store the role in user metadata
          },
        },
      });

      if (error) throw error;
      
      // If successful, show success message
      toast({
        title: 'Account created!',
        description: 'Please check your email for the confirmation link.',
      });
      
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const userRole = data.user?.user_metadata?.role || 'student';
      toast({ title: 'Welcome back!', description: `Signed in as ${userRole}` });
      navigate(userRole === 'teacher' ? '/teacher-dashboard' : '/student-dashboard');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* Back button to landing page */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 z-50 px-3 py-1 rounded-md text-sm bg-white/10 text-white border border-white/20 hover:bg-white/20"
      >
        Back
      </button>

      {/* Switch between Login/Register - centered above the card */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex gap-2">
        <button
          onClick={() => setTab('login')}
          className={`px-3 py-1 rounded-md text-sm ${tab === 'login' ? 'bg-white text-black' : 'bg-white/10 text-white border border-white/20'}`}
        >
          Login
        </button>
        <button
          onClick={() => setTab('register')}
          className={`px-3 py-1 rounded-md text-sm ${tab === 'register' ? 'bg-white text-black' : 'bg-white/10 text-white border border-white/20'}`}
        >
          Register
        </button>
      </div>

      {tab === 'login' ? (
        <SignInCard2 onSubmit={handleSignIn} isLoading={loading} />
      ) : (
        <SignUpCard2
          onSubmit={async (email, password, selectedRole) => {
            setLoading(true);
            try {
              const { error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { role: selectedRole } },
              });
              if (error) throw error;
              toast({ title: 'Account created!', description: 'Please check your email for the confirmation link.' });
              setTab('login');
            } catch (error: any) {
              toast({ title: 'Error', description: error.message, variant: 'destructive' });
            } finally {
              setLoading(false);
            }
          }}
          isLoading={loading}
        />
      )}
    </div>
  );
};

export default Auth;