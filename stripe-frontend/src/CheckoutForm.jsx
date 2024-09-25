import React, { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";

const CheckoutForm = ({ product }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState(null);

  // State for shipping and customer information
  const [shippingInfo, setShippingInfo] = useState({
    receiver_name: "",
    sender_name: "",
    sender_email: "",
    receiver_email: "",
    addressCountry: "",
  });

  const [email, setEmail] = useState("");

  const handleShippingChange = (e) => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);

    // Create a token using the card element
    const { token, error } = await stripe.createToken(cardElement);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    // Prepare data to send to the backend
    const paymentData = {
      product: {
        name: product.name,
        price: product.price, // Price in cents
      },
      token,
      shipping: {
        receiver_name: shippingInfo.receiver_name,
        sender_name: shippingInfo.sender_name,
        sender_email: shippingInfo.sender_email,
        receiver_email: shippingInfo.receiver_email,
        addressCountry: shippingInfo.addressCountry,
      },
    };

    // Send token and product details to your backend
    const response = await fetch("http://localhost:5000/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paymentData),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("Payment successful!", data);
      // Handle successful payment (e.g., show confirmation)
    } else {
      setErrorMessage(data.error || "Payment processing failed.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />

      {/* Shipping Information Fields */}
      <input
        type="text"
        name="receiver_name"
        placeholder="Receiver Full Name"
        value={shippingInfo.receiver_name}
        onChange={handleShippingChange}
        required
      />
      {/* <input
        type="email"
        name="receiver_email"
        placeholder="Receiver Email Address"
        value={shippingInfo.receiver_email}
        onChange={handleShippingChange}
        required
      /> */}
      <input
        type="text"
        name="addressCountry"
        placeholder="Receiver Country"
        value={shippingInfo.addressCountry}
        onChange={handleShippingChange}
        required
      />

      <input
        type="text"
        name="sender_name"
        placeholder="Your Full Name"
        value={shippingInfo.sender_name}
        onChange={handleShippingChange}
        required
      />

      <input
        type="email"
        name="sender_email"
        placeholder="Your Email Address"
        value={shippingInfo.sender_email}
        onChange={handleShippingChange}
        required
      />

      <button type="submit" disabled={!stripe}>
        Pay
      </button>
      {errorMessage && <div>{errorMessage}</div>}
    </form>
  );
};

export default CheckoutForm;
