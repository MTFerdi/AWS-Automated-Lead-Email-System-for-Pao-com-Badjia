🟧 AWS Automated Lead & Email System for Pão Com Badjia

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-success?style=for-the-badge&logo=github)](https://mtferdi.github.io/AWS-Automated-Lead-Email-System-for-Pao-com-Badjia/)


This repository contains a fully serverless lead capture and email automation system built for Pão Com Badjia, designed to handle customer registrations, store leads, and send automated branded emails using AWS.

The entire system is live in production and optimized for extremely low cost while ensuring reliability, scalability, and high deliverability.

🚀 Project Overview

This system automates the complete onboarding flow:

Captures user data from a website form

Stores leads in Amazon DynamoDB

Sends a confirmation email to the user

Sends a structured internal notification message

Ensures authenticated and deliverable emails via AWS SES

All infrastructure is serverless, requiring no servers and costing less than $1 per month to run.

🏗 Architecture
Website → API Gateway → Lambda → DynamoDB
                                 ↓
                               SES
                 (User + Internal Notifications)

Components
Service	Purpose
AWS Lambda	Processes incoming leads, validates duplicates, triggers SES
AWS API Gateway	Public HTTPS endpoint for the website form
Amazon DynamoDB	Secure NoSQL lead database
Amazon SES	Sends customer confirmation and internal alert emails
Route 53	Domain DNS, SPF, DKIM and DMARC configuration
CloudFront	Serves the production website
✨ Features
✔ Lead Handling

Saves user name, email, WhatsApp, source, user agent, IP, and timestamp

Checks duplicates using a GSI or fallback scan

Sanitizes input and prevents injection

✔ Email Automation

Sends a personalized HTML confirmation email to the customer

Sends an internal notification email with all lead details

Works even when the lead already exists (“duplicate but handled”)

✔ Professional Email Template

Fully responsive HTML email

Branded with Pão Com Badjia styling

Includes social media icons

Includes share button (WhatsApp link)

Includes unsubscribe notice

Personalized greeting (Olá {{NAME}})

✔ Secure by Design

CORS restricted to production domain

Verified SES domain & DKIM selectors

DMARC enforcement

No public database access

Input sanitized and escaped server-side

💰 Cost Optimization

A major goal of this project was to keep the solution extremely low cost.

Real monthly costs:
Service	Cost
AWS usage (Lambda + SES + DDB + API GW)	$0.62 USD
Domain (paocombadjia.com)	$12/year
Professional email address	$7/month

For less than $1/month, the system runs:

Website form

Lead storage

Customer emails

Team notifications

Scalable serverless backend

📁 Repository Structure
/
├── README.md
├── lambda/
│   ├── index.js           # Final Lambda function
│   └── package.json       # AWS SDK dependencies
│
├── frontend/
│   ├── index.html         # Production website
│   └── styles.css
│
└── email/
    └── email.html         # Final HTML email template

📦 Lambda Function Responsibilities

The Lambda function:

Parses incoming JSON

Sanitizes and normalizes data

Checks for duplicate email entries

Stores new leads in DynamoDB

Sends internal alert email

Sends confirmation email using HTML template

Outputs CORS-safe JSON to the frontend

All email content is loaded as a template and dynamically personalized.

🧪 Testing & Validation

The project was tested end-to-end in production:

Website form submissions

Lambda execution logs

DynamoDB data validation

SES deliverability

Duplicate lead handling

Full DNS validation (SPF, DKIM, DMARC)

Rendering on Gmail, Outlook, iOS, Android

📈 Future Enhancements

Automated multi-day follow-up email flow

WhatsApp Cloud API integration

Admin dashboard to view leads

Export reports (CSV/Excel)

Lead segmentation

👤 Author

Ferdinando Torres
Cloud & Web Developer
Creator of the Pão Com Badjia automated onboarding system.


Feel free to connect or reach out for collaborations or similar projects.
