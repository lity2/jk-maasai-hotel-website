import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function handler(event) {
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
      special_request,
      booking_reference
    } = JSON.parse(event.body);

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

    console.log("Hotel Email:");
    console.log(JSON.stringify(hotelEmail, null, 2));

    console.log("Guest Email:");
    console.log(JSON.stringify(guestEmail, null, 2));
    console.log("Guest email:", email);

    if (hotelEmail.error) {
      console.error("Hotel email error:", hotelEmail.error);
    }

    if (guestEmail.error) {
      console.error("Guest email error:", guestEmail.error);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true
      })
    };

  } catch (error) {

    console.error(error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };

  }
}