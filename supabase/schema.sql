-- =========================================================================
-- SCHEMA ISOLADO COM PREFIXO 'ls_' (LOS SANTOS)
-- =========================================================================
-- O prefixo 'ls_' garante 100% de isolamento: não colide nem altera
-- nenhuma das tabelas existentes do seu projeto atual no Supabase.
-- =========================================================================

-- Habilita extensão de UUID (se ainda não estiver ativa)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE PRODUTOS DA LOJA DE ROUPAS
CREATE TABLE IF NOT EXISTS ls_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    category TEXT NOT NULL DEFAULT 'Geral',
    sizes TEXT[] NOT NULL DEFAULT ARRAY['P', 'M', 'G', 'GG'],
    image TEXT NOT NULL,
    in_stock BOOLEAN NOT NULL DEFAULT true,
    featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELA DE PROFISSIONAIS (BARBEIROS E MANICURES)
CREATE TABLE IF NOT EXISTS ls_professionals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('barbeiro', 'manicure')),
    avatar TEXT,
    specialty TEXT,
    phone TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABELA DE SERVIÇOS (BARBEARIA E MANICURE)
CREATE TABLE IF NOT EXISTS ls_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    duration_min INTEGER NOT NULL DEFAULT 30,
    type TEXT NOT NULL CHECK (type IN ('barbearia', 'manicure')),
    category TEXT NOT NULL DEFAULT 'Geral',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABELA DE AGENDAMENTOS (BARBEARIA E MANICURE)
CREATE TABLE IF NOT EXISTS ls_appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    service_id UUID REFERENCES ls_services(id) ON DELETE SET NULL,
    service_name TEXT,
    professional_id UUID REFERENCES ls_professionals(id) ON DELETE SET NULL,
    professional_name TEXT,
    date DATE NOT NULL,
    shift TEXT NOT NULL CHECK (shift IN ('manha', 'tarde', 'noite')),
    scheduled_time TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'solicitado' CHECK (status IN ('solicitado', 'agendado', 'confirmado', 'concluido', 'cancelado', 'pendente')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABELA DE VENDAS / PEDIDOS (LOJA DE ROUPAS)
CREATE TABLE IF NOT EXISTS ls_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT,
    customer_phone TEXT,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'concluido' CHECK (status IN ('pendente', 'concluido', 'cancelado')),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. USUÁRIOS ADMINISTRADORES (100% ISOLADO - NÃO INTERFERE EM OUTRO PROJETO)
CREATE TABLE IF NOT EXISTS ls_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('barbearia', 'manicure')),
    name TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) & POLÍTICAS ISOLADAS
-- =========================================================================

ALTER TABLE ls_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE ls_professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE ls_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE ls_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ls_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE ls_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ls_permitir_leitura_produtos" ON ls_products FOR SELECT USING (true);
CREATE POLICY "ls_permitir_escrita_produtos" ON ls_products FOR ALL USING (true);

CREATE POLICY "ls_permitir_leitura_profissionais" ON ls_professionals FOR SELECT USING (true);
CREATE POLICY "ls_permitir_escrita_profissionais" ON ls_professionals FOR ALL USING (true);

CREATE POLICY "ls_permitir_leitura_servicos" ON ls_services FOR SELECT USING (true);
CREATE POLICY "ls_permitir_escrita_servicos" ON ls_services FOR ALL USING (true);

CREATE POLICY "ls_permitir_leitura_agendamentos" ON ls_appointments FOR SELECT USING (true);
CREATE POLICY "ls_permitir_insercao_agendamentos" ON ls_appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "ls_permitir_atualizacao_agendamentos" ON ls_appointments FOR UPDATE USING (true);

CREATE POLICY "ls_permitir_leitura_pedidos" ON ls_orders FOR SELECT USING (true);
CREATE POLICY "ls_permitir_insercao_pedidos" ON ls_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "ls_permitir_atualizacao_pedidos" ON ls_orders FOR UPDATE USING (true);

CREATE POLICY "ls_permitir_leitura_usuarios" ON ls_users FOR SELECT USING (true);
CREATE POLICY "ls_permitir_escrita_usuarios" ON ls_users FOR ALL USING (true);

-- =========================================================================
-- CRIAÇÃO DOS 2 USUÁRIOS ADMINISTRATIVOS DO LOS SANTOS
-- =========================================================================
INSERT INTO ls_users (username, password, role, name)
VALUES 
    ('barbearia', 'barbearia123', 'barbearia', 'Administrador Barbearia & Loja'),
    ('manicure', 'manicure123', 'manicure', 'Administradora Manicure')
ON CONFLICT (username) DO UPDATE 
SET password = EXCLUDED.password,
    role = EXCLUDED.role,
    name = EXCLUDED.name,
    active = true,
    updated_at = NOW();

-- =========================================================================
-- SEED DE PROFISSIONAIS (BARBEIROS E MANICURES)
-- =========================================================================
INSERT INTO ls_professionals (name, role, specialty, avatar, active)
VALUES
    ('Lucas Barbeiro', 'barbeiro', 'Fade, Barba Terapia e Freestyle', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', true),
    ('Mateus Barbeiro', 'barbeiro', 'Cortes clássicos na tesoura e Visagismo', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', true),
    ('Camila Nail Designer', 'manicure', 'Fibra de Vidro, Nail Art e Gel', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400', true),
    ('Juliana Manicure', 'manicure', 'Cutilagem Perfeita e Spa dos Pés', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400', true)
ON CONFLICT DO NOTHING;

-- =========================================================================
-- SEED DE SERVIÇOS (BARBEARIA E MANICURE)
-- =========================================================================
INSERT INTO ls_services (name, description, price, duration_min, type, category)
VALUES
    ('Corte Degrade & Navalhado', 'Corte moderno com acabamento na navalha', 50.00, 45, 'barbearia', 'Cabelo'),
    ('Barba Terapia Completa', 'Toalha quente, óleos essenciais e navalha', 45.00, 35, 'barbearia', 'Barba'),
    ('Combo Corte + Barba', 'Experiência completa de corte e barba', 85.00, 75, 'barbearia', 'Combos'),
    ('Manicure Tradicional', 'Cutilagem completa, lixamento técnico, hidratação profunda e esmaltação convencional.', 45.00, 45, 'manicure', 'Mãos'),
    ('Pedicure Spa dos Pés', 'Higienização, esfoliação relaxante, remoção de asperezas, cutilagem e massagem.', 55.00, 50, 'manicure', 'Pés'),
    ('Alongamento Fibra de Vidro', 'Aplicação fio a fio com estrutura anatômica natural, alta resistência e acabamento impecável.', 180.00, 120, 'manicure', 'Alongamento'),
    ('Esmaltação em Gel', 'Secagem em cabine LED/UV com brilho espelhado e duração de até 20 dias.', 70.00, 60, 'manicure', 'Esmaltação')
ON CONFLICT DO NOTHING;

-- =========================================================================
-- SEED DE PRODUTOS (LOJA DE ROUPAS E PRODUTOS DE MANICURE)
-- =========================================================================
INSERT INTO ls_products (name, description, price, category, sizes, image, in_stock, featured)
VALUES
    ('Camiseta Streetwear Oversized Black', 'Camiseta corte oversized em algodão premium 260g, toque peletizado e gola canelada 3cm.', 139.90, 'Camisetas', ARRAY['P', 'M', 'G', 'GG'], 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800', true, true),
    ('Moletom Canguru Heavyweight Off-White', 'Moletom 3 cabos com felpa interna pesada, capuz duplo estruturado e bolso frontal canguru.', 289.00, 'Moletons', ARRAY['M', 'G', 'GG'], 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800', true, true),
    ('Calça Cargo Utilitária Black Ops', 'Calça sarja encorpada com 6 bolsos funcionais, regulagem na barra e cintura com cordão embutido.', 249.90, 'Calças', ARRAY['38', '40', '42', '44'], 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800', true, true),
    ('Kit Esmalte Gel Red Diamond + Top Coat', 'Brilho espelhado e secagem rápida em cabine LED.', 49.90, 'Esmaltes', ARRAY['10ml'], 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800', true, true),
    ('Óleo Nutritivo de Cutículas com Vitaminas', 'Hidratação profunda para cutículas perfeitas e unhas resistentes.', 29.90, 'Cuidados', ARRAY['15ml'], 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=800', true, false)
ON CONFLICT DO NOTHING;

-- =========================================================================
-- STORAGE BUCKET PARA UPLOAD DE IMAGENS (OPCIONAL)
-- =========================================================================
-- Caso queira armazenar arquivos no Supabase Storage:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('ls_images', 'ls_images', true) ON CONFLICT (id) DO NOTHING;
-- CREATE POLICY "ls_leitura_imagens" ON storage.objects FOR SELECT USING (bucket_id = 'ls_images');
-- CREATE POLICY "ls_upload_imagens" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'ls_images');



