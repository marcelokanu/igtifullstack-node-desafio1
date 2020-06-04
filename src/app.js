const express = require("express");
const fs = require("fs");
const { promisify } = require("util");
const path = require("path");

const app = express();

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);


const CidadesEstado = [];

let estados = require(path.resolve(__dirname, 'json', 'estados.json'));
let cidades = require(path.resolve(__dirname, 'json', 'cidades.json'));

async function start() {
  await loadCidadesEstado();
   maisCidades();
   menosCidades();
   maiorMenorCidade();
}


const loadCidadesEstado = async () => {
  await estados.map((estado) => {
    let cidadesDoEstado = cidades.filter(
      (cidade) => estado.ID === cidade.Estado
    );
    cidadesDoEstado = cidadesDoEstado.map((item) => {
      return {nome: item.Nome, tamanhostring: item.Nome.length};
    });
    cidadesDoEstado.sort((a,b) => a.nome.localeCompare(b.nome));
    //5 e 6
    const maiorString = Math.max.apply(Math, cidadesDoEstado.map(item => item.tamanhostring))
    const cidadeMaiorString = cidadesDoEstado.find(cidade => cidade.tamanhostring === maiorString)
    const menorString = Math.min.apply(Math, cidadesDoEstado.map(item => item.tamanhostring))
    const cidadeMenorString = cidadesDoEstado.find(cidade => cidade.tamanhostring === menorString)

    CidadesEstado.push({
      uf: estado.Sigla,
      totalcidades: cidadesDoEstado.length,
      maiorCidade:  [
        cidadeMaiorString,
        maiorString,
      ],
      menorCidade: [
        cidadeMenorString,
        menorString,
      ]
    });
    fs.exists(
      path.resolve(__dirname, "json", "estados", `${estado.Sigla}.json`),
      (data) => {
        if (!data) {
          generateJsonEstados(
            estado.Sigla,
            cidadesDoEstado.length,
            cidadesDoEstado,
          );
        }
      }
    );
  });
};

app.get("/estados", (_, res) => {
  return res.json(estados);
});

app.get("/cidades", (_, res) => {
  return res.json(cidades);
});



app.get("/CidadesEstado", (_, res) => {
  res.json(CidadesEstado);
});

const generateJsonEstados = async (uf, totalcidades, cidades) => {
  try {
    await writeFileAsync(
      path.resolve(__dirname, "json", "estados", `${uf}.json`),
      JSON.stringify({ uf, totalcidades, cidades }),
    );
  } catch (err) {
    console.log(err);
  }
};

//2
const loadUF = async (uf) => {
  if (uf === undefined) {
    return;
  }
  const file = fs.readFileSync(
    path.resolve(__dirname, "json", "estados", `${uf}.json`)
  );
  ufJson = JSON.parse(file);
  return { uf: uf, totalcidades: ufJson.totalcidades };
};

//3
const maisCidades = async () => {
  let maiorQtdeCidades = CidadesEstado.map((item) => {
    return {
      uf: item.uf,
      totalcidades: item.totalcidades,
    };
  });
  maiorQtdeCidades.sort((a, b) =>
    a.totalcidades > b.totalcidades
      ? -1
      : a.totalcidades < b.totalcidades
      ? 1
      : 0
  );

  maiorQtdeCidades = maiorQtdeCidades.slice(0, 5);

  return ["5 MAIS +++ quantidade de cidades", maiorQtdeCidades];
};

//4
const menosCidades = async () => {
  let menorQtdeCidades = CidadesEstado.map((item) => ({
    uf: item.uf,
    totalcidades: item.totalcidades,
  }));
  menorQtdeCidades.sort((a, b) =>
    a.totalcidades < b.totalcidades
      ? -1
      : a.totalcidades > b.totalcidades
      ? 1
      : 0
  );

  menorQtdeCidades = menorQtdeCidades.slice(0, 5);

  return ["5 MENOS --- quantidade de cidades", menorQtdeCidades];
};

//7 e 8
const maiorMenorCidade = async () => {
  const cidadesOrdened = cidades.sort((a, b) => a.Nome.localeCompare(b.Nome));
  const maiorString = Math.max.apply(Math, cidadesOrdened.map(item => item.Nome.length))
  const cidadeMaiorString = cidadesOrdened.find(Nome => Nome.Nome.length === maiorString)
  const menorString = Math.min.apply(Math, cidadesOrdened.map(item => item.Nome.length))
  const cidadeMenorString = cidadesOrdened.find(Nome => Nome.Nome.length === menorString)
  return [
    {maior: maiorString, cidadeMaiorString, 
    menor: menorString, cidadeMenorString}
  ]
}

app.get("/", async (_, res) => {
  const maiorMenor = await maiorMenorCidade();
  const uf = await loadUF("ms");
  const cincoMais = await maisCidades();
  const cincoMenos = await menosCidades();
  res.json({
    maiorMenor,
    cincoMais,
    cincoMenos,
    uf,
  });
});

app.get("/:uf", (req, res) => {
  return res.json(loadUF(req.params.uf));
});

start();

module.exports = app;
