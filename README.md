# Webstock-api

Sistema de gestão de estoque

- As configurações abaixo estão otimizadas para deploy na Google APP engine

### Crie um arquivo app.yaml na raiz do projeto

### [START app.yaml]

```yaml
runtime: nodejs10

env_variables:
  DB_HOST: /cloudsql/socketPath
  DB_PATH: /cloudsql/socketPath
  DB_USER: user
  DB_PASS: pass
  DB_DATABASE: webstock
  DATABASE_URL: mysql://user:pass@hostip/webstock
  SECRET: 1234
  SENDGRID: KEY
  PAGARME_KEY: KEY
```

### [END app.yaml]