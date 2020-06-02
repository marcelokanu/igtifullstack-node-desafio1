const express = require("express");
const fs = require("fs");
const { promisify } = require("util");

const app = express();

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

let estados = [];
let cidades = [];

const CidadesEstado = [];

const loadFiles = async () => {
  const fileStates = await readFileAsync("./src/json/Estados.json");
  estados = JSON.parse(fileStates);
  const fileCitys = await readFileAsync("./src/json/Cidades.json");
  cidades = JSON.parse(fileCitys);
};

loadFiles();

app.get("/estados", (_, res) => {
  res.json(estados);
});

const loadFile = (uf) => {
  const file = fs.readFileSync(`./src/json/estados/${uf}.json`);
  ufJson = JSON.parse(file);
  return {"uf": uf,"totalcidades": ufJson.totalcidades, "cidades": ufJson.cidades};
};

//1 - Implementar um método que irá criar um arquivo JSON para cada estado representado no arquivo Estados.json, e o seu conteúdo será um array das cidades pertencentes aquele estado, de acordo com o arquivo Cidades.json. O nome do arquivo deve ser o UF do estado, por exemplo: MG.json.
const generateJsonEstados = async (uf, totalcidades, cidades) => {
  try {
    await writeFileAsync(
      `./src/json/estados/${uf}.json`,
      JSON.stringify({ uf, totalcidades, cidades }),
      (err) => {
        console.log(err);
      }
    );
  } catch (err) {
    console.log(err);
  }
};

//2 - Criar um método que recebe como parâmetro o UF do estado, realize a leitura do arquivo JSON correspondente e retorne a quantidade de cidades daquele estado.
app.get("/estados/:uf", (req, res) => {
  return res.json(loadFile(req.params.uf));
});

//3 - Criar um método que imprima no console um array com o UF dos cinco estados que mais possuem cidades, seguidos da quantidade, em ordem decrescente. Utilize o método criado no tópico anterior. Exemplo de impressão: [“UF - 93”, “UF - 82”, “UF - 74”, “UF - 72”, “UF - 65”]
app.get("/top5", (_, res) => {
  loadCidadesEstado()
  const maiorQtdeCidades = CidadesEstado.map((item) => {
    return {
      uf: item.uf,
      totalcidades: item.totalcidades,
    }
  });
 
  maiorQtdeCidades.sort((a,b) => {
    return a.totalcidades > b.totalcidades ? -1 : a.totalcidades < b.totalcidades ? 1 : 0;
  })

  console.log(["5 mais quantidade de cidades", maiorQtdeCidades.slice(0, 5)]);
  return res.json(["5 mais quantidade de cidades", maiorQtdeCidades.slice(0, 5)]);
});
//4 - Criar um método que imprima no console um array com o UF dos cinco estados que menos possuem cidades, seguidos da quantidade, em ordem decrescente. Utilize o método criado no tópico anterior. Exemplo de impressão: [“UF - 30”, “UF - 27”, “UF - 25”, “UF - 23”, “UF - 21”]
app.get("/min5", (_, res) => {
  loadCidadesEstado()
  const menorQtdeCidades = CidadesEstado.map((item) => {
    return {
      uf: item.uf,
      totalcidades: item.totalcidades,
    }
  });
 
  menorQtdeCidades.sort((a,b) => {
    return a.totalcidades < b.totalcidades ? -1 : a.totalcidades > b.totalcidades ? 1 : 0;
  }) 
  console.log(["5 menos quantidade de cidades", menorQtdeCidades.slice(0, 5)]);
  return res.json(["5 menos quantidade de cidades", menorQtdeCidades.slice(0, 5)]);
});

//5 - Criar um método que imprima no console um array com a cidade de maior nome de cada estado, seguida de seu UF. Em caso de empate, considerar a ordem alfabética para ordená-los e então retornar o primeiro. Por exemplo: [“Nome da Cidade – UF”, “Nome da Cidade – UF”, ...].

app.get("/maiorcidade", (_, res) => {
  loadCidadesEstado()
  const maiorcidade = 0
  CidadesEstado.map(cidades =>  {
    cidades.forEach(cidade => {
      if (cidade.tamanhostring > maiorcidade ) {
        maiorcidade = cidade.tamanhostring
      }
    });
  })
  res.json(maiorcidade);
});


app.get("/cidades", (_, res) => {
  res.json(cidades);
});

function loadCidadesEstado() {
  if (CidadesEstado.length !== 0) {
    return;
  }
  estados.map((estado) => {
    let cidadesDoEstado = cidades.filter(
      (cidade) => estado.ID === cidade.Estado
    );
    cidadesDoEstado = cidadesDoEstado.map((item) => {
      return item.Nome
    });

    CidadesEstado.push({
      uf: estado.Sigla,
      totalcidades: cidadesDoEstado.length,
  
      cidades: cidadesDoEstado,
    });
    fs.exists(`./src/json/estados/${estado.Sigla}.json`, (data) => {
      if (!data) {
        generateJsonEstados(estado.Sigla, cidadesDoEstado.length, cidadesDoEstado);
      }
    });
  });
}

app.get("/CidadesEstado", (_, res) => {
  loadCidadesEstado()
  res.json(CidadesEstado);
});

module.exports = app;
