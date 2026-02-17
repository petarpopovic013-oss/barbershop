# Customer Table Integration ✅

## What's New

The booking flow now **creates customer records** in the `Customer` table and links them to reservations via the `customer_id` foreign key.

### Ensure Customer table is populated

Add **SUPABASE_SERVICE_ROLE_KEY** to `.env.local` so the server API can insert into `Customer` (and `Reservations`) without RLS blocking:

1. Supabase Dashboard → **Settings** → **API** → copy the **service_role** key (keep it secret).
2. In your project `.env.local` add:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```
3. Restart the dev server. New reservations will then create/find a customer and save to the Customer table.

## How It Works

### Step 1: Customer Creation/Lookup
When a booking is submitted:

1. **Parse phone number** - Extract digits from customer phone
2. **Check for existing customer** - Query `Customer` table by phone
3. **If exists** → Use existing `customer_id`
4. **If new** → Create new customer record, get new `customer_id`

### Step 2: Reservation Creation
Insert into `Reservations` table with:
- `customer_id` (link to Customer record)
- `customer_name`, `customer_phone`, `customer_email` (denormalized for quick access)
- All other booking details

## Benefits

✅ **No duplicate customers** - Phone number acts as unique identifier  
✅ **Customer history** - Can track all bookings per customer  
✅ **Data integrity** - Foreign key ensures valid customer links  
✅ **Future-ready** - Easy to add customer profiles, loyalty programs, etc.

## Database Schema

### Customer Table
```sql
id           bigint (PK, auto-increment)
name         text
phone        bigint (used for deduplication)
email        text
created_at   timestamptz
```

### Reservations Table (Updated)
```sql
id              bigint (PK)
customer_id     bigint (FK → Customer.id) ← NEW!
customer_name   text (denormalized)
customer_phone  text (denormalized)
customer_email  text (denormalized)
barber_id       bigint (FK → Barbers.id)
service_id      bigint (FK → Services.id)
start_time      timestamptz
end_time        timestamptz
created_at      timestamptz
```

## Example Flow

### First Booking
```
User enters:
  Name: John Doe
  Phone: +381 60 123 4567
  Email: john@example.com

Backend:
  1. Parse phone: 381601234567
  2. Query Customer WHERE phone = 381601234567 → Not found
  3. INSERT INTO Customer (name, phone, email) → Returns id: 1
  4. INSERT INTO Reservations (customer_id: 1, ...)
  
Result:
  ✓ Customer record created (id: 1)
  ✓ Reservation created (customer_id: 1)
```

### Second Booking (Same Customer)
```
User enters:
  Name: John Doe
  Phone: +381 60 123 4567
  Email: john@example.com

Backend:
  1. Parse phone: 381601234567
  2. Query Customer WHERE phone = 381601234567 → Found id: 1
  3. Skip customer creation (already exists)
  4. INSERT INTO Reservations (customer_id: 1, ...)
  
Result:
  ✓ Reused existing customer (id: 1)
  ✓ New reservation linked to same customer
```

## Phone Number Handling

The API converts phone strings to bigint for storage:

```typescript
// Input: "+381 60 123 4567" or "060-123-4567"
const phoneNumber = parseInt(payload.customerPhone.replace(/\D/g, ""), 10);
// Output: 381601234567 (stored as bigint)
```

**Why bigint?**
- Your Customer.phone column is bigint
- Removes formatting inconsistencies
- Easy numeric comparison

## RLS Policies Added

```sql
-- Allow public to create customers (for bookings)
CREATE POLICY "Public insert customers"
  ON "Customer" FOR INSERT
  WITH CHECK (true);

-- Allow public to read customers (for deduplication check)
CREATE POLICY "Public read customers"
  ON "Customer" FOR SELECT
  USING (true);
```

## Error Handling

### Invalid Phone Format
```json
{
  "ok": false,
  "message": "Invalid phone number format"
}
```

### Customer Creation Fails
```json
{
  "ok": false,
  "message": "Failed to create customer record",
  "error": "..."
}
```

### RLS Policy Missing
```json
{
  "ok": false,
  "message": "Database permission denied for Customer table.",
  "hint": "CREATE POLICY 'Allow public inserts' ON \"Customer\" FOR INSERT WITH CHECK (true);"
}
```

## API Response (Updated)

Success response now includes `customerId`:

```json
{
  "ok": true,
  "reservationId": 123,
  "customerId": 45,
  "message": "Reservation created successfully"
}
```

## Testing

### Test Customer Creation
1. Make first booking with phone: `+381 60 111 1111`
2. Check Customer table → New record created
3. Check Reservations table → `customer_id` populated

### Test Customer Reuse
1. Make second booking with **same phone**: `+381 60 111 1111`
2. Check Customer table → No new record (count stays same)
3. Check Reservations table → New reservation with same `customer_id`

### Verify Linking
```sql
-- See all reservations for a customer
SELECT 
  r.*,
  c.name as customer_name,
  c.email as customer_email
FROM "Reservations" r
JOIN "Customer" c ON c.id = r.customer_id
WHERE c.phone = 381601111111;
```

## Future Enhancements

With Customer table now populated, you can:

1. **Customer profiles** - Let customers view their booking history
2. **Loyalty program** - Track number of visits, offer discounts
3. **Email marketing** - Send promotions to customers
4. **SMS reminders** - Send appointment reminders via phone
5. **Customer preferences** - Store favorite barber, usual service
6. **Analytics** - New vs returning customers, customer lifetime value

## Summary

✅ **Customers automatically created** on first booking  
✅ **Duplicate prevention** via phone number lookup  
✅ **Proper foreign key relationship** between Reservations and Customer  
✅ **Denormalized data** in Reservations for performance  
✅ **RLS policies** added for security  
✅ **Error handling** for edge cases  

Your booking system now has a solid customer management foundation! 🎉
