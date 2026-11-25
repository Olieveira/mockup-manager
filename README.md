# Mockup Viewer

**Mockup Viewer** é uma ferramenta web para visualização e exportação de mockups 3D personalizados diretamente no navegador. Desenvolvido inicialmente como parte de um sistema de vendas, este visualizador funciona de forma independente e gratuita, com suporte a modelos como **blister** e **caneca**.

---

## Funcionalidades

- Visualização 3D de **mockups de blister e caneca**
- Upload de **imagem personalizada** (PNG, JPG ou WebP) pelo botão ou arrastando o arquivo para a cena
- **Exportação da cena atual** como imagem PNG (em celulares abre o compartilhamento nativo)
- **Controle de rotação** automática e velocidade
- Escolha de **cor de fundo sólida** ou ambiente HDRI (cidade, estúdio, etc.)
- **Tema claro, escuro ou do sistema**, com a escolha salva no navegador
- Interface adaptável e responsiva, navegável pelo teclado

---

## Tecnologias Utilizadas

- [React 19](https://react.dev/)
- [Three.js](https://threejs.org/) via [@react-three/fiber](https://r3f.docs.pmnd.rs/)
- [@react-three/drei](https://drei.docs.pmnd.rs/)
- [TailwindCSS 4](https://tailwindcss.com/) com tokens de design em `@theme`
- [Phosphor Icons](https://phosphoricons.com/) via [react-icons](https://react-icons.github.io/react-icons/)
- [Schibsted Grotesk](https://fontsource.org/fonts/schibsted-grotesk) via Fontsource, servida junto com o app
- [Vite 8](https://vite.dev/) e [TypeScript](https://www.typescriptlang.org/)

---

## Estrutura do Projeto

- `src/components/`: componentes da interface (header, viewer, painel de ajustes, seletor de tema, aviso de falha da cena)
- `src/components/ui/`: componentes reutilizáveis (botões, dicas, avisos, controles, régua de carregamento)
- `src/components/brand/`: slot do logo
- `src/components/scene/`: cena 3D, textura da arte e progresso de carregamento
- `src/components/scene/models/`: modelos 3D (Blister, Caneca), nome e ordem em `catalog.ts` e carregamento sob demanda em `index.ts`
- `src/config/`: marca (`brand.ts`), tema, opções iniciais da cena e lista de cenários HDRI (`scene.ts`)
- `src/hooks/`: hooks da aplicação
- `src/lib/`: funções sem React (processamento da arte, exportação, tema)
- `src/index.css`: tokens de cor, raio, sombra e tipografia, utilitários de safe area (`px-safe-*`, `pb-safe-*`, `pt-safe`) e a variante `landscape-short:` para celular deitado
- `vite/`: plugin que preenche o `index.html` com os dados da marca
- `public/`: assets estáticos e modelos `.glb`
- `public/hdri/`: cenários HDRI (`.hdr` em 1k)

Para adicionar um modelo, crie o componente em `src/components/scene/models/`, inclua o nome em `catalog.ts` e o carregamento em `index.ts`. O TypeScript acusa se um dos dois ficar faltando.

---

## Marca e tema

O nome, a descrição, os ícones e as cores da marca ficam em `src/config/brand.ts`. Esse arquivo alimenta o header, o `<title>`, as meta tags (inclusive `theme-color` e Open Graph) e o favicon. O nome atual é provisório.

- **Nome e textos**: edite `brand.ts`
- **Logo**: substitua o placeholder em `src/components/brand/Logo.tsx`
- **Favicon e imagens**: troque os arquivos em `public/` ou os caminhos em `brand.icons`
- **Cores da marca**: `brand.colors` define, para cada tema, o destaque (botão principal e controles ativos), o texto sobre ele e a cor do header e da barra do navegador

As demais cores são tokens em `src/index.css`. A paleta padrão do Tailwind está desligada, então os componentes só usam tokens (`bg-surface`, `text-ink`, `border-line`...). Os neutros não têm croma de propósito: como numa mesa de prova de gráfica, a interface fica em cinza para não interferir na leitura das cores da arte.

O tema salvo é aplicado por um script inline no `<head>` antes da primeira pintura, evitando o flash de tema errado. No modo do sistema ele acompanha a mudança do sistema operacional em tempo real.

O fundo da cena 3D não acompanha o tema: ele faz parte da imagem exportada, e o mesmo mockup não deve sair diferente dependendo do tema de quem usa.

---

## Como rodar localmente

Requer Node.js 20.19+ ou 22.12+.

1. Clone o repositório:

   ```bash
   git clone https://github.com/Olieveira/mockup-manager.git
   cd mockup-manager
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Rode em modo desenvolvimento:

   ```bash
   npm run dev
   ```

4. Acesse em: [http://localhost:5173](http://localhost:5173)

Outros scripts:

- `npm run build`: checa os tipos e gera a versão de produção
- `npm run preview`: serve a versão de produção localmente
- `npm run lint`: executa o ESLint
- `npm run typecheck`: checa apenas os tipos

---

## Observações

- O projeto é **100% client-side**, sem backend ou persistência de dados.
- Imagens enviadas são aceitas com até **25MB** e redimensionadas para no máximo 2048px no navegador.
- A exportação gera a imagem **com base na visualização atual** da cena 3D.
- Os cenários HDRI são servidos pelo próprio app, de `public/hdri/`, e só baixam quando escolhidos. São os mesmos dos presets do drei, da [Poly Haven](https://polyhaven.com/) (CC0). Para incluir outro, coloque o `.hdr` na pasta e adicione o nome em `ENVIRONMENT_PRESETS`.
- A cena 3D (three, R3F e drei) e cada modelo ficam em chunks separados, baixados depois que a interface aparece. O pacote inicial tem cerca de 80KB com gzip. Depois que a primeira cena fica pronta, os outros modelos são baixados em segundo plano.
- Ao trocar de modelo, cenário ou arte, a cena anterior continua na tela até a nova carregar, com o progresso num canto do palco.
- Com o celular deitado (paisagem com até 500px de altura), o seletor de modelo sobe para a barra do cabeçalho e as ações viram um trilho vertical à direita, para o palco ganhar altura.

---

## Próximos passos

- Integração com sistema de vendas (mockups vinculados a produtos)
- Possibilidade de controlar iluminação
- Possibilidade de salvar e carregar predefinições de cenas
- Suporte a outros modelos além de blister e caneca
- Galeria de cenas geradas
- Geração automática de mp4
- Controle de dimensões da cena exportada

---

## Licença

Este projeto está licenciado sob a Creative Commons Atribuição-NãoComercial 4.0 Internacional (CC BY-NC 4.0).
