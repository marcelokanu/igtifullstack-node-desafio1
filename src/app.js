const express = require("express");
const fs = require("fs");
const app = express();

app.use(express.json());

const dirJson = __dirname + "/json/";

const states = JSON.parse(
  fs.readFileSync(dirJson + "Estados.json", "utf8", (err, data) => {
    console.log(err);
  })
);

const citys = JSON.parse(
  fs.readFileSync(dirJson + "Cidades.json", "utf8", (err, data) => {
    console.log(err);
  })
);

const cidades_estados = [];

states.map((state) => {
  const citysOfState = [];
  citys.map((city) => {
    if (state.ID === city.Estado) {
      citysOfState.push({ id: city.ID, nome: city.Nome, tamanhoString: city.Nome.length });
    }
  });
  cidades_estados.push({
    id_estado: state.ID,
    uf: state.Sigla,
    nome: state.Nome,
    totalcidades: citysOfState.length,
    cidades: citysOfState,
    tamanhoString: citysOfState,
  });
  fs.exists(`${dirJson}/estados/${state.Sigla}.json`, (existe) => {
    if (!existe) {
      fs.writeFile(
        `${dirJson}/estados/${state.Sigla}.json`,
        JSON.stringify({ total: citysOfState.length, cidades: citysOfState }),
        (err) => {
          console.log(err);
        }
      );
    }
  });
});

app.get("/", (req, res) => {
  return res.json(cidades_estados);
});

app.get("/estados", (req, res) => {
  return res.json(states);
});
app.get("/cidades", (req, res) => {
  return res.json(citys);
});

app.get("/estados/:uf", (req, res) => {
  const ufToLoad = JSON.parse(
    fs.readFileSync(
      dirJson + `/estados/${req.params.uf}.json`,
      "utf8",
      (err, data) => {
        console.log(err);
        console.log(data);
      }
    )
  );

  return res.json(ufToLoad);
});

module.exports = app;
