-- Drop tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS investor_activities;
DROP TABLE IF EXISTS pitch_decks;
DROP TABLE IF EXISTS startup_profiles;
DROP TABLE IF EXISTS investor_profiles;
DROP TABLE IF EXISTS users;

-- Create users table first
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create investor_profiles table
CREATE TABLE investor_profiles (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    sector VARCHAR(100) NOT NULL,
    investment_range_min DECIMAL(15,2) NOT NULL,
    investment_range_max DECIMAL(15,2) NOT NULL,
    location VARCHAR(255) NOT NULL,
    investment_focus VARCHAR(255) NOT NULL,
    active_investments_count INTEGER DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create startup_profiles table
CREATE TABLE startup_profiles (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    startup_name VARCHAR(255) NOT NULL,
    description TEXT,
    industry VARCHAR(100) NOT NULL,
    funding_stage VARCHAR(50) NOT NULL,
    team_size VARCHAR(50),
    website VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create investment_offers table
CREATE TABLE investment_offers (
    id SERIAL PRIMARY KEY,
    investor_id BIGINT,
    user_id BIGINT NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    sector VARCHAR(100) NOT NULL,
    investment_range_min DECIMAL(15,2) NOT NULL,
    investment_range_max DECIMAL(15,2) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(100),
    version INTEGER DEFAULT 1,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CLOSED', 'EXPIRED', 'NEGOTIATING')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (investor_id) REFERENCES investor_profiles(id) ON DELETE CASCADE
);

-- Create pitch_decks table
CREATE TABLE pitch_decks (
    id SERIAL PRIMARY KEY,
    startup_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_path VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(100),
    version INTEGER DEFAULT 1,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (startup_id) REFERENCES startup_profiles(id) ON DELETE CASCADE
);

-- Create investor_activities table
CREATE TABLE investor_activities (
    id SERIAL PRIMARY KEY,
    investor_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    activity_date TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (investor_id) REFERENCES investor_profiles(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_investor_profiles_user_id ON investor_profiles(user_id);
CREATE INDEX idx_startup_profiles_user_id ON startup_profiles(user_id);
CREATE INDEX idx_pitch_decks_startup_id ON pitch_decks(startup_id);
CREATE INDEX idx_investor_activities_investor_id ON investor_activities(investor_id);
CREATE INDEX idx_investor_activities_date ON investor_activities(activity_date); 