import os
from PIL import Image, ImageDraw

res_dir = os.path.join(os.path.dirname(__file__), 'android', 'app', 'src', 'main', 'res')
logo_path = os.path.join(os.path.dirname(__file__), 'assets', 'simbolo_pomba_azul.png')
splash_src = os.path.join(os.path.dirname(__file__), 'assets', 'logo_iceb_horizontal.png')

logo = Image.open(logo_path).convert('RGBA')

sizes = {
    'mipmap-mdpi': (48, 108),
    'mipmap-hdpi': (72, 162),
    'mipmap-xhdpi': (96, 216),
    'mipmap-xxhdpi': (144, 324),
    'mipmap-xxxhdpi': (192, 432)
}

def create_square_icon(size):
    img = Image.new('RGBA', (size, size), (255, 255, 255, 255))
    # Padding 15%
    pad = int(size * 0.12)
    inner_size = size - (pad * 2)
    resized_logo = logo.resize((inner_size, inner_size), Image.Resampling.LANCZOS)
    img.paste(resized_logo, (pad, pad), resized_logo)
    return img

def create_round_icon(size):
    base = create_square_icon(size)
    mask = Image.new('L', (size, size), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, size - 1, size - 1), fill=255)
    
    round_img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    round_img.paste(base, (0, 0), mask)
    return round_img

def create_foreground_icon(fg_size):
    img = Image.new('RGBA', (fg_size, fg_size), (0, 0, 0, 0))
    logo_size = int(fg_size * 0.55)
    resized_logo = logo.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
    offset = (fg_size - logo_size) // 2
    img.paste(resized_logo, (offset, offset), resized_logo)
    return img

for folder, (icon_size, fg_size) in sizes.items():
    folder_path = os.path.join(res_dir, folder)
    if not os.path.exists(folder_path):
        continue
    
    sq = create_square_icon(icon_size)
    sq.save(os.path.join(folder_path, 'ic_launcher.png'), 'PNG')
    
    rnd = create_round_icon(icon_size)
    rnd.save(os.path.join(folder_path, 'ic_launcher_round.png'), 'PNG')
    
    fg = create_foreground_icon(fg_size)
    fg.save(os.path.join(folder_path, 'ic_launcher_foreground.png'), 'PNG')
    
    print(f"Gerado ícones para {folder}: {icon_size}x{icon_size} / fg {fg_size}")

print("Todos os ícones nativos foram atualizados com o símbolo oficial ICEB!")
