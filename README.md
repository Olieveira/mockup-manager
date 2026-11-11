# Mockup Viewer

**Mockup Viewer** é uma ferramenta web para visualização e exportação de mockups 3D personalizados diretamente no navegador. Desenvolvido inicialmente como parte de um sistema de vendas, este visualizador funciona de forma independente e gratuita, com suporte a modelos como **blister** e **caneca**.

---

## Funcionalidades

- Visualização 3D de **mockups de blister e caneca**
- Upload de **imagem personalizada** (PNG, JPG ou WebP) pelo botão ou arrastando o arquivo para a cena
- **Exportação da cena atual** como imagem PNG (em celulares abre o compartilhamento nativo)
- **Controle de rotação** automática e velocidade
- Escolha de **cor de fundo sólida** ou ambiente HDRI (cidade, estúdio, etc.)
- Interface adaptável e responsiva
- Dicas explicativas para cada botão da interface

---

## Tecnologias Utilizadas

- [React 19](https://react.dev/)
- [Three.js](https://threejs.org/) via [@react-three/fiber](https://r3f.docs.pmnd.rs/)
- [@react-three/drei](https://drei.docs.pmnd.rs/)
- [TailwindCSS 4](https://tailwindcss.com/)
- [Motion](https://motion.dev/)
- [Vite 8](https://vite.dev/) e [TypeScript](https://www.typescriptlang.org/)

---

## Estrutura do Projeto

- `src/components/`: componentes da interface (viewer, modal de preferências)
- `src/components/ui/`: componentes reutilizáveis (botões, dicas, avisos)
- `src/components/scene/`: cena 3D e configuração da textura
- `src/components/scene/models/`: modelos 3D (Blister, Caneca) e o registro em `index.ts`
- `src/config/`: opções e valores iniciais da cena
- `src/hooks/`: hooks da aplicação
- `src/lib/`: funções sem React (processamento da arte, exportação)
- `public/`: assets estáticos e modelos `.glb`

Para adicionar um modelo, crie o componente em `src/components/scene/models/` e registre em `index.ts`.

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
- Os ambientes HDRI são carregados sob demanda a partir do CDN usado pelo drei.

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
