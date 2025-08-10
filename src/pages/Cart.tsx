import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, CreditCard, Lock } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { courseService } from '../services/courseService';
import { useAuth } from '../contexts/AuthContext';

export default function Cart() {
  const { cartItems, removeFromCart, clearCart } = useCart();
  const { user, updatePurchasedCourses } = useAuth();
  const [billingInfo, setBillingInfo] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });
  const navigate = useNavigate();

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    // Add spaces every 4 digits
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

  const formatExpiryDate = (value: string) => {
    // Remove all non-digits
    const v = value.replace(/\D/g, '');
    // Add slash after 2 digits
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (name === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
    } else if (name === 'cvv') {
      // Only allow digits for CVV and limit to 4 characters
      formattedValue = value.replace(/\D/g, '').substring(0, 4);
    }

    setBillingInfo({
      ...billingInfo,
      [name]: formattedValue
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const courseDetails = cartItems.map(item => ({
        courseId: item.course.id,
        title: item.course.title,
        price: item.course.price,
        quantity: item.quantity,
      }));

      await courseService.addUserPayment(user.id, total, tax, courseDetails);

      // Extract course IDs to add to user_courses
      const courseIds = cartItems.map(item => item.course.id);
      await courseService.addUserCourses(user.id, courseIds);

      // Navigate to the profile view after successful payment
      await updatePurchasedCourses(user.id);
      localStorage.setItem('cartItems', JSON.stringify([]));
      clearCart();
      navigate('/profile');
    } catch (error) {
      console.error('Payment processing failed:', error);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.course.price * item.quantity, 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No se ha seleccionado ningún curso</h2>
            <p className="text-gray-600 mb-8">Parece que aún no has agregado ningún curso.</p>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Explorar Cursos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Carrito de Compras</h1>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              {cartItems.map((item) => (
                <div key={item.course.id} className="p-6 border-b last:border-b-0">
                  <div className="flex items-start space-x-4">
                    <img
                      src={item.course.thumbnail}
                      alt={item.course.title}
                      className="w-32 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{item.course.title}</h3>
                      <p className="text-sm text-gray-600">por {item.course.instructor.name}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-lg font-bold text-gray-900">
                          ${item.course.price.toFixed(2)}
                        </span>
                        <button
                          className="text-red-600 hover:text-red-700 flex items-center"
                          aria-label="Remove item"
                          onClick={() => removeFromCart(item)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Information */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumen del Pedido</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Impuestos (10%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Información de Pago</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
                    Número de Tarjeta
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      value={billingInfo.cardNumber}
                      onChange={handleInputChange}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <CreditCard className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="cardName" className="block text-sm font-medium text-gray-700">
                      Nombre del Tarjetahabiente
                    </label>
                    <input
                      type="text"
                      id="cardName"
                      name="cardName"
                      value={billingInfo.cardName}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
                      Fecha de Vencimiento
                    </label>
                    <input
                      type="text"
                      id="expiryDate"
                      name="expiryDate"
                      value={billingInfo.expiryDate}
                      onChange={handleInputChange}
                      placeholder="MM/AA"
                      maxLength={5}
                      className="mt-1 block w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">
                    CVV
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type="text"
                      id="cvv"
                      name="cvv"
                      value={billingInfo.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      maxLength={4}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-4">Dirección de Facturación</h3>
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Dirección
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={billingInfo.address}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                      Ciudad
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={billingInfo.city}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                      Estado
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={billingInfo.state}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                      Código Postal
                    </label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={billingInfo.zipCode}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                      País
                    </label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={billingInfo.country}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <Lock className="h-5 w-5 mr-2" />
                  Pagar ${total.toFixed(2)}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}