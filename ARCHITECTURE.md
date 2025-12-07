# AWS Architecture — Pão com Badjia Lead Automation System

Below is the full architecture for the AWS serverless system now in production.

                           ┌──────────────────────────┐
                           │        CloudFront        │
                           │  (Landing Page Hosting)  │
                           └───────────┬──────────────┘
                                       │
                                       ▼
                         ┌────────────────────────────┐
                         │         index.html          │
                         │      User submits form      │
                         └───────────┬────────────────┘
                                     │ POST /leads
                                     ▼
                  ┌────────────────────────────────────────┐
                  │            API Gateway (HTTP)           │
                  │ Route: POST /leads                      │
                  └───────────────────┬─────────────────────┘
                                      │ invokes
                                      ▼
                        ┌────────────────────────────────┐
                        │        AWS Lambda (Node.js)     │
                        │ validate → store → email         │
                        └───────────────┬──────────────────┘
                                        │
     ┌──────────────────────────────┬────┴───────────────┬──────────────────────────┐
     │                              │                    │                          │
     ▼                              ▼                    ▼                          ▼
┌────────────┐               ┌─────────────┐     ┌────────────────┐          ┌─────────────────┐
│  DynamoDB  │               │  SES Email   │     │ Internal Email │          │ Customer Email   │
│  Store DB  │               │  Sender      │     │ apoio@...      │          │ HTML Template    │
└────────────┘               └─────────────┘     └────────────────┘          └─────────────────┘


## Technologies
- Lambda
- API Gateway
- DynamoDB
- SES
- CloudFront
- Node.js

