-- Create table for storing Clay data
CREATE TABLE IF NOT EXISTS clay_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_id TEXT NOT NULL,
    row_id TEXT NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(table_id, row_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_clay_data_table_id ON clay_data(table_id);
CREATE INDEX IF NOT EXISTS idx_clay_data_row_id ON clay_data(row_id);
CREATE INDEX IF NOT EXISTS idx_clay_data_created_at ON clay_data(created_at DESC);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_clay_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clay_data_updated_at
    BEFORE UPDATE ON clay_data
    FOR EACH ROW
    EXECUTE FUNCTION update_clay_data_updated_at();

-- Enable Row Level Security
ALTER TABLE clay_data ENABLE ROW LEVEL SECURITY;

-- Create policies for clay_data table
CREATE POLICY "Enable read access for all users" ON clay_data
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON clay_data
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON clay_data
    FOR UPDATE USING (true);

-- Add comment to table
COMMENT ON TABLE clay_data IS 'Stores data synchronized from Clay tables';
