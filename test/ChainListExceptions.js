const ChainList = artifacts.require("./ChainList.sol");

contract("ChainList", async accounts => {
    let chainListInstance;
    const seller = accounts[1];
    const buyer = accounts[3];

    const articleName1 = "article 1";
    const articleDescription1 = "Description for article 1";
    const articlePrice1 = web3.utils.toBN(1);

    const articleId = 1;

    const articleName2 = "article 2";
    const articleDescription2 = "Description for article 2";
    const articlePrice2 = web3.utils.toBN(2);

    let sellerBalanceBeforeBuy, sellerBalanceAfterBuy;
    let buyerBalanceBeforeBuy, buyerBalanceAfterBuy;

    before("set up contract instance for each test", async () => {
        chainListInstance = await ChainList.deployed();
    });

     // Test case: buying an article when no article for sale yet
     it("should throw an exception if you try to buy an article when there is no article for sale", async () => {
        try {
            await chainListInstance.buyArticle(articleId, {
                from: buyer,
                value: web3.utils.toWei(articlePrice1, "ether")
            });
            assert.fail();
        } catch(error) {
            //console.log(error);
            //assert.equal(error, "There should be at least one article");
        }    
            
        const numberOfArticles = await chainListInstance.getNumberOfArticles();
            
        //make sure sure the contract state was not altered
        assert.equal(numberOfArticles.toNumber(), 0, "number of articles must be zero");
    });


      // Test case: buying an article that does not exist
      it("should throw an exception if you try to buy an article that does not exist", async () => {
        await chainListInstance.sellArticle(
            articleName1, 
            articleDescription1, 
            web3.utils.toWei(articlePrice1, "ether"), {
                from: seller
            }
        );
        
        try {
            await chainListInstance.buyArticle(2, {
                from: seller,
                value: web3.utils.toWei(articlePrice, "ether")
            });
            assert.fail();
        } catch(error) {
            //assert.equal(error, "Article with this id does not exist");
        }
        
        const article = await chainListInstance.articles(articleId);
        assert.equal(article[0].toNumber(), articleId, "article id must be " + articleId);
        assert.equal(article[1], seller, "seller must be " + seller);
        assert.equal(article[2], 0x0, "buyer must be empty");
        assert.equal(article[3], articleName1, "article name must be " + articleName1);
        assert.equal(article[4], articleDescription1, "article description must be " + articleDescription1);
        assert.equal(article[5].toString(), web3.utils.toWei(articlePrice1, "ether").toString(), "article price must be " + web3.utils.toWei(articlePrice1, "ether"));
    });

    it("should throw an exception if you try to buy your own article", async () => {
        const receiptSell = await chainListInstance.sellArticle(articleName1, articleDescription1, web3.utils.toWei(articlePrice1, "ether"),
            {
                from: seller
            });

        try {
            const receiptBuy = await chainListInstance.buyArticle(articleId,{
                from: seller,
                value: web3.utils.toWei(articlePrice1, "ether")
            });
            assert.fail();
        } catch (error) {
            //console.log(error);
            //assert.equal(error, "Seller cannot buy his own article");
        }
    });

    it("should throw an exception if you try to buy an article different from its price", async () => {
        try {
            const receiptBuy = await chainListInstance.buyArticle(articleId,{
                from: buyer,
                value: web3.utils.toWei(articlePrice1 + 1, "ether")
            });
            assert.fail();
        } catch (error) {
            //console.log(error);
            //assert.equal(error, "Value provided does not match price of article");
        }

        const article = await chainListInstance.articles(articleId);
        //make sure sure the contract state was not altered
        assert.equal(article[0].toNumber(), articleId, "article id must be " + articleId);
        assert.equal(article[1], seller, "seller must be " + seller);
        assert.equal(article[2], 0x0, "buyer must be empty");
        assert.equal(article[3], articleName1, "article name must be " + articleName1);
        assert.equal(article[4], articleDescription1, "article description must be " + articleDescription1);
        assert.equal(article[5].toString(), web3.utils.toWei(articlePrice1, "ether").toString(), "article price must be " + web3.utils.toWei(articlePrice1, "ether"));

    })

    // Test case: article has already been sold
    it("should throw an exception if you try to buy an article that has already been sold", async () => {
        await chainListInstance.buyArticle(articleId, {
            from: buyer,
            value: web3.utils.toWei(articlePrice1, "ether")
        });
        try {
            await chainListInstance.buyArticle(articleId, {
                from: accounts[0],
                value: web3.utils.toWei(articlePrice1, "ether")
            });
            assert.fail();
        } catch(error) {
            //assert.equal(error.reason, "Article was already sold");
        }
        
        const article = await chainListInstance.articles(articleId);
        //make sure sure the contract state was not altered
        assert.equal(article[0].toNumber(), articleId, "article id must be " + articleId);
        assert.equal(article[1], seller, "seller must be " + seller);
        assert.equal(article[2], buyer, "buyer must be " + buyer);
        assert.equal(article[3], articleName1, "article name must be " + articleName1);
        assert.equal(article[4], articleDescription1, "article description must be " + articleDescription1);
        assert.equal(article[5].toString(), web3.utils.toWei(articlePrice1, "ether").toString(), "article price must be " + web3.utils.toWei(articlePrice1, "ether"));
    });
});
