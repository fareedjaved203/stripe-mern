require("dotenv").config();
const cors = require("cors");
const express = require("express");
const { v4: uuid } = require("uuid");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Server is running...");
});

app.post("/payment", async (req, res) => {
  const { product, shipping, token } = req.body;
  const idempotencyKey = uuid();

  console.log(shipping);

  try {
    // Create a new customer
    const customer = await stripe.customers.create({
      email: shipping.sender_email,
      source: token.id,
      name: shipping.sender_name,
    });

    // Create a charge
    const charge = await stripe.charges.create(
      {
        amount: product.price * 100, // amount in cents
        currency: "usd",
        customer: customer.id,
        receipt_email: shipping.receiver_email,
        description: product.name,
        shipping: {
          name: shipping.receiver_name,
          address: {
            country: shipping.addressCountry,
          },
        },
      },
      { idempotencyKey }
    );

    res.status(200).json({ charge });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Payment processing failed." });
  }
});

app.listen(5000, () => {
  console.log("server connected");
});
