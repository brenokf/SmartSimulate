<div align="center">
  <h1>🚀 SmartSimulate</h1>
  <p><strong>Simulações inteligentes com IA, prontas para desenvolvimento local e deploy rápido.</strong></p>

</div>

---

## 📌 Visão geral

O **SmartSimulate** é uma aplicação front-end integrada com IA para execução de simulações, análises e interações inteligentes com foco em produtividade e experiência moderna de uso.

Este repositório contém tudo o que você precisa para:

- rodar o app localmente;
- configurar o acesso à API Gemini;
- evoluir o projeto com fluxo de branch e CI.

---

## ✨ Principais recursos

- Interface orientada a simulação com IA
- Integração com **Gemini API**
- Execução local rápida para desenvolvimento
- Estrutura pronta para colaboração em equipe
- Base preparada para automações com GitHub Actions

---

## 🧱 Pré-requisitos

Antes de iniciar, garanta que você tenha instalado:

- **Node.js** (recomendado: versão LTS)
- **npm** (normalmente já vem com Node.js)

---

## ⚙️ Configuração local

### 1) Instale as dependências

```bash
npm install
```

### 2) Configure as variáveis de ambiente

Crie (ou edite) o arquivo `.env.local` na raiz do projeto e adicione:

```env
GEMINI_API_KEY=sua_chave_aqui
```

> 🔐 Nunca commite chaves reais em repositórios públicos.

### 3) Rode o projeto

```bash
npm run dev
```

---

## 🧪 Scripts úteis

| Script          | Descrição                                 |
|----------------|--------------------------------------------|
| `npm run dev`  | Inicia o ambiente de desenvolvimento local |

> Adicione aqui outros scripts do projeto conforme evolução (`build`, `test`, `lint`, etc.).

---

## 🌿 Estratégia de branch (sugestão)

Padrão recomendado de nome para branches de correção:

```bash
bugfix/glpi-1234-demo
```

Fluxo sugerido:

1. Crie sua branch a partir da `main`
2. Faça commits pequenos e objetivos
3. Abra Pull Request com contexto claro da mudança

---

## 🤖 CI/CD (GitHub Actions)

Este projeto pode ser integrado com pipelines para:

- validação de PR
- execução de testes
- build automatizado
- deploy

> Se desejar, inclua um badge de status da Action aqui no topo do README.

---

## 🛠️ Troubleshooting rápido

### Erro de chave de API
- Verifique se `GEMINI_API_KEY` está definida corretamente no `.env.local`
- Reinicie o servidor (`npm run dev`) após alterar variáveis de ambiente

### Dependências com problema
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 🗺️ Roadmap (exemplo)

- [ ] Melhorar UX dos fluxos de simulação
- [ ] Adicionar testes automatizados
- [ ] Incluir observabilidade (logs e métricas)
- [ ] Pipeline de deploy contínuo

---

## 🤝 Contribuição

Contribuições são bem-vindas.

1. Faça um fork
2. Crie uma branch (`feature/nome-da-feature` ou `bugfix/codigo-ticket`)
3. Commit suas alterações
4. Abra um Pull Request

---

<div align="center">
  Feito com foco em qualidade, colaboração e evolução contínua. 💙
</div>