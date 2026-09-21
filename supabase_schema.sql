-- Schema for ASTOG

-- 1. admins table
CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. home_content table
CREATE TABLE home_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    logo_url TEXT,
    welcome_text TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. about_entries table
CREATE TABLE about_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    photo_url TEXT,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. sub_organisations table
CREATE TABLE sub_organisations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    logo_url TEXT,
    name TEXT NOT NULL,
    ceo_name TEXT NOT NULL,
    about_ceo TEXT,
    founded_on DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. achievements table
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sub_org_id UUID REFERENCES sub_organisations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. employees table
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_number SERIAL,
    photo_url TEXT,
    name TEXT NOT NULL,
    employee_id TEXT NOT NULL,
    company TEXT,
    role TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Storage Bucket setup (Note: Run this in Supabase SQL Editor if bucket doesn't exist)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('logos-and-photos', 'logos-and-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Read Access for Storage" ON storage.objects
FOR SELECT USING ( bucket_id = 'logos-and-photos' );

-- Insert initial home content row
INSERT INTO home_content (welcome_text, logo_url) VALUES ('Welcome to ASTOG!', null);

-- Enable RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Public Read Access" ON home_content FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON about_entries FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON sub_organisations FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON achievements FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON employees FOR SELECT USING (true);
