App = {
  web3Provider: null,
  contracts: {},
  account: 0x0,
  loading: false,

  init: async () => {
    //load articles
    // var articlesRow = $('#articlesRow');
    // var articlesTemplate = $('#articleTemplate');

    // articlesTemplate.find('.panel-title').text("article 1");
    // articlesTemplate.find('.article-description').text("article descritption");
    // articlesTemplate.find('.article-price').text("10.23");
    // articlesTemplate.find('.article-seller').text("0x3213549845646");
    // console.log("articlesTemplate=", articlesTemplate.html());
    // articlesRow.append(articlesTemplate.html());
    // console.log("articlesRow=", articlesRow);
    return App.initWeb3();
  },

  initWeb3: async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      try {
        await window.ethereum.enable();
        App.displayAccountInfo();
        return App.initContract();
      } catch (error) {
        console.error("unbale to retreive your accounts");
      }
    } else if (window.web3) {
      window.web3 = new Web3(web3.currentProvider || "ws://localhost:7545");
      App.displayAccountInfo();
      return App.initContract();
    } else {
      console.log(
        "Non-ethereum browser detected. You should consider trying Metamask"
      );
    }
  },

  displayAccountInfo: async () => {
    const accounts = await window.web3.eth.getAccounts();
    App.account = accounts[0];
    $("#account").text(App.account);
    const balance = await window.web3.eth.getBalance(App.account);
    $("#accountBalance").text(
      window.web3.utils.fromWei(balance, "ether") + " ETH"
    );
  },

  initContract: async () => {
    $.getJSON("ChainList.json", (chainListArtifact) => {
      App.contracts.ChainList = TruffleContract(chainListArtifact);
      App.contracts.ChainList.setProvider(window.web3.currentProvider);
      App.listenToEvents();
      //return App.reloadArticles();
    });
  },

  reloadArticles: async () => {
    //avoid reentry

    if (App.loading) {
      return;
    }
    App.loading = true;

    //refresh account info
    App.displayAccountInfo();
    //clear list
    console.log("test");
    try {
      $("#articlesRow").empty();
      const chainListInstance = await App.contracts.ChainList.deployed();
      const articleIds = await chainListInstance.getArticlesForSale();
      if (articleIds.length == 0) {
        console.log("No article");
        return;
      }

      for (let index = 0; index < articleIds.length; index++) {
        const articleId = articleIds[index];
        const article = await chainListInstance.articles(articleId.toNumber());
        App.displayArticle(article);
      }

      App.loading = false;

      //  let buyer = article[1];
      //  const price = window.web3.utils.fromWei(article[4], "ether");

      //  var articlesTemplate = $("#articleTemplate");

      //  articlesTemplate.find(".panel-title").text(article[2]);
      //  articlesTemplate.find(".article-description").text(article[3]);
      //  articlesTemplate.find(".article-price").text(price);
      //  articlesTemplate.find(".btn-buy").attr("data-value", price);

      //  var seller = article[0];
      //  if (seller == App.account) {
      //    seller = "You";
      //  }

      //  articlesTemplate.find(".article-seller").text(seller);
      //  const emptyAddress = /^0x0+$/.test(buyer);

      //  if (buyer == App.account) {
      //    buyer = "You";
      //  } else if (emptyAddress) {
      //    console.log("emptyAddress", emptyAddress);
      //    buyer = "No one yet";
      //  }
      //  articlesTemplate.find(".article-buyer").text(buyer);

      //  if (article[0] == App.account || !emptyAddress) {
      //    articlesTemplate.find(".btn-buy").hide();
      //  } else {
      //    articlesTemplate.find(".btn-buy").show();
      //  }

      //  //add article
      //  var articlesRow = $("#articlesRow");
      //  articlesRow.append(articlesTemplate.html());
    } catch (error) {
      console.error(error);
      App.loading = false;
    }
  },

  displayArticle: (article) => {
    const articlesRow = $("#articlesRow");
    const price = window.web3.utils.fromWei(article[5], "ether");

    var articlesTemplate = $("#articleTemplate");
    articlesTemplate.find(".panel-title").text(article[3]);
    articlesTemplate.find(".article-description").text(article[4]);
    articlesTemplate.find(".article-price").text(price);
    articlesTemplate.find(".btn-buy").attr("data-id", article[0]);
    articlesTemplate.find(".btn-buy").attr("data-value", price);

    const seller = article[1];
    if (seller == App.account) {
      articlesTemplate.find(".article-seller").text("You");
      articlesTemplate.find(".btn-buy").hide();
    } else {
      articlesTemplate.find(".article-seller").text(seller);
      articlesTemplate.find(".btn-buy").show();
    }

    articlesRow.append(articlesTemplate.html());
  },

  sellArticle: async () => {
    const _articleName = $("#article_name").val();
    const _description = $("#article_description").val();
    const _articlePrice = parseFloat($("#article_price").val() || 0);
    console.log("_articlePrice", _articlePrice);
    const _price = window.web3.utils.toWei(_articlePrice.toString(), "ether");
    if (_articleName.trim() == "" || _price === 0) {
      //nothing to sell
      return false;
    }
    try {
      const chainListInstance = await App.contracts.ChainList.deployed();
      const receipt = await chainListInstance
        .sellArticle(_articleName, _description, _price, {
          from: App.account,
          gas: 5000000,
        })
        .on("transactionHash", (hash) => {
          console.log("transaction hash", hash);
        });
      console.log("transaction receipt", receipt);
      //App.reloadArticles();
    } catch (error) {
      console.error(error);
    }
  },

  listenToEvents: async () => {
    const chainListInstance = await App.contracts.ChainList.deployed();
    if (App.logSellArticleEventListener == null) {
      App.logSellArticleEventListener = chainListInstance
        .LogSellArticle({ fromBlock: "0" })
        .on("data", (event) => {
          //$('#' + event._name).remove();
          $("#events").append(
            '<li class="list-group-item">' +
              event.returnValues._name +
              " is for sale</li>"
          );
          console.log("event received sell-1");
          App.reloadArticles();
        })
        .on("error", (error) => {
          console.error(error);
        });
      console.log("event received sell-2");
    }

    if (App.logBuyArticleEventListener == null) {
      App.logBuyArticleEventListener = chainListInstance
        .LogBuyArticle({ fromBlock: "0" })
        .on("data", (event) => {
          $("#" + event._id).remove();
          $("#events").append(
            '<li class="list-group-item" id="' +
              event.id +
              '">' +
              event.returnValues._buyer +
              " bought " +
              event.returnValues._name +
              "</li>"
          );
          App.reloadArticles();
          console.log("event received buy -1");
        })
        .on("error", (error) => {
          console.error(error);
        });
      console.log("event received buy -2");
    }
  },

  buyArticle: async () => {
    event.preventDefault();
    try {
      const _articleId = $(event.target).data("id");
      //retrieve price
      var articlePriceValue = parseFloat($(event.target).data("value"));
      var _price = window.web3.utils.toWei(articlePriceValue, "ether");
      console.log(_price);
      const chainListInstance = await App.contracts.ChainList.deployed();
      const receiptBuy = await chainListInstance.buyArticle(_articleId, {
        from: App.account,
        value: _price,
        gas: 500000,
      });
    } catch (error) {
      console.error(error);
    }
  },
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
