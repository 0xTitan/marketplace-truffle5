const ChainList = artifacts.require("./ChainList.sol");

contract("ChainList", async (accounts) => {
  let chainListInstance;
  const seller = accounts[1];
  const buyer = accounts[3];

  const articleName1 = "article 1";
  const articleDescription1 = "Description for article 1";
  const articlePrice1 = web3.utils.toBN(1);

  const articleName2 = "article 2";
  const articleDescription2 = "Description for article 2";
  const articlePrice2 = web3.utils.toBN(2);

  let sellerBalanceBeforeBuy, sellerBalanceAfterBuy;
  let buyerBalanceBeforeBuy, buyerBalanceAfterBuy;

  before("set up contract instance for each test", async () => {
    chainListInstance = await ChainList.deployed();
  });

  it("sould be initialized with empty values", async () => {
    const data = await chainListInstance.getNumberOfArticles();
    assert.equal(data.toNumber(), 0, "number of article must be zero");
    const listOfArticles = await chainListInstance.getArticlesForSale();
    let articlesArray = listOfArticles[0];
    assert.equal(
      listOfArticles.length,
      0,
      "there shouldn't be any article for sale"
    );

    // assert.equal(data[1], 0x0, "buyer must be empty");
    // assert.equal(data[2], "", "article name must be empty");
    // assert.equal(data[3], "", "article description must be empty");
    // assert.equal(data[4].toNumber(), 0, "article price must be 0");
  });

  it("should let us sell a first article", async () => {
    const receipt = await chainListInstance.sellArticle(
      articleName1,
      articleDescription1,
      web3.utils.toWei(articlePrice1, "ether"),
      {
        from: seller,
      }
    );

    assert.equal(
      receipt.logs.length,
      1,
      "one event should have been triggered"
    );
    assert.equal(
      receipt.logs[0].event,
      "LogSellArticle",
      "event should be LogSellArticle"
    );
    assert.equal(receipt.logs[0].args._id.toNumber(), 1, "id must be 1");
    assert.equal(
      receipt.logs[0].args._seller,
      seller,
      "event seller must be " + seller
    );
    assert.equal(
      receipt.logs[0].args._name,
      articleName1,
      "event article name must be " + articleName1
    );
    assert.equal(
      receipt.logs[0].args._price,
      web3.utils.toWei(articlePrice1, "ether").toString(),
      "article price must be " +
        web3.utils.toWei(articlePrice1, "ether").toString()
    );

    const data = await chainListInstance.getNumberOfArticles();
    assert.equal(data.toNumber(), 1, "number of article must be 1");
    const listOfArticles = await chainListInstance.getArticlesForSale();
    let articlesArray = listOfArticles[0];
    assert.equal(
      listOfArticles.length,
      1,
      "there should be one article for sale"
    );
    const article = await chainListInstance.articles(
      listOfArticles[0].toNumber()
    );
    assert.equal(article[0].toNumber(), 1, "article id must be one");
    assert.equal(article[1], seller, "seller must be " + seller);
    assert.equal(article[2], 0x0, "buyer must be empty");
    assert.equal(
      article[3],
      articleName1,
      "articleName must be" + articleName1
    );
  });

  it("should let us sell a second article", async () => {
    const receipt = await chainListInstance.sellArticle(
      articleName2,
      articleDescription2,
      web3.utils.toWei(articlePrice2, "ether"),
      {
        from: seller,
      }
    );

    assert.equal(
      receipt.logs.length,
      1,
      "one event should have been triggered"
    );
    assert.equal(
      receipt.logs[0].event,
      "LogSellArticle",
      "event should be LogSellArticle"
    );
    assert.equal(receipt.logs[0].args._id.toNumber(), 2, "id must be 2");
    assert.equal(
      receipt.logs[0].args._seller,
      seller,
      "event seller must be " + seller
    );
    assert.equal(
      receipt.logs[0].args._name,
      articleName2,
      "event article name must be " + articleName2
    );
    assert.equal(
      receipt.logs[0].args._price,
      web3.utils.toWei(articlePrice2, "ether").toString(),
      "article price must be " +
        web3.utils.toWei(articlePrice2, "ether").toString()
    );

    const data = await chainListInstance.getNumberOfArticles();
    assert.equal(data.toNumber(), 2, "number of article must be 2");
    const listOfArticles = await chainListInstance.getArticlesForSale();
    let articlesArray = listOfArticles[0];
    assert.equal(
      listOfArticles.length,
      2,
      "there should be two article for sale"
    );
    const article = await chainListInstance.articles(
      listOfArticles[1].toNumber()
    );
    assert.equal(article[0].toNumber(), 2, "article id must be 2");
    assert.equal(article[1], seller, "seller must be " + seller);
    assert.equal(article[2], 0x0, "buyer must be empty");
    assert.equal(
      article[3],
      articleName2,
      "articleName must be" + articleName2
    );
  });

  // it("should sell an article", async () => {
  //     const receipt = await chainListInstance.sellArticle(articleName1, articleDescription1, web3.utils.toWei(articlePrice1, "ether"),
  //         {
  //             from: seller
  //         });

  //     const data = await chainListInstance.getArticle();
  //     //console.log("data[3]=", web3.utils.toWei(data[3], "ether").toString());
  //     assert.equal(data[0], seller, "seller must be ", seller);
  //     assert.equal(data[1], 0X0, "buyer must be empty");
  //     assert.equal(data[2], articleName1, "article name must be " + articleName1);
  //     assert.equal(data[3], articleDescription1, "article description must be " + articleDescription1);
  //     assert.equal(data[4], web3.utils.toWei(articlePrice1, "ether").toString(), "article price must be " + web3.utils.toWei(articlePrice1, "ether").toString());
  // });

  it("should buy an article", async () => {
    // record balances of seller and buyer before the buy
    sellerBalanceBeforeBuy = parseFloat(
      web3.utils.fromWei(await web3.eth.getBalance(seller), "ether")
    );
    buyerBalanceBeforeBuy = parseFloat(
      web3.utils.fromWei(await web3.eth.getBalance(buyer), "ether")
    );

    const receipt = await chainListInstance.buyArticle(1, {
      from: buyer,
      value: web3.utils.toWei(articlePrice1, "ether"),
    });

    assert.equal(
      receipt.logs.length,
      1,
      "one event should have been triggered"
    );
    assert.equal(
      receipt.logs[0].event,
      "LogBuyArticle",
      "event should be LogBuyArticle"
    );
    assert.equal(receipt.logs[0].args._id.toNumber(), 1, "event id must be 1");
    assert.equal(
      receipt.logs[0].args._seller,
      seller,
      "event seller must be " + seller
    );
    assert.equal(
      receipt.logs[0].args._buyer,
      buyer,
      "event buyer must be " + buyer
    );
    assert.equal(
      receipt.logs[0].args._name,
      articleName1,
      "event article name must be " + articleName1
    );
    assert.equal(
      receipt.logs[0].args._price.toString(),
      web3.utils.toWei(articlePrice1, "ether").toString(),
      "event article price must be " + web3.utils.toWei(articlePrice1, "ether")
    );
    //record balances of buyer and seller after the buy
    sellerBalanceAfterBuy = parseFloat(
      web3.utils.fromWei(await web3.eth.getBalance(seller), "ether")
    );
    buyerBalanceAfterBuy = parseFloat(
      web3.utils.fromWei(await web3.eth.getBalance(buyer), "ether")
    );
    //console.log("sellerBalanceBeforeBuy",sellerBalanceBeforeBuy);
    //console.log("sellerBalanceAfterBuy",sellerBalanceAfterBuy);

    //console.log("buyerBalanceBeforeBuy",buyerBalanceBeforeBuy);
    //console.log("buyerBalanceAfterBuy",buyerBalanceAfterBuy);

    //check the effect of buy on balances of buyer and seller, accounting for gas
    assert(
      sellerBalanceAfterBuy ==
        sellerBalanceBeforeBuy + articlePrice1.toNumber(),
      "seller should have earned " + articlePrice1 + " ETH"
    );
    assert(
      buyerBalanceAfterBuy <= buyerBalanceBeforeBuy - articlePrice1.toNumber(),
      "buyer should have spent " + articlePrice1 + " ETH"
    );

    const listOfArticles = await chainListInstance.getArticlesForSale();
    let articlesArray = listOfArticles[0];
    assert.equal(
      listOfArticles.length,
      1,
      "there should be one article left for sale"
    );

    const article = await chainListInstance.articles(
      listOfArticles[0].toNumber()
    );
    assert.equal(
      article[0].toNumber(),
      2,
      "article 2 should be the only article left for sale"
    );
    const data = await chainListInstance.getNumberOfArticles();
    assert.equal(
      data.toNumber(),
      2,
      "there should still be 2 articles in total"
    );
  });

  // it("should trigger an event when an article is sold", async () => {
  //     const receipt = await chainListInstance.sellArticle(articleName1, articleDescription1, web3.utils.toWei(articlePrice1, "ether"),
  //         {
  //             from: seller
  //         });
  //     assert.equal(receipt.logs.length, 1, "one event should have been triggered");
  //     assert.equal(receipt.logs[0].event, "LogSellArticle", "event should be LogSellArticle");
  //     assert.equal(receipt.logs[0].args._seller, seller, "event seller must be " + seller);
  //     assert.equal(receipt.logs[0].args._name, articleName1, "event article name must be " + articleName1);
  //     assert.equal(receipt.logs[0].args._price, web3.utils.toWei(articlePrice1, "ether").toString(), "article price must be " + web3.utils.toWei(articlePrice1, "ether").toString());
  // });
});
