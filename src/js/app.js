App = { 
    web3Provider: null,
    contracts: {},
    account: '0x0',
    loading: false,
    tokenPrice: 0,
    tokensSold: 0,
    tokensAvailable: 750000,

  init: function() {
    console.log("App initialized...")
    return App.initWeb3();
  },

  initWeb3: function() {
    if (window.ethereum) {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = window.ethereum;
      window.web3 = new Web3(window.ethereum);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      window.web3 = new Web3(App.web3Provider);
    }
    return App.initContracts();
  },

  initContracts: function() {
    $.getJSON("BTPTokenSale.json", function(BTPTokenSale) {
      App.contracts.BTPTokenSale = TruffleContract(BTPTokenSale);
      App.contracts.BTPTokenSale.setProvider(App.web3Provider);
      App.contracts.BTPTokenSale.deployed().then(function(BTPTokenSale) {
        console.log("BTP Token Sale Address:", BTPTokenSale.address);
      });
    }).done(function() {
      $.getJSON("BTPToken.json", function(BTPToken) {
        App.contracts.BTPToken = TruffleContract(BTPToken);
        App.contracts.BTPToken.setProvider(App.web3Provider);
        App.contracts.BTPToken.deployed().then(function(BTPToken) {
          console.log("BTP Token Address:", BTPToken.address);
        });

        App.listenForEvents();
        return App.render();
      });
    })
  },

  //listen for events emitted from the contract
  listenForEvents: function() {
    App.contracts.BTPTokenSale.deployed().then(function(instance) {
      instance.Sell({}, {
        fromBlock: 0,
        toBlock: 'latest',
      }).watch(function(error, event) {
        console.log("event triggered", event);
        App.render();
      })
    })
  },


  render: function()
  {
     if(App.loading)
     {
         return;
     }
     App.loading = true;
     
     var loader = $('#loader');
     var content = $('#content');
     
     loader.show();
     content.hide();

    web3.eth.getCoinbase(function(err, account) {
        if(err === null) {
          App.account = account;
          $('#accountAddress').html("Your Account : " + account);
        }
      })
 
      // Load token sale contract
    App.contracts.BTPTokenSale.deployed().then(function(instance) {
      BTPTokenSaleInstance = instance;
      return BTPTokenSaleInstance.tokenPrice();
    }).then(function(tokenPrice) {
      App.tokenPrice = tokenPrice;
      //console.log('tokenPrice', tokenPrice.toNumber());
      $('.token-price').html(web3.fromWei(App.tokenPrice, "ether").toNumber());
      return BTPTokenSaleInstance.tokensSold();
    }).then(function(tokensSold) {
      App.tokensSold = tokensSold.toNumber();
      $('.tokens-sold').html(App.tokensSold);
      $('.tokens-available').html(App.tokensAvailable);
       
      var progressPercent = (App.tokensSold / App.tokensAvailable) * 100;
      $('#progress').css('width', progressPercent + '%');

     // Load token contract
     App.contracts.BTPToken.deployed().then(function(instance) {
      BTPTokenInstance = instance;
      return BTPTokenInstance.balanceOf(App.account);
    }).then(function(balance) {
      $('.BTP-balance').html(balance.toNumber());

      App.loading = false;
      loader.hide();
      content.show();
    })

    });
     
  },

  buyTokens : function()
  {
    $('#content').hide();
    $('#loader').show();
    var numberOfTokens = $('#numberOfTokens').val();

    App.contracts.BTPTokenSale.deployed().then(function(instance) {
      return instance.buyTokens(numberOfTokens, {
        from: App.account,
        value: numberOfTokens * App.tokenPrice,
        gas: 500000 // Gas limit
      });
    }).then(function(result) {
      console.log("Tokens bought...")
      $('form').trigger('reset') // reset number of tokens in form
      
      // Wait for Sell event
    });
  } 



}

$(function() {
    $(window).on('load', function() {
      App.init();
    })
  });
  
