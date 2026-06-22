# 🚰 EquiFlow – Smart Water Pressure Management System

EquiFlow is an IoT-enabled smart water infrastructure management system designed to improve municipal water distribution through intelligent pressure control, leak detection, automated valve operations, and role-based monitoring.

The system aims to reduce water wastage, improve supply reliability, minimize non-revenue water, and support smart city initiatives through data-driven decision-making.

## 📦 Submission Deliverables

### 🌐 Live Demo

https://equiflow-solapur.netlify.app

### 📄 Technical Documentation

* EquiFlow_Report.pdf
* EquiFlow_Presentation.pdf

Location:

```text
technical-documentation/
```

### 🎥 Demo Video

Demo video link:
https://drive.google.com/file/d/1wV7MPJG6Q6aZZ_hSdvMIFP5MR749276F/view?usp=drive_link

### 📐 Architecture Diagram

Included in the technical documentation package.

### 🛠 Repository Contents

```text
src/                      Frontend source code
public/                   Static assets
EquiFlow_ESP32_Final.ino  IoT controller code
technical-documentation/  Report & Presentation
README.md                 Project overview
```


## 🌟 Problem Statement

Urban water distribution networks often face challenges such as:

* Uneven water pressure across different zones
* Delayed leak detection and response
* Water wastage due to pipeline failures
* High dependency on manual monitoring
* Non-revenue water losses
* Limited visibility into field operations

EquiFlow addresses these challenges through automation, monitoring, and intelligent control mechanisms.

---

## 🚀 Key Features

### 👤 Role-Based Access Control

* Centralized Admin Dashboard
* Zone-wise (Prabhag-wise) engineer assignment
* Restricted access for field operators
* Activity monitoring and surveillance

### 💧 Smart Water Pressure Management

* Partial and full valve control
* Pressure balancing across elevation zones
* Improved water availability for higher-altitude regions

### 🚨 Intelligent Leak Detection

* Multi-condition leak detection logic
* Automatic trip safeguard mechanism
* Automated valve shutdown near leak locations
* Reduction in water wastage

### 🏥 Emergency Infrastructure Protection

Critical facilities such as:

* Hospitals
* Fire Stations

are excluded from automatic shutdown logic.

Instead, the system generates alerts for on-duty officers to ensure uninterrupted water availability.

### 🌍 Water Quality Monitoring

* Chlorine level monitoring
* Corrosion and pipe burst risk indication
* Improved public health awareness

### 🔒 Secure Authentication

* Cloud-based architecture
* OTP-based login
* Access restricted to administrator-approved users

---

## 🔩 IoT & Infrastructure Integration

EquiFlow includes a conceptual IoT control layer capable of:

* Valve automation
* Sensor integration
* Real-time monitoring
* Leak response workflows

The system is designed to:

* Integrate with existing SCADA infrastructure
* Act as a cost-effective augmentation layer
* Support future smart-city deployments

---

## 📈 Future Scope

* WhatsApp-based citizen notification bot
* Water supply schedule alerts
* Citizen leak reporting system
* Predictive maintenance using AI/ML
* Advanced analytics dashboard
* Smart City platform integration

---

## 🛠️ Technology Stack

### Frontend

* React.js
* Tailwind CSS
* Vite

### Backend & Services

* Firebase Authentication
* Cloud Database Services

### Infrastructure

* IoT-based monitoring architecture
* Sensor-driven control logic

---

## 🔗 Live Demo

https://equiflow-solapur.netlify.app

---