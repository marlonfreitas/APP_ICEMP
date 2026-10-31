import json
import re
import csv
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

# 1. Carregar dados atuais do churches-data.js
with open('churches-data.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Extrair JSON de ICEB_CHURCHES_DATA
match = re.search(r'const ICEB_CHURCHES_DATA\s*=\s*(\[.*?\]);\s*const', content, re.DOTALL)
if not match:
    raise ValueError("Não foi possível encontrar ICEB_CHURCHES_DATA em churches-data.js")

churches = json.loads(match.group(1))

# Definição das colunas
COLUMNS = [
    ('id', 'ID Único (Sistema)', 25),
    ('nome', 'Nome da Igreja', 32),
    ('estado', 'UF', 6),
    ('cidade', 'Cidade', 22),
    ('bairro', 'Bairro', 22),
    ('endereco', 'Endereço Completo', 38),
    ('cep', 'CEP', 12),
    ('latitude', 'Latitude (Y)', 14),
    ('longitude', 'Longitude (X)', 14),
    ('pastor_nome', 'Nome do Pastor', 26),
    ('pastor_esposa', 'Nome da Esposa', 26),
    ('pastor_cargo', 'Cargo Pastoral', 24),
    ('telefone', 'Telefone', 18),
    ('whatsapp', 'WhatsApp (com DDD)', 18),
    ('email', 'E-mail', 28),
    ('instagram', 'Instagram', 20),
    ('youtube', 'YouTube', 28),
    ('facebook', 'Facebook', 28),
    ('website', 'Site Oficial', 28),
    ('cultos_horarios', 'Horários dos Cultos (separados por | )', 45),
    ('pix_chave', 'Chave PIX', 22),
    ('pix_tipo', 'Tipo Chave PIX', 14),
    ('pix_favorecido', 'Favorecido PIX', 26),
    ('comodidades', 'Comodidades (separadas por vírgula)', 35),
    ('sede_regional', 'Sede Regional? (SIM/NÃO)', 16),
    ('foto_url', 'Foto Principal (URL)', 35),
    ('pastor_bio', 'Biografia / Mensagem Pastoral', 40)
]

wb = openpyxl.Workbook()
ws = wb.active
ws.title = "Igrejas ICEB Brasil"

# Estilos do cabeçalho oficial ICEB
header_fill = PatternFill(start_color="1D3546", end_color="1D3546", fill_type="solid") # ICEB Navy
header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
header_align = Alignment(horizontal="center", vertical="center", wrap_text=True)

thin_border = Border(
    left=Side(style='thin', color='D0D7DE'),
    right=Side(style='thin', color='D0D7DE'),
    top=Side(style='thin', color='D0D7DE'),
    bottom=Side(style='thin', color='D0D7DE')
)

# Escrever cabeçalho
for col_idx, (col_id, col_label, width) in enumerate(COLUMNS, 1):
    cell = ws.cell(row=1, column=col_idx, value=col_label)
    cell.fill = header_fill
    cell.font = header_font
    cell.alignment = header_align
    cell.border = thin_border
    col_letter = get_column_letter(col_idx)
    ws.column_dimensions[col_letter].width = width

ws.row_dimensions[1].height = 28
ws.freeze_panes = "A2"

zebra_fill = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid")

rows_for_csv = []
headers_for_csv = [col[0] for col in COLUMNS]
rows_for_csv.append(headers_for_csv)

for row_idx, c in enumerate(churches, 2):
    # Formatar cultos
    schedules = c.get('schedule', [])
    schedule_strs = []
    for s in schedules:
        schedule_strs.append(f"{s.get('day', '')} {s.get('time', '')} - {s.get('title', '')}")
    cultos_text = " | ".join(schedule_strs)
    
    # Formatar comodidades
    features = c.get('features', [])
    comodidades_text = ", ".join(features)
    
    # Formatar foto principal
    gallery = c.get('gallery', [])
    foto_url = gallery[0].get('url', '') if gallery else ''
    
    row_data = [
        c.get('id', ''),
        c.get('name', ''),
        c.get('uf', ''),
        c.get('cidade', c.get('city', '')),
        c.get('bairro', c.get('neighborhood', '')),
        c.get('address', ''),
        c.get('cep', ''),
        float(c.get('lat', 0)),
        float(c.get('lng', 0)),
        c.get('pastorTitle', ''),
        c.get('pastorSpouse', ''),
        c.get('pastorRole', 'Pastor Titular'),
        c.get('phone', ''),
        str(c.get('whatsapp', '')),
        c.get('email', ''),
        c.get('instagram', ''),
        c.get('youtubeUrl', ''),
        c.get('facebook', 'https://facebook.com'),
        c.get('website', 'https://igrejacristaevangelica.com.br'),
        cultos_text,
        c.get('pixKey', ''),
        c.get('pixType', 'CNPJ'),
        c.get('pixBeneficiary', c.get('shortName', '')),
        comodidades_text,
        'SIM' if c.get('isHeadquarters', False) else 'NÃO',
        foto_url,
        c.get('pastorBio', '')
    ]
    
    rows_for_csv.append(row_data)
    
    # Escrever na planilha Excel
    for col_idx, val in enumerate(row_data, 1):
        cell = ws.cell(row=row_idx, column=col_idx, value=val)
        cell.font = Font(name="Calibri", size=10)
        cell.border = thin_border
        
        # Alinhamento
        if col_idx in [3, 23]: # UF, Sede
            cell.alignment = Alignment(horizontal="center", vertical="center")
        elif col_idx in [8, 9]: # Coordenadas
            cell.alignment = Alignment(horizontal="right", vertical="center")
            cell.number_format = '0.0000'
        else:
            cell.alignment = Alignment(horizontal="left", vertical="center")
            
        if row_idx % 2 == 0:
            cell.fill = zebra_fill
            
    ws.row_dimensions[row_idx].height = 20

# Salvar planilha Excel
wb.save('igrejas_iceb.xlsx')
print(f"Planilha Excel criada com sucesso: igrejas_iceb.xlsx ({len(churches)} congregações)")

# Salvar também como CSV com codificação UTF-8-sig (para abrir perfeito no Excel em português)
with open('igrejas_iceb.csv', 'w', encoding='utf-8-sig', newline='') as f:
    writer = csv.writer(f, delimiter=';')
    writer.writerows(rows_for_csv)

print(f"Arquivo CSV criado com sucesso: igrejas_iceb.csv ({len(churches)} congregações)")
