import React, { useState, useEffect } from 'react';
import { 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiCreditCard, 
  FiShield,
  FiCheck,
  FiX,
  FiStar,
  FiLock,
  FiInfo
} from 'react-icons/fi';
import { useToast } from '../../contexts/ToastContext';

const PaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
    billingAddressId: '',
    isDefault: false,
    cardType: ''
  });

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      // Simulate API call - replace with actual service
      const mockMethods = [
        {
          id: 1,
          last4: '4242',
          cardType: 'Visa',
          expiryMonth: '12',
          expiryYear: '2025',
          cardholderName: 'John Doe',
          isDefault: true,
          billingAddress: {
            address1: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001'
          }
        },
        {
          id: 2,
          last4: '5555',
          cardType: 'Mastercard',
          expiryMonth: '08',
          expiryYear: '2026',
          cardholderName: 'John Doe',
          isDefault: false,
          billingAddress: {
            address1: '456 Business Ave',
            city: 'New York',
            state: 'NY',
            zipCode: '10002'
          }
        }
      ];
      
      setTimeout(() => {
        setPaymentMethods(mockMethods);
        setLoading(false);
      }, 500);
    } catch (err) {
      error('Failed to load payment methods');
      setLoading(false);
    }
  };

  const detectCardType = (cardNumber) => {
    const cleaned = cardNumber.replace(/\s/g, '');
    
    if (/^4/.test(cleaned)) return 'Visa';
    if (/^5[1-5]/.test(cleaned)) return 'Mastercard';
    if (/^3[47]/.test(cleaned)) return 'American Express';
    if (/^6/.test(cleaned)) return 'Discover';
    
    return '';
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    const cardType = detectCardType(formatted);
    
    setFormData(prev => ({
      ...prev,
      cardNumber: formatted,
      cardType
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingMethod) {
        // Update existing method
        const updatedMethods = paymentMethods.map(method => 
          method.id === editingMethod.id 
            ? { 
                ...method,
                ...formData,
                last4: formData.cardNumber.slice(-4)
              }
            : formData.isDefault 
              ? { ...method, isDefault: false }
              : method
        );
        setPaymentMethods(updatedMethods);
        success('Payment method updated successfully');
      } else {
        // Add new method
        const newMethod = {
          ...formData,
          id: Date.now(),
          last4: formData.cardNumber.slice(-4),
          billingAddress: {
            address1: '123 Main St', // This would come from selected billing address
            city: 'New York',
            state: 'NY',
            zipCode: '10001'
          }
        };
        
        const updatedMethods = formData.isDefault 
          ? paymentMethods.map(method => ({ ...method, isDefault: false })).concat(newMethod)
          : [...paymentMethods, newMethod];
          
        setPaymentMethods(updatedMethods);
        success('Payment method added successfully');
      }
      
      closeModal();
    } catch (err) {
      error('Failed to save payment method');
    }
  };

  const handleEdit = (method) => {
    setEditingMethod(method);
    setFormData({
      cardNumber: `**** **** **** ${method.last4}`,
      expiryMonth: method.expiryMonth,
      expiryYear: method.expiryYear,
      cvv: '',
      cardholderName: method.cardholderName,
      billingAddressId: '',
      isDefault: method.isDefault,
      cardType: method.cardType
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (methodId) => {
    if (window.confirm('Are you sure you want to delete this payment method?')) {
      try {
        setPaymentMethods(paymentMethods.filter(method => method.id !== methodId));
        success('Payment method deleted successfully');
      } catch (err) {
        error('Failed to delete payment method');
      }
    }
  };

  const setAsDefault = async (methodId) => {
    try {
      const updatedMethods = paymentMethods.map(method => ({
        ...method,
        isDefault: method.id === methodId
      }));
      
      setPaymentMethods(updatedMethods);
      success('Default payment method updated');
    } catch (err) {
      error('Failed to update default payment method');
    }
  };

  const openModal = () => {
    setEditingMethod(null);
    setFormData({
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      cardholderName: '',
      billingAddressId: '',
      isDefault: false,
      cardType: ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMethod(null);
  };

  const getCardIcon = (cardType) => {
    switch (cardType) {
      case 'Visa':
        return '💳';
      case 'Mastercard':
        return '💳';
      case 'American Express':
        return '💳';
      case 'Discover':
        return '💳';
      default:
        return '💳';
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Methods</h1>
          <p className="text-gray-600">Manage your saved payment methods and billing information</p>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
          <div className="flex items-start">
            <FiShield className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-1">Your payment information is secure</h3>
              <p className="text-sm text-blue-700">
                We use industry-standard encryption to protect your payment information. Your card details are securely stored and never shared.
              </p>
            </div>
          </div>
        </div>

        {/* Add Payment Method Button */}
        <div className="mb-8">
          <button
            onClick={openModal}
            className="btn-primary"
          >
            <FiPlus className="w-4 h-4 mr-2" />
            Add Payment Method
          </button>
        </div>

        {/* Payment Methods List */}
        {paymentMethods.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-8 text-center">
            <FiCreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No payment methods</h3>
            <p className="text-gray-600 mb-4">Add a payment method to make checkout faster</p>
            <button onClick={openModal} className="btn-primary">
              <FiPlus className="w-4 h-4 mr-2" />
              Add Your First Payment Method
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {paymentMethods.map(method => (
              <div key={method.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">
                      {getCardIcon(method.cardType)}
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">
                          {method.cardType} •••• {method.last4}
                        </h3>
                        {method.isDefault && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <FiStar className="w-3 h-3 mr-1" />
                            Default
                          </span>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600 mt-1">
                        <div>{method.cardholderName}</div>
                        <div>Expires {method.expiryMonth}/{method.expiryYear}</div>
                        {method.billingAddress && (
                          <div className="mt-1">
                            {method.billingAddress.address1}, {method.billingAddress.city}, {method.billingAddress.state} {method.billingAddress.zipCode}
                          </div>
                        )}
                      </div>
                      
                      {!method.isDefault && (
                        <button
                          onClick={() => setAsDefault(method.id)}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-2"
                        >
                          Set as default
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(method)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <FiEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(method.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Method Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}
                    </h3>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Security Notice */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center">
                      <FiLock className="w-4 h-4 text-green-600 mr-2" />
                      <span className="text-sm text-green-700">Your information is encrypted and secure</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Card Number */}
                    <div>
                      <label className="form-label">Card Number</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="1234 5678 9012 3456"
                          className="form-input pr-12"
                          maxLength="19"
                          required
                        />
                        {formData.cardType && (
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <span className="text-gray-500 text-sm">{formData.cardType}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Cardholder Name */}
                    <div>
                      <label className="form-label">Cardholder Name</label>
                      <input
                        type="text"
                        value={formData.cardholderName}
                        onChange={(e) => setFormData(prev => ({ ...prev, cardholderName: e.target.value }))}
                        placeholder="John Doe"
                        className="form-input"
                        required
                      />
                    </div>

                    {/* Expiry and CVV */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="form-label">Month</label>
                        <select
                          value={formData.expiryMonth}
                          onChange={(e) => setFormData(prev => ({ ...prev, expiryMonth: e.target.value }))}
                          className="form-select"
                          required
                        >
                          <option value="">MM</option>
                          {Array.from({length: 12}, (_, i) => (
                            <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                              {String(i + 1).padStart(2, '0')}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="form-label">Year</label>
                        <select
                          value={formData.expiryYear}
                          onChange={(e) => setFormData(prev => ({ ...prev, expiryYear: e.target.value }))}
                          className="form-select"
                          required
                        >
                          <option value="">YYYY</option>
                          {Array.from({length: 20}, (_, i) => {
                            const year = new Date().getFullYear() + i;
                            return (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                      <div>
                        <label className="form-label">CVV</label>
                        <input
                          type="text"
                          value={formData.cvv}
                          onChange={(e) => setFormData(prev => ({ ...prev, cvv: e.target.value }))}
                          placeholder="123"
                          className="form-input"
                          maxLength="4"
                          required
                        />
                      </div>
                    </div>

                    {/* Default Payment Method Checkbox */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isDefault"
                        checked={formData.isDefault}
                        onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
                        Set as default payment method
                      </label>
                    </div>

                    {/* Terms */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-start">
                        <FiInfo className="w-4 h-4 text-gray-500 mt-0.5 mr-2" />
                        <div className="text-xs text-gray-600">
                          By adding this payment method, you agree to our Terms of Service and Privacy Policy. Your payment information is securely encrypted.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    <FiCheck className="w-4 h-4 mr-2" />
                    {editingMethod ? 'Update Payment Method' : 'Add Payment Method'}
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

export default PaymentMethods; 