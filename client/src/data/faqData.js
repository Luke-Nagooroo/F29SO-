export const faqItems = [
  // Getting Started
  {
    id: "gs-1",
    category: "Getting Started",
    question: "How do I log my first health metric?",
    answer:
      "Navigate to your dashboard and click the 'Track Data' button in the top-right corner. Select the metric type (e.g. heart rate, steps, blood pressure), enter your value, and hit Save. Your metric will immediately appear on the dashboard tiles and in your activity charts.",
  },
  {
    id: "gs-2",
    category: "Getting Started",
    question: "What is the Wellness Score?",
    answer:
      "Your Wellness Score is a 0–100 composite score that reflects your recent health activity. It is calculated from three factors: how consistently you log vitals (50%), your medication adherence rate (30%), and your activity streak (20%). The score updates each time you log data and reflects the last 7 days of activity.",
  },
  {
    id: "gs-3",
    category: "Getting Started",
    question: "How do I connect a wearable device?",
    answer:
      "Go to the Wearables tab from your dashboard. You can connect Google Fit to sync steps, heart rate, and other metrics automatically. If you don't have a compatible wearable, you can use the built-in Device Simulator to generate test data and explore how the platform works.",
  },
  {
    id: "gs-4",
    category: "Getting Started",
    question: "Can I use MEDXI on my phone?",
    answer:
      "Yes — MEDXI is fully responsive and works on any modern smartphone browser. Open your browser, navigate to the app URL, and the layout will adapt automatically to your screen size. For the best mobile experience, you can also add it to your home screen as a Progressive Web App (PWA) through your browser's 'Add to Home Screen' option.",
  },

  // Health Metrics
  {
    id: "hm-1",
    category: "Health Metrics",
    question: "What do the metric tile colours mean?",
    answer:
      "Each metric tile shows a progress arc that fills based on how close your current reading is to the daily goal (where applicable). Blue/primary colour indicates normal or on-track values. Red indicates readings that have triggered a health alert due to values outside the safe range. Tiles without a colour arc (e.g. weight, blood glucose) show your latest reading without a goal comparison.",
  },
  {
    id: "hm-2",
    category: "Health Metrics",
    question: "How are health alerts generated?",
    answer:
      "Alerts are generated automatically when a logged metric falls outside medically established safe ranges: heart rate below 60 or above 100 bpm, blood pressure above 140/90 mmHg, blood glucose below 70 or above 140 mg/dL, and oxygen saturation below 95%. When an alert is created, you'll see it in the Alerts page and a banner will appear on your dashboard.",
  },
  {
    id: "hm-3",
    category: "Health Metrics",
    question: "Can I reorder the metric tiles on my dashboard?",
    answer:
      "Yes — the metric tiles on your dashboard are fully drag-and-droppable. Click and hold any tile, then drag it to your preferred position. Your custom order is saved to your browser's local storage and will persist across sessions on the same device.",
  },
  {
    id: "hm-4",
    category: "Health Metrics",
    question: "How do I view my metric history?",
    answer:
      "Click on any metric tile on the dashboard to open the Metric Detail Modal. This shows a 7-day chart of your readings for that metric type, along with your most recent value. You can also log a new reading directly from this modal.",
  },

  // Appointments
  {
    id: "ap-1",
    category: "Appointments",
    question: "How do I book an appointment?",
    answer:
      "Go to the Appointments tab from your dashboard. Click 'Book Appointment', select a provider, choose a date and time from the available slots, add an optional reason for your visit, and confirm. You'll receive a confirmation and the appointment will appear in your calendar. You can also book appointments directly from a health alert by clicking 'Book Appointment' on the alert card.",
  },
  {
    id: "ap-2",
    category: "Appointments",
    question: "Can I cancel or reschedule an appointment?",
    answer:
      "Yes — open the Appointments tab and find the appointment you want to change. Click the three-dot menu on the appointment card to access Cancel and Reschedule options. Cancellations and reschedules are reflected immediately for both you and your provider.",
  },
  {
    id: "ap-3",
    category: "Appointments",
    question: "How do I message my doctor about an appointment?",
    answer:
      "You can message any provider you have an appointment with via the Messages section. Navigate to Messages from the dashboard, find the conversation with your provider (or start a new one), and type your message. Your provider will be notified and can respond within the platform.",
  },

  // Medications
  {
    id: "med-1",
    category: "Medications",
    question: "How do I add a medication?",
    answer:
      "Go to the Medications tab on your dashboard and click 'Add Medication'. Enter the medication name, dosage, frequency (e.g. once daily, twice daily), and optional notes. Once added, it will appear in your medication list and you can log doses against it each day.",
  },
  {
    id: "med-2",
    category: "Medications",
    question: "How is medication adherence calculated?",
    answer:
      "Adherence is calculated as the percentage of scheduled doses you have logged as taken over the last 30 days. For example, if you have one daily medication and logged it on 25 of the last 30 days, your adherence is 83%. This figure feeds directly into your Wellness Score (30% weighting) and is visible on your Progress page.",
  },
  {
    id: "med-3",
    category: "Medications",
    question: "Will I get reminders for my medications?",
    answer:
      "Browser-based notification reminders are on the roadmap. Currently, your medication schedule is visible in the Medications tab and you can log doses manually each day. Logging a dose awards XP and contributes to your daily challenge progress if 'Take medications' is one of your active challenges.",
  },

  // Account
  {
    id: "acc-1",
    category: "Account",
    question: "How do I update my profile information?",
    answer:
      "Click your initials avatar in the dock at the bottom of the screen to go to your Profile page, or navigate directly to /profile. Click 'Edit' on the Account Information card to update your first name, last name, and phone number. Your email address cannot be changed after registration.",
  },
  {
    id: "acc-2",
    category: "Account",
    question: "How do I export my health data?",
    answer:
      "From your Profile page, scroll down to the 'Health Data Export' section (visible to patients only). Click 'Export Health Data' and choose between PDF (formatted report) or CSV (spreadsheet). You can optionally filter by date range before downloading. The export includes all logged health metrics, medications, and appointments.",
  },
  {
    id: "acc-3",
    category: "Account",
    question: "How do I change the app theme or colour scheme?",
    answer:
      "Click the palette icon in the dock at the bottom of any page. A small popup will appear with theme options (Crimson, Medical, Midnight, Emerald) and a light/dark mode toggle. Your selection is saved automatically and applies instantly across the entire app.",
  },
  {
    id: "acc-4",
    category: "Account",
    question: "Is my health data private and secure?",
    answer:
      "Yes. All data is stored securely and is only accessible to you and the healthcare providers you have appointments with. Passwords are hashed and never stored in plain text. All API communication is encrypted via HTTPS. Health data is never shared with third parties.",
  },
];

export const faqCategories = [
  "All",
  "Getting Started",
  "Health Metrics",
  "Appointments",
  "Medications",
  "Account",
];
