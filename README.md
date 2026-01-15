[//]: # (Author: Abdul Faheem A)
[//]: # (Copyrights: Gahranox Carvel Labs Technologies)
[//]: # (Purpose: Documentation for the Bill0 professional invoice generator project.)
[//]: # (Usecase: Serves as the primary guide for developers to set up, run, and test the application.)

# Bill0 🧾

**Bill0** is a professional, open-source invoice generator designed for precision and ease of use. Built with Angular, it empowers users to create high-quality, professional invoices with real-time financial calculations and instant PDF downloads.

🌐 **Live Demo:** [https://gahranoxcarvel.in/Bill0-Free/](https://gahranoxcarvel.in/Bill0-Free/)

---

## 🚀 Features
- **Simplified & Full Invoices**: Supports both B2C and B2B requirements.
- **Financial Precision**: Real-time calculations for subtotals, complex tax structures (Inclusive/Exclusive), and discounts.
- **Personalization**: Upload and manage business logos directly within the interface.
- **Professional PDF Exports**: Generate and download professional billing documents instantly.
- **Responsive Design**: Modern, premium UI optimized for desktop and mobile devices.
- **Animated Experience**: Interactive welcome notifications and delightful loading states.

---

## 🛠️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v20 or higher)
- [npm](https://www.npmjs.com/) (v10 or higher)

### Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/Gahranox-Carvel-Labs/Bill0.git
   ```

2. **Navigate to the project directory:**
   ```bash
   cd Bill0
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

---

## 💻 Development Workflow

### Start the Application
Run the local development server:
```bash
npm start
```
Navigate to `http://localhost:4200/`. The app will automatically reload on source changes.

### Build for Production
To create an optimized production build:
```bash
npm run build
```
The compiled artifacts will be stored in the `dist/` directory. These files are ready to be deployed to any static web hosting service (e.g., GitHub Pages, Vercel, or Netlify).

### User Flow
1. **Configuration**: Select Invoice Type (Full/Simplified) and Currency.
2. **Identity**: Enter Seller and Buyer details; upload your Business Logo.
3. **Line Items**: Add products/services with specific tax rates and discounts.
4. **Validation**: Review real-time totals in the premium summary card.
5. **PDF Export**: Click "Generate Bill" to download your professional document.

---

## 🧪 Testing Suite

### Unit Testing (Jasmine/Karma)
Validates core logic, services, and components using the Jasmine framework:
```bash
npm test
```

### UAT / E2E Testing (Playwright)
Executes comprehensive UI scenarios across multiple browsers. This project is configured to test against:
- **Chromium** (Google Chrome, Microsoft Edge)
- **Firefox** (Mozilla Firefox)
- **WebKit** (Apple Safari)

> [!IMPORTANT]
> To run these tests, you must first install the necessary browser binaries:
> ```bash
> npx playwright install
> ```

To execute the full UAT suite:
```bash
npx playwright test
```

---

## 💎 Bill0 PRO (Coming Soon)
A premium version of Bill0 is currently in development, featuring:
- Cloud-based invoice management
- Multi-user collaboration & teams
- Advanced financial analytics & reporting
- Automated payment integrations

---

## 🤝 Collaboration & Support
We welcome contributions and professional collaborations!

- **Support & Inquiries**: [support@gahranoxcarvel.in](mailto:support@gahranoxcarvel.in)
- **Organization**: Gahranox Carvel Labs Technologies

---

[//]: # (Built with passion by Gahranox Carvel Labs)
