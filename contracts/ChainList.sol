// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;
import "./Ownable.sol";

contract ChainList is Ownable {
    //custom types
    struct Article {
        uint256 id;
        address payable seller;
        address buyer;
        string name;
        string description;
        uint256 price;
    }

    //state variables
    mapping(uint256 => Article) public articles;
    uint256 articleCounter;

    //events
    event LogSellArticle(
        uint256 indexed _id,
        address indexed _seller,
        address indexed _buyer,
        string _name,
        uint256 _price
    );

    event LogBuyArticle(
        uint256 indexed _id,
        address indexed _seller,
        address indexed _buyer,
        string _name,
        uint256 _price
    );

    event Info(string data);

    constructor() {
        owner = payable(msg.sender);
    }

    function kill() public onlyOwner {
        selfdestruct(owner);
    }

    function sellArticle(
        string memory _name,
        string memory _description,
        uint256 _price
    ) public {
        articleCounter++;
        articles[articleCounter] = Article(
            articleCounter,
            payable(msg.sender),
            address(0),
            _name,
            _description,
            _price
        );

        emit LogSellArticle(
            articleCounter,
            msg.sender,
            address(0),
            _name,
            _price
        );
    }

    // function getArticle()
    //     public
    //     view
    //     returns (
    //         address _seller,
    //         address _buyer,
    //         string memory _name,
    //         string memory _description,
    //         uint256 _price
    //     )
    // {
    //     return (seller, buyer, name, description, price);
    // }

    function getNumberOfArticles() public view returns (uint256) {
        return articleCounter;
    }

    function getArticlesForSale() public view returns (uint256[] memory) {
        if (articleCounter == 0) {
            //emit Info("No article");
            uint256[] memory emptyArray = new uint256[](0);
            return (emptyArray);
        }

        string memory log = "";
        uint256[] memory articleIds = new uint256[](articleCounter);
        uint256 numberOFArticlesForSales = 0;
        for (uint256 index = 1; index <= articleCounter; index++) {
            log = string(bytes.concat(bytes(log), "-", bytes(" 1")));
            if (articles[index].buyer == address(0)) {
                log = string(bytes.concat(bytes(log), "-", bytes(" 2")));
                articleIds[numberOFArticlesForSales] = articles[index].id;
                log = string(bytes.concat(bytes(log), "-", bytes(" 3")));
                numberOFArticlesForSales++;
            }
        }

        uint256[] memory forSale = new uint256[](numberOFArticlesForSales);
        for (uint256 index = 0; index < numberOFArticlesForSales; index++) {
            log = string(bytes.concat(bytes(log), "-", bytes(" 4")));
            forSale[index] = articleIds[index];
        }
        log = string(bytes.concat(bytes(log), "-", bytes(" 5")));
        return (forSale);
    }

    function buyArticle(uint256 _id) public payable {
        // require(seller != address(0));
        // require(buyer == address(0));
        // require(msg.sender != seller);
        // require(msg.value == price);
        // buyer = msg.sender;
        // seller.transfer(msg.value);
        // emit LogBuyArticle(seller, msg.sender, name, msg.value);

        require(articleCounter > 0);
        require(_id > 0 && _id <= articleCounter);
        Article storage article = articles[_id];
        require(article.buyer == address(0));
        require(msg.sender != article.seller);
        require(msg.value == article.price);

        article.buyer = msg.sender;
        article.seller.transfer(msg.value);
        emit LogBuyArticle(
            article.id,
            article.seller,
            article.buyer,
            article.name,
            article.price
        );
    }
}
