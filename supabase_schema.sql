-- ==============================================================================
-- SCRIPT DE CONFIGURAÇÃO DO BANCO DE DADOS SUPABASE (ICEMP & EVENTOS)
-- ==============================================================================
-- Instruções:
-- 1. Acesse o painel do Supabase: https://supabase.com/dashboard/project/zsnkgvheajgkxobqvsqz
-- 2. No menu lateral esquerdo, clique no ícone "SQL Editor"
-- 3. Cole este script completo e clique no botão verde "Run" (no canto inferior direito)
-- ==============================================================================

-- 1. TABELA DE EVENTOS DA ICEMP
CREATE TABLE IF NOT EXISTS public.icemp_events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  day TEXT NOT NULL,
  month TEXT NOT NULL DEFAULT 'Outubro',
  day_of_week TEXT NOT NULL,
  time TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT 'Igreja - ICEM',
  badge TEXT NOT NULL DEFAULT 'Geral',
  target TEXT,
  "desc" TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS (Segurança de Linhas)
ALTER TABLE public.icemp_events ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso
DROP POLICY IF EXISTS "Leitura pública de eventos" ON public.icemp_events;
CREATE POLICY "Leitura pública de eventos" 
ON public.icemp_events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Gravação e edição de eventos" ON public.icemp_events;
CREATE POLICY "Gravação e edição de eventos" 
ON public.icemp_events FOR ALL USING (true) WITH CHECK (true);

-- 2. TABELA DE INFORMAÇÕES INSTITUCIONAIS DA ICEMP
CREATE TABLE IF NOT EXISTS public.icemp_info (
  id TEXT PRIMARY KEY DEFAULT 'icemp_main',
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  whatsapp TEXT,
  instagram TEXT,
  pix_key TEXT,
  pix_type TEXT,
  description TEXT,
  schedule JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.icemp_info ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura pública de informações ICEMP" ON public.icemp_info;
CREATE POLICY "Leitura pública de informações ICEMP" 
ON public.icemp_info FOR SELECT USING (true);

DROP POLICY IF EXISTS "Edição de informações ICEMP" ON public.icemp_info;
CREATE POLICY "Edição de informações ICEMP" 
ON public.icemp_info FOR ALL USING (true) WITH CHECK (true);

-- 3. INSERÇÃO DOS DADOS INICIAIS DA ICEMP
INSERT INTO public.icemp_info (id, name, address, whatsapp, instagram, pix_key, pix_type, description, schedule)
VALUES (
  'icemp_main',
  'Igreja Cristã Evangélica Metropolitana de Palmas',
  'Conj. 01 - Q. 201 Sul, Av. Joaquim Teotônio Segurado, Lote 04 - Plano Diretor Sul, Palmas - TO',
  '5563999910330',
  '@ice.metropolitana',
  '10900748000102',
  'CNPJ',
  'Uma comunidade bíblica, acolhedora e vibrante em Palmas - TO, proclamando o Evangelho de Cristo e discipulando vidas.',
  '[
    {"day": "DOM", "dayFull": "Domingo", "time": "07h00", "title": "Oração Matutina"},
    {"day": "DOM", "dayFull": "Domingo", "time": "18h00", "title": "Escola Bíblica Dominical (EBD)"},
    {"day": "DOM", "dayFull": "Domingo", "time": "19h00", "title": "Culto de Celebração"},
    {"day": "TER", "dayFull": "Terça-feira", "time": "06h30", "title": "Oração Matutina"},
    {"day": "QUI", "dayFull": "Quinta-feira", "time": "19h30", "title": "Culto de Oração & Estudo"}
  ]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 4. INSERÇÃO DOS EVENTOS INICIAIS DA AGENDA DA ICEMP
INSERT INTO public.icemp_events (id, title, day, month, day_of_week, time, location, badge, target, "desc")
VALUES
  ('ev_1', 'Culto Especial de Missões & Avivamento', '04', 'Outubro', 'Sábado', '19h30', 'Templo Principal', 'Geral', 'Toda a Igreja', 'Noite dedicada à oração pelos campos missionários mundiais e despertamento espiritual da igreja.'),
  ('ev_2', 'Encontro de Casais: Aliança Inabalável', '11', 'Outubro', 'Sábado', '19h30', 'Salão Social ICEMP', 'Família', 'Casais e Noivos', 'Jantar temático com ministração especial sobre comunicação, intimidade e vida espiritual no lar.'),
  ('ev_3', 'Culto de Jovens JUMP: Chamados para Fora', '18', 'Outubro', 'Sábado', '20h00', 'Templo Principal', 'Jovens', 'Juventude e Amigos', 'Louvor fervoroso, comunhão entre as tribos e palavra desafiadora para a juventude cristã.'),
  ('ev_4', 'Vigília Geral de Oração & Clamor', '24', 'Outubro', 'Sexta-feira', '22h00', 'Templo Principal', 'Geral', 'Todos os Membros', 'Madrugada de oração, intercessão pelo Tocantins e busca profunda pela presença do Senhor.'),
  ('ev_hoje_30_out', 'Culto Especial & Clamor da Família', '30', 'Outubro', 'Sexta-feira', '20h00', 'Templo Principal - ICEMP', 'Geral', 'Toda a congregação e visitantes', 'Culto especial hoje às 20h00! Momento marcante de louvor congregacional e intercessão pelas famílias e jovens.'),
  ('ev_5', 'Celebração da Reforma Protestante', '31', 'Outubro', 'Sexta-feira', '19h30', 'Templo Principal', 'Geral', 'Toda a Família', 'Culto de gratidão pelos 5 Solas da fé bíblica e memorial histórico da fidelidade do Evangelho.')
ON CONFLICT (id) DO NOTHING;

