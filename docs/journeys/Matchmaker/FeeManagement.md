# Matchmaker Fee Management Journey

## Overview

A registered matchmaker updates their fee percentage or claims accumulated fees.

## Preconditions

- User has a connected wallet
- User is registered as a matchmaker

## Part A: Update Fee Percentage

### Steps

1. **Navigate to Dashboard**
   - User visits mm-portal and sees their dashboard

2. **Click Update Fee**
   - Modal opens with fee slider

3. **Select New Fee**
   - Slider range: 0% to 10%
   - Current fee shown as default value
   - Info text: "This change will only affect future orders"

4. **Confirm Update**
   - Click "Update" button
   - Transaction submitted to contract
   - Loading state: "Updating..."

5. **Success**
   - Modal closes
   - Dashboard refreshes with new fee percentage

### Postconditions

- Fee percentage updated in contract
- Future orders use new fee
- Existing orders retain snapshotted fee

## Part B: Claim Accumulated Fees

### Preconditions

- Accumulated fees > 0

### Steps

1. **View Accumulated Fees**
   - Dashboard shows current accumulated amount in PAS

2. **Click Claim Fees**
   - Button enabled when fees > 0
   - Button disabled with text "No Fees to Claim" when fees = 0

3. **Confirm Claim**
   - Transaction submitted to contract
   - Loading state shown

4. **Success**
   - Fees transferred to wallet
   - Accumulated fees reset to 0
   - Dashboard refreshes

### Postconditions

- Fees transferred to matchmaker wallet
- `feesAccumulated` reset to 0 in contract

## Test Plan

### Update Fee Tests

1. Open update fee modal
2. Verify current fee is pre-selected
3. Change fee to different value
4. Submit and verify transaction
5. Verify dashboard shows new fee
6. Place new order and verify new fee applied
7. Verify old orders retain original fee

### Claim Fees Tests

1. Place and complete order through matchmaker
2. Verify fees accumulated on dashboard
3. Click Claim Fees
4. Verify transaction succeeds
5. Verify accumulated fees reset to 0
6. Verify wallet balance increased

## Error Scenarios

| Scenario                 | Expected Behavior               |
| ------------------------ | ------------------------------- |
| Fee > 10%                | Prevented by slider max         |
| Update transaction fails | Error message, modal stays open |
| Claim with 0 fees        | Button disabled                 |
| Claim transaction fails  | Error message, fees unchanged   |
| Network disconnect       | Reconnect prompt                |
