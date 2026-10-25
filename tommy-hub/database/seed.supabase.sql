-- TOMMY HUB — Supabase/PostgreSQL seed data
-- Run after database/schema.supabase.sql.

INSERT INTO products (category, product_name, price, stock_qty) VALUES
  ('Shirt', 'Classic White Formal Shirt', 1299.00, 25),
  ('Shirt', 'Navy Checked Casual Shirt', 1499.00, 18),
  ('Pant', 'Slim Fit Chinos - Beige', 1799.00, 20),
  ('Footwear', 'Leather Oxford Shoes', 3499.00, 12),
  ('Footwear', 'Suede Sneakers', 2799.00, 15),
  ('Trouser', 'Formal Wool-Blend Trouser', 2199.00, 14),
  ('Track', 'Performance Track Pants', 1399.00, 22),
  ('T-Shirt', 'Premium Cotton Crew Neck', 899.00, 40),
  ('Accessories', 'Genuine Leather Belt', 999.00, 30),
  ('Accessories', 'Classic Analog Watch', 4999.00, 8)
ON CONFLICT DO NOTHING;
