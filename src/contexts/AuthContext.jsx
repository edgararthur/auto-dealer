import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../../shared/supabase/supabaseClient.js';
import { logError } from '../../shared/utils/errorLogger';

// Add console logging to check if imports are working (development only)
if (process.env.NODE_ENV === 'development') {
    console.log('Buyer AuthContext: Imports loaded', { 
    hasSupabase: !!supabase, 
    hasSupabaseAuth: !!(supabase && supabase.auth),
    logError: !!logError
  });
}

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
          if (process.env.NODE_ENV === 'development') {
            console.log('Buyer AuthContext: Starting initialization');
        }
        setLoading(true);
        
        // Get current session
        if (!supabase || !supabase.auth) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Buyer AuthContext: Supabase or supabase.auth is undefined');
          }
          setError('Authentication service unavailable');
          setLoading(false);
          return;
        }
        
          if (process.env.NODE_ENV === 'development') {
            console.log('Buyer AuthContext: Getting session');
        }
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
          if (process.env.NODE_ENV === 'development') {
            console.log('Buyer AuthContext: Session result', { 
            hasSession: !!currentSession, 
            error: sessionError ? sessionError.message : null 
          });
        }
        
        if (sessionError) {
          throw sessionError;
        }

        setSession(currentSession);
        
        // If we have a session, get user profile
        if (currentSession) {
            if (process.env.NODE_ENV === 'development') {
              console.log('Buyer AuthContext: Getting user profile');
          }
          
          // First try to get profile by user ID
          let { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentSession.user.id)
            .maybeSingle(); // Use maybeSingle() instead of single()
            
            if (process.env.NODE_ENV === 'development') {
              console.log('Buyer AuthContext: Profile result', { 
              hasProfile: !!profile, 
              error: profileError ? profileError.message : null 
            });
          }
            
          // If no profile found by ID, try to find by email
          if (!profile && !profileError && currentSession.user.email) {
              if (process.env.NODE_ENV === 'development') {
                console.log('Buyer AuthContext: Profile not found by ID, trying email lookup');
            }
            const { data: profileByEmail, error: emailError } = await supabase
              .from('profiles')
              .select('*')
              .eq('email', currentSession.user.email)
              .maybeSingle();
              
            if (profileByEmail && !emailError) {
              profile = profileByEmail;
                if (process.env.NODE_ENV === 'development') {
                  console.log('Buyer AuthContext: Found profile by email');
              }
            } else if (emailError) {
              if (process.env.NODE_ENV === 'development') {
                console.error('Buyer AuthContext: Error finding profile by email:', emailError);
              }
            }
          }
          
          // If still no profile found, create a basic one for buyer
          if (!profile && !profileError) {
              if (process.env.NODE_ENV === 'development') {
                console.log('Buyer AuthContext: No profile found, creating basic buyer profile');
            }
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
                if (process.env.NODE_ENV === 'development') {
                  console.error('Buyer AuthContext: Error creating profile:', createError);
                }
                // Continue without profile if creation fails
              } else {
                profile = newProfile;
                  if (process.env.NODE_ENV === 'development') {
                    console.log('Buyer AuthContext: Created new buyer profile');
                }
              }
            } catch (createErr) {
              if (process.env.NODE_ENV === 'development') {
                console.error('Buyer AuthContext: Exception creating profile:', createErr);
              }
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
            if (process.env.NODE_ENV === 'development') {
              console.log('Buyer AuthContext: User set successfully');
          }
        } else {
            if (process.env.NODE_ENV === 'development') {
              console.log('Buyer AuthContext: No session found, user not authenticated');
          }
        }
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Buyer AuthContext: Initialization error', err.message, err.stack);
        }
        logError('AuthContext.initializeAuth', err);
        setError(err.message || 'Failed to initialize authentication');
      } finally {
          if (process.env.NODE_ENV === 'development') {
            console.log('Buyer AuthContext: Finished initialization, setting loading to false');
        }
        setLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state change subscription
    if (!supabase || !supabase.auth) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Buyer AuthContext: Supabase or supabase.auth is undefined when setting up subscription');
      }
      return () => {}; // Return empty cleanup function
    }

      if (process.env.NODE_ENV === 'development') {
        console.log('Buyer AuthContext: Setting up auth state change subscription');
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('Buyer AuthContext: Auth state change', { event, hasSession: !!newSession });
      }
      setSession(newSession);
      
      if (event === 'SIGNED_IN' && newSession) {
        // Get user profile on sign in
          if (process.env.NODE_ENV === 'development') {
            console.log('Buyer AuthContext: Getting profile after sign in');
        }
        
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
          if (process.env.NODE_ENV === 'development') {
            console.error('Buyer AuthContext: Error getting profile after sign in', profileError);
          }
          return;
        }
          
        setUser({
          ...newSession.user,
          profile
        });
          if (process.env.NODE_ENV === 'development') {
            console.log('Buyer AuthContext: User set after sign in');
        }
      } else if (event === 'SIGNED_OUT') {
          if (process.env.NODE_ENV === 'development') {
            console.log('Buyer AuthContext: User signed out');
        }
        setUser(null);
      }
    });

    // Clean up subscription
    return () => {
        if (process.env.NODE_ENV === 'development') {
          console.log('Buyer AuthContext: Cleanup subscription');
      }
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
        message: 'Password reset email sent successfully'
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
        return { success: false, error: 'User not authenticated' };
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id)
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      // Update user state with new profile data
      setUser({
        ...user,
        profile: data
      });
      
      return {
        success: true,
        profile: data,
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

  // Update email
  const updateEmail = async (newEmail, password) => {
    try {
      setError(null);
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }
      
      if (!newEmail || !password) {
        return { success: false, error: 'New email and password are required' };
      }
      
      const { error } = await supabase.auth.updateUser({
        email: newEmail,
        password: password
      });
      
      if (error) {
        throw error;
      }
      
      return {
        success: true,
        message: 'Email update requested. Please check your new email for confirmation.'
      };
    } catch (err) {
      logError('AuthContext.updateEmail', err);
      return {
        success: false,
        error: err.message
      };
    }
  };

  // Update password
  const updatePassword = async (currentPassword, newPassword) => {
    try {
      setError(null);
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }
      
      if (!currentPassword || !newPassword) {
        return { success: false, error: 'Current password and new password are required' };
      }
      
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

  // Ensure buyer profile exists
  const ensureBuyerProfile = async (user) => {
    try {
      // Check if profile already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }
      
      if (existingProfile) {
        return { success: true, profile: existingProfile };
      }
      
      // Create new profile
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          full_name: user.user_metadata?.full_name || 
                     user.user_metadata?.name || 
                     user.email?.split('@')[0] || 'User',
          email: user.email,
          role: 'customer',
          created_at: new Date(),
          is_active: true
        })
        .select()
        .single();
      
      if (createError) {
        throw createError;
      }
      
      return { success: true, profile: newProfile };
    } catch (err) {
      logError('AuthContext.ensureBuyerProfile', err);
      return { success: false, error: err.message };
    }
  };

  const value = {
    user,
    session,
    loading,
    error,
    register,
    login,
    logout,
    resetPassword,
    updateProfile,
    updateEmail,
    updatePassword,
    ensureBuyerProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 