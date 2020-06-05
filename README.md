# webstock-api
Sistema de gestão de estoque

1. Após clonar, será necessário realizar a conexão a um banco de dados mysql
2. Rode o comando "npm install" ou "yarn install" para baixar e linkar as dependências
3. Crie as variaveis de ambiente no seu sistema ou insira elas em um arquivo .env na raiz do projeto
4. Após isso execute o comando "npm run sequelize db:migrate" ou "yarn sequelize db:migrate"
5. As tabelas serão configuradas no seu banco de dados

VARIAVEIS AMBIENTE

### URL DA BASE DE DADOS
DATABASE_URL=mysql://root:senha@host/database

### CHAVE DE ENCRIPTAÇÃO DAS SENHAS
SECRET=1234

### CHAVE DO SENDGRID PARA ENVIO DE EMAIL
SENDGRID=KEY

### CHAVE DE INTEGRAÇÃO COM O PAGARME
PAGARME_KEY=KEY
