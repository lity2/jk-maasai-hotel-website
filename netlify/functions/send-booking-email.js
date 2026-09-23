import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY);

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function handler(event) {
  if (event.httpMethod && event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, error: "Method Not Allowed" })
    };
  }

  try {
    const {
      full_name,
      email,
      phone,
      room_type,
      check_in,
      check_out,
      adults,
      children,
      number_of_rooms,
      special_request
    } = JSON.parse(event.body || "{}");

    if (!full_name || !email || !room_type || !check_in || !check_out) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: "Missing required booking fields." })
      };
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable.");
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          error: "Server configuration error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables must be configured on Netlify."
        })
      };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert booking using elevated Service Role Key privileges
    const { data, error: dbError } = await supabase
      .from("bookings")
      .insert([
        {
          full_name,
          email,
          phone,
          room_type,
          check_in,
          check_out,
          special_request,
          adults,
          children,
          number_of_rooms
        }
      ])
      .select()
      .single();

    if (dbError) {
      console.error("Supabase server-side insert error:", dbError);
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          error: dbError.message || "Failed to save booking record to database."
        })
      };
    }

    const booking_reference = data.booking_reference;

    // Email to the hotel
    const hotelEmail = await resend.emails.send({
      from: "JK Maasai Hotel <reservations@jkmaasaihotel.com>",
      to: "reservations@jkmaasaihotel.com",
      subject: `New Booking Request - ${booking_reference}`,
      html: `
        <h2>New Booking Request</h2>

        <p><strong>Booking Reference:</strong> ${booking_reference}</p>

        <p><strong>Guest:</strong> ${full_name}</p>

        <p><strong>Email:</strong> ${email}</p>

        <p><strong>Phone:</strong> ${phone}</p>

        <p><strong>Room Type:</strong> ${room_type}</p>

        <p><strong>Check In:</strong> ${check_in}</p>

        <p><strong>Check Out:</strong> ${check_out}</p>

        <p><strong>Adults:</strong> ${adults}</p>

        <p><strong>Children:</strong> ${children}</p>

        <p><strong>Rooms:</strong> ${number_of_rooms}</p>

        <p><strong>Special Request:</strong> ${special_request || "None"}</p>
      `
    });

    // Confirmation email to the guest
    const guestEmail = await resend.emails.send({
      from: "JK Maasai Hotel <reservations@jkmaasaihotel.com>",
      to: email,
      subject: "Your Booking Request has been Received",
      html: `
        <h2>Thank you for choosing JK Maasai Hotel!</h2>

        <p>Dear ${full_name},</p>

        <p>We have successfully received your booking request.</p>

        <p><strong>Booking Reference:</strong> ${booking_reference}</p>

        <p>Our reservations team will review your request and contact you shortly to confirm availability and payment details.</p>

        <br>

        <p>Kind regards,</p>

        <p><strong>Reservations Team</strong><br>
        JK Maasai Hotel<br>
        reservations@jkmaasaihotel.com</p>
      `
    });

    console.log("Hotel Email:", JSON.stringify(hotelEmail, null, 2));
    console.log("Guest Email:", JSON.stringify(guestEmail, null, 2));

    if (hotelEmail.error || guestEmail.error) {
      const emailErrorDetails = hotelEmail.error || guestEmail.error;
      console.error("Hotel Email Error:", hotelEmail.error);
      console.error("Guest Email Error:", guestEmail.error);

      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          error: `Your booking (Ref: ${booking_reference}) was saved, but confirmation email delivery failed (${emailErrorDetails.message || "Email error"}). Please contact support directly instead of re-submitting to avoid duplicate bookings.`,
          booking_reference: booking_reference
        })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        booking_reference: booking_reference
      })
    };

  } catch (error) {
    console.error("Booking handler error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
}