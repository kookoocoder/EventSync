# Blockchain Points System Documentation

This document provides an overview of the blockchain-based points system implemented in EventSync.

## Overview

The points system allows participants to earn points when their event registrations are approved by organizers. These points can be redeemed for discounts on future event registrations. All point transactions are recorded on a simplified blockchain for transparency and security.

## Components

### Database Schema

1. **token_balances**
   - Stores each participant's point balance
   - Fields: `id`, `participant_id`, `balance`, `updated_at`

2. **token_transactions**
   - Records all point transactions (earning and spending)
   - Fields: `id`, `participant_id`, `event_id`, `amount`, `transaction_type`, `description`, `transaction_hash`, `created_at`

3. **blockchain_blocks**
   - Stores blocks in the blockchain
   - Fields: `id`, `block_number`, `previous_hash`, `merkle_root`, `timestamp`, `nonce`, `difficulty`, `hash`

4. **blockchain_transaction_blocks**
   - Links transactions to blocks
   - Fields: `id`, `block_id`, `transaction_id`

### Backend Functions

1. **award_points_on_approval()**
   - Triggered when a registration is approved
   - Awards points to the participant
   - Records the transaction with a unique hash

2. **redeem_points_for_discount()**
   - Allows participants to use points for registration discounts
   - Updates point balance and records the redemption transaction
   - Returns the discount amount

3. **create_blockchain_block()**
   - Creates a new block with pending transactions
   - Generates a hash for the block based on its contents

4. **process_pending_blockchain_transactions()**
   - Scheduled job to process pending transactions into blocks

### API Endpoints

1. **Balance**: `/api/blockchain/balance?participantId=XXX`
   - Returns the current point balance for a participant

2. **Transactions**: `/api/blockchain/transactions?participantId=XXX`
   - Returns transaction history for a participant

3. **Verify**: `/api/blockchain/verify?hash=XXX`
   - Verifies a transaction on the blockchain and returns details

4. **Redeem**: `/api/blockchain/redeem` (POST)
   - Redeems points for a discount
   - Requires: `participantId`, `eventId`, `pointsToRedeem`

### UI Components

1. **PointsDisplay** (`/app/participant/dashboard/PointsDisplay.tsx`)
   - Displays point balance on participant dashboard
   - Shows recent transactions

2. **PointsHistoryClient** (`/app/participant/points/client.tsx`)
   - Displays full transaction history
   - Provides transaction verification functionality

3. **PointDiscountSelector** (`/app/events/[id]/register/PointDiscountSelector.tsx`)
   - Allows users to select how many points to use during registration
   - Calculates discount amount

## How it Works

### Earning Points

1. When a participant registers for an event, no points are awarded immediately
2. When an organizer approves the registration, the `award_points_on_approval()` function is triggered
3. The function awards points based on the event's `points_reward` value
4. A transaction is recorded with a unique hash
5. The participant's point balance is updated

### Spending Points

1. During event registration, participants can choose to redeem points for a discount
2. The `PointDiscountSelector` component allows them to select how many points to use
3. When the registration is submitted, the points are deducted from their balance
4. A transaction is recorded with the redemption details

### Blockchain Verification

1. All transactions are recorded with a cryptographic hash
2. Periodically, the system batches transactions into blocks
3. Each block contains a hash of the previous block, creating a chain
4. Participants can verify their transactions through the UI

## Deployment

The blockchain system includes:

1. Database migrations for the schema changes
2. A Supabase Edge Function for blockchain operations
3. Frontend components for user interaction

To deploy the edge function:
```bash
./scripts/deploy-blockchain-edge-function.sh
```

## Configuration

- Default points per approved registration: 100 (configurable per event)
- Point value: 0.1 currency units per point
- Maximum points per transaction: Limited by the event's registration fee
- Block generation: Manual or scheduled (configurable) 