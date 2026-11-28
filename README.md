# Mockup Viewer

**Mockup Viewer** é uma ferramenta web para visualização e exportação de mockups 3D personalizados diretamente no navegador. Desenvolvido inicialmente como parte de um sistema de vendas, este visualizador funciona de forma independente e gratuita, com suporte a modelos como **blister**, **caneca**, **quadro em canvas** e **caixa de embalagem**.

---

## Funcionalidades

- Visualização 3D de **mockups de blister, caneca, quadro em canvas e caixa de embalagem**
- **Biblioteca de modelos** com miniaturas, aberta pelo nome do modelo atual, além das setas para passar de um em um
- Upload de **imagem personalizada** (PNG, JPG ou WebP) pelo botão ou arrastando o arquivo para a cena
- **Exportação da cena atual** como imagem PNG (em celulares abre o compartilhamento nativo)
- **Controle de rotação** automática e velocidade
- **Vistas da câmera** pelo botão Vista: Inicial (três quartos), Frente, Esquerda, Direita e Cima, com troca animada que mantém o zoom. No desktop, também pelas teclas 1 a 5 e por duplo clique no palco para a Inicial
- Escolha de **cor de fundo sólida** ou ambiente HDRI (cidade, estúdio, etc.), com desfoque opcional do fundo
- **Controles de luz**: intensidade e rotação do cenário, exposição, luz principal e sombra de contato sob o modelo (com opacidade, suavidade, alcance e tamanho), com botão para restaurar o padrão. Tudo sai igual na imagem exportada
- **Predefinições de cena**: fundo, luz e giro salvos com um nome no topo do painel de ajustes, para aplicar de novo em qualquer modelo e arte
- **Arquivo de cena** (.json): modelo, ajustes e, se quiser, a arte embutida, para abrir depois ou em outro aparelho. As predefinições também saem num arquivo à parte. Abre pelo botão na seção Arquivo do painel ou soltando o arquivo no palco
- **A cena volta como estava** ao recarregar a página: ajustes, modelo escolhido e a última arte enviada ficam salvos no navegador até a arte ser redefinida
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

- `src/components/`: componentes da interface (header, viewer, seletor de modelo, menu das vistas, biblioteca de modelos, painel de ajustes com as predefinições de cena, seletor de tema, aviso de falha da cena)
- `src/components/ui/`: componentes reutilizáveis (botões, dicas, avisos, controles deslizantes, chips, régua de carregamento e o painel lateral em `<dialog>` usado pelos ajustes e pela biblioteca)
- `src/components/brand/`: slot do logo
- `src/components/scene/`: cena 3D, textura da arte, progresso de carregamento e câmera (controles de órbita e troca de vista em `CameraRig.tsx`, posição de cada vista em `cameraOrbit.ts`)
- `src/components/scene/models/`: modelos 3D (Blister, Caneca, Quadro, Caixa), nome, ordem, giro da frente e miniatura em `catalog.ts` e carregamento sob demanda em `index.ts`
- `src/config/`: marca (`brand.ts`), tema, opções iniciais da cena, padrões e limites da luz e lista de cenários HDRI (`scene.ts`), vistas da câmera e as teclas delas (`cameraViews.ts`) e as media queries que o React precisa conhecer: celular deitado, tela estreita e mouse (`layout.ts`)
- `src/hooks/`: hooks da aplicação
- `src/lib/`: funções sem React (processamento da arte, exportação, tema e o que fica salvo no navegador: estado da cena e predefinições em `sceneStorage.ts`, última arte em `artworkStore.ts`; arquivos de cena e de predefinições em `sceneFile.ts`)
- `src/index.css`: tokens de cor, raio, sombra e tipografia, utilitários de safe area (`px-safe-*`, `pb-safe-*`, `pt-safe`) e a variante `landscape-short:` para celular deitado (a mesma query fica em `config/layout.ts`; mantenha as duas iguais)
- `vite/`: plugin que preenche o `index.html` com os dados da marca
- `scripts/models/`: geradores de modelos por código, que montam a geometria com o three e exportam o `.glb` para `public/`, e as medidas da faca da caixa (`packagingBoxDie.mjs`)
- `scripts/thumbnails.mjs`: gerador das miniaturas da biblioteca, que abre o app no Chromium do Playwright e captura cada modelo
- `scripts/boxArtwork.mjs`: gerador da arte padrão da caixa, a faca inteira de um produto de exemplo desenhada em SVG
- `scripts/browser.mjs`: Chromium do Playwright e conversão para webp, usados pelos dois geradores de imagem
- `public/`: assets estáticos e modelos `.glb`
- `public/hdri/`: cenários HDRI (`.hdr` em 1k)
- `public/thumbnails/`: miniaturas dos modelos (`<id>.webp`, 320px), geradas por `npm run thumbnails`

Para adicionar um modelo, crie o componente em `src/components/scene/models/`, inclua o nome em `catalog.ts` e o carregamento em `index.ts`. O TypeScript acusa se um dos dois ficar faltando. A malha que recebe a arte deve se chamar `Arte`, e o modelo deve ficar em volta da origem com a base abaixo dela. No catálogo, `frontTurn` é o giro em y (em graus) que leva a frente do modelo, o lado em que a arte fica reta, para +z; `initialAngle` muda o ângulo da vista Inicial quando os três quartos padrão (35°) não servem. Depois rode `npm run thumbnails` para gerar a miniatura dele.

A arte padrão da caixa (`public/caixa-exemplo.webp`) é a faca planificada inteira de um chá fictício, na proporção exata da faca, para a caixa abrir com as seis faces impressas. Ela é desenhada em SVG sobre as mesmas medidas do modelo (`scripts/models/packagingBoxDie.mjs`) e convertida para webp no Chromium por `npm run artwork`. Uma arte enviada na mesma proporção também cobre a caixa inteira; qualquer outra vai só na frente.

O quadro e a caixa não vêm de um programa 3D: eles são gerados por `scripts/models/canvasPrint.mjs` e `scripts/models/packagingBox.mjs` (`npm run models`), que montam a geometria com o three, calculam o UV da arte e exportam `public/quadro.glb` e `public/caixa.glb` com o `GLTFExporter`. Para mudar medidas ou materiais, edite o script e rode o comando de novo. Os `.glb` gerados ficam versionados.

As miniaturas da biblioteca são imagens, e não cenas 3D, para a biblioteca não puxar o three para o pacote inicial. `npm run thumbnails` sobe o app com o servidor do Vite, passa por cada modelo do catálogo na vista Inicial dele no desktop, sobre fundo cinza claro e com a arte padrão, e grava um webp por modelo. Ele usa o `playwright-core` e o Chromium instalado pelo Playwright (`npx playwright-core install --only-shell chromium`) ou o caminho em `CHROMIUM_PATH`. O WebGL roda por software, então leva uns 30 segundos. As miniaturas ficam versionadas: gere de novo quando mudar um modelo, a arte padrão ou a luz.

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
- `npm run models`: gera de novo os modelos feitos por código em `public/`
- `npm run artwork`: gera de novo a arte padrão da caixa em `public/caixa-exemplo.webp`
- `npm run thumbnails`: gera de novo as miniaturas da biblioteca em `public/thumbnails/`

---

## Observações

- O projeto é **100% client-side**, sem backend. O que fica salvo (tema, ajustes da cena, modelo, predefinições e a última arte) fica só no navegador: os textos no `localStorage` e a arte no IndexedDB, que guarda o arquivo como ele é. Um valor salvo inválido ou de outra versão volta ao padrão, campo a campo. Fora de um app instalado na tela de início, o Safari apaga esses dados de sites que ficam 7 dias sem ser abertos.
- O arquivo de cena usa o mesmo envelope do que fica salvo no navegador, com o tipo do conteúdo:

  ```json
  {
    "type": "mockup-viewer/scene",
    "version": 1,
    "data": {
      "model": "packagingBox",
      "settings": { "backgroundMode": "preset", "environment": "studio", "shadowOpacity": 0.5, "...": "..." },
      "artwork": { "mediaType": "image/png", "base64": "iVBORw0KGgo..." }
    }
  }
  ```

  Sem `artwork`, a arte não foi incluída e a que está na tela continua; com `artwork: null`, a cena usa a arte de exemplo do modelo. O arquivo de predefinições tem `"type": "mockup-viewer/presets"` e a lista em `data`; ao abrir, uma predefinição com o mesmo nome de outra é substituída. Um arquivo de outro tipo ou de outra versão é recusado com um aviso, sem mexer na cena; dentro de um arquivo aceito, o campo inválido volta ao padrão e um modelo desconhecido deixa o atual. Campos novos (como o posicionamento da arte) entram sem mudar a versão, porque a leitura é campo a campo. A arte embutida ocupa um terço a mais que a imagem (o tamanho aparece antes de exportar) e passa pelas mesmas checagens de um envio; o arquivo pode ter até 32MB. Solte um arquivo por vez no palco: uma imagem e uma cena juntas não mudam nada.
- Imagens enviadas são aceitas com até **25MB** e redimensionadas para no máximo 2048px no navegador.
- A exportação gera a imagem **com base na visualização atual** da cena 3D.
- Os cenários HDRI são servidos pelo próprio app, de `public/hdri/`, e só baixam quando escolhidos. São os mesmos dos presets do drei, da [Poly Haven](https://polyhaven.com/) (CC0). Para incluir outro, coloque o `.hdr` na pasta e adicione o nome em `ENVIRONMENT_PRESETS`.
- A cena 3D (three, R3F e drei) e cada modelo ficam em chunks separados, baixados depois que a interface aparece. O pacote inicial tem cerca de 87KB com gzip. Depois que a primeira cena fica pronta, os outros modelos são baixados em segundo plano.
- Ao trocar de modelo, cenário ou arte, a cena anterior continua na tela até a nova carregar, com o progresso num canto do palco.
- Com o celular deitado (paisagem com até 500px de altura), o seletor de modelo e o botão Vista sobem para a barra do cabeçalho e as ações viram um trilho vertical à direita, para o palco ganhar altura. Eles mudam de lugar no DOM, e não só na tela, para a ordem do Tab seguir a ordem visual.
- Os modelos ficam parados, com a frente em +z: quem dá a volta é a câmera. As vistas são posições na órbita em volta do centro, e a troca anda pela órbita (e não em linha reta, que passaria por dentro do modelo). Escolher uma vista desliga o giro automático; arrastar ou dar zoom no meio da troca a interrompe; com movimento reduzido no sistema, a câmera vai direto. Não há vista de baixo: a câmera não desce do chão. Na caneca, a frente é o centro da arte, do lado oposto à alça, onde fica uma arte centrada; a vista Inicial dela gira mais (70°) para a alça aparecer à direita.
- A cena só é redesenhada quando algo muda (arrastar, giro automático, troca de modelo, cenário, arte ou ajuste). Parada, ela não gasta GPU nem bateria. Código que altera o renderer ou a cena fora dos componentes do R3F precisa chamar `invalidate()`.
- No quadro, a arte cobre a frente e dobra nas quatro bordas, como na impressão em tela esticada: a imagem inteira equivale à frente mais uma faixa de 3cm em volta. Se a proporção da imagem for diferente, ela é recortada no centro em vez de esticada, e o que for transparente no PNG sai branco, como a tela. A vista Frente mostra a arte reta.
- A caixa é um cartucho de 9 x 4 x 14cm com fechamento reverso, e o UV dela segue a faca planificada de 275 x 250mm, vista do lado impresso. Na faixa do meio, da esquerda para a direita: aba de cola (15mm), lateral, frente, lateral e verso. A tampa sai de cima do verso e o fundo de baixo da frente, cada um com uma lingueta de 15mm. Uma arte nessa proporção (com até 4% de diferença, para caber a sangria) cobre a caixa inteira. Qualquer outra imagem vai só na frente, recortada no centro sem distorcer, e o resto da caixa fica branco.
- Os painéis de ajustes e da biblioteca não bloqueiam o palco no desktop e com o celular deitado: dá para girar o modelo e trocar a vista com eles abertos, e clicar fora não fecha. O Esc fecha (também depois de um clique no palco) e o foco volta ao botão que abriu o painel. No desktop o painel acompanha a altura do palco, para a linha de cima e a barra de ações continuarem à mão. No celular em pé, a folha inferior é modal e fecha com um toque fora. Um painel aberto fecha o outro.
- A biblioteca de modelos fica no mesmo painel lateral dos ajustes e não escurece a cena: escolher um modelo troca o mockup na hora e o painel continua aberto. No celular em pé ela é uma folha baixa com uma fileira que rola para o lado, para o palco continuar à vista; deitado, uma coluna sobre o trilho. Os cartões são rádios nativos: o Tab entra no modelo atual, as setas trocam e o Esc fecha.
- A sombra de contato é desenhada uma vez e de novo só quando o modelo ou um ajuste dela muda, e acompanha a base pelo tamanho medido na cena. O alcance e o tamanho são proporções do modelo, para a mesma predefinição servir em todos. Ela fica centrada no eixo da cena, então novos modelos devem ficar em volta da origem com a base abaixo dela (o alcance não desce de 50%, a distância da base até a origem nos modelos atuais, porque o desfoque precisa enxergar a origem).

---

## Próximos passos

- Integração com sistema de vendas (mockups vinculados a produtos)
- Link compartilhável da cena
- Sombra deslocada, como a de uma luz direcional
- Mais modelos gerados por código, como garrafa
- Galeria de cenas geradas
- Geração automática de mp4
- Controle de dimensões da cena exportada

---

## Licença

Este projeto está licenciado sob a Creative Commons Atribuição-NãoComercial 4.0 Internacional (CC BY-NC 4.0).
