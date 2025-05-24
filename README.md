# Mockup Viewer

**Mockup Viewer** é uma ferramenta web para visualização e exportação de mockups 3D personalizados diretamente no navegador. Desenvolvido inicialmente como parte de um sistema de vendas, este visualizador funciona de forma independente e gratuita, com suporte a modelos como **blister** e **caneca**.

---

## 🚀 Funcionalidades da versão 1.0.0

- ✅ Visualização 3D de **mockups de blister e caneca**
- ✅ Upload de **imagem personalizada** para aplicar como textura
- ✅ **Exportação da cena atual** como imagem PNG
- ✅ **Controle de rotação** automática e velocidade
- ✅ Escolha de **cor de fundo sólida** ou ambiente HDRI (cidade, estúdio, etc.)
- ✅ Interface adaptável e responsiva
- ✅ Popovers explicativos para cada botão da interface

---

## 🛠️ Tecnologias Utilizadas

- [React](https://react.dev/)
- [Three.js](https://threejs.org/) via [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction)
- [@react-three/drei](https://docs.pmnd.rs/drei/introduction)
- [TailwindCSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Vite](https://vitejs.dev/)

---

## 📁 Estrutura do Projeto

- `src/components/` — Componentes principais da aplicação
- `src/components/modelos/` — Modelos 3D reutilizáveis (Blister, Caneca)
- `public/` — Assets estáticos e modelos `.glb`

---

## 💻 Como rodar localmente

1. Clone o repositório:

   ```bash
   git clone https://github.com/seu-usuario/mockup-viewer.git
   cd mockup-viewer
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

---

## ℹ️ Observações

- O projeto é **100% client-side**, sem backend ou persistência de dados.
- Limitado o uso de imagens com até **5MB** para melhor performance.
- A exportação gera a imagem **com base na visualização atual** da cena 3D.

---

## 📌 Próximos passos

- Integração com sistema de vendas (mockups vinculados a produtos)
- Possibilidade de controlar iluminação
- Possibilidade de salvar e carregar predefinições de cenas
- Suporte a outros modelos além de blister e caneca
- Galeria de cenas geradas
- Geração automática de mp4
- Controle de dimensões da cena exportada

---

## 📝 Licença

Este projeto está licenciado sob a Creative Commons Atribuição-NãoComercial 4.0 Internacional (CC BY-NC 4.0).
