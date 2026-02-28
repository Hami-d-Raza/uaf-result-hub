# UAF Result Hub 🎓

An advanced, unofficial Result & GPA Management System for the University of Agriculture Faisalabad (UAF). Built to provide a modern, fast, and responsive interface for students to check their results and calculate their GPA/CGPA with precision.

![Project Status](https://img.shields.io/badge/Status-Active-success)
[![Live Demo](https://img.shields.io/badge/Live-uafcalc.online-6d28d9)](https://uafcalc.online)
![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## ✨ Features

- **Instant Result Fetching** — Retrieve complete academic history using your AG Number (e.g., `2022-ag-7688`).
- **Accurate GPA/CGPA Calculator** — Automatically implements official UAF grading formulas including repeat/improvement logic.
- **Individual Result Page** — Full semester-wise breakdown with marks, grades, and credit hours per subject.
- **Class Result** — Fetch and compare results for an entire class using an AG number range or Excel upload.
- **Smart Search** — Filter results by course name, grade, or CGPA across any fetched dataset.
- **GPA Analytics Dashboard** — Visualize semester trends, peak/lowest GPA, pass rates, and grade distribution charts.
- **Target CGPA Calculator** — Enter your AG number to auto-fetch your current standing, then set a target CGPA and get the required GPA per semester with projection charts and credit-load scenarios.
- **Academic Milestones** — Tracks Dean's List, Good Standing, Satisfactory, and Probation thresholds.
- **Loading Skeleton Screens** — Smooth skeleton placeholders replace all spinners across every page.
- **Dark / Light Mode** — Fully themed purple/amber palette, toggleable at any time.
- **Mobile Responsive** — Fully optimized for seamless use on smartphones and desktop.
- **Privacy Policy & Contact Page** — Built-in contact form (powered by Formspree) for bug reports and feature requests.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Frontend Framework | [React 18](https://react.dev/) |
| Build Tool | [Vite](https://vitejs.dev/) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| UI Components | [Shadcn UI](https://ui.shadcn.com/) + Radix Primitives |
| Animations | [Framer Motion](https://www.framer.com/motion/) |
| Charts | [Recharts](https://recharts.org/) |
| Data Fetching | [TanStack Query (React Query)](https://tanstack.com/query/latest) |
| Routing | React Router DOM v6 |
| HTML Parsing | [Cheerio](https://cheerio.js.org/) |
| Deployment | [Vercel](https://vercel.com/) |

---

## 🏗️ Architecture & How it Works

Since UAF does not provide a public API, extracting data requires a specialized approach:

1. **Proxy Server** — A Vercel Serverless Function (`/api/proxy`) acts as a secure intermediary.
2. **Session Handling** — The proxy automates the login handshake with the LMS to retrieve CSRF tokens and session cookies.
3. **HTML Parsing** — Raw HTML result pages are fetched from the university server and parsed with **Cheerio**, extracting marks and course details into clean JSON.
4. **Client-Side Logic** — The React frontend receives the JSON and runs all GPA calculation algorithms locally for instant feedback.

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18 or higher
- npm or bun

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Hami-d-Raza/uafcalc.git

# 2. Navigate to directory
cd uafcalc

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

The app will be running at `http://localhost:8080`.

---

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/         # Header, Footer, Layout wrapper
│   ├── results/        # ResultCard, AnalyticsDashboard, StudentOverview etc.
│   └── ui/             # Shadcn components + custom (AGNumberInput, GPADisplay, LoadingSkeleton...)
├── pages/
│   ├── Dashboard.tsx
│   ├── IndividualResult.tsx
│   ├── ClassResult.tsx
│   ├── SmartSearch.tsx
│   ├── TargetCalculator.tsx
│   ├── Contact.tsx
│   └── PrivacyPolicy.tsx
├── lib/                # gpaCalculator, uaf-scraper, pdfGenerator, utils
├── config/             # semesterMap
├── types/              # result.ts TypeScript interfaces
└── hooks/              # use-toast, use-mobile
```

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 👤 Author

**Muhammad Hamid Raza**
- GitHub: [@Hami-d-Raza](https://github.com/Hami-d-Raza)
- LinkedIn: [muhammad-hamid-raza-](https://www.linkedin.com/in/muhammad-hamid-raza-/)

---

## 📝 License

This project is open-source and available under the **MIT License**.

---

*Note: This is an unofficial tool and is not affiliated with the University of Agriculture Faisalabad.*
