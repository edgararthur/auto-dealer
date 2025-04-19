import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrderService, PaymentService, CartService } from 'autoplus-shared';

const Checkout = ({ userId }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [processingFee, setProcessingFee] = useState(0);
  const [shippingInfo, setShippingInfo] = useState({
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
    method: 'STANDARD'
  });
  const [orderSummary, setOrderSummary] = useState(null);

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }
    
    fetchCartItems();
    fetchPaymentMethods();
  }, [userId, navigate]);

  useEffect(() => {
    if (cartTotal > 0) {
      const fees = PaymentService.calculateProcessingFee(cartTotal);
      setProcessingFee(fees.processingFee);
    }
  }, [cartTotal]);

  const fetchCartItems = async () => {
    setLoading(true);
    try {
      const result = await CartService.getCartItems(userId);
      if (result.success) {
        setCartItems(result.cartItems);
        setCartTotal(result.cartTotal);
      } else {
        setError('Failed to load cart items');
      }
    } catch (err) {
      setError('An error occurred while fetching cart items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const result = await PaymentService.getUserPaymentMethods(userId);
      if (result.success) {
        setPaymentMethods(result.paymentMethods);
        if (result.paymentMethods.length > 0) {
          const defaultMethod = result.paymentMethods.find(m => m.isDefault) || result.paymentMethods[0];
          setSelectedPaymentMethod(defaultMethod.id);
        }
      } else {
        setError('Failed to load payment methods');
      }
    } catch (err) {
      setError('An error occurred while fetching payment methods');
      console.error(err);
    }
  };

  const handleShippingInfoChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateShippingInfo = () => {
    const { address, city, state, zip } = shippingInfo;
    if (!address || !city || !state || !zip) {
      setError('Please fill in all shipping information fields');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateShippingInfo()) {
      setStep(2);
      setError('');
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
      setError('');
    }
  };

  const handlePaymentMethodChange = (e) => {
    setSelectedPaymentMethod(e.target.value);
  };

  const handlePlaceOrder = async () => {
    if (!selectedPaymentMethod) {
      setError('Please select a payment method');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create order
      const orderData = {
        shipping_address: shippingInfo.address,
        shipping_city: shippingInfo.city,
        shipping_state: shippingInfo.state,
        shipping_zip: shippingInfo.zip,
        shipping_country: shippingInfo.country,
        shipping_method: shippingInfo.method,
        payment_method_id: selectedPaymentMethod
      };

      const orderResult = await OrderService.createOrder(userId, orderData);
      
      if (!orderResult.success) {
        throw new Error(orderResult.error || 'Failed to create order');
      }

      // Process payment
      const paymentResult = await PaymentService.processPayment(
        orderResult.order.id,
        orderResult.order.total_amount,
        selectedPaymentMethod
      );

      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Payment processing failed');
      }

      setOrderSummary(orderResult.order);
      setStep(3); // Move to order confirmation step
    } catch (err) {
      setError(err.message || 'An error occurred during checkout');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && step !== 3) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Checkout</h1>
          <div className="flex space-x-2">
            <div className={`h-2 w-16 rounded ${step >= 1 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`h-2 w-16 rounded ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`h-2 w-16 rounded ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {step === 1 && (
        <div className="shipping-info">
          <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
                Address
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="address"
                type="text"
                name="address"
                value={shippingInfo.address}
                onChange={handleShippingInfoChange}
                placeholder="Street Address"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="city">
                City
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="city"
                type="text"
                name="city"
                value={shippingInfo.city}
                onChange={handleShippingInfoChange}
                placeholder="City"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="state">
                State
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="state"
                type="text"
                name="state"
                value={shippingInfo.state}
                onChange={handleShippingInfoChange}
                placeholder="State/Province"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="zip">
                ZIP/Postal Code
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="zip"
                type="text"
                name="zip"
                value={shippingInfo.zip}
                onChange={handleShippingInfoChange}
                placeholder="ZIP/Postal Code"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="country">
                Country
              </label>
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="country"
                name="country"
                value={shippingInfo.country}
                onChange={handleShippingInfoChange}
                required
              >
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="GH">Ghana</option>
                <option value="NG">Nigeria</option>
                <option value="UK">United Kingdom</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="method">
                Shipping Method
              </label>
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="method"
                name="method"
                value={shippingInfo.method}
                onChange={handleShippingInfoChange}
                required
              >
                <option value="STANDARD">Standard Shipping (3-5 business days)</option>
                <option value="EXPRESS">Express Shipping (1-2 business days)</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={handleNextStep}
            >
              Continue to Payment
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="payment-info">
          <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
          
          {paymentMethods.length > 0 ? (
            <div className="mb-6">
              <div className="mb-4">
                {paymentMethods.map(method => (
                  <div key={method.id} className="flex items-center p-4 border rounded mb-2">
                    <input
                      type="radio"
                      id={`payment-${method.id}`}
                      name="paymentMethod"
                      value={method.id}
                      checked={selectedPaymentMethod === method.id}
                      onChange={handlePaymentMethodChange}
                      className="mr-2"
                    />
                    <label htmlFor={`payment-${method.id}`} className="flex items-center">
                      <div className="mr-2">
                        {method.cardType === 'VISA' && <span className="text-blue-700">VISA</span>}
                        {method.cardType === 'MASTERCARD' && <span className="text-red-700">MasterCard</span>}
                        {method.cardType === 'AMEX' && <span className="text-blue-500">American Express</span>}
                      </div>
                      <div>
                        <div>{method.maskedCardNumber}</div>
                        <div className="text-sm text-gray-600">Expires: {method.expiryMonth}/{method.expiryYear}</div>
                      </div>
                      {method.isDefault && <span className="ml-auto text-sm text-green-600">Default</span>}
                    </label>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between">
                <button
                  className="text-blue-500 hover:text-blue-700 font-bold"
                  onClick={() => navigate('/account/payment-methods')}
                >
                  Add New Payment Method
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 rounded">
              <p className="mb-2">You don't have any payment methods saved.</p>
              <button
                className="text-blue-500 hover:text-blue-700 font-bold"
                onClick={() => navigate('/account/payment-methods')}
              >
                Add Payment Method
              </button>
            </div>
          )}

          <div className="order-summary bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
            
            <div className="mb-4">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between py-2 border-b">
                  <div className="flex">
                    <span className="font-medium">{item.quantity} x </span>
                    <span className="ml-2">{item.product.name}</span>
                  </div>
                  <span>${(item.total).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Processing Fee</span>
                <span>${processingFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shippingInfo.method === 'EXPRESS' ? '$15.00' : '$5.00'}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span>${(cartTotal + processingFee + (shippingInfo.method === 'EXPRESS' ? 15 : 5)).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <button
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={handlePreviousStep}
            >
              Back to Shipping
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={handlePlaceOrder}
              disabled={loading || !selectedPaymentMethod}
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </div>
      )}

      {step === 3 && orderSummary && (
        <div className="order-confirmation">
          <div className="text-center mb-6">
            <div className="inline-block p-4 bg-green-100 text-green-700 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Order Placed Successfully!</h2>
            <p className="text-gray-600">Your order #{orderSummary.orderNumber} has been confirmed.</p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h3 className="text-lg font-semibold mb-4">Order Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Order Number:</span>
                <span>{orderSummary.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{new Date(orderSummary.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span>${orderSummary.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Address:</span>
                <span>{shippingInfo.address}, {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zip}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 justify-center">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline"
              onClick={() => navigate(`/orders/${orderSummary.id}`)}
            >
              View Order Details
            </button>
            <button
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline"
              onClick={() => navigate('/products')}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout; 