import Stripe from "stripe";
import { Purchase } from "../models/Purchase.js";
import Course from "../models/Course.js";
import User from "../models/User.js";
import connectDB from "../configs/mongodb.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhooks = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  try {
    await connectDB();

    // express.raw() gives us a Buffer in req.body
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const { purchaseId } = session.metadata || {};

      if (purchaseId) {
        const purchaseData = await Purchase.findById(purchaseId);

        if (purchaseData && purchaseData.status !== "completed") {
          const userData = await User.findById(purchaseData.userId);
          const courseData = await Course.findById(purchaseData.courseId);

          if (userData && courseData) {
            const alreadyInCourse = courseData.enrolledStudents.some((id) => id.equals(userData._id));
            if (!alreadyInCourse) {
              courseData.enrolledStudents.push(userData._id);
              await courseData.save();
            }

            const alreadyInUser = userData.enrolledCourses.some((id) => id.equals(courseData._id));
            if (!alreadyInUser) {
              userData.enrolledCourses.push(courseData._id);
              await userData.save();
            }

            purchaseData.status = "completed";
            await purchaseData.save();
          }
        }
      }
    }

    res.json({ received: true });
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
};