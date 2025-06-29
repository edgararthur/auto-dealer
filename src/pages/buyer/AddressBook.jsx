import React, { useState, useEffect } from 'react';
import { 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiMapPin, 
  FiHome, 
  FiBuilding,
  FiCheck,
  FiX,
  FiStar
} from 'react-icons/fi';
import { useToast } from '../../contexts/ToastContext';

const AddressBook = () => {
  const [addresses, setAddresses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: '',
    isDefault: false,
    type: 'shipping' // 'shipping' or 'billing'
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      // Simulate API call - replace with actual service
      const mockAddresses = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          company: '',
          address1: '123 Main Street',
          address2: 'Apt 4B',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'United States',
          phone: '(555) 123-4567',
          isDefault: true,
          type: 'shipping'
        },
        {
          id: 2,
          firstName: 'John',
          lastName: 'Doe',
          company: 'Tech Corp',
          address1: '456 Business Ave',
          address2: 'Suite 200',
          city: 'New York',
          state: 'NY',
          zipCode: '10002',
          country: 'United States',
          phone: '(555) 987-6543',
          isDefault: false,
          type: 'billing'
        }
      ];
      
      setTimeout(() => {
        setAddresses(mockAddresses);
        setLoading(false);
      }, 500);
    } catch (err) {
      error('Failed to load addresses');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingAddress) {
        // Update existing address
        const updatedAddresses = addresses.map(addr => 
          addr.id === editingAddress.id 
            ? { ...formData, id: editingAddress.id }
            : formData.isDefault && addr.type === formData.type 
              ? { ...addr, isDefault: false }
              : addr
        );
        setAddresses(updatedAddresses);
        success('Address updated successfully');
      } else {
        // Add new address
        const newAddress = {
          ...formData,
          id: Date.now()
        };
        
        const updatedAddresses = formData.isDefault 
          ? addresses.map(addr => 
              addr.type === formData.type 
                ? { ...addr, isDefault: false }
                : addr
            ).concat(newAddress)
          : [...addresses, newAddress];
          
        setAddresses(updatedAddresses);
        success('Address added successfully');
      }
      
      closeModal();
    } catch (err) {
      error('Failed to save address');
    }
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setFormData(address);
    setIsModalOpen(true);
  };

  const handleDelete = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        setAddresses(addresses.filter(addr => addr.id !== addressId));
        success('Address deleted successfully');
      } catch (err) {
        error('Failed to delete address');
      }
    }
  };

  const setAsDefault = async (addressId) => {
    try {
      const address = addresses.find(addr => addr.id === addressId);
      const updatedAddresses = addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId ? true : 
                  (addr.type === address.type ? false : addr.isDefault)
      }));
      
      setAddresses(updatedAddresses);
      success('Default address updated');
    } catch (err) {
      error('Failed to update default address');
    }
  };

  const openModal = () => {
    setEditingAddress(null);
    setFormData({
      firstName: '',
      lastName: '',
      company: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
      phone: '',
      isDefault: false,
      type: 'shipping'
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAddress(null);
  };

  const formatAddress = (address) => {
    const parts = [
      address.address1,
      address.address2,
      `${address.city}, ${address.state} ${address.zipCode}`,
      address.country
    ].filter(Boolean);
    
    return parts.join('\n');
  };

  const shippingAddresses = addresses.filter(addr => addr.type === 'shipping');
  const billingAddresses = addresses.filter(addr => addr.type === 'billing');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Address Book</h1>
          <p className="text-gray-600">Manage your shipping and billing addresses</p>
        </div>

        {/* Add Address Button */}
        <div className="mb-8">
          <button
            onClick={openModal}
            className="btn-primary"
          >
            <FiPlus className="w-4 h-4 mr-2" />
            Add New Address
          </button>
        </div>

        {/* Address Sections */}
        <div className="space-y-8">
          {/* Shipping Addresses */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <FiMapPin className="w-5 h-5 mr-2" />
              Shipping Addresses
            </h2>
            
            {shippingAddresses.length === 0 ? (
              <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-8 text-center">
                <FiMapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No shipping addresses</h3>
                <p className="text-gray-600 mb-4">Add a shipping address to get started</p>
                <button onClick={openModal} className="btn-primary">
                  <FiPlus className="w-4 h-4 mr-2" />
                  Add Shipping Address
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {shippingAddresses.map(address => (
                  <div key={address.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <FiHome className="w-5 h-5 text-gray-400 mr-2" />
                        <h3 className="font-semibold text-gray-900">
                          {address.firstName} {address.lastName}
                        </h3>
                        {address.isDefault && (
                          <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <FiStar className="w-3 h-3 mr-1" />
                            Default
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(address)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(address.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-gray-600 mb-4 whitespace-pre-line">
                      {address.company && <div className="font-medium">{address.company}</div>}
                      {formatAddress(address)}
                    </div>
                    
                    {address.phone && (
                      <div className="text-sm text-gray-600 mb-4">
                        Phone: {address.phone}
                      </div>
                    )}
                    
                    {!address.isDefault && (
                      <button
                        onClick={() => setAsDefault(address.id)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Set as default shipping address
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Billing Addresses */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <FiBuilding className="w-5 h-5 mr-2" />
              Billing Addresses
            </h2>
            
            {billingAddresses.length === 0 ? (
              <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-8 text-center">
                <FiBuilding className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No billing addresses</h3>
                <p className="text-gray-600 mb-4">Add a billing address for payments</p>
                <button 
                  onClick={() => {
                    setFormData(prev => ({ ...prev, type: 'billing' }));
                    openModal();
                  }} 
                  className="btn-primary"
                >
                  <FiPlus className="w-4 h-4 mr-2" />
                  Add Billing Address
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {billingAddresses.map(address => (
                  <div key={address.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <FiBuilding className="w-5 h-5 text-gray-400 mr-2" />
                        <h3 className="font-semibold text-gray-900">
                          {address.firstName} {address.lastName}
                        </h3>
                        {address.isDefault && (
                          <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <FiStar className="w-3 h-3 mr-1" />
                            Default
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(address)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(address.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-gray-600 mb-4 whitespace-pre-line">
                      {address.company && <div className="font-medium">{address.company}</div>}
                      {formatAddress(address)}
                    </div>
                    
                    {address.phone && (
                      <div className="text-sm text-gray-600 mb-4">
                        Phone: {address.phone}
                      </div>
                    )}
                    
                    {!address.isDefault && (
                      <button
                        onClick={() => setAsDefault(address.id)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Set as default billing address
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Address Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {editingAddress ? 'Edit Address' : 'Add New Address'}
                    </h3>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Address Type */}
                    <div>
                      <label className="form-label">Address Type</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                        className="form-select"
                        required
                      >
                        <option value="shipping">Shipping Address</option>
                        <option value="billing">Billing Address</option>
                      </select>
                    </div>

                    {/* Name Fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">First Name</label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                          className="form-input"
                          required
                        />
                      </div>
                      <div>
                        <label className="form-label">Last Name</label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                          className="form-input"
                          required
                        />
                      </div>
                    </div>

                    {/* Company */}
                    <div>
                      <label className="form-label">Company (Optional)</label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                        className="form-input"
                      />
                    </div>

                    {/* Address */}
                    <div>
                      <label className="form-label">Address Line 1</label>
                      <input
                        type="text"
                        value={formData.address1}
                        onChange={(e) => setFormData(prev => ({ ...prev, address1: e.target.value }))}
                        className="form-input"
                        required
                      />
                    </div>

                    <div>
                      <label className="form-label">Address Line 2 (Optional)</label>
                      <input
                        type="text"
                        value={formData.address2}
                        onChange={(e) => setFormData(prev => ({ ...prev, address2: e.target.value }))}
                        className="form-input"
                      />
                    </div>

                    {/* City, State, ZIP */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">City</label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                          className="form-input"
                          required
                        />
                      </div>
                      <div>
                        <label className="form-label">State</label>
                        <select
                          value={formData.state}
                          onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                          className="form-select"
                          required
                        >
                          <option value="">Select State</option>
                          <option value="AL">Alabama</option>
                          <option value="CA">California</option>
                          <option value="FL">Florida</option>
                          <option value="NY">New York</option>
                          <option value="TX">Texas</option>
                          {/* Add more states as needed */}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">ZIP Code</label>
                        <input
                          type="text"
                          value={formData.zipCode}
                          onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                          className="form-input"
                          required
                        />
                      </div>
                      <div>
                        <label className="form-label">Phone</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          className="form-input"
                        />
                      </div>
                    </div>

                    {/* Default Address Checkbox */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isDefault"
                        checked={formData.isDefault}
                        onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
                        Set as default {formData.type} address
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    <FiCheck className="w-4 h-4 mr-2" />
                    {editingAddress ? 'Update Address' : 'Save Address'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressBook; 