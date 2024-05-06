import inquirer from "inquirer";
import chalk from "chalk";
import fs from "fs";
import { error } from "console";
import { parse } from "path";

operacaoSelecionada();

function operacaoSelecionada() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "O que você deseja fazer?",
        choices: [
          "Criar conta",
          "Consultar Saldo",
          "Depositar",
          "Sacar",
          "Sair",
        ],
      },
    ])
    .then((answer) => {
      const action = answer["action"];
      if (action === "Criar conta") {
        mensagemCriarConta();
      } else if (action === "Depositar") {
        depositar();
      } else if (action === "Consultar Saldo") {
        consultarSaldo();
      } else if (action === "Sacar") {
        sacar();
      } else if (action === "Sair") {
        console.log(chalk.bgBlue.black("Obrigado por usar o Accounts!"));
        process.exit();
      }
    })
    .catch((err) => console.log(err));
}

function mensagemCriarConta() {
  console.log(
    chalk.bgGreen.black("Parabéns por escolher nossa instituição financeira!")
  );
  console.log(chalk.green("Defina as opções da sua conta a seguir!"));
  criarConta();
}

function criarConta() {
  inquirer
    .prompt([
      {
        name: "contaNome",
        message: "Digite um nome para sua conta:",
      },
    ])
    .then((answer) => {
      const contaNome = answer["contaNome"];
      if (!fs.existsSync(`accounts`)) {
        fs.mkdirSync("accounts");
      }

      if (fs.existsSync(`accounts/${contaNome}.json`)) {
        console.log(
          chalk.bgRed.black("Esta conta já existe, escolha outro nome!")
        );
        criarConta();
        return;
      }

      fs.writeFileSync(
        `accounts/${contaNome}.json`,
        '{"saldo": 0}',
        function (err) {
          console.log(err);
        }
      );

      console.log(chalk.green("Parabéns, a sua conta foi criada!"));
      operacaoSelecionada();
    })
    .catch((err) => console.log(err));
}

// Adicionar valor na conta do usuário

function depositar() {
  inquirer
    .prompt([
      {
        name: "contaNome",
        message: "Qual o nome da sua conta?",
      },
    ])
    .then((answer) => {
      const contaNome = answer["contaNome"];

      // Verificar se a conta existe
      if (!checarConta(contaNome)) {
        return depositar();
      }

      inquirer
        .prompt([
          {
            name: "valor",
            message: "Quanto você deseja depositar?",
          },
        ])
        .then((answer) => {
          const saldo = answer["valor"];
          adicionarSaldo(contaNome, saldo);
          operacaoSelecionada();
        });
    })
    .catch((err) => console.log(err));
}

function checarConta(contaNome) {
  if (!fs.existsSync(`accounts/${contaNome}.json`)) {
    console.log(
      chalk.bgRed.black("Essa conta não existe, escolha outro nome!")
    );
    return false;
  }

  return true;
}

function adicionarSaldo(nomeConta, valor) {
  const conta = getConta(nomeConta);
  if (!valor) {
    console.log(
      chalk.bgRed.black("Ocorreu um erro, tente novamente mais tarde!")
    );
    return depositar();
  }

  conta.saldo = parseFloat(valor) + parseFloat(conta.saldo);

  fs.writeFileSync(
    `accounts/${nomeConta}.json`,
    JSON.stringify(conta),
    function (err) {
      console.log(err);
    }
  );

  console.log(
    chalk.green(`Foi despositado um valor de R$ ${valor} na sua conta!`)
  );
}

function getConta(nomeConta) {
  const contaJSON = fs.readFileSync(`accounts/${nomeConta}.json`, {
    encoding: "utf-8",
    flag: "r",
  });

  return JSON.parse(contaJSON);
}

// Mostrar saldo da conta do usuário

function consultarSaldo() {
  inquirer
    .prompt([
      {
        name: "contaNome",
        message: "Qual o nome da sua conta?",
      },
    ])
    .then((answer) => {
      const contaNome = answer["contaNome"];

      if (!checarConta(contaNome)) {
        return consultarSaldo();
      }

      const conta = getConta(contaNome);

      console.log(chalk.bgBlue.black(`Seu saldo é: R$ ${conta.saldo}`));

      operacaoSelecionada();
    })
    .catch((err) => console.log(err));
}

// Tirar dinheiro da conta do usuário

function sacar() {
  inquirer
    .prompt([
      {
        name: "contaNome",
        message: "Qual o nome da sua conta?",
      },
    ])
    .then((answer) => {
      const contaNome = answer["contaNome"];

      // Verificar se a conta existe
      if (!checarConta(contaNome)) {
        return sacar();
      }

      inquirer
        .prompt([
          {
            name: "valor",
            message: "Quanto você deseja sacar?",
          },
        ])
        .then((answer) => {
          const saldo = answer["valor"];
          removerSaldo(contaNome, saldo);
        });
    })
    .catch((err) => console.log(err));
}

function removerSaldo(nomeConta, valor) {
  const conta = getConta(nomeConta);
  if (!valor) {
    console.log(
      chalk.bgRed.black("Ocorreu um erro, tente novamente mais tarde!")
    );
    return sacar();
  }

  if (conta.saldo < valor) {
    console.log(chalk.bgRed.black("Valor indisponível"));
    return sacar();
  }

  conta.saldo = parseFloat(conta.saldo) - parseFloat(valor);

  fs.writeFileSync(
    `accounts/${nomeConta}.json`,
    JSON.stringify(conta),
    function (err) {
      console.log(err);
    }
  );

  console.log(
    chalk.green(`Você retirou um valor de R$ ${valor} da sua conta!`)
  );

  operacaoSelecionada();
}
