const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");
const { type } = require("os");

const app = express();

app.set("view engine", "ejs");

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));

let message = "";
let baseCode = "USD";
let quoteCode = "BTC";
let totalPages = 95;
let apiKey = process.env.APIKEY;

app.get("/", function (req, res) {
  res.render("index", {
    message: message,
    baseCode: baseCode,
    quoteCode: quoteCode,
  });
});

app.post("/", function (req, res) {
  baseCode = req.body.baseCurrency.toUpperCase();
  quoteCode = req.body.quoteCurrency.toUpperCase();

  const options = {
    method: "GET",
    hostname: "rest.coinapi.io",
    path: "/v1/exchangerate/" + baseCode + "/" + quoteCode,
    headers: { "X-CoinAPI-Key": apiKey },
  };

  const request = https.request(options, function (response) {
    if (response.statusCode === 200) {
      response.on("data", function (data) {
        let exchangeRate = JSON.parse(data).rate.toFixed(5);
        message =
          "The exchange rate from " +
          baseCode +
          " to " +
          quoteCode +
          " is " +
          exchangeRate +
          ".";
        res.render("index", {
          message: message,
          baseCode: baseCode,
          quoteCode: quoteCode,
        });
        message = "";
      });
    } else {
      message = "Invalid currency symbols. Please try again!";
      res.render("index", {
        message: message,
        baseCode: baseCode,
        quoteCode: quoteCode,
      });
      message = "";
    }
  });

  request.end();
});

app.get("/list/:pageNumber", function (req, res) {
  let currentPage = parseInt(req.params.pageNumber);
  let pagination = [];
  pagination.push(1);
  if (currentPage < 4) {
    pagination.push(2, 3, 4, 5, 0);
  } else if (currentPage === 4) {
    pagination.push(2, 3, 4, 5, 6, 0);
  } else if (currentPage > totalPages - 3) {
    pagination.push(
      0,
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1
    );
  } else if (currentPage === totalPages - 3) {
    pagination.push(
      0,
      totalPages - 5,
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1
    );
  } else if (currentPage > 4 && currentPage < totalPages - 3) {
    pagination.push(
      0,
      currentPage - 2,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      currentPage + 2,
      0
    );
  }
  pagination.push(totalPages);

  const options = {
    method: "GET",
    hostname: "rest.coinapi.io",
    path: "/v1/assets",
    headers: { "X-CoinAPI-Key": apiKey },
  };

  const request = https.request(options, function (response) {
    var chunks = "";
    response.on("data", function (chunk) {
      chunks += chunk;
    });

    response.on("end", function () {
      let allCurrencies = JSON.parse(chunks);
      totalPages = Math.ceil(allCurrencies.length / 100);
      res.render("list", {
        allCurrencies: allCurrencies,
        totalPages: totalPages,
        currentPage: currentPage,
        pagination: pagination,
      });
    });
  });

  request.end();
});

app.get("/currency/:symbol", function (req, res) {
  const options = {
    method: "GET",
    hostname: "rest.coinapi.io",
    path: "/v1/exchangerate/" + req.params.symbol,
    headers: { "X-CoinAPI-Key": apiKey },
  };

  const request = https.request(options, function (response) {
    var chunks = "";
    response.on("data", function (chunk) {
      chunks += chunk;
    });

    response.on("end", function () {
      let allRates = JSON.parse(chunks).rates;

      let tenRates = [];
      allRates.forEach((rate) => {
        switch (rate.asset_id_quote) {
          case "USD":
            tenRates.push(rate);
            break;
          case "BTC":
            tenRates.push(rate);
            break;
          case "EUR":
            tenRates.push(rate);
            break;
          case "CNY":
            tenRates.push(rate);
            break;
          case "JPY":
            tenRates.push(rate);
            break;
          case "AUD":
            tenRates.push(rate);
            break;
          case "GBP":
            tenRates.push(rate);
            break;
          case "CAD":
            tenRates.push(rate);
            break;
          case "ETH":
            tenRates.push(rate);
            break;
          case "XRP":
            tenRates.push(rate);
            break;
          default:
            break;
        }
      });

      res.render("currency", {
        baseSymbol: req.params.symbol,
        exchangeRates: tenRates,
      });
    });
  });

  request.end();
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server is running.");
});
