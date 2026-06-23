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
form.querySelector(
'[name="adults"]'
)?.value

const children =
form.querySelector(
'[name="children"]'
)?.value

const number_of_rooms =
form.querySelector(
'[name="rooms"]'
)?.value

const special_request =
form.querySelector(
'[name="message"]'
)?.value

const { error } =
await supabase
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
console.log("Submitting...")

if (error) {

alert(
'Booking failed'
)

console.log(error)

} else {

alert(
'Booking submitted successfully!'
)

form.reset()

}

})

}