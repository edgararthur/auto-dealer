import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiShoppingBag, FiMapPin, FiCreditCard, FiLock, FiEdit, FiPlus, FiTrash2, FiCheck, FiX } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import supabase from '../../../../shared/supabase/supabaseClient';

const BuyerAccount = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
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

  useEffect(() => {
    fetchUserData();
  }, [user?.id]);

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
        
        // Fetch user's orders
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
        }
        
        // Fetch user's addresses
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
        }
        
        // Fetch user's payment methods
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
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      showNotification('Failed to load your profile data. Please try again.', 'error');
    } finally {
      setLoading(false);
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">My Account</h1>
      
      {notification.show && (
        <div className={`mb-4 p-3 rounded-md ${
          notification.type === 'error' ? 'bg-error-50 text-error-700 border border-error-200' : 'bg-success-50 text-success-700 border border-success-200'
        }`}>
          {notification.message}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left sidebar with tabs */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <nav className="flex flex-col">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center px-4 py-3 text-sm font-medium ${
                  activeTab === 'profile' ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-500' : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <FiUser className="mr-3 h-5 w-5" />
                Profile
              </button>
              
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex items-center px-4 py-3 text-sm font-medium ${
                  activeTab === 'orders' ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-500' : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <FiShoppingBag className="mr-3 h-5 w-5" />
                Orders
              </button>
              
              <button
                onClick={() => setActiveTab('addresses')}
                className={`flex items-center px-4 py-3 text-sm font-medium ${
                  activeTab === 'addresses' ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-500' : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <FiMapPin className="mr-3 h-5 w-5" />
                Addresses
              </button>
              
              <button
                onClick={() => setActiveTab('payment')}
                className={`flex items-center px-4 py-3 text-sm font-medium ${
                  activeTab === 'payment' ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-500' : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <FiCreditCard className="mr-3 h-5 w-5" />
                Payment Methods
              </button>
              
              <button
                onClick={() => setActiveTab('security')}
                className={`flex items-center px-4 py-3 text-sm font-medium ${
                  activeTab === 'security' ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-500' : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <FiLock className="mr-3 h-5 w-5" />
                Security
              </button>
            </nav>
          </div>
        </div>
        
        {/* Main content area */}
        <div className="md:col-span-3">
          <div className="bg-white rounded-lg shadow p-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
              </div>
            ) : (
              <>
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold text-neutral-900">Profile Information</h2>
                      {!editMode ? (
                        <button 
                          onClick={handleProfileEdit}
                          className="flex items-center text-sm text-primary-600 hover:text-primary-500"
                        >
                          <FiEdit className="mr-1 h-4 w-4" /> Edit
                        </button>
                      ) : (
                        <div className="flex space-x-3">
                          <button 
                            onClick={handleProfileCancel}
                            className="flex items-center text-sm text-neutral-600 hover:text-neutral-500"
                            disabled={updating}
                          >
                            <FiX className="mr-1 h-4 w-4" /> Cancel
                          </button>
                          <button 
                            onClick={handleProfileSave}
                            className="flex items-center text-sm text-success-600 hover:text-success-500"
                            disabled={updating}
                          >
                            {updating ? (
                              <>
                                <div className="mr-1 h-3 w-3 animate-spin rounded-full border-2 border-current border-r-transparent"></div>
                                Saving...
                              </>
                            ) : (
                              <>
                                <FiCheck className="mr-1 h-4 w-4" /> Save
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm font-medium text-neutral-500">Name</p>
                        {!editMode ? (
                          <p className="mt-1 text-neutral-900">{profile.name}</p>
                        ) : (
                          <input
                            type="text"
                            name="name"
                            value={editableProfile.name}
                            onChange={handleInputChange}
                            className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          />
                        )}
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-neutral-500">Email</p>
                        <p className="mt-1 text-neutral-900">{profile.email}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-neutral-500">Phone Number</p>
                        {!editMode ? (
                          <p className="mt-1 text-neutral-900">{profile.phone || 'Not provided'}</p>
                        ) : (
                          <input
                            type="tel"
                            name="phone"
                            value={editableProfile.phone}
                            onChange={handleInputChange}
                            className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            placeholder="Enter phone number"
                          />
                        )}
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-neutral-500">Member Since</p>
                        <p className="mt-1 text-neutral-900">{formatDate(profile.joinedDate)}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Orders Tab */}
                {activeTab === 'orders' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold text-neutral-900">Order History</h2>
                    </div>
                    
                    {orders.length > 0 ? (
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
                              <tr key={order.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">{order.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{formatDate(order.date)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">${order.total.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{order.items}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <Link to={`/orders/${order.id}`} className="text-primary-600 hover:text-primary-900">View</Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-neutral-500">You haven't placed any orders yet.</p>
                        <Link to="/products" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
                          Browse Products
                        </Link>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Addresses Tab */}
                {activeTab === 'addresses' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold text-neutral-900">Saved Addresses</h2>
                      <button className="flex items-center text-sm text-primary-600 hover:text-primary-500">
                        <FiPlus className="mr-1 h-4 w-4" /> Add New
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {addresses.map(address => (
                        <div key={address.id} className="border rounded-lg p-4 relative">
                          {address.default && (
                            <span className="absolute top-4 right-4 bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded">Default</span>
                          )}
                          
                          <p className="font-medium">{address.type}</p>
                          <p className="text-sm text-neutral-700 mt-1">{address.address}</p>
                          <p className="text-sm text-neutral-700">{address.city}, {address.state} {address.zip}</p>
                          
                          <div className="mt-4 flex space-x-3">
                            <button className="text-sm text-neutral-600 hover:text-neutral-900">Edit</button>
                            {!address.default && (
                              <>
                                <button className="text-sm text-neutral-600 hover:text-neutral-900">Make Default</button>
                                <button className="text-sm text-red-600 hover:text-red-900">Remove</button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}

                      {addresses.length === 0 && (
                        <div className="sm:col-span-2 border rounded-lg p-6 text-center">
                          <p className="text-neutral-500">You don't have any saved addresses yet.</p>
                          <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
                            <FiPlus className="mr-1 h-4 w-4" /> Add Address
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Payment Methods Tab */}
                {activeTab === 'payment' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold text-neutral-900">Payment Methods</h2>
                      <button className="flex items-center text-sm text-primary-600 hover:text-primary-500">
                        <FiPlus className="mr-1 h-4 w-4" /> Add New
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {paymentMethods.map(method => (
                        <div key={method.id} className="border rounded-lg p-4 relative">
                          {method.default && (
                            <span className="absolute top-4 right-4 bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded">Default</span>
                          )}
                          
                          <div className="flex items-center">
                            <div className="mr-3">
                              {method.brand === 'MoMo' ? (
                                <span className="text-purple-600 text-xl font-bold">MoMo</span>
                              ) : method.brand === 'Telecel Cash' ? (
                                <span className="text-red-600 text-xl font-bold">TC</span>
                              ) : (
                                <span className="text-neutral-600 text-xl font-bold">MM</span>
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{method.brand} •••• {method.last4}</p>
                              <p className="text-sm text-neutral-700">Phone Number</p>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex space-x-3">
                            <button className="text-sm text-neutral-600 hover:text-neutral-900">Update</button>
                            {!method.default && (
                              <>
                                <button className="text-sm text-neutral-600 hover:text-neutral-900">Make Default</button>
                                <button className="text-sm text-red-600 hover:text-red-900">Remove</button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}

                      {paymentMethods.length === 0 && (
                        <div className="sm:col-span-2 border rounded-lg p-6 text-center">
                          <p className="text-neutral-500">You don't have any saved payment methods yet.</p>
                          <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
                            <FiPlus className="mr-1 h-4 w-4" /> Add Payment Method
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Security Tab */}
                {activeTab === 'security' && (
                  <div>
                    <h2 className="text-xl font-semibold text-neutral-900 mb-6">Security Settings</h2>
                    
                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-medium text-neutral-900">Password</h3>
                        <button className="flex items-center text-sm text-primary-600 hover:text-primary-500">
                          <FiEdit className="mr-1 h-4 w-4" /> Change
                        </button>
                      </div>
                      <p className="text-neutral-500 text-sm">Last changed 3 months ago</p>
                    </div>
                    
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <h3 className="text-lg font-medium text-neutral-900">Two-Factor Authentication</h3>
                        <p className="text-neutral-500 text-sm mt-1">Add an extra layer of security to your account</p>
                      </div>
                      <div className="flex items-center">
                        <span className={`mr-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          securityInfo.twoFactorEnabled ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {securityInfo.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                        <button className="flex items-center text-sm text-primary-600 hover:text-primary-500">
                          {securityInfo.twoFactorEnabled ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    </div>
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