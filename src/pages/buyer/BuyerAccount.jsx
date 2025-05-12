import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiShoppingBag, FiMapPin, FiCreditCard, FiLock, FiEdit, FiPlus, FiTrash2, FiCheck, FiX, FiChevronRight, FiSettings, FiShield, FiCalendar, FiDollarSign, FiPackage, FiBell, FiHeart, FiTruck } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from 'autoplus-shared';

const BuyerAccount = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  // Add section-specific loading states
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [securityLoading, setSecurityLoading] = useState(false);
  const [addressFormSubmitting, setAddressFormSubmitting] = useState(false);
  const [passwordFormSubmitting, setPasswordFormSubmitting] = useState(false);
  
  const [editMode, setEditMode] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  
  const { user, updateProfile } = useAuth();
  
  // User profile state
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    joinedDate: ''
  });
  
  // Edit profile state
  const [editableProfile, setEditableProfile] = useState({
    name: '',
    phone: ''
  });
  
  // Orders state
  const [orders, setOrders] = useState([]);
  
  // Addresses state
  const [addresses, setAddresses] = useState([]);
  
  // Payment methods state
  const [paymentMethods, setPaymentMethods] = useState([]);
  
  // Security state
  const [securityInfo, setSecurityInfo] = useState({
    password: '********',
    twoFactorEnabled: false
  });

  // Account stats
  const [accountStats, setAccountStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    pendingOrders: 0,
    rewardPoints: 720,
    lastLogin: new Date().toISOString(),
    lastActivity: "Updated shipping address"
  });

  // Add these new state variables
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    type: 'Home',
    address: '',
    city: '',
    state: '',
    zip: '',
    isDefault: false
  });

  // Add these state variables
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Login activity dummy data
  const [loginActivity, setLoginActivity] = useState([
    {
      id: 1,
      date: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      device: 'Chrome on MacOS',
      location: 'Accra, Ghana',
      ip: '192.168.1.1',
      status: 'success'
    },
    {
      id: 2,
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      device: 'Safari on iPhone',
      location: 'Accra, Ghana',
      ip: '192.168.1.2',
      status: 'success'
    },
    {
      id: 3,
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      device: 'Unknown Device',
      location: 'Lagos, Nigeria',
      ip: '192.168.1.3',
      status: 'failed'
    }
  ]);
  
  // Active devices dummy data
  const [activeDevices, setActiveDevices] = useState([
    {
      id: 1,
      name: 'MacBook Pro',
      lastActive: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      browser: 'Chrome 98.0.4758.102',
      os: 'macOS 12.2.1',
      location: 'Accra, Ghana',
      current: true
    },
    {
      id: 2,
      name: 'iPhone 13',
      lastActive: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      browser: 'Safari 15.4',
      os: 'iOS 15.3.1',
      location: 'Accra, Ghana',
      current: false
    }
  ]);

  // Additional profile features
  const [profileCompleteness, setProfileCompleteness] = useState(0);
  const [showProfilePicture, setShowProfilePicture] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  
  // Communication preferences
  const [communicationPrefs, setCommunicationPrefs] = useState({
    marketing: true,
    orderUpdates: true,
    promotions: false,
    newsletter: true
  });

  useEffect(() => {
    fetchUserData();
  }, [user?.id]);

  // Add tab change handler to set loading states
  useEffect(() => {
    const fetchTabData = async () => {
      try {
        // Set appropriate loading state based on the active tab
        if (activeTab === 'orders') {
          setOrdersLoading(true);
          await fetchOrders();
        } else if (activeTab === 'addresses') {
          setAddressesLoading(true);
          await fetchAddresses();
        } else if (activeTab === 'payment') {
          setPaymentLoading(true);
          await fetchPaymentMethods();
        } else if (activeTab === 'security') {
          setSecurityLoading(true);
          await fetchSecurityInfo();
        }
      } catch (error) {
        console.error(`Error loading ${activeTab} data:`, error);
        // Show error notification
        showNotification(`Failed to load ${activeTab} data. Please try again.`, 'error');
      } finally {
        // Always reset loading states no matter what
        setOrdersLoading(false);
        setAddressesLoading(false);
        setPaymentLoading(false);
        setSecurityLoading(false);
      }
    };
    
    // Only fetch if user is available
    if (user?.id) {
      fetchTabData();
    } else {
      // Reset loading states if no user
      setOrdersLoading(false);
      setAddressesLoading(false);
      setPaymentLoading(false);
      setSecurityLoading(false);
    }
  }, [activeTab, user?.id]);

  // Add specific fetch functions for each section
  const fetchOrders = async () => {
    if (!user?.id) {
      // Early return if no user, but don't set loading state here anymore
      return;
    }
    
    try {
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select(`
            id,
            created_at,
            total_amount,
            order_status,
            order_items(id)
          `)
          .eq('buyer_id', user.id)
          .order('created_at', { ascending: false });
          
        if (orderError) throw orderError;
        
        if (orderData) {
          setOrders(orderData.map(order => ({
            id: order.id,
            date: order.created_at,
            total: order.total_amount || 0,
            status: order.order_status?.toLowerCase() || 'processing',
            items: order.order_items?.length || 0
          })));
      } else {
        // Ensure we set empty array if no data
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Ensure we set empty array on error
      setOrders([]);
      throw error; // Rethrow so the tab change effect can handle it
    }
  };
  
  const fetchAddresses = async () => {
    if (!user?.id) {
      // Early return if no user, but don't set loading state here anymore
      return;
    }
    
    try {
        const { data: addressData, error: addressError } = await supabase
          .from('user_addresses')
          .select('*')
          .eq('user_id', user.id);
          
        if (addressError) throw addressError;
        
        if (addressData && addressData.length > 0) {
          setAddresses(addressData.map(addr => ({
            id: addr.id,
            type: addr.address_type || 'Home',
            default: addr.is_default || false,
            address: addr.street_address || '',
            city: addr.city || '',
            state: addr.region || '',
            zip: addr.postal_code || ''
          })));
      } else {
        // Ensure we set empty array if no data
        setAddresses([]);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      // Ensure we set empty array on error
      setAddresses([]);
      throw error; // Rethrow so the tab change effect can handle it
    }
  };
  
  const fetchPaymentMethods = async () => {
    if (!user?.id) {
      // Early return if no user, but don't set loading state here anymore
      return;
    }
    
    try {
        const { data: paymentData, error: paymentError } = await supabase
          .from('payment_methods')
          .select('*')
          .eq('user_id', user.id);
          
        if (paymentError) throw paymentError;
        
        if (paymentData && paymentData.length > 0) {
          setPaymentMethods(paymentData.map(payment => ({
            id: payment.id,
            type: payment.payment_type || 'Mobile Money',
            last4: payment.mobile_number?.slice(-4) || '****',
            brand: payment.provider || 'MoMo',
            expiry: 'N/A',
            default: payment.is_default || false
          })));
      } else {
        // Ensure we set empty array if no data
        setPaymentMethods([]);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      // Ensure we set empty array on error
      setPaymentMethods([]);
      throw error; // Rethrow so the tab change effect can handle it
    }
  };
  
  const fetchSecurityInfo = async () => {
    if (!user?.id) {
      // Early return if no user, but don't set loading state here anymore
      return;
    }
    
    try {
      // In a real app, you would fetch security settings from the backend
      // For now, just set default values immediately instead of using a timeout
      setSecurityInfo({
        password: '********',
        twoFactorEnabled: false
      });
    } catch (error) {
      console.error('Error fetching security info:', error);
      throw error; // Rethrow so the tab change effect can handle it
    }
  };

  const fetchUserData = async () => {
    setLoading(true);
    
    try {
      if (user && user.id) {
        // Set basic profile info from auth context
        setProfile({
          name: user.profile?.name || '',
          email: user.email || '',
          phone: user.profile?.phone || '',
          joinedDate: user.created_at || new Date().toISOString()
        });
        
        setEditableProfile({
          name: user.profile?.name || '',
          phone: user.profile?.phone || ''
        });
        
        // Fetch initial data for active tab only
        if (activeTab === 'orders') {
          await fetchOrders();
        } else if (activeTab === 'addresses') {
          await fetchAddresses();
        } else if (activeTab === 'payment') {
          await fetchPaymentMethods();
        } else if (activeTab === 'security') {
          await fetchSecurityInfo();
        }
      } else {
        // Reset all state if no user
        setProfile({
          name: '',
          email: '',
          phone: '',
          joinedDate: ''
        });
        setEditableProfile({
          name: '',
          phone: ''
        });
        setOrders([]);
        setAddresses([]);
        setPaymentMethods([]);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      showNotification('Failed to load your profile data. Please try again.', 'error');
    } finally {
      setLoading(false);
      // Clear all section-specific loading states as a precaution
      setOrdersLoading(false);
      setAddressesLoading(false);
      setPaymentLoading(false);
      setSecurityLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 5000);
  };

  const handleProfileEdit = () => {
    setEditMode(true);
  };

  const handleProfileSave = async () => {
    setUpdating(true);
    
    try {
      const { success, error } = await updateProfile({
        name: editableProfile.name,
        phone: editableProfile.phone
      });
      
      if (!success) {
        throw new Error(error || 'Failed to update profile');
      }
      
      // Update local state
      setProfile(prev => ({
        ...prev,
        name: editableProfile.name,
        phone: editableProfile.phone
      }));
      
      setEditMode(false);
      showNotification('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification(error.message || 'Failed to update profile', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleProfileCancel = () => {
    // Reset editable profile to current profile
    setEditableProfile({
      name: profile.name,
      phone: profile.phone
    });
    setEditMode(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Add these new functions
  const handleAddNewAddress = () => {
    setAddressForm({
      type: 'Home',
      address: '',
      city: '',
      state: '',
      zip: '',
      isDefault: false
    });
    setEditingAddress(null);
    setShowAddressForm(true);
  };

  const handleEditAddress = (address) => {
    setAddressForm({
      type: address.type,
      address: address.address,
      city: address.city,
      state: address.state,
      zip: address.zip,
      isDefault: address.default
    });
    setEditingAddress(address.id);
    setShowAddressForm(true);
  };

  const handleAddressFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddressFormSubmit = async (e) => {
    e.preventDefault();
    setAddressFormSubmitting(true);
    
    try {
      // This would be implemented with real database connectivity
      if (editingAddress) {
        // Update existing address
        showNotification('Address updated successfully');
      } else {
        // Add new address
        const newAddress = {
          id: Date.now(), // Temporary ID for demo
          type: addressForm.type,
          address: addressForm.address,
          city: addressForm.city,
          state: addressForm.state,
          zip: addressForm.zip,
          default: addressForm.isDefault
        };
        setAddresses(prev => [...prev, newAddress]);
        showNotification('New address added successfully');
      }
    } catch (error) {
      console.error('Error submitting address form:', error);
      showNotification('Failed to save address. Please try again.', 'error');
    } finally {
      setAddressFormSubmitting(false);
      setShowAddressForm(false);
    }
  };

  const handleCancelAddressForm = () => {
    setShowAddressForm(false);
    setEditingAddress(null);
  };

  const handleSetDefaultAddress = (addressId) => {
    setAddresses(prev => 
      prev.map(addr => ({
        ...addr,
        default: addr.id === addressId
      }))
    );
    showNotification('Default address updated');
  };

  const handleRemoveAddress = (addressId) => {
    setAddresses(prev => prev.filter(addr => addr.id !== addressId));
    showNotification('Address removed successfully');
  };

  // Add password form handlers
  const handlePasswordFormChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordFormSubmit = (e) => {
    e.preventDefault();
    setPasswordFormSubmitting(true);
    
    try {
      // Password validation
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        showNotification('New passwords do not match', 'error');
        return;
      }
      
      if (passwordForm.newPassword.length < 8) {
        showNotification('Password must be at least 8 characters', 'error');
        return;
      }
      
      // This would connect to actual authentication system
      showNotification('Password changed successfully');
      setShowPasswordForm(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error updating password:', error);
      showNotification('Failed to update password. Please try again.', 'error');
    } finally {
      setPasswordFormSubmitting(false);
    }
  };
  
  const handleRemoveDevice = (deviceId) => {
    setActiveDevices(prev => prev.filter(device => device.id !== deviceId));
    showNotification('Device removed successfully');
  };
  
  const calculatePasswordStrength = (password) => {
    if (!password) return 0;
    
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    
    // Character variety check
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    return Math.min(strength, 5);
  };
  
  const getPasswordStrengthLabel = (strength) => {
    switch (strength) {
      case 0: return 'Very Weak';
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Strong';
      case 5: return 'Very Strong';
      default: return 'Unknown';
    }
  };
  
  const getPasswordStrengthColor = (strength) => {
    switch (strength) {
      case 0: return 'bg-error-500';
      case 1: return 'bg-error-500';
      case 2: return 'bg-yellow-500';
      case 3: return 'bg-yellow-500';
      case 4: return 'bg-success-500';
      case 5: return 'bg-success-500';
      default: return 'bg-neutral-500';
    }
  };

  // Calculate profile completeness
  useEffect(() => {
    if (!profile) return;
    
    let completeness = 0;
    const totalFields = 5; // name, email, phone, avatar, preferences
    
    if (profile.name) completeness += 1;
    if (profile.email) completeness += 1;
    if (profile.phone) completeness += 1;
    if (profilePicture) completeness += 1;
    if (communicationPrefs) completeness += 1;
    
    setProfileCompleteness(Math.round((completeness / totalFields) * 100));
  }, [profile, profilePicture, communicationPrefs]);
  
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, you would upload the file to a server
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result);
      };
      reader.readAsDataURL(file);
      showNotification('Profile picture updated successfully');
    }
  };
  
  const handlePreferenceChange = (e) => {
    const { name, checked } = e.target;
    setCommunicationPrefs(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  return (
    <div className="bg-neutral-50 min-h-screen pb-16">
      {/* Page header */}
      <div className="bg-gradient-luxury pt-10 pb-12 px-4 sm:px-6 lg:px-8 mb-10 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-gradient-radial from-primary-500/20 to-transparent opacity-70"></div>
        <div className="absolute bottom-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto opacity-10">
            <path fill="#ffffff" fillOpacity="1" d="M0,96L34.3,106.7C68.6,117,137,139,206,149.3C274.3,160,343,160,411,149.3C480,139,549,117,617,112C685.7,107,754,117,823,138.7C891.4,160,960,192,1029,197.3C1097.1,203,1166,181,1234,160C1302.9,139,1371,117,1406,106.7L1440,96L1440,320L1405.7,320C1371.4,320,1303,320,1234,320C1165.7,320,1097,320,1029,320C960,320,891,320,823,320C754.3,320,686,320,617,320C548.6,320,480,320,411,320C342.9,320,274,320,206,320C137.1,320,69,320,34,320L0,320Z"></path>
          </svg>
        </div>
        
        <div className="max-w-7xl mx-auto relative">
          <h1 className="text-3xl md:text-4xl font-bold text-white font-display mb-3">My Account</h1>
          <p className="text-neutral-200 max-w-2xl">
            Manage your personal information, orders, addresses, and payment methods all in one place.
          </p>
        </div>
      </div>
      
      {notification.show && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <div className={`p-4 rounded-lg shadow-sm border ${
            notification.type === 'error' ? 'bg-error-50 text-error-700 border-error-200' : 'bg-success-50 text-success-700 border-success-200'
        }`}>
          {notification.message}
          </div>
        </div>
      )}
      
      {/* Account Dashboard Summary */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="bg-white rounded-xl shadow-luxury border border-neutral-100 overflow-hidden">
          <div className="p-6 border-b border-neutral-100 bg-gradient-to-r from-primary-50 to-neutral-50">
            <h2 className="text-xl font-bold text-neutral-900 font-display">Account Dashboard</h2>
            <p className="text-sm text-neutral-600 mt-1">Overview of your account activity and status</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Order Stats */}
              <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200 flex items-start space-x-4">
                <div className="rounded-full w-12 h-12 bg-primary-100 flex items-center justify-center text-primary-600">
                  <FiShoppingBag size={22} />
                </div>
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Total Orders</p>
                  <p className="text-2xl font-bold text-neutral-900">{orders.length}</p>
                  <p className="text-xs text-primary-600 mt-1 flex items-center">
                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-1"></span>
                    {accountStats.pendingOrders} orders in progress
                  </p>
                </div>
              </div>
              
              {/* Spending Stats */}
              <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200 flex items-start space-x-4">
                <div className="rounded-full w-12 h-12 bg-accent-100 flex items-center justify-center text-accent-600">
                  <FiDollarSign size={22} />
                </div>
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Total Spent</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    ${orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
                  </p>
                  <p className="text-xs text-accent-600 mt-1 flex items-center">
                    <span className="w-1.5 h-1.5 bg-accent-500 rounded-full mr-1"></span>
                    Avg. ${(orders.length ? orders.reduce((sum, order) => sum + order.total, 0) / orders.length : 0).toFixed(2)} per order
                  </p>
                </div>
              </div>
              
              {/* Rewards */}
              <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200 flex items-start space-x-4">
                <div className="rounded-full w-12 h-12 bg-gold-100 flex items-center justify-center text-gold-600">
                  <FiHeart size={22} />
                </div>
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Reward Points</p>
                  <p className="text-2xl font-bold text-neutral-900">{accountStats.rewardPoints}</p>
                  <p className="text-xs text-gold-600 mt-1 flex items-center">
                    <span className="w-1.5 h-1.5 bg-gold-500 rounded-full mr-1"></span>
                    $72 in potential savings
                  </p>
                </div>
              </div>
              
              {/* Activity */}
              <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200 flex items-start space-x-4">
                <div className="rounded-full w-12 h-12 bg-success-100 flex items-center justify-center text-success-600">
                  <FiCalendar size={22} />
                </div>
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Recent Activity</p>
                  <p className="text-sm font-medium text-neutral-900 line-clamp-1">{accountStats.lastActivity}</p>
                  <p className="text-xs text-success-600 mt-1 flex items-center">
                    <span className="w-1.5 h-1.5 bg-success-500 rounded-full mr-1"></span>
                    Last login: {formatDate(accountStats.lastLogin)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Left sidebar with tabs */}
        <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-luxury overflow-hidden border border-neutral-100">
              <div className="p-6 border-b border-neutral-100 bg-gradient-to-r from-primary-50 to-neutral-50">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-luxury flex items-center justify-center text-white shadow-luxury">
                    <FiUser size={28} />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-800">{profile.name || 'User'}</h3>
                    <p className="text-sm text-neutral-500">{profile.email}</p>
                  </div>
                </div>
              </div>
              
              <nav className="py-2">
              <button
                onClick={() => setActiveTab('profile')}
                  className={`flex items-center justify-between w-full px-6 py-3.5 text-sm font-medium transition-colors duration-200 ${
                    activeTab === 'profile' 
                      ? 'bg-primary-50 text-primary-700 border-r-4 border-primary-600' 
                      : 'text-neutral-700 hover:bg-neutral-50 hover:text-primary-600'
                  }`}
                >
                  <div className="flex items-center">
                <FiUser className="mr-3 h-5 w-5" />
                    <span>Profile</span>
                  </div>
                  {activeTab === 'profile' && <FiChevronRight size={16} />}
              </button>
              
              <button
                onClick={() => setActiveTab('orders')}
                  className={`flex items-center justify-between w-full px-6 py-3.5 text-sm font-medium transition-colors duration-200 ${
                    activeTab === 'orders' 
                      ? 'bg-primary-50 text-primary-700 border-r-4 border-primary-600' 
                      : 'text-neutral-700 hover:bg-neutral-50 hover:text-primary-600'
                  }`}
                >
                  <div className="flex items-center">
                <FiShoppingBag className="mr-3 h-5 w-5" />
                    <span>Orders</span>
                  </div>
                  {activeTab === 'orders' && <FiChevronRight size={16} />}
              </button>
              
              <button
                onClick={() => setActiveTab('addresses')}
                  className={`flex items-center justify-between w-full px-6 py-3.5 text-sm font-medium transition-colors duration-200 ${
                    activeTab === 'addresses' 
                      ? 'bg-primary-50 text-primary-700 border-r-4 border-primary-600' 
                      : 'text-neutral-700 hover:bg-neutral-50 hover:text-primary-600'
                  }`}
                >
                  <div className="flex items-center">
                <FiMapPin className="mr-3 h-5 w-5" />
                    <span>Addresses</span>
                  </div>
                  {activeTab === 'addresses' && <FiChevronRight size={16} />}
              </button>
              
              <button
                onClick={() => setActiveTab('payment')}
                  className={`flex items-center justify-between w-full px-6 py-3.5 text-sm font-medium transition-colors duration-200 ${
                    activeTab === 'payment' 
                      ? 'bg-primary-50 text-primary-700 border-r-4 border-primary-600' 
                      : 'text-neutral-700 hover:bg-neutral-50 hover:text-primary-600'
                  }`}
                >
                  <div className="flex items-center">
                <FiCreditCard className="mr-3 h-5 w-5" />
                    <span>Payment Methods</span>
                  </div>
                  {activeTab === 'payment' && <FiChevronRight size={16} />}
              </button>
              
              <button
                onClick={() => setActiveTab('security')}
                  className={`flex items-center justify-between w-full px-6 py-3.5 text-sm font-medium transition-colors duration-200 ${
                    activeTab === 'security' 
                      ? 'bg-primary-50 text-primary-700 border-r-4 border-primary-600' 
                      : 'text-neutral-700 hover:bg-neutral-50 hover:text-primary-600'
                  }`}
                >
                  <div className="flex items-center">
                <FiLock className="mr-3 h-5 w-5" />
                    <span>Security</span>
                  </div>
                  {activeTab === 'security' && <FiChevronRight size={16} />}
              </button>
            </nav>
          </div>
        </div>
        
        {/* Main content area */}
        <div className="md:col-span-3">
            {/* Only show the main loading spinner on initial page load, not for tab changes */}
            {loading ? (
              <div className="bg-white rounded-xl shadow-luxury p-12 border border-neutral-100 flex justify-center">
                <div className="animate-spin h-12 w-12 rounded-full border-t-2 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <>
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    {/* Profile completeness card */}
                    <div className="bg-white rounded-xl shadow-luxury border border-neutral-100 overflow-hidden">
                      <div className="p-6 bg-gradient-to-r from-primary-50 to-neutral-50">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-neutral-900">Profile Completeness</h3>
                          <span className="text-sm font-bold text-primary-700">{profileCompleteness}%</span>
                        </div>
                        <div className="w-full h-2 bg-neutral-200 rounded-full mt-2 overflow-hidden">
                          <div 
                            className="h-full bg-primary-600 rounded-full"
                            style={{ width: `${profileCompleteness}%` }}
                          ></div>
                        </div>
                        
                        <div className="mt-4 text-sm">
                          {profileCompleteness < 100 && (
                            <p className="text-neutral-600">
                              Complete your profile to get the most out of AutoPlus.
                            </p>
                          )}
                          
                          <div className="mt-3 flex flex-wrap gap-2">
                            {!profile.name && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
                                Add your name
                              </span>
                            )}
                            {!profile.phone && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
                                Add phone number
                              </span>
                            )}
                            {!profilePicture && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
                                Add profile picture
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Main profile info */}
                    <div className="bg-white rounded-xl shadow-luxury border border-neutral-100 overflow-hidden">
                      <div className="flex justify-between items-center p-6 border-b border-neutral-100 bg-gradient-to-r from-primary-50 to-neutral-50">
                        <h2 className="text-xl font-bold text-neutral-900 font-display">Profile Information</h2>
                      {!editMode ? (
                        <button 
                          onClick={handleProfileEdit}
                            className="flex items-center px-4 py-2 text-sm font-medium text-primary-600 bg-white rounded-lg border border-primary-200 hover:bg-primary-50 shadow-sm transition-colors duration-200"
                        >
                            <FiEdit className="mr-2 h-4 w-4" /> Edit Profile
                        </button>
                      ) : (
                        <div className="flex space-x-3">
                          <button 
                            onClick={handleProfileCancel}
                              className="flex items-center px-4 py-2 text-sm font-medium text-neutral-600 bg-white rounded-lg border border-neutral-200 hover:bg-neutral-50 shadow-sm transition-colors duration-200"
                            disabled={updating}
                          >
                              <FiX className="mr-2 h-4 w-4" /> Cancel
                          </button>
                          <button 
                            onClick={handleProfileSave}
                              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 shadow-sm transition-colors duration-200"
                            disabled={updating}
                          >
                            {updating ? (
                              <>
                                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></div>
                                Saving...
                              </>
                            ) : (
                              <>
                                  <FiCheck className="mr-2 h-4 w-4" /> Save Changes
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                    
                      <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                          {/* Profile picture section */}
                          <div className="lg:col-span-1">
                            <div className="flex flex-col items-center space-y-4">
                              <div className="relative">
                                <div className="w-32 h-32 rounded-full overflow-hidden bg-neutral-100 border-4 border-white shadow-md">
                                  {profilePicture ? (
                                    <img 
                                      src={profilePicture} 
                                      alt="Profile" 
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-600">
                                      <FiUser size={48} />
                                    </div>
                                  )}
                                </div>
                                <button 
                                  onClick={() => setShowProfilePicture(true)}
                                  className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md border border-neutral-200 hover:bg-neutral-50 transition-colors"
                                >
                                  <FiEdit size={16} className="text-neutral-600" />
                                </button>
                              </div>
                              
                              {showProfilePicture && (
                                <div className="w-full">
                                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Upload Profile Picture
                                  </label>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleProfilePictureChange}
                                    className="w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-600 hover:file:bg-primary-100"
                                  />
                                  <p className="mt-1 text-xs text-neutral-500">
                                    JPG, PNG or GIF. Max size 1MB.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Profile details section */}
                          <div className="lg:col-span-3 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">Full Name</label>
                        {!editMode ? (
                                  <p className="text-neutral-800 bg-neutral-50 p-3 rounded-lg border border-neutral-200">{profile.name}</p>
                        ) : (
                          <input
                            type="text"
                            name="name"
                            value={editableProfile.name}
                            onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                                    placeholder="Enter your full name"
                          />
                        )}
                      </div>
                      
                      <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">Email Address</label>
                                <p className="text-neutral-800 bg-neutral-50 p-3 rounded-lg border border-neutral-200 flex items-center">
                                  {profile.email}
                                  <span className="ml-2 text-xs bg-success-100 text-success-700 px-2 py-0.5 rounded-full">Verified</span>
                                </p>
                      </div>
                      
                      <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">Phone Number</label>
                        {!editMode ? (
                                  <p className="text-neutral-800 bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                                    {profile.phone || 'Not provided'}
                                  </p>
                        ) : (
                          <input
                            type="tel"
                            name="phone"
                            value={editableProfile.phone}
                            onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                                    placeholder="Enter your phone number"
                          />
                        )}
                      </div>
                      
                      <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">Member Since</label>
                                <p className="text-neutral-800 bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                                  {formatDate(profile.joinedDate)}
                                </p>
                              </div>
                            </div>
                            
                            <div>
                              <button 
                                onClick={() => setShowPreferences(!showPreferences)}
                                className="flex items-center justify-between w-full px-4 py-3 bg-neutral-50 rounded-lg border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
                              >
                                <div className="flex items-center">
                                  <FiBell size={18} className="mr-2 text-neutral-600" />
                                  Communication Preferences
                                </div>
                                <svg className={`w-5 h-5 text-neutral-500 transition-transform duration-200 ${showPreferences ? 'transform rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </button>
                              
                              {showPreferences && (
                                <div className="mt-4 p-5 bg-white rounded-lg border border-neutral-200 shadow-sm">
                                  <h3 className="text-sm font-medium text-neutral-800 mb-4">How would you like to receive updates?</h3>
                                  <div className="space-y-3">
                                    <div className="flex items-start">
                                      <div className="flex items-center h-5">
                                        <input
                                          id="marketing"
                                          name="marketing"
                                          type="checkbox"
                                          checked={communicationPrefs.marketing}
                                          onChange={handlePreferenceChange}
                                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                                        />
                                      </div>
                                      <div className="ml-3 text-sm">
                                        <label htmlFor="marketing" className="font-medium text-neutral-700">Marketing Communications</label>
                                        <p className="text-neutral-500">Receive emails about new products, features, and more.</p>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-start">
                                      <div className="flex items-center h-5">
                                        <input
                                          id="orderUpdates"
                                          name="orderUpdates"
                                          type="checkbox"
                                          checked={communicationPrefs.orderUpdates}
                                          onChange={handlePreferenceChange}
                                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                                        />
                                      </div>
                                      <div className="ml-3 text-sm">
                                        <label htmlFor="orderUpdates" className="font-medium text-neutral-700">Order Updates</label>
                                        <p className="text-neutral-500">Receive notifications about order status changes.</p>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-start">
                                      <div className="flex items-center h-5">
                                        <input
                                          id="promotions"
                                          name="promotions"
                                          type="checkbox"
                                          checked={communicationPrefs.promotions}
                                          onChange={handlePreferenceChange}
                                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                                        />
                                      </div>
                                      <div className="ml-3 text-sm">
                                        <label htmlFor="promotions" className="font-medium text-neutral-700">Promotions and Discounts</label>
                                        <p className="text-neutral-500">Get notified about special offers and discounts.</p>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-start">
                                      <div className="flex items-center h-5">
                                        <input
                                          id="newsletter"
                                          name="newsletter"
                                          type="checkbox"
                                          checked={communicationPrefs.newsletter}
                                          onChange={handlePreferenceChange}
                                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                                        />
                                      </div>
                                      <div className="ml-3 text-sm">
                                        <label htmlFor="newsletter" className="font-medium text-neutral-700">Newsletter</label>
                                        <p className="text-neutral-500">Subscribe to our monthly newsletter for automotive tips and trends.</p>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="mt-5 flex justify-end">
                                    <button
                                      onClick={() => {
                                        showNotification('Communication preferences updated');
                                        setShowPreferences(false);
                                      }}
                                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
                                    >
                                      Save Preferences
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Orders Tab */}
                {activeTab === 'orders' && (
                  <div className="bg-white rounded-xl shadow-luxury border border-neutral-100 overflow-hidden">
                    <div className="p-6 border-b border-neutral-100 bg-gradient-to-r from-primary-50 to-neutral-50">
                      <h2 className="text-xl font-bold text-neutral-900 font-display">Order History</h2>
                      <p className="text-sm text-neutral-600 mt-1">Track and manage your past purchases</p>
                    </div>
                    
                    <div className="p-6">
                      {ordersLoading ? (
                        <div className="flex justify-center p-12">
                          <div className="animate-spin h-12 w-12 rounded-full border-t-2 border-b-2 border-primary-600"></div>
                        </div>
                      ) : orders.length > 0 ? (
                  <div>
                          {/* Filtering and sorting controls */}
                          <div className="mb-6 flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0">
                            <div className="flex items-center space-x-3">
                              <div className="relative">
                                <select 
                                  className="appearance-none pl-3 pr-10 py-2 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-800 hover:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer"
                                >
                                  <option value="all">All Orders</option>
                                  <option value="processing">Processing</option>
                                  <option value="shipped">Shipped</option>
                                  <option value="delivered">Delivered</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-500">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                  </svg>
                                </div>
                    </div>
                    
                              <div className="relative">
                                <select 
                                  className="appearance-none pl-3 pr-10 py-2 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-800 hover:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer"
                                >
                                  <option value="recent">Most Recent</option>
                                  <option value="oldest">Oldest</option>
                                  <option value="highest">Highest Amount</option>
                                  <option value="lowest">Lowest Amount</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-500">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                  </svg>
                                </div>
                              </div>
                              
                              <div className="relative">
                                <select 
                                  className="appearance-none pl-3 pr-10 py-2 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-800 hover:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer"
                                >
                                  <option value="all">All Time</option>
                                  <option value="30">Last 30 Days</option>
                                  <option value="90">Last 90 Days</option>
                                  <option value="365">Last Year</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-500">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                  </svg>
                                </div>
                              </div>
                            </div>
                            
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="Search orders..."
                                className="w-full sm:w-auto pl-10 pr-4 py-2 border border-neutral-200 rounded-lg text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              />
                              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                              </div>
                            </div>
                          </div>

                          <div className="shadow-sm rounded-lg overflow-hidden border border-neutral-200">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-neutral-200">
                          <thead className="bg-neutral-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Order ID</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Total</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Items</th>
                              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-neutral-200">
                            {orders.map(order => (
                                    <tr key={order.id} className="hover:bg-neutral-50 transition-colors duration-150">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">{order.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{formatDate(order.date)}</td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">${order.total.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{order.items}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end items-center space-x-3">
                                          {order.status === 'processing' && (
                                            <button className="text-error-600 hover:text-error-800 flex items-center">
                                              Cancel
                                            </button>
                                          )}
                                          
                                          {order.status === 'shipped' && (
                                            <button className="text-primary-600 hover:text-primary-800 flex items-center">
                                              <FiTruck className="mr-1" size={14} /> Track
                                            </button>
                                          )}
                                          
                                          {order.status === 'delivered' && (
                                            <button className="text-success-600 hover:text-success-800 flex items-center">
                                              Reorder
                                            </button>
                                          )}
                                          
                                          <Link 
                                            to={`/orders/${order.id}`} 
                                            className="text-primary-600 hover:text-primary-900 flex items-center"
                                          >
                                            Details
                                            <FiChevronRight className="ml-1" size={14} />
                                          </Link>
                                        </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                            </div>
                          </div>
                          
                          {/* Pagination */}
                          <div className="mt-6 flex items-center justify-between">
                            <div className="flex-1 flex justify-between sm:hidden">
                              <button className="relative inline-flex items-center px-4 py-2 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50">
                                Previous
                              </button>
                              <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50">
                                Next
                              </button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                              <div>
                                <p className="text-sm text-neutral-700">
                                  Showing <span className="font-medium">1</span> to <span className="font-medium">{Math.min(orders.length, 10)}</span> of <span className="font-medium">{orders.length}</span> results
                                </p>
                              </div>
                              <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                  <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-neutral-300 bg-white text-sm font-medium text-neutral-500 hover:bg-neutral-50">
                                    <span className="sr-only">Previous</span>
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </button>
                                  <button className="relative inline-flex items-center px-4 py-2 border border-primary-300 bg-primary-50 text-sm font-medium text-primary-600 hover:bg-primary-100">
                                    1
                                  </button>
                                  <button className="relative inline-flex items-center px-4 py-2 border border-neutral-300 bg-white text-sm font-medium text-neutral-500 hover:bg-neutral-50">
                                    2
                                  </button>
                                  <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-neutral-300 bg-white text-sm font-medium text-neutral-500 hover:bg-neutral-50">
                                    <span className="sr-only">Next</span>
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </button>
                                </nav>
                              </div>
                            </div>
                          </div>
                      </div>
                    ) : (
                        <div className="bg-neutral-50 rounded-xl p-8 text-center border border-neutral-200">
                          <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
                            <FiShoppingBag className="text-neutral-400" size={24} />
                          </div>
                          <h3 className="text-lg font-medium text-neutral-900 mb-2">No orders yet</h3>
                          <p className="text-neutral-600 mb-6">You haven't placed any orders yet.</p>
                          <Link 
                            to="/products" 
                            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
                          >
                            Start Shopping
                        </Link>
                      </div>
                    )}
                    </div>
                  </div>
                )}
                
                {/* Addresses Tab */}
                {activeTab === 'addresses' && (
                  <div className="bg-white rounded-xl shadow-luxury border border-neutral-100 overflow-hidden">
                    <div className="flex justify-between items-center p-6 border-b border-neutral-100 bg-gradient-to-r from-primary-50 to-neutral-50">
                  <div>
                        <h2 className="text-xl font-bold text-neutral-900 font-display">Saved Addresses</h2>
                        <p className="text-sm text-neutral-600 mt-1">Manage delivery locations for your orders</p>
                      </div>
                      <button 
                        onClick={handleAddNewAddress}
                        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 shadow-sm transition-colors duration-200"
                      >
                        <FiPlus className="mr-2 h-4 w-4" /> Add New Address
                      </button>
                    </div>
                    
                    <div className="p-6">
                      {showAddressForm && (
                        <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200 mb-6">
                          <form onSubmit={handleAddressFormSubmit}>
                            <h3 className="text-lg font-medium text-neutral-900 mb-4">
                              {editingAddress ? 'Edit Address' : 'Add New Address'}
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                              <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">Address Type</label>
                                <select
                                  name="type"
                                  value={addressForm.type}
                                  onChange={handleAddressFormChange}
                                  className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                                >
                                  <option value="Home">Home</option>
                                  <option value="Work">Work</option>
                                  <option value="Other">Other</option>
                                </select>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">Street Address</label>
                                <input
                                  type="text"
                                  name="address"
                                  value={addressForm.address}
                                  onChange={handleAddressFormChange}
                                  className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                                  placeholder="Enter street address"
                                  required
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">City</label>
                                <input
                                  type="text"
                                  name="city"
                                  value={addressForm.city}
                                  onChange={handleAddressFormChange}
                                  className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                                  placeholder="Enter city"
                                  required
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">State/Region</label>
                                <input
                                  type="text"
                                  name="state"
                                  value={addressForm.state}
                                  onChange={handleAddressFormChange}
                                  className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                                  placeholder="Enter state or region"
                                  required
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">ZIP/Postal Code</label>
                                <input
                                  type="text"
                                  name="zip"
                                  value={addressForm.zip}
                                  onChange={handleAddressFormChange}
                                  className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                                  placeholder="Enter ZIP code"
                                  required
                                />
                              </div>
                              
                              <div className="flex items-center mt-4">
                                <input
                                  type="checkbox"
                                  name="isDefault"
                                  id="isDefault"
                                  checked={addressForm.isDefault}
                                  onChange={handleAddressFormChange}
                                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                                />
                                <label htmlFor="isDefault" className="ml-2 block text-sm text-neutral-700">
                                  Set as default address
                                </label>
                              </div>
                            </div>
                            
                            <div className="flex justify-end space-x-3">
                              <button
                                type="button"
                                onClick={handleCancelAddressForm}
                                className="px-4 py-2 border border-neutral-300 rounded-lg text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                disabled={addressFormSubmitting}
                              >
                                {addressFormSubmitting ? (
                                  <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                  </span>
                                ) : editingAddress ? 'Update Address' : 'Add Address'}
                              </button>
                            </div>
                          </form>
                        </div>
                      )}
                      
                      {addressesLoading ? (
                        <div className="flex justify-center p-12">
                          <div className="animate-spin h-12 w-12 rounded-full border-t-2 border-b-2 border-primary-600"></div>
                        </div>
                      ) : addresses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map(address => (
                            <div key={address.id} className="border border-neutral-200 rounded-xl p-5 relative group hover:border-primary-200 hover:shadow-sm transition-all duration-200">
                          {address.default && (
                                <span className="absolute top-4 right-4 bg-gold-100 text-gold-800 text-xs px-2.5 py-1 rounded-full font-medium">Default</span>
                          )}
                          
                              <p className="font-medium text-neutral-900 mb-2">{address.type}</p>
                              <p className="text-sm text-neutral-700">{address.address}</p>
                          <p className="text-sm text-neutral-700">{address.city}, {address.state} {address.zip}</p>
                          
                              <div className="mt-4 pt-4 border-t border-neutral-100 flex space-x-4">
                                <button 
                                  onClick={() => handleEditAddress(address)}
                                  className="text-sm text-primary-600 hover:text-primary-800 flex items-center transition-colors"
                                >
                                  <FiEdit className="mr-1" size={14} /> Edit
                                </button>
                            {!address.default && (
                              <>
                                    <button 
                                      onClick={() => handleSetDefaultAddress(address.id)}
                                      className="text-sm text-neutral-600 hover:text-neutral-800 flex items-center transition-colors"
                                    >
                                      <FiCheck className="mr-1" size={14} /> Set as Default
                                    </button>
                                    <button 
                                      onClick={() => handleRemoveAddress(address.id)}
                                      className="text-sm text-error-600 hover:text-error-800 flex items-center transition-colors"
                                    >
                                      <FiTrash2 className="mr-1" size={14} /> Remove
                                    </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                        </div>
                      ) : (
                        <div className="bg-neutral-50 rounded-xl p-8 text-center border border-neutral-200">
                          <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
                            <FiMapPin className="text-neutral-400" size={24} />
                          </div>
                          <h3 className="text-lg font-medium text-neutral-900 mb-2">No addresses saved</h3>
                          <p className="text-neutral-600 mb-6">Add an address to streamline your checkout process.</p>
                          <button 
                            onClick={handleAddNewAddress}
                            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
                          >
                            <FiPlus className="mr-2 h-4 w-4" /> Add Address
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Payment Methods Tab */}
                {activeTab === 'payment' && (
                  <div className="bg-white rounded-xl shadow-luxury border border-neutral-100 overflow-hidden">
                    <div className="flex justify-between items-center p-6 border-b border-neutral-100 bg-gradient-to-r from-primary-50 to-neutral-50">
                  <div>
                        <h2 className="text-xl font-bold text-neutral-900 font-display">Payment Methods</h2>
                        <p className="text-sm text-neutral-600 mt-1">Manage payment options for your purchases</p>
                      </div>
                      <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 shadow-sm transition-colors duration-200">
                        <FiPlus className="mr-2 h-4 w-4" /> Add Payment Method
                      </button>
                    </div>
                    
                    <div className="p-6">
                      {paymentLoading ? (
                        <div className="flex justify-center p-12">
                          <div className="animate-spin h-12 w-12 rounded-full border-t-2 border-b-2 border-primary-600"></div>
                        </div>
                      ) : paymentMethods.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {paymentMethods.map(method => (
                            <div key={method.id} className="border border-neutral-200 rounded-xl p-5 relative group hover:border-primary-200 hover:shadow-sm transition-all duration-200">
                          {method.default && (
                                <span className="absolute top-4 right-4 bg-gold-100 text-gold-800 text-xs px-2.5 py-1 rounded-full font-medium">Default</span>
                          )}
                          
                          <div className="flex items-center">
                                <div className="mr-4 w-12 h-12 rounded-full bg-gradient-to-r from-gold-400 to-gold-300 flex items-center justify-center text-white font-bold shadow-gold">
                                  {method.brand === 'MoMo' ? 'MM' : method.brand === 'Telecel Cash' ? 'TC' : 'MM'}
                            </div>
                            <div>
                                  <p className="font-medium text-neutral-900">{method.brand} •••• {method.last4}</p>
                                  <p className="text-xs text-neutral-500 mt-1">Mobile Money</p>
                            </div>
                          </div>
                          
                              <div className="mt-4 pt-4 border-t border-neutral-100 flex space-x-4">
                                <button className="text-sm text-primary-600 hover:text-primary-800 flex items-center transition-colors">
                                  <FiEdit className="mr-1" size={14} /> Update
                                </button>
                            {!method.default && (
                              <>
                                    <button className="text-sm text-neutral-600 hover:text-neutral-800 flex items-center transition-colors">
                                      <FiCheck className="mr-1" size={14} /> Set as Default
                                    </button>
                                    <button className="text-sm text-error-600 hover:text-error-800 flex items-center transition-colors">
                                      <FiTrash2 className="mr-1" size={14} /> Remove
                                    </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                        </div>
                      ) : (
                        <div className="bg-neutral-50 rounded-xl p-8 text-center border border-neutral-200">
                          <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
                            <FiCreditCard className="text-neutral-400" size={24} />
                          </div>
                          <h3 className="text-lg font-medium text-neutral-900 mb-2">No payment methods</h3>
                          <p className="text-neutral-600 mb-6">Add a payment method for faster checkout.</p>
                          <button className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm">
                            <FiPlus className="mr-2 h-4 w-4" /> Add Payment Method
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Security Tab */}
                {activeTab === 'security' && (
                  <div className="space-y-6">
                    {securityLoading ? (
                      <div className="bg-white rounded-xl shadow-luxury p-12 border border-neutral-100 flex justify-center">
                        <div className="animate-spin h-12 w-12 rounded-full border-t-2 border-b-2 border-primary-600"></div>
                      </div>
                    ) : (
                      <>
                        {/* Password Form */}
                        <div className="bg-white rounded-xl shadow-luxury border border-neutral-100 overflow-hidden">
                          <div className="p-6 border-b border-neutral-100 bg-gradient-to-r from-primary-50 to-neutral-50">
                            <h2 className="text-xl font-bold text-neutral-900 font-display">Security Settings</h2>
                            <p className="text-sm text-neutral-600 mt-1">Manage your account security and access</p>
                          </div>
                          
                          <div className="p-6 space-y-8">
                            {/* Password Change Section */}
                            <div className="border border-neutral-200 rounded-xl overflow-hidden">
                              <div className="flex justify-between items-center p-5 bg-neutral-50 border-b border-neutral-200">
                                <div className="flex items-start space-x-4">
                                  <div className="mt-1 w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                                    <FiLock size={18} />
                                  </div>
                  <div>
                                    <h3 className="text-lg font-medium text-neutral-800">Password</h3>
                                    <p className="text-neutral-600 text-sm mt-1">
                                      Securely change your password
                                    </p>
                                  </div>
                                </div>
                                
                                <button 
                                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                                  className="flex items-center px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg border border-primary-200 hover:bg-primary-100 shadow-sm transition-colors duration-200"
                                >
                                  {showPasswordForm ? 'Cancel' : 'Change Password'}
                        </button>
                      </div>
                              
                              <div className="p-5">
                                {showPasswordForm ? (
                                  <form onSubmit={handlePasswordFormSubmit}>
                                    <div className="space-y-4">
                                      <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-1">Current Password</label>
                                        <input
                                          type="password"
                                          name="currentPassword"
                                          value={passwordForm.currentPassword}
                                          onChange={handlePasswordFormChange}
                                          className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                                          placeholder="Enter your current password"
                                          required
                                        />
                    </div>
                    
                      <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-1">New Password</label>
                                        <input
                                          type="password"
                                          name="newPassword"
                                          value={passwordForm.newPassword}
                                          onChange={handlePasswordFormChange}
                                          className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                                          placeholder="Enter your new password"
                                          required
                                        />
                                        
                                        {passwordForm.newPassword && (
                                          <div className="mt-2">
                                            <div className="flex items-center justify-between mb-1">
                                              <span className="text-xs text-neutral-500">Password Strength:</span>
                                              <span className={`text-xs font-medium ${
                                                calculatePasswordStrength(passwordForm.newPassword) >= 3 ? 
                                                  'text-success-600' : 
                                                  calculatePasswordStrength(passwordForm.newPassword) >= 2 ? 
                                                    'text-yellow-600' : 'text-error-600'
                                              }`}>
                                                {getPasswordStrengthLabel(calculatePasswordStrength(passwordForm.newPassword))}
                                              </span>
                      </div>
                                            <div className="h-1.5 w-full bg-neutral-200 rounded-full overflow-hidden">
                                              <div 
                                                className={`h-full ${getPasswordStrengthColor(calculatePasswordStrength(passwordForm.newPassword))}`}
                                                style={{ width: `${(calculatePasswordStrength(passwordForm.newPassword) / 5) * 100}%` }}
                                              ></div>
                                            </div>
                                            <ul className="mt-2 text-xs text-neutral-500 space-y-1 list-disc list-inside">
                                              <li className={passwordForm.newPassword.length >= 8 ? 'text-success-600' : ''}>
                                                At least 8 characters
                                              </li>
                                              <li className={/[A-Z]/.test(passwordForm.newPassword) ? 'text-success-600' : ''}>
                                                At least one uppercase letter
                                              </li>
                                              <li className={/[a-z]/.test(passwordForm.newPassword) ? 'text-success-600' : ''}>
                                                At least one lowercase letter
                                              </li>
                                              <li className={/[0-9]/.test(passwordForm.newPassword) ? 'text-success-600' : ''}>
                                                At least one number
                                              </li>
                                              <li className={/[^A-Za-z0-9]/.test(passwordForm.newPassword) ? 'text-success-600' : ''}>
                                                At least one special character
                                              </li>
                                            </ul>
                                          </div>
                                        )}
                                      </div>
                                      
                                      <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-1">Confirm New Password</label>
                                        <input
                                          type="password"
                                          name="confirmPassword"
                                          value={passwordForm.confirmPassword}
                                          onChange={handlePasswordFormChange}
                                          className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                                          placeholder="Confirm your new password"
                                          required
                                        />
                                        
                                        {passwordForm.newPassword && passwordForm.confirmPassword && (
                                          <p className={`mt-1 text-xs ${
                                            passwordForm.newPassword === passwordForm.confirmPassword ? 
                                              'text-success-600' : 'text-error-600'
                                          }`}>
                                            {passwordForm.newPassword === passwordForm.confirmPassword ? 
                                              'Passwords match' : 'Passwords do not match'}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div className="mt-6 flex justify-end space-x-3">
                                      <button
                                        type="button"
                                        onClick={() => setShowPasswordForm(false)}
                                        className="px-4 py-2 border border-neutral-300 rounded-lg text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        type="submit"
                                        className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                        disabled={passwordFormSubmitting}
                                      >
                                        {passwordFormSubmitting ? (
                                          <span className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Updating...
                                          </span>
                                        ) : 'Update Password'}
                                      </button>
                                    </div>
                                  </form>
                                ) : (
                                  <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 text-neutral-800">
                                    <p>Your password was last changed <strong>30 days ago</strong>.</p>
                                    <p className="mt-1 text-sm text-neutral-500">
                                      We recommend changing your password regularly for better security.
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Two-Factor Authentication */}
                            <div className="border border-neutral-200 rounded-xl p-5 relative">
                              <div className="absolute top-5 right-5">
                                <button className="flex items-center px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg border border-primary-200 hover:bg-primary-100 shadow-sm transition-colors duration-200">
                                  {securityInfo.twoFactorEnabled ? 'Disable' : 'Enable'}
                                </button>
                              </div>
                              
                              <div className="flex items-start space-x-4">
                                <div className="mt-1 w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                                  <FiShield size={18} />
                                </div>
                                <div>
                      <div className="flex items-center">
                                    <h3 className="text-lg font-medium text-neutral-800 mr-3">Two-Factor Authentication</h3>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      securityInfo.twoFactorEnabled ? 'bg-success-100 text-success-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {securityInfo.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                                  </div>
                                  <p className="text-neutral-600 text-sm mt-1">
                                    Add an extra layer of security to your account by requiring a verification code in addition to your password when signing in.
                                  </p>
                                  
                                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                                      <h4 className="font-medium text-neutral-800 text-sm mb-1">SMS Verification</h4>
                                      <p className="text-xs text-neutral-600">Receive codes via text message</p>
                                    </div>
                                    
                                    <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                                      <h4 className="font-medium text-neutral-800 text-sm mb-1">Authenticator App</h4>
                                      <p className="text-xs text-neutral-600">Use an authentication app</p>
                                    </div>
                                    
                                    <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                                      <h4 className="font-medium text-neutral-800 text-sm mb-1">Backup Codes</h4>
                                      <p className="text-xs text-neutral-600">Generate emergency backup codes</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Active Devices */}
                            <div className="border border-neutral-200 rounded-xl overflow-hidden">
                              <div className="p-5 bg-neutral-50 border-b border-neutral-200">
                                <div className="flex items-start space-x-4">
                                  <div className="mt-1 w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                                    <FiSettings size={18} />
                                  </div>
                                  <div>
                                    <h3 className="text-lg font-medium text-neutral-800">Active Devices</h3>
                                    <p className="text-neutral-600 text-sm mt-1">
                                      These devices are currently logged into your account
                                    </p>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="p-5">
                                <div className="space-y-4">
                                  {activeDevices.map(device => (
                                    <div key={device.id} className="flex justify-between items-center p-4 border border-neutral-200 rounded-lg">
                                      <div className="flex items-start space-x-4">
                                        <div className="mt-1 w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center text-neutral-600">
                                          {device.name.includes('iPhone') || device.name.includes('iPad') ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                                              <line x1="12" y1="18" x2="12" y2="18" />
                                            </svg>
                                          ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                                              <line x1="8" y1="21" x2="16" y2="21" />
                                              <line x1="12" y1="17" x2="12" y2="21" />
                                            </svg>
                                          )}
                                        </div>
                                        
                                        <div>
                                          <div className="flex items-center">
                                            <h4 className="font-medium text-neutral-800">{device.name}</h4>
                                            {device.current && (
                                              <span className="ml-2 text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                                                Current Device
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-sm text-neutral-600 mt-1">
                                            {device.browser} on {device.os}
                                          </p>
                                          <p className="text-xs text-neutral-500 mt-0.5">
                                            Last active: {formatDate(device.lastActive)} • {device.location}
                                          </p>
                                        </div>
                                      </div>
                                      
                                      {!device.current && (
                                        <button 
                                          onClick={() => handleRemoveDevice(device.id)}
                                          className="text-sm text-error-600 hover:text-error-800 transition-colors"
                                        >
                                          Sign Out
                        </button>
                                      )}
                      </div>
                                  ))}
                    </div>
                              </div>
                            </div>
                            
                            {/* Login Activity */}
                            <div className="border border-neutral-200 rounded-xl overflow-hidden">
                              <div className="p-5 bg-neutral-50 border-b border-neutral-200 flex justify-between items-center">
                                <div className="flex items-start space-x-4">
                                  <div className="mt-1 w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                                    <FiBell size={18} />
                                  </div>
                                  <div>
                                    <h3 className="text-lg font-medium text-neutral-800">Login Activity</h3>
                                    <p className="text-neutral-600 text-sm mt-1">
                                      Recent login attempts to your account
                                    </p>
                                  </div>
                                </div>
                                
                                <button className="text-sm text-primary-600 hover:text-primary-800 transition-colors">
                                  View All
                                </button>
                              </div>
                              
                              <div className="p-5">
                                <div className="space-y-4">
                                  {loginActivity.map(activity => (
                                    <div key={activity.id} className="flex items-start p-3 border border-neutral-200 rounded-lg">
                                      <div className={`w-2 h-2 mt-2 rounded-full mr-3 ${
                                        activity.status === 'success' ? 'bg-success-500' : 'bg-error-500'
                                      }`}></div>
                                      
                                      <div className="flex-1">
                                        <div className="flex items-start justify-between">
                                          <div>
                                            <h4 className="font-medium text-neutral-800">{activity.device}</h4>
                                            <p className="text-sm text-neutral-600 mt-1">
                                              {activity.location} • IP: {activity.ip}
                                            </p>
                                          </div>
                                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                            activity.status === 'success' 
                                              ? 'bg-success-100 text-success-800' 
                                              : 'bg-error-100 text-error-800'
                                          }`}>
                                            {activity.status === 'success' ? 'Successful' : 'Failed'}
                                          </span>
                                        </div>
                                        <p className="text-xs text-neutral-500 mt-1">
                                          {formatDate(activity.date)}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerAccount;