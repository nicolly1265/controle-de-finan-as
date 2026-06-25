# Security Specification - Controle de Finanças Pessoais

## 1. Data Invariants
- A BankAccount, Transaction, or Budget document can only be read, created, updated, or deleted by its owning user (matching the `userId` in the document path).
- The document ID path variable `{userId}` MUST match the authenticated user `request.auth.uid`.
- Transaction types must be strictly either `income` or `expense`.
- All writes must include proper type checks and maximum sizes (to prevent wallet exhaustion).
- `createdAt` and `updatedAt` timestamps must match the server timestamp (`request.time`).

## 2. The "Dirty Dozen" Payloads (Security Test Cases)
Below are 12 specific hostile payloads designed to compromise Identity, Integrity, or State, and how the rules must prevent them:

1. **Spoofed User ID Write**: An attacker tries to write to `/users/attackerId` using another user's authentic credential.
   - *Result*: `PERMISSION_DENIED` - Path userId must equal `request.auth.uid`.
2. **Impersonated Bank Account Link**: User A tries to link a bank account on behalf of User B by writing to `/users/userB/bankAccounts/bank1`.
   - *Result*: `PERMISSION_DENIED` - Checked via path parameter validation.
3. **Ghost Fields Injection**: Adding a `isAdmin: true` field into a user's transaction or budget payload.
   - *Result*: `PERMISSION_DENIED` - The schema helper restricts keys to only allowed fields.
4. **Negative Transaction Amount**: Writing an expense transaction with amount `-100.00` to artificially increase balance.
   - *Result*: `PERMISSION_DENIED` - Amounts must be strictly positive (`incoming().amount > 0`).
5. **Wrong Transaction Type**: Writing a transaction with type `loan` or `credit` instead of `income` or `expense`.
   - *Result*: `PERMISSION_DENIED` - Checked against enum validation `type in ['income', 'expense']`.
6. **Huge ID / Resource Poisoning**: Sending an account ID that is a 2MB string.
   - *Result*: `PERMISSION_DENIED` - Checked via `isValidId()` which restricts ID length to <= 128 characters.
7. **Tampered CreatedAt Timestamp**: Supplying a historical or future `createdAt` value instead of using server time.
   - *Result*: `PERMISSION_DENIED` - Checked via `incoming().createdAt == request.time`.
8. **Malicious Budget Bypass**: Forging an auto-generated AI budget with a fake spending limit of 99999999.
   - *Result*: `PERMISSION_DENIED` - Budget rules validate max budget boundaries and owner matching.
9. **Blanket Query Scraping**: Requesting all transactions in Firestore using a root collection query without filtering by user.
   - *Result*: `PERMISSION_DENIED` - Rules do not permit blanket list actions without matching the resource's owner structure.
10. **Spoofed Email Signup**: Setting `email_verified` to true when logging in via custom claims or forging profiles.
    - *Result*: `PERMISSION_DENIED` - Standard Firebase Auth email-verified or Google verification enforcement.
11. **Bypassing Category Constraints**: Creating an empty string category `category: ""`.
    - *Result*: `PERMISSION_DENIED` - Category must be a non-empty string of safe size.
12. **Tampering with Linked Account Balances**: Bypassing sync locks to directly modify linked status or fields of other accounts.
    - *Result*: `PERMISSION_DENIED` - Locked behind path ownership check.

## 3. Security Rules Outline
We will enforce this directly in `firestore.rules`.
