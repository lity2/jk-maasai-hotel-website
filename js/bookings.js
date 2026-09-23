import { supabase } from './supabase.js'

const form = document.getElementById('booking-form')

if (form) {
    const roomTypeSelect = form.querySelector('[name="room-type"]')
    const checkInInput = form.querySelector('[name="check_in"]')
    const checkOutInput = form.querySelector('[name="check_out"]')
    const roomsInput = form.querySelector('[name="rooms"]')
    const messageContainer = document.getElementById('availability-message')
    const submitBtn = document.getElementById('btn-submit-booking') || form.querySelector('button[type="submit"]')

    let checkInPicker = null
    let checkOutPicker = null
    let disabledDatesList = []

    // Format Date object to YYYY-MM-DD local string
    function formatDateStr(date) {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    // Display availability feedback messages
    function showMessage(msg, type = 'info') {
        if (!messageContainer) return
        messageContainer.style.display = 'block'
        messageContainer.textContent = msg
        if (type === 'error') {
            messageContainer.style.backgroundColor = '#f8d7da'
            messageContainer.style.color = '#721c24'
            messageContainer.style.border = '1px solid #f5c6cb'
        } else if (type === 'success') {
            messageContainer.style.backgroundColor = '#d4edda'
            messageContainer.style.color = '#155724'
            messageContainer.style.border = '1px solid #c3e6cb'
        } else if (type === 'warning') {
            messageContainer.style.backgroundColor = '#fff3cd'
            messageContainer.style.color = '#856404'
            messageContainer.style.border = '1px solid #ffeeba'
        } else {
            messageContainer.style.backgroundColor = '#e2e3e5'
            messageContainer.style.color = '#383d41'
            messageContainer.style.border = '1px solid #d6d8db'
        }
    }

    function clearMessage() {
        if (messageContainer) {
            messageContainer.style.display = 'none'
            messageContainer.textContent = ''
        }
    }

    // Fetch occupied dates for selected room type over a lightweight 30-day window
    async function fetchOccupiedDates(roomType, numDays = 30) {
        if (!roomType) return []
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const promises = []
        for (let i = 0; i < numDays; i++) {
            const d1 = new Date(today)
            d1.setDate(today.getDate() + i)
            const d2 = new Date(d1)
            d2.setDate(d1.getDate() + 1)

            const checkInStr = formatDateStr(d1)
            const checkOutStr = formatDateStr(d2)

            promises.push(
                supabase.rpc('check_room_available', {
                    p_room_type: roomType,
                    p_check_in: checkInStr,
                    p_check_out: checkOutStr
                }).then(({ data, error }) => {
                    if (!error && data === false) {
                        return checkInStr
                    }
                    return null
                }).catch(() => null)
            )
        }

        const results = await Promise.all(promises)
        return results.filter(d => d !== null)
    }

    // Initialize Flatpickr instances
    function initPickers() {
        if (typeof flatpickr === 'undefined') {
            setTimeout(initPickers, 100)
            return
        }

        const todayStr = formatDateStr(new Date())

        checkInPicker = flatpickr(checkInInput, {
            minDate: todayStr,
            dateFormat: 'Y-m-d',
            altInput: true,
            altFormat: 'F j, Y',
            disable: disabledDatesList,
            onChange: function(selectedDates) {
                if (selectedDates.length > 0) {
                    const checkInDate = selectedDates[0]
                    const minCheckOut = new Date(checkInDate)
                    minCheckOut.setDate(checkInDate.getDate() + 1)

                    if (checkOutPicker) {
                        checkOutPicker.set('minDate', formatDateStr(minCheckOut))
                        const currentCheckOut = checkOutPicker.selectedDates[0]
                        if (currentCheckOut && currentCheckOut <= checkInDate) {
                            checkOutPicker.setDate(minCheckOut, true)
                        }
                    }
                    validateStayAvailability()
                }
            }
        })

        checkOutPicker = flatpickr(checkOutInput, {
            minDate: todayStr,
            dateFormat: 'Y-m-d',
            altInput: true,
            altFormat: 'F j, Y',
            disable: disabledDatesList,
            onChange: function() {
                validateStayAvailability()
            }
        })
    }

    // Update disabled dates when room type changes
    async function updateRoomAvailability() {
        const roomType = roomTypeSelect?.value
        if (!roomType) {
            clearMessage()
            return
        }

        showMessage('Checking room availability...', 'info')
        try {
            disabledDatesList = await fetchOccupiedDates(roomType, 30)
            if (checkInPicker && checkOutPicker) {
                checkInPicker.set('disable', disabledDatesList)
                checkOutPicker.set('disable', disabledDatesList)
            }
            clearMessage()
            validateStayAvailability()
        } catch (err) {
            console.error('Error fetching room availability:', err)
            clearMessage()
        }
    }

    // Validate stay range availability
    async function validateStayAvailability() {
        const roomType = roomTypeSelect?.value
        const checkInVal = checkInInput?.value
        const checkOutVal = checkOutInput?.value
        const requestedRooms = parseInt(roomsInput?.value) || 1

        if (!roomType || !checkInVal || !checkOutVal) {
            return true
        }

        const checkInDate = new Date(checkInVal)
        const checkOutDate = new Date(checkOutVal)

        if (checkOutDate <= checkInDate) {
            showMessage('Check-out date must be after check-in date.', 'error')
            return false
        }

        // Call Supabase RPC for full date range
        const { data: isAvailable, error } = await supabase.rpc('check_room_available', {
            p_room_type: roomType,
            p_check_in: checkInVal,
            p_check_out: checkOutVal
        })

        if (error) {
            console.error('RPC availability error:', error)
            return true
        }

        if (isAvailable === false) {
            showMessage('Sorry, this room type is not available for the selected dates.', 'error')
            return false
        }

        if (requestedRooms > 1) {
            showMessage('Note: Single-room availability verified. Requests for 2+ rooms require backend database verification for exact room counts.', 'warning')
        } else {
            showMessage('Selected dates are available!', 'success')
        }

        return true
    }

    // Event listeners (guaranteed single attachment)
    if (roomTypeSelect) {
        roomTypeSelect.addEventListener('change', updateRoomAvailability)
    }

    if (roomsInput) {
        roomsInput.addEventListener('input', validateStayAvailability)
    }

    // Init pickers on page load
    initPickers()

    // Form submit handler
    form.addEventListener('submit', async (e) => {
        e.preventDefault()

        const full_name = form.querySelector('[name="full_name"]')?.value
        const email = form.querySelector('[name="email"]')?.value
        const phone = form.querySelector('[name="phone"]')?.value
        const room_type = form.querySelector('[name="room-type"]')?.value
        const check_in = form.querySelector('[name="check_in"]')?.value
        const check_out = form.querySelector('[name="check_out"]')?.value
        const adults = parseInt(form.querySelector('[name="adults"]')?.value) || 1
        const children = parseInt(form.querySelector('[name="children"]')?.value) || 0
        const number_of_rooms = parseInt(form.querySelector('[name="rooms"]')?.value) || 1
        const special_request = form.querySelector('[name="message"]')?.value

        if (!room_type) {
            showMessage('Please select a room type.', 'error')
            return
        }

        if (!check_in || !check_out) {
            showMessage('Please select check-in and check-out dates.', 'error')
            return
        }

        const dIn = new Date(check_in)
        const dOut = new Date(check_out)
        if (dOut <= dIn) {
            showMessage('Check-out date must be after check-in date.', 'error')
            return
        }

        // Final RPC check before saving
        showMessage('Validating availability...', 'info')

        const { data: isAvailable, error: rpcErr } = await supabase.rpc('check_room_available', {
            p_room_type: room_type,
            p_check_in: check_in,
            p_check_out: check_out
        })

        if (rpcErr) {
            console.error('Availability RPC error during submit:', rpcErr)
        } else if (isAvailable === false) {
            showMessage('Sorry, this room type is not available for the selected dates.', 'error')
            return
        }

        if (submitBtn) {
            submitBtn.disabled = true
            submitBtn.textContent = 'Processing Booking...'
        }

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
                    special_request
                })
            })

            const result = await response.json()

            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Failed to submit booking request.')
            }

            console.log('Booking saved and processed successfully:', result.booking_reference)

            clearMessage()
            const successEl = document.getElementById('booking-success-message')
            if (successEl) {
                successEl.style.display = 'block'
            } else {
                alert('Booking submitted successfully!')
            }

            form.reset()

            if (checkInPicker) checkInPicker.clear()
            if (checkOutPicker) checkOutPicker.clear()
        } catch (err) {
            console.error('Booking submission error:', err)
            showMessage(err.message || 'Booking failed. Please try again.', 'error')
            alert(err.message || 'Booking failed. Please try again.')
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false
                submitBtn.textContent = 'Submit Booking Request'
            }
        }
    })
}