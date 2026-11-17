# Product Overview

This is a Next.js SaaS starter template (supastarter) designed for rapid web application development. It provides a complete foundation for building modern SaaS applications with authentication, payments, organizations, and internationalization.

## Key Features

- **Multi-tenant SaaS**: Support for both user-level and organization-level billing
- **Authentication**: Multiple auth methods (password, magic link, social login, passkeys, 2FA)
- **Payments**: Integrated payment processing with multiple providers (Stripe, LemonSqueezy, Polar, etc.)
- **Internationalization**: Built-in i18n support with multiple locales (English, German)
- **Marketing Site**: Includes blog, docs, changelog, and legal pages
- **Admin Panel**: User and organization management
- **AI Integration**: Built-in AI chat functionality
- **Email System**: Transactional emails with multiple provider support

## Application Structure

The application is split into two main sections:
- **Marketing** (`/[locale]/*`): Public-facing pages, blog, docs, legal
- **SaaS** (`/app/*`): Authenticated application with user/organization features
