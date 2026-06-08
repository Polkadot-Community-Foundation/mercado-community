# Matchmaker Registration Journey

## Overview

A new user registers as a matchmaker to earn referral fees on orders.

## Preconditions

- User has a connected wallet
- User is not already registered as a matchmaker

## Steps

### 1. Navigate to mm-portal

User visits the matchmaker portal at `mercado-mm.dot`.

### 2. Connect Wallet

If not connected, user clicks "Connect Wallet" and approves connection.

### 3. Register Form

User sees registration form with:

- **Matchmaker Name**: Text input (required)
- **Fee Percentage**: Slider from 0% to 10% (default: 5%)
- **Register button**

### 4. Submit Registration

User clicks "Register as Matchmaker":

1. Transaction is submitted to MercadoMatchmakers contract
2. Loading state shown: "Registering..."
3. On success: redirect to dashboard
4. On error: error message displayed

### 5. Dashboard View

After registration, user sees dashboard with:

- Matchmaker ID and name
- Active status badge
- Current fee percentage
- Accumulated fees (starts at 0)
- Registration date
- Actions: Update Fee, Claim Fees

## Postconditions

- Matchmaker record created in contract
- User can share referral links
- Fee percentage active for future orders

## Test Plan

1. Connect wallet with no prior registration
2. Verify registration form displays
3. Enter name and select fee percentage
4. Submit and verify transaction succeeds
5. Verify redirect to dashboard
6. Verify all dashboard fields display correctly

## Error Scenarios

| Scenario             | Expected Behavior               |
| -------------------- | ------------------------------- |
| Empty name           | Form validation prevents submit |
| Already registered   | Redirect to dashboard (no form) |
| Transaction rejected | Error message, form remains     |
| Network error        | Error message with retry option |
