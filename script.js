"use strict";

// ==================================
// NASHY HAVEN STAYS - JAVASCRIPT
// ==================================

// Replace this with your actual business email.
const FORMSPREE_URL = "https://formspree.io/f/mjyyydep";

// MOBILE NAVIGATION
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");

  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.textContent = isOpen ? "✕" : "☰";
});

// Close the mobile menu when a link is clicked
document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.textContent = "☰";
  });
});

// COPYRIGHT YEAR
document.getElementById("year").textContent = new Date().getFullYear();

// BOOKING ELEMENTS
const bookingForm = document.getElementById("bookingForm");
const checkIn = document.getElementById("checkIn");
const checkOut = document.getElementById("checkOut");
const apartmentSelect = document.getElementById("apartment");
const formStatus = document.getElementById("formStatus");

// Get today's date in local time
function getLocalDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Prevent selecting past dates
const today = getLocalDate();

checkIn.min = today;
checkOut.min = today;

// Set checkout to at least one day after check-in
checkIn.addEventListener("change", () => {
  if (!checkIn.value) return;

  const nextDay = new Date(`${checkIn.value}T12:00:00`);
  nextDay.setDate(nextDay.getDate() + 1);

  const minimumCheckout = getLocalDate(nextDay);

  checkOut.min = minimumCheckout;

  if (checkOut.value && checkOut.value < minimumCheckout) {
    checkOut.value = "";
  }
});

// SELECT APARTMENT WHEN INQUIRE IS CLICKED
document.querySelectorAll(".book-apartment").forEach((button) => {
  button.addEventListener("click", () => {
    const apartmentName = button.dataset.apartment;

    apartmentSelect.value = apartmentName;
  });
});

// DISPLAY FORM MESSAGE
function showStatus(message, type) {
  formStatus.textContent = message;
  formStatus.className = `form-status ${type}`;
}

// BOOKING INQUIRY FORM

 // BOOKING INQUIRY FORM - FORMSPREE

bookingForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const submitButton = bookingForm.querySelector(
    'button[type="submit"]'
  );

  const name = document.getElementById("guestName").value.trim();
  const email = document.getElementById("guestEmail").value.trim();
  const phone = document.getElementById("guestPhone").value.trim();
  const stayType = document.getElementById("stayType").value;
  const apartment = apartmentSelect.value;
  const arrival = checkIn.value;
  const departure = checkOut.value;
  const guests = document.getElementById("guests").value;
  const message = document.getElementById("message").value.trim();

  if (!bookingForm.reportValidity()) return;

  // Validate booking dates
  if (arrival < getLocalDate()) {
    showStatus("Check-in cannot be in the past.", "error");
    return;
  }

  if (departure <= arrival) {
    showStatus(
      "Check-out must be after check-in.",
      "error"
    );
    return;
  }

  // Calculate nights
  const nights = Math.round(
    (
      new Date(`${departure}T12:00:00`) -
      new Date(`${arrival}T12:00:00`)
    ) / (1000 * 60 * 60 * 24)
  );

  // Prepare booking information
  const bookingData = {
    name: name,
    email: email,
    phone: phone,
    stayType: stayType,
    apartment: apartment,
    checkIn: arrival,
    checkOut: departure,
    nights: nights,
    guests: guests,
    message: message || "None",
    _subject: `New Nashy Haven Booking Inquiry - ${name}`
  };

  // Disable button during submission
  submitButton.disabled = true;
  submitButton.textContent = "Sending Inquiry...";

  try {
    const response = await fetch(FORMSPREE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(bookingData)
    });

    if (response.ok) {
      showStatus(
        "Your booking inquiry has been sent successfully! We will contact you soon.",
        "success"
      );

      bookingForm.reset();

      checkIn.min = getLocalDate();
      checkOut.min = getLocalDate();
    } else {
      showStatus(
        "Unable to send your inquiry. Please try again.",
        "error"
      );
    }
  } catch (error) {
    console.error("Booking submission error:", error);

    showStatus(
      "Connection error. Please check your internet and try again.",
      "error"
    );
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Send Booking Inquiry →";
  }
});
