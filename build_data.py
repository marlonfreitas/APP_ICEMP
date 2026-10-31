import os
import re
import json
import unicodedata
import shutil

UF_NAMES = {
    'GO': 'Goiás',
    'RN': 'Rio Grande do Norte',
    'PA': 'Pará',
    'CE': 'Ceará',
    'DF': 'Distrito Federal',
    'MT': 'Mato Grosso',
    'TO': 'Tocantins',
    'MA': 'Maranhão',
    'MG': 'Minas Gerais',
    'PI': 'Piauí',
    'MS': 'Mato Grosso do Sul',
    'PE': 'Pernambuco',
    'RS': 'Rio Grande do Sul',
    'SC': 'Santa Catarina',
    'PR': 'Paraná',
    'SP': 'São Paulo',
    'BA': 'Bahia',
    'RJ': 'Rio de Janeiro'
}

CHURCH_DEFAULT_IMAGES = [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDGA5irQbJd2vRJyFH2JhISA4HSd_KU1_ZX0G94vyWGNuqMe7dpQJKbXN73Fh4CvQ20BllCf9S9L65xU7sbZwSGNHQNqwExcfGYFhzwHva6OVuazjfbiKAwSVzsjKaderxUTJudl02ni9m3hTBZNwIehfZlILdJz44lBvqUOJnZzRfx2ZmVSKNOC-DsBsl-0eFJcibBy3AvmvAx6uZH8XDT90PeStalHFbi7uPo98udBF-vN9iqwwoZ1A',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCgBqPcbUtpl0xcj8r9ltTxim0HB7WPAv2RQOBTNdz76hFC3xD0Ydy-z23Yo39eh7RQNyz3sUvRqOHxP5hRr-fqWyfLIEN0CAA6gVAjYNS0SeSv58DjvDqPRiwTlmMJ_XsR7pa9BR-xsPCqMHB4SDa6gCcRvWYv4GDfltAHZ43moN70HnxAU2YtBpexn4f_i2wz6x0AWdAULJ8JULyW19MAtEizLLx1CK5f5pJS2TV7vTIxBY3fzzg8Gg',
    'https://images.unsplash.com/photo-1548625361-195fe57876a3?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1510525009512-ad7fc0c0281b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1478147427282-58a87a120781?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1519491050282-cf00c82424b4?auto=format&fit=crop&w=800&q=80'
]

PASTOR_DEFAULT_PHOTOS = [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAkNWs5CAkNLeC35TEZL_7jlSYQqzgU-Fv5UEwYpnq_J_8y1IsTDNH8WWPgBH3dALZdPWSJPmHnlQymVGAN4xhQEmfB7Gb5exKcUjdnEhIgMe5D-avj5RNpcFDMgvKoE9s3JLfAy40ZhTr_Zo1Rgm_dC1p8Fmn927-MivKcJC_HMeEWdvJxw7OG-sQdJAFJUJc9o-ejz_L5U92pLdo166dSFwnaNFNKGib0LmW1tEyt8qjaeWoTFTYVbQ',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80'
]

def fix_coord(val, is_lat=True):
    try:
        f = float(val)
        while abs(f) >= 1000:
            f /= 1000.0
        while abs(f) > (90 if is_lat else 180):
            f /= 10.0
        return round(f, 6)
    except:
        return -15.7801 if is_lat else -47.9292

def slugify(text):
    text = unicodedata.normalize('NFKD', str(text)).encode('ascii', 'ignore').decode('ascii')
    text = re.sub(r'[^\w\s-]', '', text).strip().lower()
    return re.sub(r'[-\s]+', '-', text)

def parse_cultos(cultos_str):
    if not cultos_str or not str(cultos_str).strip():
        return [
            {'day': 'DOM', 'dayFull': 'Domingo', 'time': '09h00', 'title': 'Escola Bíblica Dominical (EBD)', 'badge': 'Ensino', 'desc': 'Estudo temático das Escrituras para todas as idades.'},
            {'day': 'DOM', 'dayFull': 'Domingo', 'time': '19h00', 'title': 'Culto Solene de Adoração', 'badge': 'Adoração', 'desc': 'Exposição bíblica, louvor congregacional e comunhão cristã.'},
            {'day': 'QUA', 'dayFull': 'Quarta-feira', 'time': '19h30', 'title': 'Reunião de Oração e Doutrina', 'badge': 'Oração', 'desc': 'Intercessão pela comunidade, famílias e missões globais.'}
        ]
    
    parts = re.split(r'[|;]', str(cultos_str))
    schedules = []
    for p in parts:
        p = p.strip()
        if not p:
            continue
        # Ex: "DOM 09h00 - Escola Bíblica" ou "Domingo 19:00 - Culto"
        m = re.match(r'^(DOM|SEG|TER|QUA|QUI|SEX|SAB|Domingo|Quarta|Quinta|Sábado)?\s*([0-9]{1,2}[:h][0-9]{2})?\s*[-–:]?\s*(.*)$', p, re.IGNORECASE)
        if m:
            day_raw = (m.group(1) or 'DOM').upper()[:3]
            time_raw = m.group(2) or '19h00'
            time_raw = time_raw.replace(':', 'h')
            title_raw = m.group(3) or 'Culto de Adoração'
            
            day_full = 'Domingo' if day_raw == 'DOM' else ('Quarta-feira' if day_raw == 'QUA' else ('Quinta-feira' if day_raw == 'QUI' else ('Sábado' if day_raw == 'SAB' else day_raw)))
            badge = 'Ensino' if 'ebd' in title_raw.lower() or 'escola' in title_raw.lower() else ('Oração' if 'oração' in title_raw.lower() or 'doutrina' in title_raw.lower() else 'Adoração')
            
            schedules.append({
                'day': day_raw,
                'dayFull': day_full,
                'time': time_raw,
                'title': title_raw,
                'badge': badge,
                'desc': 'Culto e comunhão na presença de Deus.'
            })
    return schedules if schedules else [
        {'day': 'DOM', 'dayFull': 'Domingo', 'time': '19h00', 'title': 'Culto de Adoração', 'badge': 'Adoração', 'desc': 'Celebração com a comunidade.'}
    ]

def load_from_excel(filepath):
    import openpyxl
    wb = openpyxl.load_workbook(filepath, data_only=True)
    ws = wb.active
    
    rows = list(ws.iter_rows(values_only=True))
    if not rows or len(rows) < 2:
        return []
    
    headers = [str(h).strip().lower() if h else '' for h in rows[0]]
    churches = []
    
    for row in rows[1:]:
        if not any(row):
            continue
        
        row_dict = {}
        for h, val in zip(headers, row):
            row_dict[h] = val
            
        nome = str(row_dict.get('nome da igreja', row_dict.get('nome', '')) or '').strip()
        if not nome:
            continue
            
        uf = str(row_dict.get('uf', row_dict.get('estado', '')) or '').strip().upper()
        cidade = str(row_dict.get('cidade', '') or '').strip()
        bairro = str(row_dict.get('bairro', '') or '').strip()
        endereco = str(row_dict.get('endereço completo', row_dict.get('endereco', '')) or '').strip()
        cep = str(row_dict.get('cep', '') or '').strip()
        
        lat_val = row_dict.get('latitude (y)', row_dict.get('latitude', -15.7801))
        lng_val = row_dict.get('longitude (x)', row_dict.get('longitude', -47.9292))
        lat = fix_coord(lat_val, is_lat=True)
        lng = fix_coord(lng_val, is_lat=False)
            
        id_val = str(row_dict.get('id único (sistema)', row_dict.get('id', '')) or '').strip()
        if not id_val:
            id_val = f"{slugify(nome)}-{slugify(cidade)}-{slugify(uf)}"
            
        pastor_nome = str(row_dict.get('nome do pastor', row_dict.get('pastor_nome', '')) or '').strip()
        if not pastor_nome:
            pastor_nome = f"Pr. Titular ({nome})"
        pastor_cargo = str(row_dict.get('cargo pastoral', row_dict.get('pastor_cargo', 'Pastor Titular')) or 'Pastor Titular').strip()
        pastor_bio = str(row_dict.get('biografia / mensagem pastoral', row_dict.get('pastor_bio', '')) or '').strip()
        if not pastor_bio:
            pastor_bio = f"Servo de Deus à frente da {nome} em {cidade} - {uf}, dedicado à pregação bíblica e acolhimento pastoral."
            
        telefone = str(row_dict.get('telefone', '') or '').strip()
        whatsapp = str(row_dict.get('whatsapp (com ddd)', row_dict.get('whatsapp', '')) or '').strip()
        whatsapp = re.sub(r'\D', '', whatsapp)
        if not whatsapp:
            whatsapp = "5561999100000"
        elif not whatsapp.startswith('55') and len(whatsapp) in [10, 11]:
            whatsapp = '55' + whatsapp
            
        email = str(row_dict.get('e-mail', row_dict.get('email', '')) or '').strip()
        if not email:
            email = f"contato.{slugify(nome)[:15]}@iceb.org.br"
            
        instagram = str(row_dict.get('instagram', '') or '').strip()
        if instagram and not instagram.startswith('@') and not instagram.startswith('http'):
            instagram = '@' + instagram
            
        youtube = str(row_dict.get('youtube', '') or '').strip()
        if not youtube:
            youtube = 'https://youtube.com'
            
        facebook = str(row_dict.get('facebook', '') or '').strip()
        if not facebook:
            facebook = 'https://facebook.com'
            
        cultos_raw = row_dict.get('horários dos cultos (separados por | )', row_dict.get('cultos_horarios', ''))
        schedule = parse_cultos(cultos_raw)
        
        pix_chave = str(row_dict.get('chave pix', row_dict.get('pix_chave', '')) or '').strip()
        pix_tipo = str(row_dict.get('tipo chave pix', row_dict.get('pix_tipo', 'CNPJ')) or 'CNPJ').strip()
        pix_fav = str(row_dict.get('favorecido pix', row_dict.get('pix_favorecido', nome)) or nome).strip()
        
        comodidades_raw = str(row_dict.get('comodidades (separadas por vírgula)', row_dict.get('comodidades', '')) or '').strip()
        if comodidades_raw:
            features = [f.strip() for f in comodidades_raw.split(',') if f.strip()]
        else:
            features = ['Ambiente climatizado', 'Estacionamento']
            
        sede_raw = str(row_dict.get('sede regional? (sim/não)', row_dict.get('sede_regional', 'NÃO')) or '').strip().upper()
        is_hq = 'SIM' in sede_raw or 'S' == sede_raw or 'TRUE' in sede_raw
        
        foto_url = str(row_dict.get('foto principal (url)', row_dict.get('foto_url', '')) or '').strip()
        idx = len(churches)
        main_img = foto_url if foto_url.startswith('http') else CHURCH_DEFAULT_IMAGES[idx % len(CHURCH_DEFAULT_IMAGES)]
        alt_img = CHURCH_DEFAULT_IMAGES[(idx + 1) % len(CHURCH_DEFAULT_IMAGES)]
        
        gallery = [
            {'url': main_img, 'title': 'Fachada do Templo', 'desc': f'Templo da {nome} em {cidade}'},
            {'url': alt_img, 'title': 'Nave do Santuário', 'desc': 'Espaço acolhedor para adoração e comunhão'}
        ]
        
        pastor_photo_custom = str(row_dict.get('foto do pastor (url ou arquivo)', row_dict.get('foto do pastor', row_dict.get('pastor_foto', ''))) or '').strip()
        if pastor_photo_custom:
            pastor_photo = pastor_photo_custom
        else:
            pastor_photo = PASTOR_DEFAULT_PHOTOS[idx % len(PASTOR_DEFAULT_PHOTOS)]
        
        # Pastor Auxiliar na planilha (se informado)
        aux_nome = str(row_dict.get('nome pastor auxiliar', row_dict.get('pastor_auxiliar_nome', '')) or '').strip()
        pastor_auxiliar = None
        if aux_nome:
            aux_cargo = str(row_dict.get('cargo pastor auxiliar', row_dict.get('pastor_auxiliar_cargo', 'Pastor Auxiliar')) or 'Pastor Auxiliar').strip()
            aux_esposa = str(row_dict.get('esposa pastor auxiliar', row_dict.get('pastor_auxiliar_esposa', '')) or '').strip()
            aux_bio = str(row_dict.get('bio pastor auxiliar', row_dict.get('pastor_auxiliar_bio', '')) or '').strip()
            aux_foto = str(row_dict.get('foto pastor auxiliar (url ou arquivo)', row_dict.get('foto pastor auxiliar', row_dict.get('pastor_auxiliar_foto', ''))) or '').strip()
            if not aux_foto:
                aux_foto = 'assets/simbolo_pomba_azul.png'
            pastor_auxiliar = {
                'name': aux_nome,
                'role': aux_cargo,
                'spouse': aux_esposa,
                'bio': aux_bio if aux_bio else f"Servo de Deus atuando como {aux_cargo} na {nome}.",
                'photo': aux_foto
            }
        
        TEST_SPOUSE_NAMES = [
            'Pra. Maria Helena Santos',
            'Pra. Raquel Cavalcante',
            'Irmã Débora Souza',
            'Pra. Ana Cristina Mello',
            'Irmã Elisabete Ferreira',
            'Pra. Luciana Pereira',
            'Irmã Marta de Morais',
            'Pra. Noemi Arantes',
            'Irmã Sara Lopes',
            'Pra. Rute Barbosa'
        ]
        pastor_esposa = str(row_dict.get('nome da esposa', row_dict.get('pastor_esposa', row_dict.get('esposa', ''))) or '').strip()
        if not pastor_esposa:
            pastor_esposa = TEST_SPOUSE_NAMES[idx % len(TEST_SPOUSE_NAMES)]

        website = str(row_dict.get('site oficial', row_dict.get('website', row_dict.get('site', ''))) or '').strip()
        if not website:
            website = 'https://igrejacristaevangelica.com.br'

        gc_bairro = bairro if bairro else 'Centro'
        growth_groups = [
            {
                'name': f'GC Betel ({gc_bairro})',
                'dayTime': 'Terça • 20h00',
                'host': f'Lares no setor {gc_bairro}',
                'focus': 'Estudo bíblico, comunhão e edificação nos lares.'
            },
            {
                'name': 'GC Famílias Conectadas',
                'dayTime': 'Quinta • 19h30',
                'host': 'Residência de Membros',
                'focus': 'Discipulado de casais, jovens e filhos.'
            }
        ]

        church_obj = {
            'id': id_val,
            'uf': uf,
            'ufName': UF_NAMES.get(uf, uf),
            'name': nome,
            'shortName': nome,
            'region': f'MEAR {UF_NAMES.get(uf, uf)}',
            'isHeadquarters': is_hq,
            'isOfficial': True,
            'city': cidade,
            'neighborhood': bairro,
            'address': endereco if endereco else f"{cidade} - {uf}",
            'cep': cep,
            'distance': f'{(idx % 15) * 0.4 + 0.8:.1f} km',
            'lat': lat,
            'lng': lng,
            'phone': telefone if telefone else '(61) 3300-1000',
            'whatsapp': whatsapp,
            'email': email,
            'youtubeUrl': youtube,
            'instagram': instagram if instagram else '@iceb.oficial',
            'facebook': facebook,
            'website': website,
            'cnpj': pix_chave if '/' in pix_chave else '01.100.100/0001-10',
            'pixKey': pix_chave if pix_chave else 'contato@iceb.org.br',
            'pixType': pix_tipo,
            'pixBeneficiary': pix_fav,
            'pastorTitle': pastor_nome,
            'pastorSpouse': pastor_esposa,
            'pastorRole': pastor_cargo,
            'pastorBio': pastor_bio,
            'pastorPhoto': pastor_photo,
            'pastorAuxiliar': pastor_auxiliar,
            'gallery': gallery,
            'schedule': schedule,
            'growthGroups': growth_groups,
            'features': features,
            'monthlyAgenda': None,
            'birthdays': None,
            'ebd': None,
            'bankAccount': None,
            'description': f'Comunidade de fé e adoração em {cidade} - {uf}, filiada à ICEB.'
        }

        churches.append(church_obj)
        
    return churches

def process_dados_igrejas_folder(churches):
    base_dir = 'dados_igrejas'
    if not os.path.exists(base_dir):
        os.makedirs(base_dir, exist_ok=True)
        
    readme_path = os.path.join(base_dir, 'LEIA-ME.md')
    if not os.path.exists(readme_path):
        with open(readme_path, 'w', encoding='utf-8') as f:
            f.write('''# Como Personalizar os Dados e Fotos de uma Igreja

Você pode criar uma pasta aqui dentro para qualquer igreja que desejar personalizar!

## Opção 1: Nome da Pasta
Dê à pasta o nome da cidade ou o ID da igreja. Exemplos:
- `palmas` ou `ice-metropolitana-palmas` ou `igreja-crista-evangelica-metropolitana-de-palmas-palmas-to`
- `goiania` ou `1a-ice-goiania`
- `brasilia-asa-sul`

## O que colocar dentro da pasta da igreja:
1. **Fotos:**
   - Foto do Pastor Titular: nomeie como `pastor.png` ou `pastor_titular.png` (ou `.jpg`, `.webp`)
   - Foto do Pastor Auxiliar: nomeie como `pastor_auxiliar.png` ou `auxiliar.png` (ou `.jpg`, `.webp`)
   - Foto do Templo/Fachada: nomeie como `fachada.png` ou `templo.png` (ou `.jpg`, `.webp`)

2. **Informações Adicionais (`info.json`):**
   Você pode criar um arquivo `info.json` para adicionar ou alterar qualquer informação daquela igreja. Exemplo:
   ```json
   {
     "pastorTitle": "Pr. Titular Ubiracy Lucas Barbosa",
     "pastorSpouse": "Pra. Adriana Lucas",
     "pastorBio": "Mensagem pastoral...",
     "pastorAuxiliar": {
       "name": "Pr. Raimundo Brindeiro",
       "role": "Pastor Auxiliar",
       "spouse": "",
       "bio": "Pastor auxiliar dedicado ao pastoreio e ensino bíblico.",
       "photo": "assets/PR_Raimundo_Brindeiro.png"
     },
     "whatsapp": "5563999910330",
     "instagram": "@ice.metropolitana",
     "website": "https://icemetropolitana.com.br/"
   }
   ```

Quando terminar, basta dar dois cliques em `atualizar_dados.bat`!
O sistema lerá automaticamente suas fotos e informações e atualizará o aplicativo.
''')

    # Mapear igrejas para busca rápida
    church_map = {}
    for c in churches:
        c_id = c['id']
        c_name_slug = slugify(c['name'])
        c_full_slug = slugify(f"{c['name']} {c['city']} {c['uf']}")
        church_map[c_id] = c
        church_map[c_name_slug] = c
        church_map[c_full_slug] = c

    # Varrer pastas em dados_igrejas
    for entry in os.listdir(base_dir):
        folder_path = os.path.join(base_dir, entry)
        if not os.path.isdir(folder_path):
            continue

        entry_slug = slugify(entry)
        target_church = None

        # 1. Verificar se info.json define o id ou nome
        info_path = os.path.join(folder_path, 'info.json')
        info_data = {}
        if os.path.exists(info_path):
            try:
                with open(info_path, 'r', encoding='utf-8') as fp:
                    info_data = json.load(fp)
            except Exception as e:
                print(f"Aviso ao ler {info_path}: {e}")

        if info_data.get('id'):
            target_church = next((c for c in churches if c['id'] == info_data['id']), None)
        
        # 2. Casar por slug exato
        if not target_church:
            target_church = church_map.get(entry_slug)

        # 3. Casar por termos parciais
        if not target_church:
            for c in churches:
                c_slug = slugify(c['id'])
                c_name_slug = slugify(c['name'])
                c_city_slug = slugify(c['city'])
                if entry_slug in c_slug or (entry_slug in c_name_slug and c_city_slug in entry_slug) or (c_city_slug in entry_slug and any(term in c_name_slug for term in entry_slug.split('-'))):
                    target_church = c
                    break

        if not target_church:
            # Tentar achar por cidade
            for c in churches:
                if entry_slug == slugify(c['city']) or entry_slug in slugify(c['name']):
                    target_church = c
                    break

        if not target_church:
            print(f"Aviso: Não foi possível identificar a igreja para a pasta '{entry}'.")
            continue

        print(f"-> Aplicando dados de 'dados_igrejas/{entry}' para: {target_church['name']} ({target_church['city']} - {target_church['uf']})")

        # Criar pasta destino em assets/igrejas/<id>
        dest_assets_dir = os.path.join('assets', 'igrejas', target_church['id'])
        os.makedirs(dest_assets_dir, exist_ok=True)

        # Varrer arquivos e subpastas da pasta
        church_photos = []
        for fname in sorted(os.listdir(folder_path)):
            fpath = os.path.join(folder_path, fname)
            if os.path.isdir(fpath):
                # Se for uma subpasta (como estudos_GC), copiar para os assets da igreja
                dest_sub_dir = os.path.join(dest_assets_dir, fname)
                os.makedirs(dest_sub_dir, exist_ok=True)
                for sub_item in sorted(os.listdir(fpath)):
                    s_path = os.path.join(fpath, sub_item)
                    if os.path.isfile(s_path):
                        shutil.copy2(s_path, os.path.join(dest_sub_dir, sub_item))
                continue

            if not os.path.isfile(fpath):
                continue

            fname_lower = fname.lower()
            ext = os.path.splitext(fname)[1].lower()
            if ext in ['.png', '.jpg', '.jpeg', '.webp']:
                dest_file = os.path.join(dest_assets_dir, fname)
                shutil.copyfile(fpath, dest_file)
                asset_url = f"assets/igrejas/{target_church['id']}/{fname}".replace('\\', '/')

                if any(k in fname_lower for k in ['auxiliar', 'raimundo', 'brindeiro']):
                    if not target_church.get('pastorAuxiliar'):
                        target_church['pastorAuxiliar'] = {
                            'name': 'Pr. Raimundo Brindeiro',
                            'role': 'Pastor Auxiliar',
                            'spouse': 'Jacilene',
                            'bio': 'Pastor auxiliar dedicado ao ministério, discipulado e pastoreio da comunidade.',
                            'photo': asset_url
                        }
                    else:
                        target_church['pastorAuxiliar']['photo'] = asset_url
                elif any(k in fname_lower for k in ['pastor', 'titular', 'ubiracy', 'pr_']):
                    target_church['pastorPhoto'] = asset_url
                else:
                    # Foto da igreja / fachada / cultos / eventos
                    church_photos.append((fname_lower, asset_url))

        # Se houver fotos da igreja (fachada, cultos, etc.), montar a galeria completa
        if church_photos:
            # Ordenar para que 'fachada' ou 'templo' fique em primeiro
            church_photos.sort(key=lambda x: 0 if any(k in x[0] for k in ['fachada', 'templo', 'frente', 'igreja']) else 1)
            
            new_gallery = []
            for idx_p, (fl, aurl) in enumerate(church_photos):
                if any(k in fl for k in ['fachada', 'templo', 'frente', 'igreja']):
                    title = "Fachada do Templo"
                    desc = f"Templo da {target_church['name']}"
                elif 'culto' in fl:
                    title = f"Culto & Celebração {idx_p if idx_p > 1 else ''}".strip()
                    desc = f"Momentos de adoração, comunhão e Palavra de Deus na {target_church['shortName']}"
                else:
                    title = fl.replace('.png', '').replace('.jpg', '').replace('.jpeg', '').replace('_', ' ').replace('-', ' ').title()
                    desc = f"Atividades e comunhão na {target_church['shortName']}"
                new_gallery.append({'url': aurl, 'title': title, 'desc': desc})
            
            target_church['gallery'] = new_gallery

        # Aplicar dados de info.json
        if info_data:
            for k, v in info_data.items():
                if k in ['id']:
                    continue
                if k == 'pastorAuxiliar' and isinstance(v, dict):
                    if not target_church.get('pastorAuxiliar'):
                        target_church['pastorAuxiliar'] = v
                    else:
                        target_church['pastorAuxiliar'].update(v)
                else:
                    target_church[k] = v

        # Auto-sincronizar PDFs da pasta estudos_GC caso algum não esteja registrado
        gc_folder = os.path.join(folder_path, 'estudos_GC')
        if os.path.isdir(gc_folder):
            if 'estudosGC' not in target_church:
                target_church['estudosGC'] = {
                    'title': 'Estudos dos Grupos de Crescimento',
                    'series': 'O Princípio da Mutualidade nos Relacionamentos',
                    'badge': 'Série Oficial • 2026',
                    'description': 'Lições bíblicas oficiais para os Grupos de Crescimento.',
                    'folderPath': f"assets/igrejas/{target_church['id']}/estudos_GC",
                    'studies': []
                }
            studies_list = target_church['estudosGC'].setdefault('studies', [])
            existing_files = {os.path.basename(s.get('file', '')).lower() for s in studies_list}
            for s in studies_list:
                if 'fileName' in s:
                    existing_files.add(s['fileName'].lower())

            for pdf_name in sorted(os.listdir(gc_folder)):
                if pdf_name.lower().endswith('.pdf') and pdf_name.lower() not in existing_files:
                    full_p = os.path.join(gc_folder, pdf_name)
                    size_bytes = os.path.getsize(full_p)
                    size_str = f"{(size_bytes / 1024):.0f} KB" if size_bytes < 1024*1024 else f"{(size_bytes / (1024*1024)):.1f} MB"
                    
                    num_match = re.search(r'(?:licao|lição|aula)[\s_-]*0?(\d+)', pdf_name, re.IGNORECASE)
                    lesson_num = int(num_match.group(1)) if num_match else len(studies_list) + 1
                    clean_name = os.path.splitext(pdf_name)[0].replace('_', ' ').replace('-', ' ').strip()
                    clean_title = f"Lição {lesson_num}: {clean_name}" if not clean_name.lower().startswith('lição') else clean_name

                    studies_list.append({
                        'id': f"licao-{lesson_num}",
                        'lessonNumber': lesson_num,
                        'title': clean_title,
                        'topic': 'Estudo Bíblico',
                        'desc': 'Estudo bíblico e edificação para os Grupos de Crescimento.',
                        'file': f"assets/igrejas/{target_church['id']}/estudos_GC/{pdf_name}",
                        'fileName': pdf_name,
                        'size': size_str
                    })
                    existing_files.add(pdf_name.lower())
                    print(f"   [+] Novo estudo detectado e adicionado automaticamente: {pdf_name}")

            studies_list.sort(key=lambda s: s.get('lessonNumber', 999))

    # Verificação inteligente fallback apenas se a foto ainda for default
    for c in churches:
        if ('ubiracy' in slugify(c.get('pastorTitle', '')) or 'metropolitana' in slugify(c.get('id', ''))) and not c.get('pastorPhoto', '').startswith('assets/'):
            if os.path.exists('assets/PR_Ubiracy_lucas.png'):
                c['pastorPhoto'] = 'assets/PR_Ubiracy_lucas.png'
            if os.path.exists('assets/PR_Raimundo_Brindeiro.png'):
                if not c.get('pastorAuxiliar'):
                    c['pastorAuxiliar'] = {
                        'name': 'Pr. Raimundo Brindeiro',
                        'role': 'Pastor Auxiliar',
                        'spouse': 'Jacilene',
                        'bio': 'Pastor dedicado ao ministério bíblico, apoio pastoral, aconselhamento e visitação.',
                        'photo': 'assets/PR_Raimundo_Brindeiro.png'
                    }
                elif not c['pastorAuxiliar'].get('photo', '').startswith('assets/'):
                    c['pastorAuxiliar']['photo'] = 'assets/PR_Raimundo_Brindeiro.png'

def main():
    excel_path = 'igrejas_iceb.xlsx'
    if not os.path.exists(excel_path):
        print(f"Erro: {excel_path} não encontrado.")
        return

    print(f"Lendo dados de {excel_path}...")
    churches = load_from_excel(excel_path)
    
    if not churches:
        print("Aviso: Nenhuma igreja encontrada na planilha.")
        return

    # Processar personalizações da pasta dados_igrejas
    process_dados_igrejas_folder(churches)
    
    # Agrupamento e contagem por estado
    uf_counts = {}
    for c in churches:
        uf = c['uf']
        uf_counts[uf] = uf_counts.get(uf, 0) + 1

    states_list = [{'uf': 'ALL', 'name': 'Todos', 'count': len(churches)}]
    for uf, count in sorted(uf_counts.items(), key=lambda x: x[1], reverse=True):
        name = f'{UF_NAMES.get(uf, uf)} ({uf})'
        states_list.append({'uf': uf, 'name': name, 'count': count})

    ICEB_EVENTS = [
      {
        "id": "convencao-nacional-2026",
        "title": "82ª Convenção Geral da ICEB",
        "theme": "Fidelidade e Missão no Século XXI",
        "date": "14 a 18 de Julho de 2026",
        "location": "Centro de Convenções de Goiânia - GO",
        "type": "Nacional",
        "speaker": "Pastores convidados e Diretoria da AICEB",
        "image": "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80"
      },
      {
        "id": "congresso-mocidade-uceb",
        "title": "Congresso Nacional da Juventude (UCEB)",
        "theme": "Geração que Permanece em Cristo",
        "date": "10 a 12 de Outubro de 2026",
        "location": "Acampamento Betel - São Paulo - SP",
        "type": "Juventude",
        "speaker": "Lideranças jovens de todo o Brasil",
        "image": "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=800&q=80"
      },
      {
        "id": "simposio-teologico-sebite",
        "title": "Simpósio Teológico SEBITE",
        "theme": "Hermenêutica Expositiva e Pregação Bíblica",
        "date": "22 a 24 de Novembro de 2026",
        "location": "SEBITE - Goiânia - GO",
        "type": "Teologia",
        "speaker": "Professores e Teólogos da denominação",
        "image": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80"
      }
    ]

    js_content = f'''/**
 * Dados de Congregações da Igreja Cristã Evangélica do Brasil (ICEB)
 * Gerado e sincronizado com a planilha igrejas_iceb.xlsx
 * Total de Congregações: {len(churches)}
 */

const ICEB_CHURCHES_DATA = {json.dumps(churches, ensure_ascii=False, indent=2)};

const BRAZIL_STATES = {json.dumps(states_list, ensure_ascii=False, indent=2)};

const ICEB_EVENTS = {json.dumps(ICEB_EVENTS, ensure_ascii=False, indent=2)};
'''

    with open('churches-data.js', 'w', encoding='utf-8') as fp:
        fp.write(js_content)

    # Copiar também para www/churches-data.js se a pasta www existir
    if os.path.exists('www'):
        shutil.copyfile('churches-data.js', os.path.join('www', 'churches-data.js'))
        print("Sincronizado também com www/churches-data.js!")

    print(f"SUCESSO: {len(churches)} congregações atualizadas na aplicação com sucesso!")
    print(f"Estados presentes: {len(uf_counts)}")

if __name__ == '__main__':
    main()
