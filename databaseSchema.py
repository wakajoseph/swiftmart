import sqlite3

def create_database_schema():
    # Connect to SQLite database (creates it if it doesn't exist)
    conn = sqlite3.connect('ecommerce.db')
    cursor = conn.cursor()
    
    try:
        # Enable foreign key support
        cursor.execute("PRAGMA foreign_keys = ON;")
        
        # Execute all the CREATE TABLE statements
        cursor.executescript("""
        -- Users Table
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT UNIQUE,
            email TEXT UNIQUE,
            password_hash TEXT NOT NULL,
            default_shipping_address TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP
        );

        -- Stores Table
        CREATE TABLE IF NOT EXISTS stores (
            store_id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            location TEXT,
            contact TEXT,
            account_number TEXT,
            verified INTEGER DEFAULT 0,
            rating REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Categories Table
        CREATE TABLE IF NOT EXISTS categories (
            category_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            description TEXT,
            parent_category_id INTEGER,
            FOREIGN KEY (parent_category_id) REFERENCES categories(category_id) ON DELETE SET NULL
        );

        -- Brands Table
        CREATE TABLE IF NOT EXISTS brands (
            brand_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            description TEXT,
            logo_url TEXT
        );

        -- Products Table
        CREATE TABLE IF NOT EXISTS products (
            product_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            category_id INTEGER,
            brand_id INTEGER,
            base_price REAL NOT NULL,
            current_price REAL NOT NULL,
            currency TEXT DEFAULT 'KSh',
            stock_quantity INTEGER DEFAULT 0,
            store_id TEXT,
            average_rating REAL,
            total_reviews INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL,
            FOREIGN KEY (brand_id) REFERENCES brands(brand_id) ON DELETE SET NULL,
            FOREIGN KEY (store_id) REFERENCES stores(store_id) ON DELETE CASCADE
        );

        -- Product Images Table
        CREATE TABLE IF NOT EXISTS product_images (
            image_id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            image_url TEXT NOT NULL,
            is_default INTEGER DEFAULT 0,
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
        );

        -- Product Attributes Table
        CREATE TABLE IF NOT EXISTS product_attributes (
            attribute_id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            attribute_name TEXT NOT NULL,
            attribute_value TEXT NOT NULL,
            is_variant INTEGER DEFAULT 0,
            FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
        );

        -- Product Tags Table
        CREATE TABLE IF NOT EXISTS product_tags (
            tag_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL
        );

        -- Product-Tag Junction Table
        CREATE TABLE IF NOT EXISTS products_tags_junction (
            product_id INTEGER NOT NULL,
            tag_id INTEGER NOT NULL,
            PRIMARY KEY (product_id, tag_id),
            FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
            FOREIGN KEY (tag_id) REFERENCES product_tags(tag_id) ON DELETE CASCADE
        );

        -- Shipping Options Table
        CREATE TABLE IF NOT EXISTS shipping_options (
            shipping_id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            available INTEGER DEFAULT 1,
            estimated_delivery TEXT,
            free_shipping INTEGER DEFAULT 0,
            cost REAL DEFAULT 0.00,
            FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
        );

        -- Offers Table
        CREATE TABLE IF NOT EXISTS offers (
            offer_id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            valid_until TEXT,
            is_active INTEGER DEFAULT 1,
            FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
        );

        -- Carts Table
        CREATE TABLE IF NOT EXISTS carts (
            cart_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
        );

        -- Cart Items Table
        CREATE TABLE IF NOT EXISTS cart_items (
            cart_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
            cart_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER DEFAULT 1,
            added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (cart_id) REFERENCES carts(cart_id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
            UNIQUE (cart_id, product_id)
        );

        -- Orders Table
        CREATE TABLE IF NOT EXISTS orders (
            order_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            total_amount REAL NOT NULL,
            shipping_address TEXT NOT NULL,
            payment_status TEXT CHECK(payment_status IN ('pending', 'paid', 'failed')) DEFAULT 'pending',
            order_status TEXT CHECK(order_status IN ('processing', 'shipped', 'delivered', 'cancelled')) DEFAULT 'processing',
            tracking_number TEXT,
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
        );

        -- Order Items Table
        CREATE TABLE IF NOT EXISTS order_items (
            order_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            unit_price REAL NOT NULL,
            subtotal REAL NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
        );

        -- Reviews Table
        CREATE TABLE IF NOT EXISTS reviews (
            review_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            rating REAL NOT NULL CHECK (rating BETWEEN 1 AND 5),
            comment TEXT,
            review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
            UNIQUE (user_id, product_id)
        );

        -- Related Products Table
        CREATE TABLE IF NOT EXISTS related_products (
            product_id INTEGER NOT NULL,
            related_product_id INTEGER NOT NULL,
            PRIMARY KEY (product_id, related_product_id),
            FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
            FOREIGN KEY (related_product_id) REFERENCES products(product_id) ON DELETE CASCADE
        );
        """)

        # Create indexes
        cursor.executescript("""
        CREATE INDEX IF NOT EXISTS idx_user_phone ON users(phone);
        CREATE INDEX IF NOT EXISTS idx_user_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_store_name ON stores(name);
        CREATE INDEX IF NOT EXISTS idx_category_name ON categories(name);
        CREATE INDEX IF NOT EXISTS idx_brand_name ON brands(name);
        CREATE INDEX IF NOT EXISTS idx_product_name ON products(name);
        CREATE INDEX IF NOT EXISTS idx_product_category ON products(category_id);
        CREATE INDEX IF NOT EXISTS idx_product_brand ON products(brand_id);
        CREATE INDEX IF NOT EXISTS idx_product_store ON products(store_id);
        CREATE INDEX IF NOT EXISTS idx_product_image ON product_images(product_id);
        CREATE INDEX IF NOT EXISTS idx_product_attr ON product_attributes(product_id);
        CREATE INDEX IF NOT EXISTS idx_tag_name ON product_tags(name);
        CREATE INDEX IF NOT EXISTS idx_product_shipping ON shipping_options(product_id);
        CREATE INDEX IF NOT EXISTS idx_product_offer ON offers(product_id);
        CREATE INDEX IF NOT EXISTS idx_offer_active ON offers(is_active, valid_until);
        CREATE INDEX IF NOT EXISTS idx_user_cart ON carts(user_id);
        CREATE INDEX IF NOT EXISTS idx_cart_items ON cart_items(cart_id);
        CREATE INDEX IF NOT EXISTS idx_user_orders ON orders(user_id);
        CREATE INDEX IF NOT EXISTS idx_order_status ON orders(order_status);
        CREATE INDEX IF NOT EXISTS idx_order_date ON orders(order_date);
        CREATE INDEX IF NOT EXISTS idx_order_items ON order_items(order_id);
        CREATE INDEX IF NOT EXISTS idx_product_reviews ON reviews(product_id);
        CREATE INDEX IF NOT EXISTS idx_user_reviews ON reviews(user_id);
        CREATE INDEX IF NOT EXISTS idx_related_products ON related_products(product_id);
        """)

        # Commit changes
        conn.commit()
        print("Database schema created successfully!")
        
    except sqlite3.Error as e:
        print(f"An error occurred: {e}")
        conn.rollback()
    finally:
        # Close connection
        conn.close()

# Execute the function to create the schema
create_database_schema()