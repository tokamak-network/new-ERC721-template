// SPDX-License-Identifier: MIT
pragma solidity 0.8.25;

import "./BaseTest.sol";

contract NFTFactoryTest is BaseTest {
    function setUp() public override {
        super.setUp();
    }

    // --------------------------- INITIALIZE FUNCTION ----------------------------

    /**
     * @notice tests the behavior of initialize function if called twice
     */
    function testInitializeShouldRevertIfCalledTwice() public {
        string memory tokenName = "Non Fungible Token";
        string memory symbol = "NFT";

        vm.startPrank(owner);
        vm.expectRevert();
        NFTFactory(nftfactoryProxyAddress).initialize(
            tokenName,
            symbol,
            owner,
            wston,
            treasuryProxyAddress
        );
        vm.stopPrank();
    }

    /**
     * @notice tests the behavior of setTreasury function
     */
    function testSetTreasury() public {
        vm.startPrank(owner);
        NFTFactory(nftfactoryProxyAddress).setTreasury(user1);
        vm.stopPrank();
        assert(NFTFactory(nftfactoryProxyAddress).getTreasuryAddress() == user1);
    }

    /**
     * @notice tests the behavior of setWston function
     */
    function testSetWston() public {
        vm.startPrank(owner);
        NFTFactory(nftfactoryProxyAddress).setWston(user1);
        vm.stopPrank();
        assert(NFTFactory(nftfactoryProxyAddress).getWstonAddress() == user1);
    }

    // --------------------------- CREATE NFT FUNCTION ----------------------------

    /**
     * @notice tests the behavior of createNFT function
     */
    function testcreateNFT() public {
        vm.startPrank(treasuryProxyAddress);
        vm.expectEmit(true, true, true, true);
        emit NFTFactoryStorage.Created(0,10*1e27,user1,"");
        NFTFactory(nftfactoryProxyAddress).createNFT(10*1e27,user1,"");
        uint256 balance = NFTFactory(nftfactoryProxyAddress).balanceOf(user1);
        assert(balance == 1);
        vm.stopPrank();
    }

    /**
     * @notice tests the behavior of createNFT function if the caller is not the treasury
     */
    function testCreateNFTShouldRevertIfNotTreasury() public {
        vm.startPrank(user1);
        vm.expectRevert();
        NFTFactory(nftfactoryProxyAddress).createNFT(10*1e27,user1,"");
        vm.stopPrank();
    }

    /**
     * @notice tests the behavior of mintAsset function if the contract is paused
     */
    function testcreateNFTShouldRevertIfContractPaused() public {
        vm.startPrank(owner);
        NFTFactory(nftfactoryProxyAddress).pause();
        vm.stopPrank();

        vm.startPrank(treasuryProxyAddress);
        vm.expectRevert(NFTFactoryStorage.ContractPaused.selector);
        NFTFactory(nftfactoryProxyAddress).createNFT(10*1e27,user1,"");
        vm.stopPrank();
    }


    /**
     * @notice tests the behavior of createNFT function if the recipient is address 0
     */
    function testCreateNFTShouldRevertIfAddressZero() public {
        vm.startPrank(treasuryProxyAddress);
        // we pass _owner = address(0) 
        vm.expectRevert(NFTFactoryStorage.AddressZero.selector);
        NFTFactory(nftfactoryProxyAddress).createNFT(10*1e27,address(0),"");
        vm.stopPrank();
    }

    // --------------------------- CREATE NFT POOL FUNCTION ----------------------------

    /** 
     * @notice tests the behavior of createNFTPool function
     */
    function testcreateNFTPool() public {
        uint256[] memory values = new uint256[](2);
        address[] memory owners = new address[](2);
        string[] memory tokenURIs = new string[](2);

        values[0] = 10*1e27;
        values[1] = 20*1e27;

        owners[0] = user1;
        owners[1] = user1;

        tokenURIs[0] = "";
        tokenURIs[1] = "";

        vm.startPrank(treasuryProxyAddress);
        NFTFactory(nftfactoryProxyAddress).createNFTPool(values,owners,tokenURIs);
        uint256 balance = NFTFactory(nftfactoryProxyAddress).balanceOf(user1);
        assert(balance == 2);
        vm.stopPrank();
    }

    function testCreateNFTPoolShouldRevertIfWrongParameterLength() public {
        uint256[] memory values = new uint256[](2);
        address[] memory owners = new address[](2);
        // wrong length
        string[] memory tokenURIs = new string[](1);

        values[0] = 10*1e27;
        values[1] = 20*1e27;

        owners[0] = user1;
        owners[1] = user1;

        tokenURIs[0] = "";

        vm.startPrank(treasuryProxyAddress);
        vm.expectRevert("Wrong parameters length");
        NFTFactory(nftfactoryProxyAddress).createNFTPool(values,owners,tokenURIs);
        vm.stopPrank();
    }

    // --------------------------- BURN ASSET FUNCTION ----------------------------

    /**
     * @notice tests the behavior of burnNFT function
     */
     function testBurnNFT() public {
        // we mint an NFT for user 1
        testcreateNFT();

        uint256 wstonBalanceBefore = IERC20(wston).balanceOf(user1);

        // burn the asset
        vm.startPrank(user1);
        vm.expectEmit(true, true, true, true);
        emit NFTFactoryStorage.NFTBurnt(0,user1);
        NFTFactory(nftfactoryProxyAddress).burnNFT(0);
        vm.stopPrank();

        uint256 wstonBalanceAfter = IERC20(wston).balanceOf(user1);
        assert(wstonBalanceAfter == wstonBalanceBefore + 10 * 1e27);

     }

     /**
     * @notice tests the behavior of burnNFT function should revert if address 0 
     */
    function testBurnNFTShouldRevertIfAddressZero() public {
        // we mint an NFT for user 1
        testcreateNFT();
        vm.startPrank(address(0));
        vm.expectRevert(NFTFactoryStorage.AddressZero.selector);
        NFTFactory(nftfactoryProxyAddress).burnNFT(0);
        vm.stopPrank();

    }

    // ---------------------- SET TOKEN URI FUNCTION --------------------------

    function testSetTokenUri() public {
        testcreateNFT();
        vm.startPrank(owner);
        NFTFactory(nftfactoryProxyAddress).setTokenURI(0, "test");
        vm.stopPrank();
    }


    // --------------------------- VIEW FUNCTIONS ----------------------------

    /**
     * @notice tests the behavior of getAsset function
     */
    function testGetNft() public {
        // we mint an NFT for user 1
        testcreateNFT();

        NFTFactoryStorage.Nft memory nft;
        nft = NFTFactory(nftfactoryProxyAddress).getNft(0);

        vm.startPrank(user1);
        assert(nft.tokenId == 0);
        assert(nft.value == 10*1e27);
        vm.stopPrank();
    }

    /**
     * @notice tests the behavior of getTotalWstonValue function
     */
     function testGetTotalSupply() public {
        // we mint an NFT for user 1
        testcreateNFT();
        uint256 totalSupply = NFTFactory(nftfactoryProxyAddress).totalSupply();
        assert(totalSupply == 1);
     }

    /**
     * @notice tests the behavior of getWstonValuePerNft function
     */
     function testGetNFTsSupplyTotalValue() public {
        // we mint an NFT for user 1
        testcreateNFT();

        uint256 NFTsSupplyTotalValue = NFTFactory(nftfactoryProxyAddress).getNFTsSupplyTotalValue();
        assert(NFTsSupplyTotalValue == 10*1e27);
     }

}