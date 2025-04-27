-- Drop the existing check constraint
ALTER TABLE investment_offers DROP CONSTRAINT IF EXISTS investment_offers_status_check;

-- Add the new check constraint with NEGOTIATING status
ALTER TABLE investment_offers ADD CONSTRAINT investment_offers_status_check 
    CHECK (status IN ('ACTIVE', 'CLOSED', 'EXPIRED', 'NEGOTIATING')); 