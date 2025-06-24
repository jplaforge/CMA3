-- Enable UUID generation
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    -- -----------------------------------------------------------------------------
    -- Properties Table
    -- Stores details for subject properties, comparables, and buyer listings.
    -- -----------------------------------------------------------------------------
    CREATE TABLE IF NOT EXISTS properties (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        address TEXT NOT NULL,
        listing_url TEXT UNIQUE, -- Can be null if not a listed property
        image_url TEXT,
        property_type TEXT,
        beds TEXT,
        baths TEXT,
        sqft TEXT,
        lot_size TEXT,
        year_built TEXT,
        garage_spaces TEXT,
        levels TEXT,
        description TEXT, -- General purpose for notes, features, condition
        asking_price TEXT, -- For active listings
        sale_price TEXT, -- For sold comparables
        sale_date TEXT, -- For sold comparables
        lat DOUBLE PRECISION,
        lng DOUBLE PRECISION,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Authenticated users can insert properties"
    ON properties
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

    CREATE POLICY "Authenticated users can read all properties"
    ON properties
    FOR SELECT
    TO authenticated
    USING (true);

    -- Note: Update/delete policies for properties might require an owner_user_id
    -- or be handled via application logic/service_role for shared data.

    -- -----------------------------------------------------------------------------
    -- CMA Reports Table
    -- -----------------------------------------------------------------------------
    CREATE TABLE IF NOT EXISTS cma_reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        report_title TEXT,
        client_name TEXT,
        prepared_date TEXT,
        subject_property_id UUID NOT NULL REFERENCES properties(id) ON DELETE RESTRICT,
        general_notes TEXT,
        price_adjustment_notes TEXT,
        suggested_price_range_low TEXT,
        suggested_price_range_high TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    ALTER TABLE cma_reports ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can manage their own cma_reports"
    ON cma_reports
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

    -- -----------------------------------------------------------------------------
    -- CMA Report Comparables (Linking Table)
    -- -----------------------------------------------------------------------------
    CREATE TABLE IF NOT EXISTS cma_report_comparables (
        cma_report_id UUID NOT NULL REFERENCES cma_reports(id) ON DELETE CASCADE,
        property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
        PRIMARY KEY (cma_report_id, property_id)
    );

    ALTER TABLE cma_report_comparables ENABLE ROW LEVEL SECURITY;

    -- Policy for linking table: access is derived from the parent cma_report
    CREATE POLICY "Users can manage their own cma_report_comparables"
    ON cma_report_comparables
    FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM cma_reports
        WHERE cma_reports.id = cma_report_comparables.cma_report_id
        AND auth.uid() = cma_reports.user_id
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM cma_reports
        WHERE cma_reports.id = cma_report_comparables.cma_report_id
        AND auth.uid() = cma_reports.user_id
    ));


    -- -----------------------------------------------------------------------------
    -- Points of Interest Table
    -- -----------------------------------------------------------------------------
    CREATE TABLE IF NOT EXISTS points_of_interest (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        lat DOUBLE PRECISION,
        lng DOUBLE PRECISION,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    ALTER TABLE points_of_interest ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Authenticated users can insert POIs"
    ON points_of_interest
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

    CREATE POLICY "Authenticated users can read all POIs"
    ON points_of_interest
    FOR SELECT
    TO authenticated
    USING (true);

    -- Note: Update/delete policies for POIs might require an owner_user_id
    -- or be handled via application logic/service_role for shared data.

    -- -----------------------------------------------------------------------------
    -- Buyer Reports Table
    -- -----------------------------------------------------------------------------
    CREATE TABLE IF NOT EXISTS buyer_reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        client_name TEXT,
        prepared_date TEXT,
        realtor_notes TEXT,
        criteria_price_min TEXT,
        criteria_price_max TEXT,
        criteria_beds_min TEXT,
        criteria_beds_max TEXT,
        criteria_baths_min TEXT,
        criteria_baths_max TEXT,
        criteria_sqft_min TEXT,
        criteria_sqft_max TEXT,
        criteria_must_have_features TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    ALTER TABLE buyer_reports ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can manage their own buyer_reports"
    ON buyer_reports
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

    -- -----------------------------------------------------------------------------
    -- Buyer Report Listings (Linking Table)
    -- -----------------------------------------------------------------------------
    CREATE TABLE IF NOT EXISTS buyer_report_listings (
        buyer_report_id UUID NOT NULL REFERENCES buyer_reports(id) ON DELETE CASCADE,
        property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
        PRIMARY KEY (buyer_report_id, property_id)
    );

    ALTER TABLE buyer_report_listings ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can manage their own buyer_report_listings"
    ON buyer_report_listings
    FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM buyer_reports
        WHERE buyer_reports.id = buyer_report_listings.buyer_report_id
        AND auth.uid() = buyer_reports.user_id
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM buyer_reports
        WHERE buyer_reports.id = buyer_report_listings.buyer_report_id
        AND auth.uid() = buyer_reports.user_id
    ));

    -- -----------------------------------------------------------------------------
    -- Buyer Report POIs (Linking Table)
    -- -----------------------------------------------------------------------------
    CREATE TABLE IF NOT EXISTS buyer_report_pois (
        buyer_report_id UUID NOT NULL REFERENCES buyer_reports(id) ON DELETE CASCADE,
        poi_id UUID NOT NULL REFERENCES points_of_interest(id) ON DELETE CASCADE,
        PRIMARY KEY (buyer_report_id, poi_id)
    );

    ALTER TABLE buyer_report_pois ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can manage their own buyer_report_pois"
    ON buyer_report_pois
    FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM buyer_reports
        WHERE buyer_reports.id = buyer_report_pois.buyer_report_id
        AND auth.uid() = buyer_reports.user_id
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM buyer_reports
        WHERE buyer_reports.id = buyer_report_pois.buyer_report_id
        AND auth.uid() = buyer_reports.user_id
    ));

    -- Add indexes for foreign keys and frequently queried columns
    CREATE INDEX IF NOT EXISTS idx_properties_listing_url ON properties(listing_url);
    CREATE INDEX IF NOT EXISTS idx_properties_coordinates ON properties USING GIST (ll_to_earth(lat, lng)); -- For geo queries

    CREATE INDEX IF NOT EXISTS idx_cma_reports_user_id ON cma_reports(user_id);
    CREATE INDEX IF NOT EXISTS idx_cma_reports_subject_property_id ON cma_reports(subject_property_id);

    CREATE INDEX IF NOT EXISTS idx_cma_report_comparables_property_id ON cma_report_comparables(property_id);

    CREATE INDEX IF NOT EXISTS idx_buyer_reports_user_id ON buyer_reports(user_id);

    CREATE INDEX IF NOT EXISTS idx_buyer_report_listings_property_id ON buyer_report_listings(property_id);

    CREATE INDEX IF NOT EXISTS idx_buyer_report_pois_poi_id ON buyer_report_pois(poi_id);
