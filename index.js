import express from "express";
import twilio from "twilio";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import moment from "moment";

dotenv.config();

const app = express();
const port = 5000;

app.use(express.json());
app.use(
  cors({
    origin: "https://api-portfolio-v2-mauve.vercel.app",
  })
);

const client = new twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
client.autoRetry = true;
console.log(client);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Conneted to db");
  })
  .catch((err) => console.log(err));

const Client = mongoose.model("Client", {
  name: {
    type: String,
    required: true,
  },
  emailorPhone: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
});

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Hello World!",
  });
});

app.post("/send",cors(), async (req, res) => {
  try {
    const { name, emailorPhone, message } = req.body;
    const date = moment().format("MMMM Do YYYY, h:mm:ss a");
    const smsBody = `Mr/Ms "${name}" at "${date}" \nwant to Contact you with this Email or Phone number "${emailorPhone}" \nAsking somthing like that:\n >> "${message}"`;
    const newClient = new Client({
      name,
      emailorPhone,
      message,
      date,
    });
    await client.messages
    .create({
      to: process.env.YOUR_NUMBER,
      from: process.env.YOUR_TWILIO_NUMBER,
      body: smsBody,
    })
    .then((res) => {
      console.log("Msg sent Successfully");
    }).catch((err) => { 
      console.log(err);
    });
    await newClient.save();
    res.status(201).json({
      success: true,
      message: "Message Sent Successfully!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});
