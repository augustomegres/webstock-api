# Webstock-api

Sistema de gestão de estoque

- As configurações abaixo estão otimizadas para deploy na Google APP engine

### Crie um arquivo .env na reaiz do projeto

### [START .env]

```yaml
runtime: nodejs10

env_variables:
  DB_HOST: DB_HOST
  DB_PATH: DB_PATH
  DB_USER: user
  DB_PASS: pass
  DB_DATABASE: webstock
  DB_URL: mysql://user:pass@hostname/webstock
  SECRET: 1234
  SENDGRID: KEY
  PAGARME_KEY: KEY
```

### [END .env]
