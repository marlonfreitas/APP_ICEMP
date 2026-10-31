# Como Personalizar os Dados e Fotos de Qualquer Igreja

Esta pasta foi criada para você gerenciar fotos e informações específicas de qualquer igreja da ICEB de forma simples e automática.

---

## 📁 Como Funciona

Para personalizar uma igreja, basta **criar uma pasta** aqui dentro com o nome da cidade ou o ID da igreja.

### Exemplos de nomes de pastas aceitos:
- `palmas` ou `ice-metropolitana-palmas-to`
- `goiania` ou `1a-ice-goiania`
- `brasilia` ou `ice-central-brasilia`
- `anapolis` ou `ice-central-anapolis`

*(O sistema reconhece tanto pelo ID oficial quanto por termos do nome e cidade).*

---

## 📸 Fotos que Você Pode Colocar na Pasta da Igreja:

Basta colar os arquivos de imagem (PNG, JPG, WEBP) dentro da pasta da igreja com os seguintes nomes:

1. **Foto do Pastor Titular:**
   - Nomeie o arquivo como: `pastor.png`, `pastor_titular.png` ou o nome do pastor (ex: `PR_Ubiracy_lucas.png`).

2. **Foto do Pastor Auxiliar:**
   - Nomeie o arquivo como: `pastor_auxiliar.png`, `auxiliar.png` ou o nome dele (ex: `PR_Raimundo_Brindeiro.png`).

3. **Foto da Fachada / Templo:**
   - Nomeie como: `fachada.png`, `templo.png` ou `foto.jpg`.

---

## 📝 Informações Personalizadas (`info.json`)

Se desejar alterar textos, telefones, redes sociais ou adicionar dados do **Pastor Auxiliar**, basta criar um arquivo `info.json` dentro da pasta da igreja.

### Exemplo Completo de `info.json`:
```json
{
  "pastorTitle": "Pr. Titular Ubiracy Lucas Barbosa",
  "pastorRole": "Pastor Titular da Comunidade",
  "pastorSpouse": "Pra. Adriana Lucas",
  "pastorBio": "Servo de Deus dedicado à pregação bíblica e ao acolhimento pastoral.",
  "pastorAuxiliar": {
    "name": "Pr. Raimundo Brindeiro",
    "role": "Pastor Auxiliar",
    "spouse": "Jacilene",
    "bio": "Pastor auxiliar dedicado ao discipulado, visitação e suporte pastoral.",
    "photo": "assets/PR_Raimundo_Brindeiro.png"
  },
  "phone": "(63) 99991-0330",
  "whatsapp": "5563999910330",
  "email": "icem.palmas2009@gmail.com",
  "instagram": "@ice.metropolitana",
  "website": "https://icemetropolitana.com.br/",
  "estruturaOrganizacional": {
    "conselho": ["Nome 1", "Nome 2"],
    "meal": ["Nome 1", "Nome 2"],
    "presbiterio": ["Nome 1", "Nome 2"],
    "diaconal": ["Nome 1", "Nome 2"]
  },
  "ministries": [
    {
      "name": "Adolescentes",
      "leaders": "Pierre e Laila",
      "icon": "diversity_3",
      "desc": "Edificação e comunhão para adolescentes."
    }
  ]
}
```

*Obs: Todos os campos são opcionais. Você só precisa colocar o que quiser personalizar!*

---

## ⚡ Como Atualizar o Aplicativo

Sempre que você:
1. Colocar novas fotos ou criar uma pasta em `dados_igrejas/`
2. Ou alterar dados na planilha `igrejas_iceb.xlsx`

👉 **Basta dar 2 cliques no arquivo `atualizar_dados.bat` na raiz do projeto!**

O script faz tudo sozinho:
- Lê a planilha Excel
- Lê as fotos e pastas de `dados_igrejas/`
- Copia e organiza as fotos automaticamente
- Atualiza os dados no aplicativo web e no projeto Android
