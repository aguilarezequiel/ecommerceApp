INSERT INTO users (id, email, password, firstName, lastName, role, createdAt, updatedAt) VALUES
('admin-001', 'admin@demo.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', 'ADMIN', NOW(), NOW()),
('user-001', 'user@demo.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John', 'Doe', 'CUSTOMER', NOW(), NOW());

INSERT INTO products (id, name, description, price, stock, category, isActive, createdAt, updatedAt) VALUES
('prod-001', 'iPhone 15 Pro', 'El iPhone más avanzado con chip A17 Pro y cámara de 48MP', 999.99, 25, 'electronics', true, NOW(), NOW()),
('prod-002', 'Camiseta Polo', 'Camiseta polo de algodón 100% disponible en varios colores', 39.99, 50, 'clothing', true, NOW(), NOW()),
('prod-003', 'Mesa de Centro', 'Mesa de centro moderna de madera maciza', 199.99, 15, 'home', true, NOW(), NOW()),
('prod-004', 'Auriculares Bluetooth', 'Auriculares inalámbricos con cancelación de ruido', 129.99, 30, 'electronics', true, NOW(), NOW()),
('prod-005', 'Balón de Fútbol', 'Balón oficial FIFA de cuero sintético', 29.99, 40, 'sports', true, NOW(), NOW());