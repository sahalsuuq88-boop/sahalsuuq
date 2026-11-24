import mongoose from "mongoose";

const aboutSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    subtitle: {
      type: String,
      default: "",
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    story: {
      type: String,
      default: "",
    },

    mission: {
      type: String,
      default: "",
    },

    vision: {
      type: String,
      default: "",
    },

    values: [
      {
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
      },
    ],

    address: {
      type: String,
      default: "Hargeisa, Somaliland",
    },

    email: {
      type: String,
      default: "support@helsuuq.online",
    },

    phone: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const About = mongoose.model("About", aboutSchema);

export default About;