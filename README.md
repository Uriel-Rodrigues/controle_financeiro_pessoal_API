## como rodar o projeto baixado
Duplicar o arquivo ".env.exemple" e renomear para ".env" <br>
alterar no arquivo .env as credencias do banco de dados<br>
alterar no arquivo .env a chave JWT_SECRET para que o projeto tenha uma chave unica<br>
alterar no arquivo env as credenciais do servidor responsavek em enviar o email <br>
 
1 instalar todas as dependencias 
´´´
npm install
´´´
2- Compilar o arquivo TypeScript.
```
npx tsc
```
3- Excutar o arquivo gerado com node.js.
```
node dist/index.js
```
4- instalar a dependência para rodar processos simultaneamente
```
npm install --save-dev concurrently
``` 

5- compilar o arquivo TypeScript. Excutar o arquivo gerado.
```
npm run start:watch
```
Executar as migration para criar as tabelas no banco de dados.
```
npx typeorm migration:run -d dist/data-source.js
```
executar as seeds para cadastrar registros de teste nas tabelas no banco de dados
```
node dist/run-seeds.js
```

## sequencia para criar o projeto 
*1-  Criar um novo arquivo packaje.json*
```
npm init
```
*2- instalar o Express para gerenciar as requisições, rotas e URLs, entre outras funcionalidades*
```
npm instal express
```
*3- Instalar os pacotes para suporte ao TypeScript*
```
npm install --save-dev @types/express
npm install --save-dev @types/node
```
*4- Inastalar o compilador de projeto com typescript e reiniciar o projeto quando o arquivo é modificado*
```
npm install --save-dev ts-node
```
*5- grar o arquivo de configuração do typeScript (tsconfig.json)*
-cofigurações adicionadas
    "outDir": "./dist", //diretorio de destino para os arquivos compilados
    "rootDir": "./src", //diretorio onde esta todo o codigo base do projeto
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules"]
```
npx tsc --init
```
*compilar o arquivo typescript*
```
npx tsc
```
executar o arquivo compilado
```
node dist/index.js
```
*6 - instalar a dependencia para rodar processos simuntaneos*
```
npm install --save-dev concurrently
```
*7 - compilar o arquivo TypeScript e executar o arquivo gerado*
adicionar confgurações no package.json em scripts
    "build": "tsc",
    "start": "node dist/index.js",
    "watch": "tsc --watch",
    "start:watch": "concurrently \"npm run watch\" \"node --watch dist/
```
npm run start:watch
```
*8 - instalar a dependencia para conectar o Node.js (TypeScript) com o banco de dados*
```
npm install typeorm
```
*9 - biblioteca utilizada no typScript para adicionar metadados (informações adicionais) a classes - documentação typeorm*
```
npm install reflect-metadata
```
*10 - instalar o drive do mysql - documentação typeorm*
```
npm install mysql2 --save
```
*11 - Manipular variaveis de ambiente*
```
npm install dotenv --save
```
*12 - Manipular variaveis de ambiente*
```
npm install dotenv --save
```
*13 - instalar os tipos do TypeScript*
criar aquivo .env na rais do projeto
```
npm install --save-dev @types/dotenv
```
*14 - Criar a migrations que será usada para criar a tebale no banco de dados* 
```
npx typeorm migration:create src/migration/<nome-da-migration>
```
```
npx typeorm migration:create src/migration/CreateSituationsTable
```
*15 - Executar as migration para criar as tabelas no banco de dados*
```
npx typeorm migration:run -d dist/data-source.js
```