import { supabase } from './supabase.js'

const form =
document.getElementById('booking-form')

if (form) {

form.addEventListener(
'submit',
async (e) => {

e.preventDefault()

const full_name =
form.querySelector(
'[name="full_name"]'
)?.value

const email =
form.querySelector(
'[name="email"]'
)?.value

const phone =
form.querySelector(
'[name="phone"]'
)?.value

const room_type =
form.querySelector(
'[name="room-type"]'
)?.value

const check_in =
form.querySelector(
'[name="check_in"]'
)?.value

const check_out =
form.querySelector(
'[name="check_out"]'
)?.value

const adults =
parseInt(form.querySelector('[name="adults"]').value) || 1

const children =
parseInt(form.querySelector('[name="children"]').value) || 0

const number_of_rooms =
parseInt(form.querySelector('[name="rooms"]').value) || 1

const special_request =
form.querySelector(
'[name="message"]'
)?.value

const { data, error } = await supabase
    .from('bookings')
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
console.log("Submitting...")

if (error) {

    console.error(error);

    alert(error.message);

    return;

} else {

    console.log("Booking saved successfully.");

    // Try sending confirmation email
    try {

        const response = await fetch('/.netlify/functions/send-booking-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
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
                booking_reference: data.booking_reference
            })
        });

        const result = await response.json();

        console.log(result);

    } catch (err) {

        console.error("Email sending failed:", err);

    }

    alert("Booking submitted successfully!");

    form.reset();

}

})

}