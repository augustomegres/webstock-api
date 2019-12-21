# USUÁRIOS

- ## Criar um novo usuário

Esta requisição é utilizada na parte de registro de usuários.

```json
MÉTODO: POST

URL: http://localhost.com.br/users

CORPO:
{
   "name": "José Augusto",
   "email": "jose@gmail.com",
   "cpf": "123.456.789-00",
   "date_of_birth": "AAAA/MM/DD",
   "phone": "(32) 92000-8962",
   "company": "Lynx Technologies",
   "cnpj": "38.651.605/0001-15",
   "address": "Bairro imê farage",
   "street": "Rua Amazonas",
   "number": "115",
   "city": "Cataguases - MG",
   "password": "123456"
}
```

---

- ## Atualizar um usuário

Esta requisição atualiza um usuário existente. É utilizada na edição de perfil

```json
MÉTODO: PUT

URL: http://localhost.com.br/user/:id

  * id: Id do usuário logado

CORPO (JSON):
  {
    "name": "José Augusto",
    "email": "jose@gmail.com",
    "phone": "(32) 92000-8962",
  }
```

---

- ## Visualizar um usuário

Esta requisição atualiza um usuário existente. É utilizada na edição de perfil

```json
MÉTODO: GET

URL: http://localhost.com.br/users/:id

  * id: Id do usuário logado
```
