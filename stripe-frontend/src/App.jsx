import React from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "./CheckoutForm.jsx";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const product = {
  name: "Test",
  price: 500,
};

const App = () => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm product={product} />
    </Elements>
  );
};

export default App;
