# Tutorial para a disciplina de Programação Web Back-End período 2025-1

## 9 - Persistência

1. Você deve instalar a dependência adequada para o tipo de banco adotado. Neste exemplo iremos utilizar o postgres com a biblioteca 'pg' (versão 8.16.0).

```bash
npm install pg
```

2. Criar pasta 'db' no nível raiz do projeto e nesta pasta criar um arquivo para a conexao com o banco de dados, por exemplo, 'postgres.js' e criar um pool de conexões. Substitua os valores de acordo com os dados de conexão do seu banco de dados.

```javascript
const { Pool } = require('pg');

dotenv.config();

const pool = new Pool({
    host: localhost,
    port: 5432,
    user: postgres,
    password: postgres,
    database: postgres
});

module.exports = pool
```

3. Perceba, porém, que dessa maneira os dados de conexão, incluindo a senha ficam acessíveis. Para evitar isso iremos utilizar o pacote 'dotenv' (versão 16.5.0) para gerenciar as variáveis de ambiente.

```bash
npm install dotenv
```

Criar o arquivo '.env' no nível raiz do projeto. Se estiver utilizando repositório git, não esqueça de adicioná-lo no '.gitignore'.
Nesse arquivo você pode declarar as variáveis de ambiente que ficarão disponíveis através do 'process.env' separando configuração do código.
Obs.: Novamente, lembrar de alterar os valores para a sua conexão com o banco de dados.

```dotenv
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=postgres
```

Atualizar o arquivo de conexão com o banco para o usar as variáveis de ambiente.

```javascript
const dotenv = require("dotenv"); // importar as variáveis de ambiente
const { Pool } = require('pg');

dotenv.config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

module.exports = pool
```

4. Adaptando o modelo para persistência.

No arquivo 'operacao.js' importar a utilização do pool de conexões do módulo de persistência.

```javascript
const pool = require('../db/postgres');
```

No método 'create', agora, devemos fazer a criação da tupla no banco a partir do modelo retornando o id da operação.
```javascript
Operacao.prototype.create = function () {
	const query_text = 'INSERT INTO operacoes (data, ativo, tipo_de_operacao, quantidade, preco, valor_bruto, taxa_b3, valor_liquido) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id;'
	const query_params = [this.data.data, this.data.ativo, this.data.tipoDeOperacao, this.data.quantidade, this.data.preco, this.data.valorBruto, this.data.taxaB3, this.data.valorLiquido]
	
	result = pool.query(query_text, query_params)
	const idDaOperacaoSalva = result.rows[0].id;
	return idDaOperacaoSalva;
}
```

Porém, devemos lembrar os métodos javascript são assíncronos. E, portanto, devemos esperar a execução da consulta antes de poder retornar o resultado. Assim como o método do controlador também deverá aguardar o recebimento do resultado para poder continuar.
Isso pode ser resolvido de duas maneiras: (i) utilizando as palavras reservadas 'async' para indicar que uma função é assíncrona e 'await' para indicar a espera do retorno de uma função assíncrona; (ii) para obter mais controle sobre tratamento dos dados em caso de sucesso ou erro podemos utilizar callbacks e Promises.

Utilizando a segunda maneira (ii) vamos ficar com a execução da consulta como a seguir.

```javascript
Operacao.prototype.create = function () {
	const query_text = 'INSERT INTO operacoes (data, ativo, tipo_de_operacao, quantidade, preco, valor_bruto, taxa_b3, valor_liquido) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id;'
	const query_params = [this.data.data, this.data.ativo, this.data.tipoDeOperacao, this.data.quantidade, this.data.preco, this.data.valorBruto, this.data.taxaB3, this.data.valorLiquido]
	return new Promise((resolve, reject) => {
		pool.query(query_text, query_params, (error, result) => {
			if (error) {
				reject('Erro ao inserir operação: ' + error);
			} else {
				const idDaOperacaoSalva = result.rows[0].id;
				resolve(idDaOperacaoSalva);
			}
		});
	})
}
```

Obs.: perceba a adição de uma função de callback (error, result) na execução da consulta. Funções callbacks são úteis para lidar com o assincronismo, sendo executada somente após a função para a qual ela foi passada terminar sua execução -- neste caso a função query.
A Promise em volta evita o aninhamento de callbacks.

5. Ajuste no controlador.
   
Agora, no controlador ('operacao-controller.js'), ao salvar uma operação, devemos realizar a chamada e fazer o devido tratamento do retorno da Promise: resolve em caso de sucesso e reject em caso de falha. Utiliza-se o 'then' para tratar o retorno vindo do caso de sucesso (resolve) de uma Promise e o 'catch' para tratar o retorno vindo do caso de falha (reject) da Promise -- além do 'finally'.

```javascript
exports.save = function (req, res) {
    /* Criar uma nova instância da classe Operacao com os dados recebidos do corpo da requisição */
    const operacao = new Operacao(req.body)
    /* Validar e realizar as conversoes necessarias nos dados da classe */
    operacao.validate()
    if (operacao.errors.length > 0) {
        return res.send(operacao.errors)
    } else {
        operacao.create()
            .then((result) => {
                res.send('Operação salva com sucesso com o id: ' + result)
            })
            .catch((error) => {
                res.status(500).send(error)
            })
    }
}
```

6. Pequenos ajustes.

i. Como já estamos utilizando banco de dados, podemos apagar a lista de operações utilizada como base temporária até aqui.

ii. Ainda não temos um método para recuperar as operações salvas no banco. Então, na função do roteador de exibir as operações ('/operacoes') passar uma lista vazia.

```javascript
router.get('/operacoes', function (req, res) {
  res.render('pages/operacoes',
    {
      title: 'Operações',
      paginaAtiva: 'operacao',
      operacoes: [] // Passa a lista de operações para a view
    }
  );
})
```

### 9.1 Exercício

Criar no modelo o método 'readAll' que recupera todas as operações do banco de dados. Em seguida criar o controlador para essa ação, para que em caso de sucesso da consulta, renderizar o template de listagem de operações.

Obs.: no modelo, após execução da consulta, converter o resultado para objetos do modelo e retornar uma lista dos mesmos. Ficar atento aos tipos retornados pela consulta, realizando as conversões apropriadas.
