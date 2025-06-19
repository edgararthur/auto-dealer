import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../../shared/supabase/supabaseClient';
import { logError } from '../../shared/utils/errorLogger';

// Add console logging to check if imports are working
console.log('Buyer AuthContext: Imports loaded', { 
  hasSupabase: !!supabase, 
  hasSupabaseAuth: !!(supabase && supabase.auth),
  logError: !!logError
});

// Create context
const AuthContext = createContext(null);

// Auth provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth on component mount
  useEffect(() => {
    // Get current session and set up auth state
    const initializeAuth = async () => {
      try {
        console.log('Buyer AuthContext: Starting initialization');
        setLoading(true);
        
        // Get current session
        if (!supabase || !supabase.auth) {
          console.error('Buyer AuthContext: Supabase or supabase.auth is undefined');
          setError('Authentication service unavailable');
          setLoading(false);
          return;
        }
        
        console.log('Buyer AuthContext: Getting session');
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        console.log('Buyer AuthContext: Session result', { 
          hasSession: !!currentSession, 
          error: sessionError ? sessionError.message : null 
        });
        
        if (sessionError) {
          throw sessionError;
        }

        setSession(currentSession);
        
        // If we have a session, get user profile
        if (currentSession) {
          console.log('Buyer AuthContext: Getting user profile');
          
          // First try to get profile by user ID
          let { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentSession.user.id)
            .maybeSingle(); // Use maybeSingle() instead of single()
            
          console.log('Buyer AuthContext: Profile result', { 
            hasProfile: !!profile, 
            error: profileError ? profileError.message : null 
          });
            
          // If no profile found by ID, try to find by email
          if (!profile && !profileError && currentSession.user.email) {
            console.log('Buyer AuthContext: Profile not found by ID, trying email lookup');
            const { data: profileByEmail, error: emailError } = await supabase
              .from('profiles')
              .select('*')
              .eq('email', currentSession.user.email)
              .maybeSingle();
              
            if (profileByEmail && !emailError) {
              profile = profileByEmail;
              console.log('Buyer AuthContext: Found profile by email');
            } else if (emailError) {
              console.error('Buyer AuthContext: Error finding profile by email:', emailError);
            }
          }
          
          // If still no profile found, create a basic one for buyer
          if (!profile && !profileError) {
            console.log('Buyer AuthContext: No profile found, creating basic buyer profile');
            try {
              const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert({
                  id: currentSession.user.id,
                  full_name: currentSession.user.user_metadata?.full_name || 
                             currentSession.user.user_metadata?.name || 
                             currentSession.user.email?.split('@')[0] || 'User',
                  email: currentSession.user.email,
                  role: 'customer', // Use 'customer' instead of 'BUYER' to match schema
                  created_at: new Date(),
                  is_active: true
                })
                .select()
                .single();
                
              if (createError) {
                console.error('Buyer AuthContext: Error creating profile:', createError);
                // Continue without profile if creation fails
              } else {
                profile = newProfile;
                console.log('Buyer AuthContext: Created new buyer profile');
              }
            } catch (createErr) {
              console.error('Buyer AuthContext: Exception creating profile:', createErr);
            }
          }
          
          if (profileError && profileError.code !== 'PGRST116') {
            // Only throw if it's not a "no rows found" error
            throw profileError;
          }
          
          setUser({
            ...currentSession.user,
            profile
          });
          console.log('Buyer AuthContext: User set successfully');
        } else {
          console.log('Buyer AuthContext: No session found, user not authenticated');
        }
      } catch (err) {
        console.error('Buyer AuthContext: Initialization error', err.message, err.stack);
        logError('AuthContext.initializeAuth', err);
        setError(err.message || 'Failed to initialize authentication');
      } finally {
        console.log('Buyer AuthContext: Finished initialization, setting loading to false');
        setLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state change subscription
    if (!supabase || !supabase.auth) {
      console.error('Buyer AuthContext: Supabase or supabase.auth is undefined when setting up subscription');
      return () => {}; // Return empty cleanup function
    }

    console.log('Buyer AuthContext: Setting up auth state change subscription');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Buyer AuthContext: Auth state change', { event, hasSession: !!newSession });
      setSession(newSession);
      
      if (event === 'SIGNED_IN' && newSession) {
        // Get user profile on sign in
        console.log('Buyer AuthContext: Getting profile after sign in');
        
        // Try getting profile by ID first
        let { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', newSession.user.id)
          .maybeSingle(); // Use maybeSingle() instead of single()
        
        // If no profile found by ID, try by email
        if (!profile && !profileError && newSession.user.email) {
          const { data: profileByEmail, error: emailError } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', newSession.user.email)
            .maybeSingle();
            
          if (profileByEmail && !emailError) {
            profile = profileByEmail;
          }
        }
        
        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Buyer AuthContext: Error getting profile after sign in', profileError);
          return;
        }
          
        setUser({
          ...newSession.user,
          profile
        });
        console.log('Buyer AuthContext: User set after sign in');
      } else if (event === 'SIGNED_OUT') {
        console.log('Buyer AuthContext: User signed out');
        setUser(null);
      }
    });

    // Clean up subscription
    return () => {
      console.log('Buyer AuthContext: Cleanup subscription');
      subscription?.unsubscribe();
    };
  }, []);

  // Register a new user (buyer)
  const register = async (userData) => {
    try {
      setError(null);
      
      // Handle both 'name' and 'full_name' for backward compatibility
      const fullName = userData.full_name || userData.name;
      
      // Validate required fields
      if (!userData.email || !userData.password || !fullName) {
        return { success: false, error: 'Email, password and name are required' };
      }
      
      // Register user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: fullName,
            role: 'customer' // Always customer for this signup flow
          }
        }
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        return { 
          success: false, 
          error: 'Registration failed. Please try again.' 
        };
      }
      
      // Create profile record in the profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          full_name: fullName,
          email: userData.email,
          role: 'customer',
          created_at: new Date(),
          is_active: true
        });

      if (profileError) {
        throw profileError;
      }
      
      return {
        success: true,
        user: authData.user,
        message: 'Registration successful! Please check your email for verification.'
      };
    } catch (err) {
      logError('AuthContext.register', err);
      return {
        success: false,
        error: err.message
      };
    }
  };

  // Sign in user
  const login = async (email, password) => {
    try {
      setError(null);
      
      if (!email || !password) {
        return { success: false, error: 'Email and password are required' };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }
      
      // Get user profile - try by ID first
      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle(); // Use maybeSingle() instead of single()
      
      // If no profile found by ID, try by email
      if (!profile && !profileError && data.user.email) {
        const { data: profileByEmail, error: emailError } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', data.user.email)
          .maybeSingle();
          
        if (profileByEmail && !emailError) {
          profile = profileByEmail;
        }
      }
      
      // If still no profile, create one for the buyer
      if (!profile && !profileError) {
                 try {
           const { data: newProfile, error: createError } = await supabase
             .from('profiles')
             .insert({
               id: data.user.id,
               full_name: data.user.user_metadata?.full_name || 
                          data.user.user_metadata?.name || 
                          data.user.email?.split('@')[0] || 'User',
               email: data.user.email,
               role: 'customer',
               created_at: new Date(),
               is_active: true
             })
             .select()
             .single();
            
          if (!createError) {
            profile = newProfile;
          }
        } catch (createErr) {
          console.error('Login: Error creating profile:', createErr);
        }
      }
        
      if (profileError && profileError.code !== 'PGRST116') {
        // Only throw if it's not a "no rows found" error
        throw profileError;
      }
      
      // Check if this is a buyer account (only if we have a profile)
      if (profile && profile.role !== 'customer') {
        // Sign out if not a customer/buyer
        await supabase.auth.signOut();
        return { 
          success: false, 
          error: 'This is not a buyer account. Please use the appropriate login page.' 
        };
      }
      
      // Set user state with profile data
      setUser({
        ...data.user,
        profile
      });
      
      setSession(data.session);
      
      return {
        success: true,
        user: {
          ...data.user,
          profile
        },
        session: data.session
      };
    } catch (err) {
      logError('AuthContext.login', err);
      return {
        success: false,
        error: err.message
      };
    }
  };

  // Sign out user
  const logout = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      setUser(null);
      setSession(null);
      
      return {
        success: true,
        message: 'Logged out successfully'
      };
    } catch (err) {
      logError('AuthContext.logout', err);
      return {
        success: false,
        error: err.message
      };
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      setError(null);
      
      if (!email) {
        return { success: false, error: 'Email is required' };
      }
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) {
        throw error;
      }
      
      return {
        success: true,
        message: 'Password reset instructions sent to your email'
      };
    } catch (err) {
      logError('AuthContext.resetPassword', err);
      return {
        success: false,
        error: err.message
      };
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      setError(null);
      
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }
      
      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .update({
          ...profileData,
          updated_at: new Date()
        })
        .eq('id', user.id);
        
      if (error) {
        throw error;
      }
      
      // Get updated profile
      const { data: updatedProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle(); // Use maybeSingle() instead of single()
        
      if (fetchError && fetchError.code !== 'PGRST116') {
        // Only throw if it's not a "no rows found" error
        throw fetchError;
      }
      
      // Update user state with new profile data
      setUser({
        ...user,
        profile: updatedProfile
      });
      
      return {
        success: true,
        profile: updatedProfile,
        message: 'Profile updated successfully'
      };
    } catch (err) {
      logError('AuthContext.updateProfile', err);
      return {
        success: false,
        error: err.message
      };
    }
  };

  // Update user email
  const updateEmail = async (newEmail, password) => {
    try {
      setError(null);
      
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }
      
      // First verify password
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password
      });
      
      if (verifyError) {
        return { success: false, error: 'Incorrect password' };
      }
      
      // Update email
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      });
      
      if (error) {
        throw error;
      }
      
      return {
        success: true,
        message: 'Verification email sent to your new email address'
      };
    } catch (err) {
      logError('AuthContext.updateEmail', err);
      return {
        success: false,
        error: err.message
      };
    }
  };

  // Update user password
  const updatePassword = async (currentPassword, newPassword) => {
    try {
      setError(null);
      
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }
      
      // First verify current password
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      });
      
      if (verifyError) {
        return { success: false, error: 'Current password is incorrect' };
      }
      
      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        throw error;
      }
      
      return {
        success: true,
        message: 'Password updated successfully'
      };
    } catch (err) {
      logError('AuthContext.updatePassword', err);
      return {
        success: false,
        error: err.message
      };
    }
  };

  // Helper function to ensure buyer profile exists
  const ensureBuyerProfile = async (user) => {
    try {
      console.log('Buyer AuthContext: Ensuring buyer profile exists for user:', user.id);
      const { data, error } = await supabase.rpc('ensure_my_buyer_profile');
      
      if (error) {
        console.error('Buyer AuthContext: Error ensuring profile:', error);
        return null;
      }
      
      console.log('Buyer AuthContext: Profile ensured:', data);
      return data;
    } catch (err) {
      console.error('Buyer AuthContext: Exception ensuring profile:', err);
      return null;
    }
  };

  // Context value
  const value = {
    user,
    session,
    loading,
    error,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    resetPassword,
    updateProfile,
    updateEmail,
    updatePassword,
    ensureBuyerProfile
  };

  // Provide auth context to children components
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 